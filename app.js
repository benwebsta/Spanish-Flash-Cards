let allWords = [];
let remaining = [];
let mastered = [];
let currentCard = null;
let showingFront = true;

const card = document.getElementById("card");
const cardFront = document.getElementById("cardFront");
const cardBack = document.getElementById("cardBack");
const frontLanguageSelect = document.getElementById("frontLanguage");
const status = document.getElementById("status");

loadWords();

function loadWords() {
  fetch("./words.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      allWords = shuffle([...data]);
      resetSession();
    })
    .catch(err => {
      console.error(err);
      cardFront.textContent = "❌ Failed to load words.json";
    });
}

function resetSession() {
  remaining = shuffle([...allWords]);
  mastered = [];
  nextCard();
}

function nextCard() {
  if (remaining.length === 0) {
    cardFront.textContent = "🎉 All done!";
    cardBack.textContent = "";
    currentCard = null;
    status.textContent = "You cleared all cards.";
    return;
  }
  currentCard = remaining.pop();
  showingFront = true;
  renderCard();
  updateStatus();
}

function renderCard() {
  if (!currentCard) return;
  const frontLang = frontLanguageSelect.value;
  const backLang = frontLang === "spanish" ? "english" : "spanish";
  cardFront.textContent = currentCard[frontLang];
  cardBack.textContent = currentCard[backLang];
  card.classList.toggle("flipped", !showingFront);
}

function updateStatus() {
  status.textContent = `Remaining: ${remaining.length} | Mastered: ${mastered.length}`;
}

// Button handlers
document.getElementById("flipBtn").onclick = () => {
  showingFront = !showingFront;
  card.classList.toggle("flipped");
};

document.getElementById("rightBtn").onclick = () => {
  mastered.push(currentCard);
  nextCard();
};

document.getElementById("wrongBtn").onclick = () => {
  const index = Math.floor(Math.random() * remaining.length);
  remaining.splice(index, 0, currentCard);
  nextCard();
};

document.getElementById("resetBtn")?.addEventListener("click", resetSession);
frontLanguageSelect.onchange = renderCard;

// Tap on card flips
card.addEventListener("click", () => {
  showingFront = !showingFront;
  card.classList.toggle("flipped");
});

// Swipe detection
let touchStartX = null;

card.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
});

card.addEventListener("touchend", e => {
  if (touchStartX === null) return;
  let dx = e.changedTouches[0].screenX - touchStartX;
  if (dx > 50) {
    // swipe right → correct
    document.getElementById("rightBtn").click();
  } else if (dx < -50) {
    // swipe left → wrong
    document.getElementById("wrongBtn").click();
  }
  touchStartX = null;
});

// Utility
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
