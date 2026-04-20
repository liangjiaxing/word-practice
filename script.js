const wordList = document.getElementById("wordList");
const supportInfo = document.getElementById("supportInfo");
const itemTemplate = document.getElementById("wordItemTemplate");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  words: [],
};

setSupportMessage();

// Load words from words.txt
fetch("words.txt")
  .then((response) => response.text())
  .then((text) => {
    state.words = text
      .split(/[\n\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);
    renderList();
  })
  .catch(() => {
    supportInfo.textContent = "Failed to load words.txt";
  });

function renderList() {
  wordList.innerHTML = "";
  state.words.forEach((word) => {
    const node = itemTemplate.content.cloneNode(true);
    const item = node.querySelector(".word-item");
    const wordText = node.querySelector(".word-text");
    const speakBtn = node.querySelector(".speak-btn");
    const recordBtn = node.querySelector(".record-btn");
    const result = node.querySelector(".result");

    wordText.textContent = word;

    speakBtn.addEventListener("click", () => speakWord(word));
    recordBtn.addEventListener("click", () => scorePronunciation(word, recordBtn, result));

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
  let hasStarted = false;
  let stopRequested = false;
  let errorCode = "";
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
  resultNode.textContent = "Preparing microphone...";

  recognition.onstart = () => {
    hasStarted = true;
    resultNode.textContent = "Listening... Speak now.";
    // Start timeout only after recognition actually begins listening.
    forceStopTimer = setTimeout(stopRecognition, 8000);
  };

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
    errorCode = event.error;
    const message = event.error === "not-allowed"
      ? "Microphone permission denied. Please allow mic access in browser settings."
      : event.error === "no-speech"
        ? "No speech detected. Please speak louder or move closer to the microphone."
        : event.error === "audio-capture"
          ? "No microphone detected. Please check your microphone/device settings."
          : `Recognition failed: ${event.error}`;
    resultNode.textContent = message;
  };

  recognition.onspeechend = () => {
    stopRecognition();
  };

  recognition.onend = () => {
    if (forceStopTimer) clearTimeout(forceStopTimer);
    if (!hasStarted) {
      resultNode.textContent = "Microphone failed to start. Try Chrome/Safari over HTTPS or localhost.";
    } else if (!hasResult && !errorCode) {
      resultNode.textContent = "No speech detected. Try again.";
    }
    recordBtn.disabled = false;
  };

  recognition.start();
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

function normalizeForScore(value) {
  return value.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}
