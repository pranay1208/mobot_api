//strongly typed
const Constants = {
  courseRegex: /https?:\/\/moodle.hku.hk\/course\/view\.php\?id=\d+\/?/,
  successLoginRegex:
    /https?:\/\/moodle\.hku\.hk\/login\/index\.php\?authCAS=CAS&ticket=[0-9a-zA-z\-]+/,

  // URLS
  loginPageUrl:
    "https://hkuportal.hku.hk/cas/login?service=https%3A%2F%2Fmoodle.hku.hk%2Flogin%2Findex.php%3FauthCAS%3DCAS",

  // LOGIN SELECTORS
  logoutDropDownSelector: "#action-menu-toggle-0",
  logoutSelector: "#actionmenuaction-6",
  logoutSuccessSelector: 'a[href="https://moodle.hku.hk/login/index.php"]',

  // COURSE SELECTORS
  sectionSelector: "ul[class=topics] > li",
  sectionModuleSelector: "ul > li",
  moduleAnchorSelector: "a[class=aalink]",
  moduleSpanNameSelector: "form[class=togglecompletion] input[name=modulename]",
  moduleCompletionInputSelector:
    "form[class=togglecompletion] input[name=completionstate]",

  //DUE_DATE SELECTORS
  assignmentTrSelector: "table.generaltable tr",
  turnitinDueDateSelector:
    "table.mod_turnitintooltwo_part_details tbody tr:nth-child(1) td:nth-child(3)",
};

export default Constants;
