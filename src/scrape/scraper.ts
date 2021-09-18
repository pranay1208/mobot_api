import axios, { AxiosResponse } from "axios";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

import { ScrapeRequestParams, ScrapeResponseData } from "../interface";
import Constants from "./constants";
import {
  CRED_INVALID,
  INTERNAL_ERROR,
  ScraperError,
  TIMED_OUT,
} from "../utils/error";

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

    await this.page.click(Constants.logoutSelector);
    await this.page.waitForNavigation();
    await this.browser.close();
  }

  async login() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
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
      console.warn("Entered incorrect credenticals");
      throw new ScraperError(CRED_INVALID);
    }

    this.cookies = (await page.cookies())
      .map((ck) => `${ck.name}=${ck.value}`)
      .join("; ");

    return;
  }

  async getAssignments(): Promise<Record<string, ScrapeResponseData>> {
    const response: Record<string, ScrapeResponseData> = {};

    const promiseCallsForAssignments: Promise<ScrapeResponseData>[] = [];
    for (const url of this.courseUrlList) {
      promiseCallsForAssignments.push(this.courseAction(url));
    }

    console.log(this.courseUrlList.length);
    const listOfResponses = await Promise.all(promiseCallsForAssignments);
    console.log(listOfResponses);
    if (listOfResponses.length !== this.courseUrlList.length) {
      console.error(
        `Response length ${listOfResponses.length}, but courseUrl length ${this.courseUrlList.length}`
      );
      throw new ScraperError(INTERNAL_ERROR);
    }
    return response;
  }

  async courseAction(url: string): Promise<ScrapeResponseData> {
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

    const $ = cheerio.load(coursePageResponse.data);
    console.log(
      `Found ${$(Constants.assignmentsSelector).length} assignments for ${url}`
    );

    return {};
  }
}
