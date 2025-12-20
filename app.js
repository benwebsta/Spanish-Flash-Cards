let allWords = [];
let remaining = [];
let mastered = [];

let currentCard = null;
let showingFront = true;

const cardText = document.getElementById("cardText");
const frontLanguageSelect = document.getElementById("frontLanguage");
const status = document.getElementById("status");

fetch("./words.json")
  .then(res => res.json())
  .then(data => {
    allWords = shuffle([...data]);
	console.log('all words: ');
	console.log(allWords);
    resetSession();
  });

function resetSession() {
	console.log('reset session');
  remaining = shuffle([...allWords]);
  mastered = [];
  nextCard();
}

function nextCard() {
  if (remaining.length === 0) {
    cardText.textContent = "🎉 All done!";
    status.textContent = "You cleared all cards.";
    currentCard = null;
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
  cardText.textContent = showingFront
    ? currentCard[frontLang]
    : currentCard[frontLang === "spanish" ? "english" : "spanish"];
}

function updateStatus() {
  status.textContent =
    `Remaining: ${remaining.length} | Mastered: ${mastered.length}`;
}

document.getElementById("flipBtn").onclick = () => {
  showingFront = !showingFront;
  renderCard();
};

document.getElementById("rightBtn").onclick = () => {
  mastered.push(currentCard);
  nextCard();
};

document.getElementById("wrongBtn").onclick = () => {
  // put back randomly
  const index = Math.floor(Math.random() * remaining.length);
  remaining.splice(index, 0, currentCard);
  nextCard();
};

document.getElementById("resetBtn").onclick = resetSession;
frontLanguageSelect.onchange = renderCard;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
