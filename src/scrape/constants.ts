//strongly typed
const Constants = {
  courseRegex: /https?:\/\/moodle.hku.hk\/course\/view\.php\?id=\d+\/?/,
  successLoginRegex:
    /https?:\/\/moodle\.hku\.hk\/login\/index\.php\?authCAS=CAS&ticket=[0-9a-zA-z\-]+/,

  // URLS
  loginPostUrl:
    "https://hkuportal.hku.hk/cas/servlet/edu.yale.its.tp.cas.servlet.Login",

  // LOGIN SELECTORS
  logoutInitUrl: "https://moodle.hku.hk/login/logout.php",
  logoutInputSelector: "form[method=post] input",

  // COURSE SELECTORS
  sectionSelector: "ul[class=topics] > li",
  sectionModuleSelector: "ul > li",
  moduleAnchorSelector: "a[class=aalink]",
  moduleSpanNameSelector: "form[class=togglecompletion] input[name=modulename]",
  moduleCompletionInputSelector:
    "form[class=togglecompletion] input[name=completionstate]",
  moduleCommentsSelector: ".contentafterlink",

  //FOLLOW_UP SELECTORS
  assignmentTrSelector: "table.generaltable tr",
  turnitinDueDateSelector:
    "table.mod_turnitintooltwo_part_details tbody tr:nth-child(1) td:nth-child(3)",
  turnitinCompletedSelector: ".mod_turnitintooltwo_digital_receipt",
};

export default Constants;
