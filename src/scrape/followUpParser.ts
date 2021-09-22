import * as cheerio from "cheerio";
import Constants from "./constants";

export const getAssignmentDueDate = (html: string): string => {
  const $ = cheerio.load(html);
  const tableRows = $(Constants.assignmentTrSelector);
  if (tableRows.length === 0) {
    console.error("Could not find the selector element");
    return "";
  }

  let date: string = "";

  tableRows.each((index, tr) => {
    const headerText = $(tr).find("th").text().toLowerCase().trim();
    if (headerText === "due date") {
      date = $(tr).find("td").text();
      return false;
    }
  });
  return date.trim().replace(/\s+/g, " ");
};

export const getTurnitinDueDate = (html: string): string => {
  const $ = cheerio.load(html);
  const td = $(Constants.turnitinDueDateSelector);
  if (td.length === 0) {
    console.error("Could not find the selector element");
    return "";
  }
  let cleanedText = td.text().trim();
  // need to remove hyphen for clean date parsing
  return cleanedText.replace("-", "").replace(/\s+/g, " ");
};
