const input = document.getElementById("repo-search");
const autocompleteContainer = document.querySelector(".autocomplete-container");
const autocompleteList = document.querySelector(".autocomplete-list");
const repoList = document.querySelector(".repo-list");

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function fetchRepositories(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    query
  )}&per_page=5`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при запросе к GitHub");
      }
      return response.json();
    })
    .then((data) => {
      const repos = data.items;
      showAutocomplete(repos);
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });
}

function clearAutocomplete() {
  autocompleteList.innerHTML = "";
  autocompleteContainer.style.display = "none";
}

function inputCharge(e) {
  const query = e.target.value.trim();
  if (query === "") {
    clearAutocomplete();
    return;
  }
  fetchRepositories(query);
}
const debouncedInput = debounce(inputCharge, 500);
input.addEventListener("input", debouncedInput);

function showAutocomplete(repos) {
  autocompleteList.innerHTML = "";
  if (!repos.length) {
    const li = document.createElement("li");
    li.textContent = "Ничего не найдено";
    li.style.color = "#888";
    autocompleteList.appendChild(li);
    autocompleteContainer.style.display = "block";
    return;
  }
  repos.forEach((repo) => {
    const li = document.createElement("li");
    li.textContent = repo.name;
    li.addEventListener("click", () => {
      addRepoToList(repo);
      autocompleteList.innerHTML = "";
      autocompleteContainer.style.display = "none";
      input.value = "";
      inputCharge({ target: { value: "" } });
    });
    autocompleteList.appendChild(li);
  });
  autocompleteContainer.style.display = "block";
}
const addedRepos = new Set();

function addRepoToList(repo) {
  const fullName = repo.full_name;

  if (addedRepos.has(fullName)) return;
  addedRepos.add(fullName);

  const li = document.createElement("li");
  const info = document.createElement("div");
  info.innerHTML = `
        <strong>${repo.name}</strong><br>
        Владелец: ${repo.owner.login}<br>
        ⭐ ${repo.stargazers_count}
    `;
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Удалить";
  removeBtn.addEventListener("click", () => {
    li.remove();
    addedRepos.delete(fullName);
  });

  li.appendChild(info);
  li.appendChild(removeBtn);

  repoList.appendChild(li);
}
