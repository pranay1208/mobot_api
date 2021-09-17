import axios from "axios";
import { writeFileSync } from "fs";
import { ScrapeRequestParams } from "../interface";
import { CookieHandler, cookieParser } from "../utils/cookie";
import LoginFunctions from "./login";

export default class MoodleScraper {
  private cookieHandler: CookieHandler;
  private courseUrlList: string[];
  private username: string;
  private password: string;

  constructor(params: ScrapeRequestParams) {
    this.cookieHandler = new CookieHandler();
    this.courseUrlList = params.relevantCourseList;
    this.username = params.username;
    this.password = params.password;
  }

  private setCookieInterface(setCookieHeader: string[], domain: string) {
    cookieParser(setCookieHeader).forEach((cookie) => {
      if (cookie.domain !== CookieHandler.UNSET) {
        domain = cookie.domain;
      }
      this.cookieHandler.setCookie(domain, cookie.name, cookie.value);
    });
  }

  async login() {
    try {
      const setCookieHeader = await LoginFunctions.startLogin();
      this.setCookieInterface(setCookieHeader, CookieHandler.MOODLE_DOMAIN);
    } catch (err) {
      console.error("Failed set up step", err);
      throw err;
    }

    try {
      const setCookieHeader = await LoginFunctions.initAuthenticate(
        this.cookieHandler.getCookie(CookieHandler.MOODLE_DOMAIN)
      );
      this.setCookieInterface(setCookieHeader, CookieHandler.PORTAL_DOMAIN);
    } catch (err) {
      console.error("Failed inititating authentication");
      throw err;
    }

    let url: string;
    try {
      const result = await LoginFunctions.submitLoginForm(
        this.username,
        this.password,
        this.cookieHandler.getCookie(CookieHandler.PORTAL_DOMAIN)
      );
      this.setCookieInterface(
        result.setCookieHeader,
        CookieHandler.PORTAL_DOMAIN
      );
      url = result.url;
    } catch (err) {
      console.warn("Error while submitting login credentials");
      throw err;
    }

    console.log(url);
    const cookies = this.cookieHandler.getCookie(CookieHandler.MOODLE_DOMAIN);
    console.log(`${cookies}`);
    // const response = await axios.get("https://moodle.hku.hk" + url.slice(21), {
    //   headers: {
    //     Cookie: cookies,
    //     Host: "moodle.hku.hk",
    //   },
    // });
    // console.log({ ...response, data: "" });
    // writeFileSync("final.html", response.data);

    try {
      const setCookieHeader = await LoginFunctions.finalLoginStep(
        url,
        this.cookieHandler.getCookie(CookieHandler.MOODLE_DOMAIN)
      );
      this.setCookieInterface(setCookieHeader, CookieHandler.MOODLE_DOMAIN);
    } catch (err) {
      console.error("Error completing login", err);
      throw err;
    }
  }
}
