import { ScraperErrorType } from "../interface";

export class ScraperError extends Error {
  status: number;
  constructor(error: ScraperErrorType) {
    super(error.message);
    this.name = error.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = error.status;
  }
}

export const CRED_INVALID: ScraperErrorType = {
  name: "Credentials Invalid",
  status: 403,
  message: "The credentials you provided were invalid",
};

export const INTERNAL_ERROR: ScraperErrorType = {
  name: "Internal Error",
  status: 500,
  message: "There was an internal error while retrieving your data",
};

export const NOT_SUPPORTED: ScraperErrorType = {
  name: "Not Supported",
  status: 400,
  message:
    "You are trying to use something that is not supported. Please try again in the future",
};

export const UNEXPECTED_DATA: ScraperErrorType = {
  name: "Unexpected Error",
  status: 500,
  message:
    "We've received some unexpected data, and are working on fixing this. Please try again in a while",
};

export const TIMED_OUT: ScraperErrorType = {
  name: "Request Timeout",
  status: 500,
  message: "HKU Moodle did not respond",
};
// add more errors here
