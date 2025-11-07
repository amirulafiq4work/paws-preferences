const cardContainer = document.getElementById("card-container");
const summary = document.getElementById("summary");
const likeCount = document.getElementById("like-count");
const likedCats = document.getElementById("liked-cats");

let cats = [];
let liked = [];

function fetchCats(count = 10) {
  cats = Array.from({ length: count }, (_, i) => `https://cataas.com/cat`);
  renderCards();
}

function renderCards() {
  cats.reverse().forEach((url, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundImage = `url(${url})`;
    card.dataset.index = index;
    addSwipeListeners(card);
    cardContainer.appendChild(card);
  });
}

function addSwipeListeners(card) {
  let startX = 0;
  let currentX = 0;

  card.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  card.addEventListener("touchmove", e => {
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    card.style.transform = `translateX(${diff}px)`;
  });

  card.addEventListener("touchend", () => {
    const diff = currentX - startX;
    if (Math.abs(diff) > 80) {
      const likedIt = diff > 0;
      handleSwipe(card, likedIt);
    } else {
      card.style.transform = "translateX(0)";
    }
  });
}

function handleSwipe(card, likedIt) {
  const index = card.dataset.index;
  card.style.transform = `translateX(${likedIt ? "100%" : "-100%"})`;
  setTimeout(() => {
    card.remove();
    if (likedIt) liked.push(cats[index]);
    if (cardContainer.children.length === 0) showSummary();
  }, 300);
}

function showSummary() {
  likeCount.textContent = liked.length;
  liked.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    likedCats.appendChild(img);
  });
  summary.classList.remove("hidden");
}

function restart() {
  liked = [];
  likedCats.innerHTML = "";
  summary.classList.add("hidden");
  fetchCats();
}

fetchCats();
