import * as cheerio from "cheerio";
import Constants from "./constants";

export interface FollowUpData {
  date: string;
  completed: boolean;
}

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

const stringDeepCleanse = (s: string, lower = false): string => {
  s = s.trim().replace(/\s+/g, " ");
  if (lower) {
    s = s.toLowerCase();
  }
  return s;
};
