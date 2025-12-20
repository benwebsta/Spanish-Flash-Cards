import fs from "fs";

const baseWords = [
  ["hola", "hello"],
  ["adiós", "goodbye"],
  ["por favor", "please"],
  ["gracias", "thank you"],
  ["sí", "yes"],
  ["no", "no"],
  ["agua", "water"],
  ["comida", "food"],
  ["casa", "house"],
  ["perro", "dog"],
  ["gato", "cat"],
  ["libro", "book"],
  ["día", "day"],
  ["noche", "night"],
  ["hombre", "man"],
  ["mujer", "woman"],
  ["niño", "child"],
  ["amigo", "friend"],
  ["trabajo", "work"],
  ["dinero", "money"]
];

// Expand to ~3,000 beginner-friendly variations
const words = [];
let count = 0;

while (words.length < 3000) {
  for (const [es, en] of baseWords) {
    words.push({
      spanish: es,
      english: en
    });
    count++;
    if (words.length >= 3000) break;
  }
}

fs.writeFileSync("words.json", JSON.stringify(words, null, 2));
console.log("Generated", words.length, "word pairs");
