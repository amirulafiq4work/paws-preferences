const cardStack = document.getElementById("card-stack");
const summary = document.getElementById("summary");
const likeCountEl = document.getElementById("like-count");
const likedCatsEl = document.getElementById("liked-cats");
const restartBtn = document.getElementById("restart");
const loader = document.getElementById("loader");
const factEl = document.getElementById("cat-fact");

const likeBtn = document.getElementById("like-btn");
const dislikeBtn = document.getElementById("dislike-btn");
const cooldownBox = document.getElementById("cooldown");
const cooldownCount = document.getElementById("cooldown-count");

const indexCounter = document.createElement('div');
indexCounter.classList.add('index-counter');
document.body.prepend(indexCounter);  // Add indexCounter at the top

let cats = [];
let likedCats = [];
let currentIndex = 0;
let canInteract = false;

async function fetchCatFact() {
  try {
    const res = await fetch("https://catfact.ninja/fact");
    const data = await res.json();
    factEl.textContent = "🐱 Fun Fact: " + data.fact;
  } catch {
    factEl.textContent = "🐱 Cats are awesome — and so are you!";
  }
}

async function loadCats() {
  likedCats = [];
  currentIndex = 0;
  summary.classList.add("hidden");
  cardStack.innerHTML = "";
  loader.classList.remove("hidden");
  factEl.textContent = "";
  likeBtn.disabled = true;
  dislikeBtn.disabled = true;
  canInteract = false;

  await fetchCatFact();

  cats = Array.from({ length: 10 }, (_, i) => `https://cataas.com/cat?${Date.now()}-${i}`);
  await preloadImages(cats);

  loader.classList.add("hidden");
  likeBtn.disabled = false;
  dislikeBtn.disabled = false;
  canInteract = true;
  createCards();
}

function preloadImages(urls) {
  const promises = urls.map(url => new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = resolve;
    img.onerror = reject;
  }));
  return Promise.all(promises);
}

function createCards() {
  // Create only one card at the beginning, which will be the first cat image
  const url = cats[currentIndex];
  const card = document.createElement("div");
  card.classList.add("cat-card");
  card.style.backgroundImage = `url(${url})`;
  card.dataset.index = currentIndex;
  cardStack.appendChild(card);
  updateIndexCounter();
  initSwipe();
}

function initSwipe() {
  const cards = document.querySelectorAll(".cat-card");

  cards.forEach((card) => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    // TOUCH
    card.addEventListener("touchstart", (e) => {
      if (!canInteract) return;
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    card.addEventListener("touchmove", (e) => {
      if (!isDragging || !canInteract) return;
      currentX = e.touches[0].clientX - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;
    });

    card.addEventListener("touchend", () => {
      if (!canInteract) return;
      isDragging = false;
      endSwipe(card, currentX);
    });

    // MOUSE
    card.addEventListener("mousedown", (e) => {
      if (!canInteract) return;
      startX = e.clientX;
      isDragging = true;
      card.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging || !canInteract) return;
      currentX = e.clientX - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging || !canInteract) return;
      isDragging = false;
      card.style.cursor = "grab";
      endSwipe(card, currentX);
    });
  });
}

function endSwipe(card, currentX) {
  if (!canInteract) return;
  if (currentX > 100) swipe("right", card);
  else if (currentX < -100) swipe("left", card);
  else card.style.transform = "";
}

function swipe(direction, card) {
  if (!canInteract) return;
  canInteract = false;
  likeBtn.disabled = true;
  dislikeBtn.disabled = true;

  const url = cats[card.dataset.index];
  if (direction === "right") likedCats.push(url);

  // Remove the current card
  card.style.transition = "transform 0.3s ease-out";
  card.style.transform =
    direction === "right"
      ? "translateX(400px) rotate(30deg)"
      : "translateX(-400px) rotate(-30deg)";

  // Remove the card after the transition
  setTimeout(() => card.remove(), 300);

  // Increment currentIndex and load the next card if needed
  currentIndex++;

  // Show the next card
  if (currentIndex < cats.length) {
    createCards();
  }

  // Show cooldown animation (3...2...1)
  showCooldown(() => {
    if (currentIndex < cats.length) {
      canInteract = true;
      likeBtn.disabled = false;
      dislikeBtn.disabled = false;
    }
  });

  if (currentIndex >= cats.length) {
    showSummary();
  }
}

function updateIndexCounter() {
  indexCounter.textContent = `${currentIndex + 1} / ${cats.length}`;
}

function showCooldown(callback) {
  cooldownBox.classList.remove("hidden");
  let count = 3;
  cooldownCount.textContent = count;

  const interval = setInterval(() => {
    count--;
    cooldownCount.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      cooldownBox.classList.add("hidden");
      callback();
    }
  }, 1000);
}

function showSummary() {
  summary.classList.remove("hidden");
  likeCountEl.textContent = likedCats.length;
  likedCatsEl.innerHTML = likedCats
    .map((url) => `<img src="${url}" alt="liked cat" />`)
    .join("");
  factEl.textContent = "🐾 Thanks for playing! Want to go again?";
}

restartBtn.addEventListener("click", loadCats);

likeBtn.addEventListener("click", () => {
  if (!canInteract) return;
  const topCard = document.querySelector(".cat-card:last-child");
  if (topCard) swipe("right", topCard);
});

dislikeBtn.addEventListener("click", () => {
  if (!canInteract) return;
  const topCard = document.querySelector(".cat-card:last-child");
  if (topCard) swipe("left", topCard);
});

// Start app
loadCats();
