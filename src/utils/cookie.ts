import { CookieData } from "../interface"

export class CookieHandler {
  cookieJar: Record<string, CookieData>

  constructor() {
    this.cookieJar = {}
  }

  public getCookie(domain: string): string {
    const cookiesInDomain: CookieData[] = []
    for (const key in this.cookieJar) {
      if (this.cookieJar[key].domain === domain) {
        cookiesInDomain.push(this.cookieJar[key])
      }
    }
    return cookiesInDomain.map((ck) => `${ck.name}=${ck.value}`).join("; ")
  }

  public setCookie(domain: string, name: string, value: string): void {
    const key = `${name}|${domain}`
    if (key in this.cookieJar) {
      this.cookieJar[key].value = value
    } else {
      this.cookieJar[key] = { domain, name, value }
    }
    return
  }

  public deleteCookie(domain: string, name: string): void {
    const key = `${name}|${domain}`
    if (key in this.cookieJar) {
      delete this.cookieJar[key]
    }
    return
  }
}
