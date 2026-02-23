const storageKey = "pronunciation_words_v1";
const wordInput = document.getElementById("wordInput");
const addWordBtn = document.getElementById("addWordBtn");
const wordList = document.getElementById("wordList");
const supportInfo = document.getElementById("supportInfo");
const itemTemplate = document.getElementById("wordItemTemplate");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  words: loadWords(),
};

renderList();
setSupportMessage();

addWordBtn.addEventListener("click", addWordFromInput);
wordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addWordFromInput();
});

function addWordFromInput() {
  const value = cleanWord(wordInput.value);
  if (!value) return;

  if (!state.words.includes(value)) {
    state.words.push(value);
    saveWords();
    renderList();
  }

  wordInput.value = "";
  wordInput.focus();
}

function renderList() {
  wordList.innerHTML = "";
  state.words.forEach((word) => {
    const node = itemTemplate.content.cloneNode(true);
    const item = node.querySelector(".word-item");
    const wordText = node.querySelector(".word-text");
    const speakBtn = node.querySelector(".speak-btn");
    const recordBtn = node.querySelector(".record-btn");
    const deleteBtn = node.querySelector(".delete-btn");
    const result = node.querySelector(".result");

    wordText.textContent = word;

    speakBtn.addEventListener("click", () => speakWord(word));
    recordBtn.addEventListener("click", () => scorePronunciation(word, recordBtn, result));
    deleteBtn.addEventListener("click", () => removeWord(word));

    item.dataset.word = word;
    wordList.appendChild(node);
  });
}

function speakWord(word) {
  if (!window.speechSynthesis) {
    alert("Speech synthesis is not supported in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function scorePronunciation(targetWord, recordBtn, resultNode) {
  if (!SpeechRecognition) {
    resultNode.textContent = "Speech recognition is not supported on this browser/device.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  let hasResult = false;
  let stopRequested = false;
  let forceStopTimer = null;

  const stopRecognition = () => {
    if (stopRequested) return;
    stopRequested = true;
    try {
      recognition.stop();
    } catch {
      // Some browsers throw if stop() is called before start completes.
    }
  };

  recordBtn.disabled = true;
  resultNode.textContent = "Listening...";

  recognition.onresult = (event) => {
    hasResult = true;
    const target = normalizeForScore(targetWord);
    const candidates = [];

    for (let i = 0; i < event.results[0].length; i += 1) {
      candidates.push(event.results[0][i].transcript);
    }

    const best = pickBestCandidate(target, candidates);
    resultNode.textContent = `You said: "${best.original}" | Score: ${best.score}/100`;
    stopRecognition();
  };

  recognition.onerror = (event) => {
    const message = event.error === "not-allowed"
      ? "Microphone permission denied. Please allow mic access in browser settings."
      : `Recognition failed: ${event.error}`;
    resultNode.textContent = message;
  };

  recognition.onspeechend = () => {
    stopRecognition();
  };

  recognition.onend = () => {
    if (forceStopTimer) clearTimeout(forceStopTimer);
    if (!hasResult && !resultNode.textContent.startsWith("Recognition failed") && !resultNode.textContent.startsWith("Microphone permission denied")) {
      resultNode.textContent = "No speech detected. Try again.";
    }
    recordBtn.disabled = false;
  };

  recognition.start();
  // Fallback: avoid hanging too long on browsers with slow end-of-speech detection.
  forceStopTimer = setTimeout(stopRecognition, 2500);
}

function pickBestCandidate(target, candidateTexts) {
  let best = { original: "", score: 0 };

  candidateTexts.forEach((text) => {
    const normalized = normalizeForScore(text);
    const score = calcSimilarityScore(target, normalized);
    if (score > best.score) {
      best = { original: text.trim(), score };
    }
  });

  return best;
}

function calcSimilarityScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 100;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, Math.round((1 - distance / maxLen) * 100));
}

function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) table[i][0] = i;
  for (let j = 0; j < cols; j += 1) table[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      table[i][j] = Math.min(
        table[i - 1][j] + 1,
        table[i][j - 1] + 1,
        table[i - 1][j - 1] + cost
      );
    }
  }

  return table[a.length][b.length];
}

function removeWord(wordToRemove) {
  state.words = state.words.filter((word) => word !== wordToRemove);
  saveWords();
  renderList();
}

function setSupportMessage() {
  const supportsSpeech = Boolean(window.speechSynthesis);
  const supportsRecognition = Boolean(SpeechRecognition);

  if (supportsSpeech && supportsRecognition) {
    supportInfo.textContent = "Your browser supports pronunciation and recording score.";
    return;
  }

  if (supportsSpeech && !supportsRecognition) {
    supportInfo.textContent = "Pronunciation is supported, but recording score is not supported on this browser.";
    return;
  }

  supportInfo.textContent = "Speech features are limited on this browser. Try the latest Safari or Chrome.";
}

function cleanWord(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeForScore(value) {
  return value.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}

function loadWords() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveWords() {
  localStorage.setItem(storageKey, JSON.stringify(state.words));
}
