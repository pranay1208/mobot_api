//* HTML Scraper for individual module pages

import * as cheerio from "cheerio";
import Constants from "./constants";

/**
 * Provides generic followup data which typically contains the due date and completion status of modules
 **/
export interface FollowUpData {
  date: string;
  completed: boolean;
}

/**
 * Gets specific information from assignment page
 * @param html The html file for the assignment page
 * @returns The due date and inferred completion status of the assignment
 */
export const getAssignmentData = (html: string): FollowUpData => {
  const $ = cheerio.load(html);
  const tableRows = $(Constants.assignmentTrSelector);
  let date: string = "";
  let completed: boolean = false;
  if (tableRows.length === 0) {
    return {
      date,
      completed,
    };
  }

  tableRows.each((index, tr) => {
    const headerText = stringDeepCleanse($(tr).find("th").text(), true);
    if (headerText === "due date") {
      date = $(tr).find("td").text();
    }
    if (headerText === "submission status") {
      const submittedText = stringDeepCleanse($(tr).find("td").text(), true);
      completed = submittedText === "submitted for grading";
    }
  });
  return {
    date: stringDeepCleanse(date),
    completed,
  };
};

/**
 * Gets specific information from Turnitin page
 * @param html The html file for the turnitin page
 * @returns The due date and inferred completion status of the assignment
 */
export const getTurnitinData = (html: string): FollowUpData => {
  const $ = cheerio.load(html);
  const td = $(Constants.turnitinDueDateSelector);
  if (td.length === 0) {
    return {
      date: "",
      completed: false,
    };
  }
  const date = td.text();
  const completed = $(Constants.turnitinCompletedSelector).length > 0;
  // need to remove hyphen for clean date parsing
  return {
    date: stringDeepCleanse(date).replace("-", ""),
    completed,
  };
};

/**
 * Clean a string by removing all double and trailing spaces from it
 * @param s The string to clean
 * @param lower indicates whether the returned string should be lower
 * @returns cleaned string
 */
const stringDeepCleanse = (s: string, lower = false): string => {
  s = s.trim().replace(/\s+/g, " ");
  if (lower) {
    s = s.toLowerCase();
  }
  return s;
};
