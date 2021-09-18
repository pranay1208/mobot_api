//strongly typed
const Constants = {
  courseRegex: /https?:\/\/moodle.hku.hk\/course\/view\.php\?id=\d+\/?/,
  successLoginRegex:
    /https?:\/\/moodle\.hku\.hk\/login\/index\.php\?authCAS=CAS&ticket=[0-9a-zA-z\-]+/,

  //URLS
  loginPageUrl:
    "https://hkuportal.hku.hk/cas/login?service=https%3A%2F%2Fmoodle.hku.hk%2Flogin%2Findex.php%3FauthCAS%3DCAS",

  //SELECTORS
  logoutSelector: "#actionmenuaction-6",
};

export default Constants;
