import axios, { AxiosError, AxiosResponse } from "axios";
import { stringify } from "qs";

import { ScrapeRequestParams, ScrapeResponseData } from "../interface";
import Constants from "./constants";
import { BAD_URL_PROVIDED, INTERNAL_ERROR, ScraperError } from "../utils/error";
import { CourseScraper, getLogoutBody } from "./course";
import { axiosLogin } from "./login";

export default class MoodleScraper {
  cookies!: string;
  private courseUrlList: string[];
  private username: string;
  private password: string;

  constructor(params: ScrapeRequestParams) {
    this.courseUrlList = params.relevantCourseList;
    this.username = params.username;
    this.password = params.password;
  }

  async end() {
    const startLogout: AxiosResponse<string> = await axios.get(
      Constants.logoutInitUrl,
      {
        headers: {
          Cookie: this.cookies,
        },
      }
    );
    const body = getLogoutBody(startLogout.data);
    try {
      await axios.post(Constants.logoutInitUrl, stringify(body), {
        headers: {
          Cookie: this.cookies,
        },
        maxRedirects: 0,
      });
    } finally {
      return;
    }
  }

  async login() {
    this.cookies = await axiosLogin(this.username, this.password);
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
    } catch (e) {
      const err = e as AxiosError;
      console.error("Recieved error from axios", err.message);

      if (err.message === "Request failed with status code 404") {
        throw new ScraperError(BAD_URL_PROVIDED);
      }
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
