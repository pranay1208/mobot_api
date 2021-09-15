export interface ScrapeBody {
    username?: string,
    password?: string,
    relevantCourses?: string,
}

export interface ScrapeRequestParams {
    username: string,
    password: string,
    relevantCourseList: string[];
}

export interface ScrapeResponseData {
    
}