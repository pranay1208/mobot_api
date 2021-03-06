import dotenv from "dotenv";
import { makeScrapeParams, scrapeRunner } from "./scrape/runner";

const COURSE_URL_PREFIX = "https://moodle.hku.hk/course/view.php?id=";
dotenv.config();
(async () => {
  if (process.argv.length < 3) {
    console.error("USAGE: npm run scrape <course-ids>...");
    return;
  }
  const relevantCourseUrls = process.argv
    .slice(2)
    .map((num) => `${COURSE_URL_PREFIX}${num}`);
  const req = {
    username: process.env.MOODLE_USERNAME,
    password: process.env.MOODLE_PASSWORD,
    courses: relevantCourseUrls.join(";"),
  };
  const params = makeScrapeParams(req);
  // const startTime = Date.now();
  const result = await scrapeRunner(params);
  // const endTime = Date.now();
  console.log(result);
  // console.log(endTime - startTime);
})();
