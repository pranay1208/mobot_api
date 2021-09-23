import axios, { AxiosResponse } from "axios";
import puppeteer from "puppeteer";

import { ScrapeRequestParams, ScrapeResponseData } from "../interface";
import Constants from "./constants";
import {
  CRED_INVALID,
  INTERNAL_ERROR,
  ScraperError,
  TIMED_OUT,
} from "../utils/error";
import { CourseScraper } from "./course";

export default class MoodleScraper {
  cookies!: string;
  private courseUrlList: string[];
  private username: string;
  private password: string;

  browser: puppeteer.Browser;
  page: puppeteer.Page;

  constructor(params: ScrapeRequestParams) {
    this.courseUrlList = params.relevantCourseList;
    this.username = params.username;
    this.password = params.password;
  }

  async end() {
    if (this.browser === undefined || this.page === undefined) {
      console.error("Browser or page is undefined");
      throw new ScraperError(INTERNAL_ERROR);
    }
    console.log("Ending session");
    await this.page.click(Constants.logoutDropDownSelector);
    await this.page.waitForTimeout(500); // to allow for dropdown to transition properly
    await this.page.click(Constants.logoutSelector);
    await this.page.waitForSelector(Constants.logoutSuccessSelector, {
      timeout: 3000,
    });
    await this.browser.close();
  }

  async login() {
    this.browser = await puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();

    console.log("Starting login");

    const page = this.page;
    await page.goto(Constants.loginPageUrl, { waitUntil: "networkidle0" });
    await page.type("#username", this.username);
    await page.type("#password", this.password);
    await page.keyboard.press("Enter");

    let loginResult: puppeteer.ElementHandle<Element>;
    try {
      loginResult = await Promise.race([
        page.waitForSelector("div.loginerror", { timeout: 5000 }),
        page.waitForSelector("#page"),
      ]);
    } catch (err) {
      console.error("Time out after clicking login");
      throw new ScraperError(TIMED_OUT);
    }

    const classHandle = await loginResult.getProperty("className");
    const className = await classHandle.jsonValue();
    if (className === "loginerror") {
      console.warn("Entered incorrect credentials");
      throw new ScraperError(CRED_INVALID);
    }

    this.cookies = (await page.cookies())
      .map((ck) => `${ck.name}=${ck.value}`)
      .join("; ");

    return;
  }

  async getResources(): Promise<ScrapeResponseData[]> {
    const promiseCallsForAssignments: Promise<ScrapeResponseData[]>[] = [];
    for (const url of this.courseUrlList) {
      promiseCallsForAssignments.push(this.courseAction(url));
    }

    const listOfResponses = await Promise.all(promiseCallsForAssignments);
    if (listOfResponses.length !== this.courseUrlList.length) {
      console.error(
        `Response length ${listOfResponses.length}, but courseUrl length ${this.courseUrlList.length}`
      );
      throw new ScraperError(INTERNAL_ERROR);
    }
    const finalList: ScrapeResponseData[] = [];
    listOfResponses.forEach((responses) => finalList.push(...responses));

    return finalList;
  }

  async courseAction(url: string): Promise<ScrapeResponseData[]> {
    let coursePageResponse: AxiosResponse<string>;
    try {
      coursePageResponse = await axios.get(url, {
        headers: {
          Cookie: this.cookies,
        },
      });
    } catch (err) {
      console.error("Recieved error from axios", err);
      throw new ScraperError(INTERNAL_ERROR);
    }
    const courseScraper = new CourseScraper(coursePageResponse.data, url);
    courseScraper.run();

    // Need to complete followups
    const htmlPromise = courseScraper.listOfFollowUps.map((followup) =>
      this.makeFollowUpRequest(followup.resourceUrl)
    );
    const assignmentHtmls = await Promise.all(htmlPromise);

    courseScraper.runFollowUps(assignmentHtmls);

    return courseScraper.getListOfResources();
  }

  async makeFollowUpRequest(url: string): Promise<string> {
    let html: string;
    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        headers: {
          Cookie: this.cookies,
        },
      });
      html = response.data;
    } catch (err) {
      html = "";
    }
    return html;
  }
}
