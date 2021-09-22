import axios from "axios";
import * as cheerio from "cheerio";
import { ModuleType, ScrapeResponseData } from "../interface";
import { ScraperError, UNEXPECTED_DATA } from "../utils/error";
import Constants from "./constants";
import { getAssignmentDueDate, getTurnitinDueDate } from "./followUpParser";

export class CourseScraper {
  private cheerioApi: cheerio.CheerioAPI;
  private listOfResources: ScrapeResponseData[];
  private listOfFollowUps: ScrapeResponseData[];
  courseUrl: string;

  constructor(html: string, courseUrl: string) {
    this.cheerioApi = cheerio.load(html);
    this.listOfResources = [];
    this.listOfFollowUps = [];
    this.courseUrl = courseUrl;
  }

  getListOfResources(): ScrapeResponseData[] {
    return this.listOfResources;
  }

  run(): void {
    const $ = this.cheerioApi;
    const sections = $(Constants.sectionSelector);
    if (sections.length === 0) {
      console.error(`Received 0 sections for ${this.courseUrl}`);
    }

    sections.each((index, section) => {
      try {
        this.sectionExtractor(section);
      } catch (err) {
        const error = err as ScraperError;
        error.message += "\n found in " + this.courseUrl;
        throw error;
      }
    });
  }

  async runFollowUps(cookies: string): Promise<void> {
    const listOfDueDatePromises: Promise<string>[] = [];
    this.listOfFollowUps.forEach((followUp) => {
      listOfDueDatePromises.push(
        this.getResourceDueDate(followUp.resourceUrl, followUp.type, cookies)
      );
    });
    const dueDateList: string[] = await Promise.all(listOfDueDatePromises);

    dueDateList.forEach((date, index) => {
      const followUp = this.listOfFollowUps[index];
      followUp.dueDate = date;
      this.listOfResources.push(followUp);
    });
  }

  private sectionExtractor(section: cheerio.Node): void {
    const $ = this.cheerioApi;
    const sectionTitle: string = this.getSectionHeader(section);
    const sectionModules = $(section).find(Constants.sectionModuleSelector);
    if (sectionModules.length === 0) {
      return;
    }

    sectionModules.each((index, module) => {
      this.moduleAction(module, sectionTitle);
    });
  }

  private async getResourceDueDate(
    url: string,
    moduleType: ModuleType,
    cookies: string
  ): Promise<string> {
    let html: string;
    try {
      const response = await axios.get(url, { headers: { Cookie: cookies } });
      html = response.data;
    } catch (err) {
      console.error(`Error while getting more data for ${url}`, err);
      return "";
    }
    switch (moduleType) {
      case ModuleType.ASSIGNMENT:
        return getAssignmentDueDate(html);
      case ModuleType.TURNITIN:
        return getTurnitinDueDate(html);
      default:
        return "";
    }
  }

  private getSectionHeader(section: cheerio.Node): string {
    const $ = this.cheerioApi;
    const sectionHeaderId = $(section).attr("aria-labelledby");
    if (sectionHeaderId === null || sectionHeaderId === undefined) {
      console.error("Did not find header ID on section");
      throw new ScraperError(UNEXPECTED_DATA);
    }

    let sectionHeader = $(section).find(`#${sectionHeaderId}`).text();
    sectionHeader = sectionHeader.trim().replace(/\s+/g, " ");
    return sectionHeader;
  }

  private moduleAction(module: cheerio.Element, title: string): void {
    const $ = this.cheerioApi;
    const classNames = $(module).attr("class");
    if (classNames === null || classNames === undefined) {
      console.error("Could not find class name for a module. Skipping this");
      return;
    }
    let resourceType: ModuleType;
    classNames.split(" ").forEach((name) => {
      switch (name) {
        //Follow up to get dueDate on these
        case ModuleType.ASSIGNMENT:
        case ModuleType.TURNITIN:
          resourceType = name;
          this.addFollowUpModule(module, title, resourceType);
          break;
        //add these to listOfResources
        case ModuleType.CHOICE:
        case ModuleType.CHOICEGROUP:
        case ModuleType.RESOURCE:
        case ModuleType.URL:
        case ModuleType.PAGE:
        case ModuleType.FOLDER:
        case ModuleType.QUIZ:
          resourceType = name;
          this.addResouceModuleData(module, title, resourceType);
          break;
        //ignore these types
        case ModuleType.LABEL:
        case ModuleType.FORUM:
          break;
        default:
          if (resourceType === undefined) {
            resourceType = ModuleType.UNKNOWN;
          }
      }
    });
  }

  private addResouceModuleData(
    module: cheerio.Element,
    title: string,
    type: ModuleType
  ) {
    if (this.isModuleMarkedComplete(module)) {
      return;
    }

    const url = this.getModuleUrl(module);
    const name = this.getModuleName(module);
    this.listOfResources.push({
      courseUrl: this.courseUrl,
      resourceUrl: url,
      compositeId: "dummyCOMPId", //TODO: Implement
      sectionTitle: title,
      name,
      type,
      dueDate: null,
    });
  }

  private addFollowUpModule(
    module: cheerio.Element,
    title: string,
    type: ModuleType
  ) {
    if (this.isModuleMarkedComplete(module)) {
      return;
    }

    const url = this.getModuleUrl(module);
    const name = this.getModuleName(module);
    this.listOfFollowUps.push({
      courseUrl: this.courseUrl,
      resourceUrl: url,
      compositeId: "dummyCOMPId",
      sectionTitle: title,
      name,
      type,
      dueDate: null,
    });
  }

  private getModuleUrl(module: cheerio.Element): string {
    const $ = this.cheerioApi;
    const urlElement = $(module).find(Constants.moduleAnchorSelector);
    if (urlElement.length === 0) {
      return;
    }
    if (urlElement.length > 1) {
      console.error("Received multiple anchors for module");
      throw new ScraperError(UNEXPECTED_DATA);
    }

    const url = $(urlElement).attr("href");
    if (url === undefined || url === null) {
      console.error("No href on anchor!");
      throw new ScraperError(UNEXPECTED_DATA);
    }
    return url;
  }

  private getModuleName(module: cheerio.Element): string {
    const $ = this.cheerioApi;
    const nameInput = $(module).find(Constants.moduleSpanNameSelector);
    if (nameInput.length === 0) {
      console.warn("No name span found for this module!");
      return $(module)
        .find("span.instancename")
        .text()
        .trim()
        .replace(/\s+/g, " ");
    }

    let name = nameInput.attr("value");
    return name;
  }

  private isModuleMarkedComplete(module: cheerio.Element): boolean {
    //weirdly, the input with completionstate = 0 means it is complete and 1 means it is not
    const $ = this.cheerioApi;
    const completeInput = $(module).find(
      Constants.moduleCompletionInputSelector
    );
    if (completeInput.length === 0) {
      return false;
    }

    const completeValue = completeInput.attr("value");
    return completeValue === "0";
  }
}
