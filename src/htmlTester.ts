import { readFileSync } from "fs";
import { CourseScraper } from "./scrape/course";

const html = readFileSync("./mocks/mockCourse.html", "utf-8");

const courseScraper = new CourseScraper(html, "url");
courseScraper.run();
console.log(courseScraper.getListOfResources());
