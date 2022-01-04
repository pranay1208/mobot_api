import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { makeScrapeParams, scrapeRunner } from "./scrape/runner";
import { ScrapeBody, ScrapeRequestParams } from "./interface";
import { INTERNAL_ERROR, ScraperError } from "./utils/error";
import { decryptText } from "./utils/crypto";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? "8080");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  if (process.env.PUBLIC_KEY === undefined) {
    res.status(500);
    res.send("No public key in .env");
    return;
  }
  res.status(200);
  const publicKey = Buffer.from(process.env.PUBLIC_KEY, "base64").toString(
    "ascii"
  );
  res.send(publicKey);
});

//Endpoint to get data from Moodle
app.post("/scrape", async (req, res) => {
  const body = req.body as ScrapeBody;
  let scrapeParams: ScrapeRequestParams;
  body.password = decryptText(body.password);

  //validate input and convert to uniform format
  try {
    scrapeParams = makeScrapeParams(body);
  } catch (e) {
    const err = e as Error;
    res.status(400);
    res.send(err.message);
    return;
  }

  //run the scrape
  try {
    const responseData = await scrapeRunner(scrapeParams);
    res.status(200);
    res.send(responseData);
  } catch (e) {
    if (!(e instanceof ScraperError)) {
      e = new ScraperError(INTERNAL_ERROR);
    }
    const err = e as ScraperError;
    console.error("Received error", err);
    res.status(err.status);
    res.send(`${err.name}: ${err.message}`);
  }
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
