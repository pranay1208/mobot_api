import * as cheerio from "cheerio";
import { ModuleType, ScrapeResponseData } from "../interface";
import { ScraperError, UNEXPECTED_DATA } from "../utils/error";
import Constants from "./constants";

export class CourseScraper {
  cheerioApi: cheerio.CheerioAPI;
  listOfResources: ScrapeResponseData[];
  listOfFollowUps: string[];
  courseUrl: string;

  constructor(html: string, courseUrl: string) {
    this.cheerioApi = cheerio.load(html);
    this.listOfResources = [];
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
        //TODO: we want to look into these
        case ModuleType.ASSIGNMENT:
        case ModuleType.TURNITIN:
        case ModuleType.QUIZ:
          resourceType = name;
          break;
        //add these to listOfResources
        case ModuleType.CHOICE:
        case ModuleType.CHOICEGROUP:
        case ModuleType.RESOURCE:
        case ModuleType.URL:
        case ModuleType.PAGE:
        case ModuleType.FOLDER:
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
      console.error("No name span found for this module!");
      throw new ScraperError(UNEXPECTED_DATA);
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
      console.warn("Could not find completion for this module");
      return false;
    }

    const completeValue = completeInput.attr("value");
    return completeValue === "0";
  }
}
