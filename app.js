(function () {
  var copy = {
    it: {
      tagline:
        "Studente di Economia all'Università degli Studi di Milano. Costruisce progetti personali: archivi, siti e strumenti.",
      sites: "Siti",
      sitesLead: "Pubblicati su GitHub Pages.",
      code: "Codice",
      codeLead: "Senza sito pubblico: solo il repository.",
      live: "Sito",
      repo: "GitHub",
      themeToDark: "Tema scuro",
      themeToLight: "Tema chiaro",
      langLabel: "Lingua",
      skip: "Vai ai progetti",
      error: "Impossibile caricare i progetti."
    },
    en: {
      tagline:
        "Economics student at the University of Milan. He builds side projects: archives, sites, and tools.",
      sites: "Sites",
      sitesLead: "Published on GitHub Pages.",
      code: "Code",
      codeLead: "No public site: repository only.",
      live: "Site",
      repo: "GitHub",
      themeToDark: "Dark theme",
      themeToLight: "Light theme",
      langLabel: "Language",
      skip: "Skip to projects",
      error: "Could not load the projects."
    }
  };

  var projects = [];
  var lang = document.documentElement.lang === "en" ? "en" : "it";

  var taglineEl = document.getElementById("tagline");
  var listEl = document.getElementById("progetti");
  var skipEl = document.getElementById("skip");
  var themeBtn = document.getElementById("theme-toggle");
  var langGroup = document.querySelector(".langs");
  var langButtons = document.querySelectorAll("[data-lang]");

  function text(project) {
    var description = project.description;
    if (description && typeof description === "object") {
      return description[lang] || description.it || "";
    }
    return description || "";
  }

  function setPressed(button, pressed) {
    button.setAttribute("aria-pressed", pressed ? "true" : "false");
  }

  function applyChrome() {
    var strings = copy[lang];
    document.documentElement.lang = lang;
    taglineEl.textContent = strings.tagline;
    skipEl.textContent = strings.skip;
    langGroup.setAttribute("aria-label", strings.langLabel);
    var dark = document.documentElement.dataset.theme === "dark";
    themeBtn.textContent = dark ? strings.themeToLight : strings.themeToDark;
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    langButtons.forEach(function (button) {
      setPressed(button, button.getAttribute("data-lang") === lang);
    });
    try {
      localStorage.setItem("lang", lang);
    } catch (err) {
      /* private mode */
    }
  }

  function link(href, label) {
    var anchor = document.createElement("a");
    anchor.href = href;
    anchor.textContent = label;
    return anchor;
  }

  function card(project, strings) {
    var article = document.createElement("article");
    article.className = "card";

    var top = document.createElement("div");
    top.className = "card-top";

    var title = document.createElement("h3");
    title.textContent = project.name;
    top.appendChild(title);

    if (project.tags && project.tags.length) {
      var tags = document.createElement("ul");
      tags.className = "tags";
      project.tags.forEach(function (tag) {
        var item = document.createElement("li");
        item.textContent = tag;
        tags.appendChild(item);
      });
      top.appendChild(tags);
    }

    var description = document.createElement("p");
    description.textContent = text(project);

    var links = document.createElement("p");
    links.className = "card-links";
    if (project.liveUrl) {
      var live = link(project.liveUrl, strings.live);
      live.className = "link-live";
      links.appendChild(live);
    }
    var repo = link(project.repoUrl, strings.repo);
    repo.className = "link-repo";
    links.appendChild(repo);

    article.appendChild(top);
    article.appendChild(description);
    article.appendChild(links);
    return article;
  }

  function section(title, lead, items) {
    var block = document.createElement("section");
    block.className = "group";
    var headingId = "heading-" + (items[0] && items[0].liveUrl ? "sites" : "code");
    block.setAttribute("aria-labelledby", headingId);

    var head = document.createElement("div");
    head.className = "group-head";

    var heading = document.createElement("h2");
    heading.id = items[0] && items[0].liveUrl ? "heading-sites" : "heading-code";
    heading.textContent = title;

    var count = document.createElement("span");
    count.className = "count";
    count.textContent = String(items.length);

    var lede = document.createElement("p");
    lede.textContent = lead;

    head.appendChild(heading);
    head.appendChild(count);
    head.appendChild(lede);

    var grid = document.createElement("div");
    grid.className = "grid";
    items.forEach(function (project) {
      grid.appendChild(card(project, copy[lang]));
    });

    block.appendChild(head);
    block.appendChild(grid);
    return block;
  }

  function render() {
    applyChrome();
    listEl.replaceChildren();
    var strings = copy[lang];
    var sites = projects.filter(function (project) {
      return project.liveUrl;
    });
    var code = projects.filter(function (project) {
      return !project.liveUrl;
    });
    if (sites.length) listEl.appendChild(section(strings.sites, strings.sitesLead, sites));
    if (code.length) listEl.appendChild(section(strings.code, strings.codeLead, code));
  }

  function showError() {
    applyChrome();
    listEl.replaceChildren();
    var note = document.createElement("p");
    note.className = "error";
    note.setAttribute("role", "alert");
    note.textContent = copy[lang].error;
    listEl.appendChild(note);
  }

  themeBtn.addEventListener("click", function () {
    var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (err) {
      /* private mode */
    }
    applyChrome();
  });

  langButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      lang = button.getAttribute("data-lang") === "en" ? "en" : "it";
      render();
    });
  });

  applyChrome();

  fetch("projects.json")
    .then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) throw new Error("format");
      projects = data;
      render();
    })
    .catch(showError);
})();
