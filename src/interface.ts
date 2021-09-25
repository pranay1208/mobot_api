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
  type: ModuleType;
  name: string;
  dueDate: string | null; //TODO: Decide type
  sectionTitle: string;
  resourceUrl: string;
  completed: boolean;
  comments: string | null;
}

export enum ModuleType {
  ASSIGNMENT = "assign",
  TURNITIN = "turnitintooltwo",
  CHOICE = "choice",
  CHOICEGROUP = "choicegroup",
  QUIZ = "quiz",
  RESOURCE = "resource",
  URL = "url",
  PAGE = "page",
  FOLDER = "folder",

  UNKNOWN = "UNKNOWN TYPE",
  //IGNORE
  LABEL = "label",
  FORUM = "forum",
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
