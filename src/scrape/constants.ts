//strongly typed
const Constants = {
  courseRegex: /https?:\/\/moodle.hku.hk\/course\/view\.php\?id=\d+\/?/,
  successLoginRegex:
    /https?:\/\/moodle\.hku\.hk\/login\/index\.php\?authCAS=CAS&ticket=[0-9a-zA-z\-]+/,

  //URLS
  startUrl: "https://moodle.hku.hk/login/index.php",
  initLoginUrl: "https://moodle.hku.hk/login/index.php?authCAS=CAS",
  loginFormSubmitUrl:
    "https://hkuportal.hku.hk/cas/servlet/edu.yale.its.tp.cas.servlet.Login",

  //TEXT VALIDATORS
  startValidator: "<title>HKU Moodle: Log in to the site</title>",
  initLoginValidator: "<title>HKU Central Authentication Gateway</title>",

  finalLoginValidator: "<title>HKU Moodle</title>",
};

export default Constants;
