import { GITHUB_ACCESS_TOKEN } from "./config.js";

let languages;
let languagePicker = document.querySelector(".language-picker");

let activeState = document.querySelector(".active-state");
let emptyState = document.querySelector(".empty-state");
let loadingState = document.querySelector(".loading-state");
let errorState = document.querySelector(".error-state");

let repoName = document.querySelector(".repo-name");
let repoDescription = document.querySelector(".repo-description");
let repoLanguage = document.querySelector(".repo-language");
let repoStars = document.querySelector(".repo-stars");
let repoForks = document.querySelector(".repo-forks");
let repoIssues = document.querySelector(".repo-issues");
let repoLanguageColor =  document.querySelector(".language-color")

let refreshButton = document.querySelector(".refresh-button");

let state = "empty";

let response = fetch(
  "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json"
)
  .then((response) => response.json())
  .then((data) => {
    languages = data;
    renderLanguages();
  })
  .catch((err) => {
    console.error("Error fetching repos:", err);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  });

function renderLanguages() {
  languages.forEach((lang) => {
    let option = document.createElement("option");
    option.value = lang.value;
    option.innerHTML = lang.title;
    languagePicker.appendChild(option);
  });
}

languagePicker.addEventListener("change", (e) => {
  activeState.classList.add("hidden");
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden");

  fetchARandomRepo(e.target.value);
});

function fetchARandomRepo(lang) {
  fetch(
    `https://api.github.com/search/repositories?q=language:${lang}&sort=stars&order=desc&page=1&per_page=30`,
    {
      method: "GET",
      headers: {
        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  )
    .then((res) => {
      if (!res.ok) {
        loadingState.classList.add("hidden");
        errorState.classList.remove("hidden");
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then( async (data) => {
      const repos = data.items;
      if (repos.length === 0) {
        loadingState.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
      }
      const random = Math.floor(Math.random() * repos.length);

      const color = await getLanguageColor(lang);

      renderRepo(repos[random], color);
    })
    .catch((err) => {
      console.error("Error fetching repos:", err);
      loadingState.classList.add("hidden");
      errorState.classList.remove("hidden");
    });
}

function renderRepo(repo, color) {
  const {
    name,
    description,
    language,
    stargazers_count,
    forks_count,
    open_issues_count,
  } = repo;

  repoName.textContent = name;
  repoDescription.textContent = description;
  repoLanguage.textContent = language;
  repoStars.textContent = stargazers_count;
  repoForks.textContent = forks_count;
  repoIssues.textContent = open_issues_count;
  repoLanguageColor.style.background = color;

  loadingState.classList.add("hidden");
  activeState.classList.remove("hidden");
  refreshButton.classList.remove("hidden");
}

refreshButton.addEventListener("click", () => {
  fetchARandomRepo(languagePicker.value);

  activeState.classList.add("hidden");
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden");
});

async function getLanguageColor(lang) {
  const res = await fetch(
    "https://raw.githubusercontent.com/ozh/github-colors/master/colors.json"
  );
  const colors = await res.json();

  const language = colors[lang];
  return language && language.color ? language.color : "#000000";
}
