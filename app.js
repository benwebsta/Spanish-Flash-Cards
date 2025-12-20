document.addEventListener("DOMContentLoaded", () => {

  // DOM elements
  const card = document.getElementById("card");
  const cardFront = document.getElementById("cardFront");
  const cardBack = document.getElementById("cardBack");
  const frontLanguageSelect = document.getElementById("frontLanguage");
  const status = document.getElementById("status");
  const flipBtn = document.getElementById("flipBtn");
  const rightBtn = document.getElementById("rightBtn");
  const wrongBtn = document.getElementById("wrongBtn");

  // State
  let allWords = [];
  let remaining = [];
  let mastered = [];
  let currentCard = null;
  let showingFront = true;

  // Load words
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
      if (status) status.textContent = "You cleared all cards.";
      return;
    }
    currentCard = remaining.pop();
    showingFront = true;
    renderCard();
    updateStatus();
  }

  function renderCard() {
    if (!currentCard) return;
    const frontLang = frontLanguageSelect.value || "spanish";
    const backLang = frontLang === "spanish" ? "english" : "spanish";
    if (cardFront) cardFront.textContent = currentCard[frontLang];
    if (cardBack) cardBack.textContent = currentCard[backLang];
    card.classList.toggle("flipped", !showingFront);
  }

  function updateStatus() {
    if (status) {
      status.textContent = `Remaining: ${remaining.length} | Mastered: ${mastered.length}`;
    }
  }

  // Flip button
  flipBtn?.addEventListener("click", () => {
    showingFront = !showingFront;
    card.classList.toggle("flipped");
  });

  // Right / Wrong buttons
  rightBtn?.addEventListener("click", () => {
    if (!currentCard) return;
    mastered.push(currentCard);
    nextCard();
  });

  wrongBtn?.addEventListener("click", () => {
    if (!currentCard) return;
    const index = Math.floor(Math.random() * remaining.length);
    remaining.splice(index, 0, currentCard);
    nextCard();
  });

  // Change front language
  frontLanguageSelect?.addEventListener("change", renderCard);

  // Tap on card flips it
  card?.addEventListener("click", () => {
    showingFront = !showingFront;
    card.classList.toggle("flipped");
  });

  // Swipe detection (mobile)
  let touchStartX = null;

  card?.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  card?.addEventListener("touchend", e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (dx > 50) {
      rightBtn?.click();
    } else if (dx < -50) {
      wrongBtn?.click();
    }
    touchStartX = null;
  });

  // Utility: shuffle array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

});
