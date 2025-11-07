const cardContainer = document.getElementById("card-container");
const summary = document.getElementById("summary");
const likeCount = document.getElementById("like-count");
const likedCats = document.getElementById("liked-cats");

let cats = [];
let liked = [];

async function fetchCats(count = 10) {
  const promises = Array.from({ length: count }, () =>
    fetch("https://cataas.com/cat?json=true").then(res => res.json())
  );
  const data = await Promise.all(promises);
  cats = data.map(cat => `https://cataas.com${cat.id}`);
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

  card.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  card.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      const likedIt = diff > 0;
      handleSwipe(card, likedIt);
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
