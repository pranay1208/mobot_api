import axios from "axios";
import { ScrapeRequestParams } from "../interface";

import puppeteer from "puppeteer";
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
  }
}
