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
  .catch((err) => console.error(err));

function renderLanguages() {
  languages.forEach((lang) => {
    let option = document.createElement("option");
    option.value = lang.value;
    option.innerHTML = lang.title;
    languagePicker.appendChild(option);
  });
}

languagePicker.addEventListener("change", (e) => {

  activeState.classList.add("hidden")
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden");

  fetchARandomRepo(e.target.value);
});

function fetchARandomRepo(lang) {
  const random = Math.floor(Math.random() * 30) + 1;

  fetch(`https://api.github.com/search/repositories?q=${lang}`, {
    method: "GET",
    headers: {
      Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        loadingState.classList.add("hidden");
        errorState.classList.remove("hidden");
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      renderRepo(data.items[random]);
    })
    .catch((err) => {
      console.error("Error fetching repos:", err);
    });
}

function renderRepo(repo) {
  console.log(repo);
  
  repoName.innerHTML =  repo.name;
  repoDescription.innerHTML = repo.description;
  repoLanguage.innerHTML = repo.language;
  repoStars.innerHTML = repo.stargazers_count;
  repoForks.innerHTML = repo.forks_count;
  repoIssues.innerHTML = repo.open_issues_count;

  loadingState.classList.add("hidden");
  activeState.classList.remove("hidden");
  refreshButton.classList.remove("hidden");
}

refreshButton.addEventListener("click", () => {
  fetchARandomRepo(languagePicker.value);

  activeState.classList.add("hidden")
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden");
});
