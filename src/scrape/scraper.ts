import { ScrapeRequestParams } from "../interface"
import { CookieHandler } from "../utils/cookie"
import { NOT_SUPPORTED, ScraperError } from "../utils/error"

export default class MoodleScraper {
  private cookieHandler: CookieHandler
  private courseUrlList: string[]
  private username: string
  private password: string

  constructor(params: ScrapeRequestParams) {
    this.cookieHandler = new CookieHandler()
    this.courseUrlList = params.relevantCourseList
    this.username = params.username
    this.password = params.password
  }

  async login() {
    throw new ScraperError(NOT_SUPPORTED)
  }
}
