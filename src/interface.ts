/**
 * This interface indicates the expected structure of the post request body
 * ! Make sure this is synced with the mobile application
 */
export interface ScrapeBody {
  username?: string;
  password?: string;
  courses?: string;
}

/**
 * This interface indicates the relevant information required to run a scrape, i.e. login credentials and which courses to retrieve information for
 */
export interface ScrapeRequestParams {
  username: string;
  password: string;
  relevantCourseList: string[];
}

/**
 * This interface indicates the information for each module
 */
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

/**
 * The ModuleType enum identifies what kind of resource is being referred to
 */
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

export interface ScraperErrorType {
  name: string;
  status: number;
  message: string;
}
