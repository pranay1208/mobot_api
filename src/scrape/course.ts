//* HTML scraper for the general course page

import * as cheerio from "cheerio";
import { ModuleType, ScrapeResponseData } from "../interface";
import { ScraperError, UNEXPECTED_DATA } from "../utils/error";
import Constants from "./constants";
import { getAssignmentData, getTurnitinData } from "./followUpParsers";

export function getLogoutBody(html: string) {
  const $ = cheerio.load(html);
  const input = $(Constants.logoutInputSelector);

  if (input === null || input === undefined) {
    return {};
  }

  const inputName = input.attr("name");
  if (inputName === undefined) {
    console.error("Input did not have a name");
    throw new ScraperError(UNEXPECTED_DATA);
  }

  return {
    [inputName]: input.attr("value"),
  };
}

export class CourseScraper {
  private cheerioApi: cheerio.CheerioAPI;
  private listOfResources: ScrapeResponseData[];
  listOfFollowUps: ScrapeResponseData[];
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

  async runFollowUps(htmls: string[]): Promise<void> {
    const finalFollowUps: ScrapeResponseData[] = htmls.map((html, index) => {
      return this.getResourceDueDate(html, this.listOfFollowUps[index]);
    });

    this.listOfResources.push(...finalFollowUps);
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

  private getResourceDueDate(
    html: string,
    followUp: ScrapeResponseData
  ): ScrapeResponseData {
    if (html === "") {
      return followUp;
    }
    switch (followUp.type) {
      case ModuleType.ASSIGNMENT:
        const assignData = getAssignmentData(html);
        followUp.dueDate = assignData.date;
        followUp.completed = followUp.completed || assignData.completed;
        break;
      case ModuleType.TURNITIN:
        const ttinData = getTurnitinData(html);
        followUp.dueDate = ttinData.date;
        followUp.completed = followUp.completed || ttinData.completed;
        break;
      default:
        console.log("Received unexpected ModuleType", followUp.type);
    }
    return followUp;
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
        //Non-action items to be added to list of resources
        case ModuleType.RESOURCE:
        case ModuleType.URL:
        case ModuleType.PAGE:
        case ModuleType.FOLDER:
          resourceType = name;
          //TODO: Check if user cares about resource data
          this.addResouceModuleData(module, title, resourceType);
          break;
        //Action items to be added to list of resources
        case ModuleType.CHOICE:
        case ModuleType.CHOICEGROUP:
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
    const completed = this.isModuleMarkedComplete(module);
    const comments = this.getModuleComments(module);
    const name = this.getModuleName(module);
    let url: string;
    const id = this.getModuleId(module);
    if (id === null) {
      url = this.getModuleUrl(module);
    } else {
      url = `${this.courseUrl}#${id}`;
    }
    this.listOfResources.push({
      courseUrl: this.courseUrl,
      resourceUrl: url,
      sectionTitle: title,
      name,
      type,
      completed,
      comments,
      dueDate: null,
    });
  }

  private addFollowUpModule(
    module: cheerio.Element,
    title: string,
    type: ModuleType
  ) {
    let listToPushTo = this.listOfFollowUps;
    let completed = false;
    if (this.isModuleMarkedComplete(module)) {
      listToPushTo = this.listOfResources;
      completed = true;
    }
    const comments = this.getModuleComments(module);
    const url = this.getModuleUrl(module);
    const name = this.getModuleName(module);
    listToPushTo.push({
      courseUrl: this.courseUrl,
      resourceUrl: url,
      sectionTitle: title,
      name,
      type,
      completed,
      comments,
      dueDate: null,
    });
  }

  private getModuleUrl(module: cheerio.Element): string {
    const $ = this.cheerioApi;
    const urlElement = $(module).find(Constants.moduleAnchorSelector);
    if (urlElement.length === 0) {
      console.error("No url element found");
      throw new ScraperError(UNEXPECTED_DATA);
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
      return $(module)
        .find("span.instancename")
        .text()
        .trim()
        .replace(/\s+/g, " ");
    }

    let name = nameInput.attr("value");
    if (name === undefined) {
      console.error("No attribute 'value' found");
      throw new ScraperError(UNEXPECTED_DATA);
    }
    return name;
  }

  private getModuleId(module: cheerio.Element): string | null {
    const $ = this.cheerioApi;
    const id = $(module).attr("id");
    if (id === null || id === undefined || id === "") {
      return null;
    }
    return id;
  }

  private getModuleComments(module: cheerio.Element): string | null {
    const $ = this.cheerioApi;
    const commentDiv = $(module).find(Constants.moduleCommentsSelector);
    if (commentDiv.length === 0) {
      return null;
    }
    return commentDiv.text().trim().replace(/\s+/g, " ");
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
