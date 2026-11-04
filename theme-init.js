(function () {
  var theme = "light";
  var lang = "it";
  try {
    var storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      theme = storedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
    var storedLang = localStorage.getItem("lang");
    if (storedLang === "it" || storedLang === "en") lang = storedLang;
  } catch (err) {
    theme = "light";
    lang = "it";
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = lang;
})();
