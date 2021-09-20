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

export interface ScrapeResponseData {
  courseUrl: string;
  compositeId: string;
  type: ModuleType;
  name: string;
  dueDate: string | null; //TODO: Decide type
  sectionTitle: string;
  url: string;
}

export enum ModuleType {
  ASSIGNMENT = "assign",
  TURNITIN = "turnitintooltwo",
  CHOICE = "choice",
  CHOICEGROUP = "choicegroup",
  QUIZ = "quiz",
  FORUM = "forum",
  RESOURCE = "resource",
  URL = "url",
  PAGE = "page",

  UNKNOWN = "UNKNOWN TYPE",
  //IGNORE
  LABEL = "label",
}

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
