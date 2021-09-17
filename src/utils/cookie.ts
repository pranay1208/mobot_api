import { CookieData } from "../interface";

export class CookieHandler {
  private cookieJar: Record<string, CookieData>;
  public static MOODLE_DOMAIN = "moodle.hku.hk";
  public static PORTAL_DOMAIN = "hkuportal.hku.hk";
  public static UNSET = "UNSET";
  public static ALL_DOMAINS = "ALL_DOMAINS";

  constructor() {
    this.cookieJar = {};
  }

  public getCookie(domain: string): string {
    const cookiesInDomain: CookieData[] = [];
    for (const key in this.cookieJar) {
      if (
        this.cookieJar[key].domain === domain ||
        domain === CookieHandler.ALL_DOMAINS
      ) {
        cookiesInDomain.push(this.cookieJar[key]);
      }
    }
    return cookiesInDomain.map((ck) => `${ck.name}=${ck.value}`).join("; ");
  }

  public setCookie(domain: string, name: string, value: string): void {
    if (domain === CookieHandler.UNSET) {
      console.error("No cookie domain has been set");
      throw Error(`No cookie domain set for ${name}=${value}`);
    }
    const key = `${name}|${domain}`;
    if (key in this.cookieJar) {
      this.cookieJar[key].value = value;
    } else {
      this.cookieJar[key] = { domain, name, value };
    }
    return;
  }

  public deleteCookie(domain: string, name: string): void {
    const key = `${name}|${domain}`;
    if (key in this.cookieJar) {
      delete this.cookieJar[key];
    }
    return;
  }
}

export const cookieParser = (setCookieHeader: string[]): CookieData[] => {
  const cookieData: CookieData[] = [];
  for (const cookie of setCookieHeader) {
    const relevantPortion = cookie.slice(0, cookie.indexOf(";"));
    const nameValSeparator = relevantPortion.indexOf("=");
    const name = relevantPortion.slice(0, nameValSeparator);
    const value = relevantPortion.slice(nameValSeparator + 1);

    cookieData.push({
      name,
      value,
      domain: CookieHandler.UNSET,
    });
  }
  return cookieData;
};
