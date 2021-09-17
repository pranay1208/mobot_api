import axiosInterface, { AxiosResponse } from "axios";
import { writeFileSync } from "fs";
import { stringify } from "qs";
import { ScraperError, UNEXPECTED_DATA } from "../utils/error";
import Constants from "./constants";

function generateKeyId(): string {
  const now = new Date();
  return `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
}

const axios = axiosInterface.create({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36",
  },
});

//Login functions
async function startLogin(): Promise<string[]> {
  console.log("--------------- Starting startLogin");
  const response: AxiosResponse<string> = await axios.get(Constants.startUrl);

  if (!response.data.includes(Constants.startValidator)) {
    console.error(
      "Did not find the validator text inside the startLogin function"
    );
    throw new ScraperError(UNEXPECTED_DATA);
  }

  const setCookieHeader = (response.headers["set-cookie"] ?? []) as string[];
  return setCookieHeader;
}

async function initAuthenticate(cookie: string): Promise<string[]> {
  console.log("--------------- Starting initAuthenticate");
  const response: AxiosResponse<string> = await axios.get(
    Constants.initLoginUrl,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  if (!response.data.includes(Constants.initLoginValidator)) {
    console.error(
      "Did not find the validator text inside the initAuthenticate function"
    );
    throw new ScraperError(UNEXPECTED_DATA);
  }

  const setCookieHeader = (response.headers["set-cookie"] ?? []) as string[];
  return setCookieHeader;
}

async function getLoginPage(cookie: string): Promise<string[]> {
  console.log("--------------- Starting getLoginPage");
  const response: AxiosResponse<string> = await axios.get(
    Constants.loginPageUrl,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  if (!response.data.includes(Constants.loginPageValidator)) {
    console.error(
      "Did not find the validator text inside the getLoginPage function"
    );
    throw new ScraperError(UNEXPECTED_DATA);
  }

  const setCookieHeader = (response.headers["set-cookie"] ?? []) as string[];
  return setCookieHeader;
}

async function submitLoginForm(
  username: string,
  password: string,
  cookie: string
): Promise<{
  url: string;
  setCookieHeader: string[];
}> {
  console.log("--------------- Starting submitLoginForm");
  const keyid = generateKeyId();
  const body = {
    keyid,
    service: "https://moodle.hku.hk/login/index.php?authCAS=CAS",
    username,
    password,
  };

  const response: AxiosResponse<string> = await axios.post(
    Constants.loginFormSubmitUrl,
    stringify(body),
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  //TODO: Check for wrong password case
  //TODO: Validator case

  const result = response.data.match(Constants.successLoginRegex);
  if (result === null) {
    console.error("Could not find success URL after login");
    throw new ScraperError(UNEXPECTED_DATA);
  }
  const setCookieHeaderRaw = (response.headers["set-cookie"] ?? []) as string[];

  const setCookieHeader = setCookieHeaderRaw.filter(
    (str) => !str.includes("Domain=hkuportal.hku.hk;")
  );

  writeFileSync("submit.html", response.data);
  return {
    url: result[0],
    setCookieHeader,
  };
}

async function finalLoginStep(url: string, cookie: string): Promise<string[]> {
  console.log("--------------- Starting finalLoginStep");
  const response: AxiosResponse<string> = await axios.get(url, {
    headers: {
      Cookie: cookie,
    },
  });

  writeFileSync("final.html", response.data);

  if (!response.data.includes(Constants.finalLoginValidator)) {
    console.error(
      "Did not find the validator text inside the finalLoginStep function"
    );
    throw new ScraperError(UNEXPECTED_DATA);
  }
  const setCookieHeader = (response.headers["set-cookie"] ?? []) as string[];
  return setCookieHeader;
}

const LoginFunctions = {
  startLogin,
  initAuthenticate,
  getLoginPage,
  submitLoginForm,
  finalLoginStep,
};

export default LoginFunctions;
