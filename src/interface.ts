export interface ScrapeBody {
  username?: string;
  password?: string;
  relevantCourses?: string;
}

export interface ScrapeRequestParams {
  username: string;
  password: string;
  relevantCourseList: string[];
}

export interface ScrapeResponseData {}

export interface CookieData {
  domain: string;
  name: string;
  value: string;
}

export interface ScraperErrorType {
  name: string;
  status: number;
  message: string;
}
