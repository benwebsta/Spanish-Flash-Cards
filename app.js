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
  let isFlipped = false;
  
   const modal = document.getElementById("wordModal");
	const modalTitle = document.getElementById("modalTitle");
	const modalList = document.getElementById("modalList");
	const closeModalBtn = document.getElementById("closeModal");

	function showListPopup(title, words) {
	  modalTitle.textContent = title;
	  modalList.innerHTML = "";

	  if (words.length === 0) {
		modalList.innerHTML = "<div>(Empty)</div>";
	  } else {
		words.forEach(w => {
		  const row = document.createElement("div");
		  row.textContent = `${w.spanish} : ${w.english}`;
		  modalList.appendChild(row);
		});
	  }

	  modal.classList.remove("hidden");
	}
	
	closeModalBtn.onclick = () => modal.classList.add("hidden");

	modal.addEventListener("click", e => {
	  if (e.target === modal) modal.classList.add("hidden");
	});

	// Close when tapping background
	modal.addEventListener("click", e => {
	  if (e.target === modal) modal.classList.add("hidden");
	});
  
  const STORAGE_KEY = "flashcard_mastered_ids";

	function saveMastered() {
	  const ids = mastered.map(w => w.id);
	  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	}

	function loadMasteredIds() {
	  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
	}

	function clearSavedProgress() {
	  localStorage.removeItem(STORAGE_KEY);
	}
  //function saveProgress() {
	//  localStorage.setItem("mastered", JSON.stringify(mastered.map(w => w.id)));
	//}
  
  const saved = JSON.parse(localStorage.getItem("mastered")) || [];
	remaining = allWords.filter(w => !saved.includes(w.id));

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

		  const savedIds = loadMasteredIds();

		  mastered = allWords.filter(w => savedIds.includes(w.id));
		  remaining = shuffle(allWords.filter(w => !savedIds.includes(w.id)));

		  nextCard();
		})
      .catch(err => {
        console.error(err);
        cardFront.textContent = "❌ Failed to load words.json";
      });
  }

  function resetSession() {
    clearSavedProgress();

	  mastered = [];
	  remaining = shuffle([...allWords]);
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
      //status.textContent = `Remaining: ${remaining.length} | Mastered: ${mastered.length}`;
		status.innerHTML = `
		<span id="remainingLink" class="status-link">
		  Remaining: ${remaining.length}
		</span>
		|
		<span id="masteredLink" class="status-link">
		  Mastered: ${mastered.length}
		</span>
	  `;
	}

	  document.getElementById("remainingLink").onclick = () =>
		showListPopup("Remaining Words", remaining);

	  document.getElementById("masteredLink").onclick = () =>
		showListPopup("Mastered Words", mastered);
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
	saveMastered();
	animateRight();
    nextCard();
  });

  wrongBtn?.addEventListener("click", () => {
    if (!currentCard) return;
    const index = Math.floor(Math.random() * remaining.length);
    remaining.splice(index, 0, currentCard);
	animateWrong();
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
  
  document.getElementById("resetBtn")?.addEventListener("click", () => {
	  const confirmed = confirm("Are you sure you want to reset your session?");
	  if (confirmed) {
		resetSession();
	  }
	  // else do nothing
	});


  // Utility: shuffle array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function flipCard() {
	  isFlipped = !isFlipped;
	  card.classList.toggle("flipped", isFlipped);
	}
	function resetCardVisual() {
	  isFlipped = false;
	  card.classList.remove("flipped");
	  card.classList.remove("animate-right", "animate-wrong");
	  card.style.opacity = "1";
	}
	function animateWrong() {
	  card.style.setProperty(
		"--flip",
		isFlipped ? "180deg" : "0deg"
	  );

	  card.classList.add("animate-wrong");

	  setTimeout(() => {
		resetCardVisual();
		nextCard();
	  }, 450);
	}

	function animateRight() {
	  card.style.setProperty(
		"--flip",
		isFlipped ? "180deg" : "0deg"
	  );

	  card.classList.add("animate-right");

	  setTimeout(() => {
		mastered.push(currentCard);
		saveMastered();

		resetCardVisual();
		nextCard();
	  }, 450);
	}
});
