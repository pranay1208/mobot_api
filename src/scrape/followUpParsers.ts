import * as cheerio from "cheerio";
import Constants from "./constants";

export const getAssignmentData = (html: string) => {
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

//TODO: getTurnitinData
export const getTurnitinDueDate = (html: string): string => {
  const $ = cheerio.load(html);
  const td = $(Constants.turnitinDueDateSelector);
  if (td.length === 0) {
    return "";
  }
  let cleanedText = td.text().trim();
  // need to remove hyphen for clean date parsing
  return cleanedText.replace("-", "").replace(/\s+/g, " ");
};

const stringDeepCleanse = (s: string, lower = false): string => {
  s = s.trim().replace(/\s+/g, " ");
  if (lower) {
    s = s.toLowerCase();
  }
  return s;
};
