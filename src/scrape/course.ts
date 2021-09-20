import * as cheerio from "cheerio";
import { ScrapeResponseData } from "../interface";
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
    console.log(`Found ${sections.length} sections for ${this.courseUrl}`);

    sections.each((index, section) => {
      console.log(`Looking at section ${index} in ${this.courseUrl}`);
      this.sectionExtractor(section);
    });
  }

  private sectionExtractor(section: cheerio.Node): void {
    const $ = this.cheerioApi;
    const sectionTitle: string = this.getSectionHeader(section);
    console.log("Found title:", sectionTitle);
    const sectionModules = $(section).find(Constants.sectionModuleSelector);
    if (sectionModules.length === 0) {
      return;
    }
    console.log(`Found ${sectionModules.length} modules inside`);
    // sectionModules.each((index, module) => {});
  }

  private getSectionHeader(section: cheerio.Node): string {
    const $ = this.cheerioApi;
    const sectionHeaderId = $(section).attr()["aria-labelledby"];
    if (sectionHeaderId === null || sectionHeaderId === undefined) {
      console.error("Did not find header ID on section");
      throw new ScraperError(UNEXPECTED_DATA);
    }

    let sectionHeader = $(section).find(`#${sectionHeaderId}`).text();
    sectionHeader = sectionHeader.trim().replace(/\s+/g, " ");
    return sectionHeader;
  }
}
