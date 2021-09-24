import axios, { AxiosError, AxiosResponse } from "axios";
import { stringify } from "qs";
import { CookieHandler, cookieParser } from "../utils/cookie";
import { CRED_INVALID, LOGIN_ERROR, ScraperError } from "../utils/error";
import Constants from "./constants";

export async function axiosLogin(username, password): Promise<string> {
  const cookieHandler = new CookieHandler();
  //Submit the form
  const postResult = await makePostReq(username, password);
  cookieSetterInterface(
    postResult.cookies,
    cookieHandler,
    CookieHandler.PORTAL_DOMAIN
  );

  //Initiate Authentication
  const initResult = await initAuthReq(
    postResult.url,
    cookieHandler.getCookie(CookieHandler.MOODLE_DOMAIN)
  );
  cookieSetterInterface(
    initResult.cookies,
    cookieHandler,
    CookieHandler.MOODLE_DOMAIN
  );

  //Complete Authentication
  const finalCookies = await finalAuthReq(
    initResult.url,
    cookieHandler.getCookie(CookieHandler.MOODLE_DOMAIN)
  );
  cookieSetterInterface(
    finalCookies,
    cookieHandler,
    CookieHandler.MOODLE_DOMAIN
  );

  return cookieHandler.getCookie(CookieHandler.MOODLE_DOMAIN);
}

export const cookieSetterInterface = (
  setCookie: string[],
  cookieHandler: CookieHandler,
  defaultDomain: string
) => {
  const data = cookieParser(setCookie);
  data.forEach((cookieData) => {
    let cookieDomain = cookieData.domain;
    if (cookieDomain == CookieHandler.UNSET) {
      cookieDomain = defaultDomain;
    }
    cookieHandler.setCookie(cookieDomain, cookieData.name, cookieData.value);
  });
};

interface AxiosFunctionResponse {
  url: string;
  cookies: string[];
}

const generateKeyId = () => {
  const now = new Date();
  return `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
};

const makePostReq = async (
  username,
  password
): Promise<AxiosFunctionResponse> => {
  const body = {
    keyid: generateKeyId(),
    service: "https://moodle.hku.hk/login/index.php?authCAS=CAS",
    username,
    password,
  };

  const response: AxiosResponse<string> = await axios.post(
    Constants.loginPostUrl,
    stringify(body)
  );

  if (response.data.includes("Login failed")) {
    throw new ScraperError(CRED_INVALID);
  }

  const result = response.data.match(Constants.successLoginRegex);
  if (result === null || result === undefined) {
    throw new ScraperError(LOGIN_ERROR);
  }
  return {
    url: result[0],
    cookies: response.headers["set-cookie"],
  };
};

const initAuthReq = async (
  url: string,
  cookies: string
): Promise<AxiosFunctionResponse> => {
  try {
    await axios.get(url, {
      headers: {
        Cookie: cookies,
      },
      maxRedirects: 0,
    });
  } catch (e) {
    const err = e as AxiosError;
    return {
      url: err.response.headers.location,
      cookies: err.response.headers["set-cookie"],
    };
  }
};

const finalAuthReq = async (
  url: string,
  cookies: string
): Promise<string[]> => {
  try {
    await axios.get(url, {
      headers: {
        Cookie: cookies,
      },
      maxRedirects: 0,
    });
    throw new ScraperError(LOGIN_ERROR);
  } catch (e) {
    if (e instanceof ScraperError) {
      throw e;
    }
    const err = e as AxiosError;
    const loc = err.response.headers.location as string;

    if (!loc.includes("testsession")) {
      console.error("UNEXPECTED REDIRECT URL");
      throw new ScraperError(LOGIN_ERROR);
    }

    const returnCookie: string[] = [];
    for (const ck of (err.response.headers["set-cookie"] as string[]) || []) {
      if (ck.includes("MoodleSession")) {
        returnCookie.push(ck);
      }
    }
    return returnCookie;
  }
};
