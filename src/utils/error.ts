import { ScraperErrorType } from "../interface";

/**
 * Defines errors encountered by the scraper
 */
export class ScraperError extends Error {
  status: number;
  constructor(error: ScraperErrorType) {
    super(error.message);
    this.name = error.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = error.status;
  }
}

//? User errors
/**
 * When credentials provided are invalid
 */
export const CRED_INVALID: ScraperErrorType = {
  name: "Credentials Invalid",
  status: 403,
  message: "The credentials you provided were invalid",
};

/**
 * When the URLs provided are invalid (i.e. malformed)
 */
export const BAD_URL_PROVIDED: ScraperErrorType = {
  name: "Bad URL Provided",
  status: 400,
  message: "One or more of the URLs provided are invalid",
};

//? Errors with application

/**
 * When encountering something unexpected during login
 */
export const LOGIN_ERROR: ScraperErrorType = {
  name: "Login Error",
  status: 500,
  message: "There was an issue on our side while attempting to log in",
};

/**
 * Generic internal error
 */
export const INTERNAL_ERROR: ScraperErrorType = {
  name: "Internal Error",
  status: 500,
  message: "There was an internal error while retrieving your data",
};

/**
 * Generic error to propagate when a certain feature is not implemented yet
 */
export const NOT_SUPPORTED: ScraperErrorType = {
  name: "Not Supported",
  status: 400,
  message:
    "You are trying to use something that is not supported. Please try again in the future",
};

/**
 * Error when encountering somethig unexpected during course-scraping
 */
export const UNEXPECTED_DATA: ScraperErrorType = {
  name: "Unexpected Error",
  status: 500,
  message:
    "We've received some unexpected data, and are working on fixing this. Please try again in a while",
};

/**
 * When a request times out (possibly during Moodle downtime)
 */
export const TIMED_OUT: ScraperErrorType = {
  name: "Request Timeout",
  status: 500,
  message: "HKU Moodle did not respond",
};
// add more errors here
