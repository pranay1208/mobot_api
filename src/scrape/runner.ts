import {
  ScrapeBody,
  ScrapeRequestParams,
  ScrapeResponseData,
} from "../interface";
import { ScraperError } from "../utils/error";
import Constants from "./constants";
import MoodleScraper from "./scraper";

export const makeScrapeParams = (body: ScrapeBody): ScrapeRequestParams => {
  const COURSE_URL_REGEX = Constants.courseRegex;
  const username: string = body.username;
  if (username === null || username === undefined || username === "") {
    console.warn("No username provided");
    throw new Error("No username field found");
  }
  const password: string = body.password;
  if (password === null || password === undefined || password === "") {
    console.warn("No password provided");
    throw new Error("No password field found");
  }

  const relevantCourseUrls: string = body.relevantCourses.trim();
  if (
    relevantCourseUrls === null ||
    relevantCourseUrls === undefined ||
    relevantCourseUrls === ""
  ) {
    console.warn("No relevantCourses provided");
    throw new Error("No relevantCourses field found");
  }

  let listOfCourseUrls = relevantCourseUrls.split(";");
  listOfCourseUrls = listOfCourseUrls.map((url) => {
    const trimmedUrl = url.trim();
    const regexResult = trimmedUrl.match(COURSE_URL_REGEX);
    if (regexResult === null || regexResult[0] !== regexResult.input) {
      console.warn("Regex mismatch error", regexResult);
      throw new Error(
        "Improperly formatted relevantCourses. Should be valid URLs delimited by ';'"
      );
    }
    return trimmedUrl;
  });
  return {
    username,
    password,
    relevantCourseList: listOfCourseUrls,
  };
};

export const scrapeRunner = async (
  params: ScrapeRequestParams
): Promise<ScrapeResponseData> => {
  const scraper = new MoodleScraper(params);

  try {
    await scraper.login();
  } catch (e) {
    const err = e as ScraperError;
    console.error("Error in login", err);
    throw err;
  }

  //rest of functions should be try-catched with a "end()" in finally

  return {};
};
