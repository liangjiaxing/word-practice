const wordList = document.getElementById("wordList");
const supportInfo = document.getElementById("supportInfo");
const itemTemplate = document.getElementById("wordItemTemplate");
const listView = document.getElementById("listView");
const flashView = document.getElementById("flashView");
const listModeBtn = document.getElementById("listModeBtn");
const flashModeBtn = document.getElementById("flashModeBtn");
const flashCard = document.getElementById("flashCard");
const flashCounter = document.getElementById("flashCounter");
const flashWord = document.getElementById("flashWord");
const flashResult = document.getElementById("flashResult");
const flashSpeakBtn = document.getElementById("flashSpeakBtn");
const flashRecordBtn = document.getElementById("flashRecordBtn");
const prevFlashBtn = document.getElementById("prevFlashBtn");
const nextFlashBtn = document.getElementById("nextFlashBtn");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  words: [],
  currentFlashIndex: 0,
  flashResults: [],
  isFlashRecording: false,
};

setSupportMessage();
attachModeHandlers();
attachFlashHandlers();

// Load words from words.txt
fetch("words.txt")
  .then((response) => response.text())
  .then((text) => {
    state.words = text
      .split(/[\n\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);
    state.flashResults = state.words.map(() => "");
    renderList();
    renderFlashCard();
  })
  .catch(() => {
    supportInfo.textContent = "Failed to load words.txt";
  });

function attachModeHandlers() {
  listModeBtn.addEventListener("click", () => setMode("list"));
  flashModeBtn.addEventListener("click", () => setMode("flash"));
}

function attachFlashHandlers() {
  prevFlashBtn.addEventListener("click", showPreviousFlashWord);
  nextFlashBtn.addEventListener("click", showNextFlashWord);
  flashSpeakBtn.addEventListener("click", () => {
    const word = state.words[state.currentFlashIndex];
    if (word) speakWord(word);
  });
  flashRecordBtn.addEventListener("click", recordCurrentFlashWord);

  let pointerStart = null;

  flashCard.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  flashCard.addEventListener("pointerup", (event) => {
    if (!pointerStart || event.target.closest("button")) return;
    handleFlashSwipe(pointerStart.x, pointerStart.y, event.clientX, event.clientY);
    pointerStart = null;
  });

  flashCard.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  flashCard.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousFlashWord();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextFlashWord();
    }
  });
}

function setMode(mode) {
  const isFlashMode = mode === "flash";

  listView.hidden = isFlashMode;
  flashView.hidden = !isFlashMode;
  listView.classList.toggle("is-active", !isFlashMode);
  flashView.classList.toggle("is-active", isFlashMode);
  listModeBtn.classList.toggle("is-active", !isFlashMode);
  flashModeBtn.classList.toggle("is-active", isFlashMode);
  listModeBtn.setAttribute("aria-selected", String(!isFlashMode));
  flashModeBtn.setAttribute("aria-selected", String(isFlashMode));

  if (isFlashMode) {
    renderFlashCard();
    flashCard.focus({ preventScroll: true });
  }
}

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

function renderFlashCard() {
  const totalWords = state.words.length;
  const hasWords = totalWords > 0;
  state.currentFlashIndex = clampIndex(state.currentFlashIndex);

  flashCounter.textContent = hasWords
    ? `Word ${state.currentFlashIndex + 1} of ${totalWords}`
    : "No words";
  flashWord.textContent = hasWords ? state.words[state.currentFlashIndex] : "";
  flashResult.textContent = hasWords ? state.flashResults[state.currentFlashIndex] : "";

  const disableActions = !hasWords || state.isFlashRecording;
  flashSpeakBtn.disabled = disableActions;
  flashRecordBtn.disabled = disableActions;
  prevFlashBtn.disabled = !hasWords || state.isFlashRecording || state.currentFlashIndex === 0;
  nextFlashBtn.disabled = !hasWords || state.isFlashRecording || state.currentFlashIndex === totalWords - 1;
}

function recordCurrentFlashWord() {
  const index = state.currentFlashIndex;
  const word = state.words[index];
  if (!word) return;

  scorePronunciation(word, flashRecordBtn, flashResult, {
    onStatusChange(message) {
      state.flashResults[index] = message;
    },
    onRecordingChange(isRecording) {
      state.isFlashRecording = isRecording;
      renderFlashCard();
    },
  });
}

function showPreviousFlashWord() {
  showFlashWord(state.currentFlashIndex - 1);
}

function showNextFlashWord() {
  showFlashWord(state.currentFlashIndex + 1);
}

function showFlashWord(index) {
  if (state.isFlashRecording || state.words.length === 0) return;

  const nextIndex = clampIndex(index);
  if (nextIndex === state.currentFlashIndex) return;

  state.currentFlashIndex = nextIndex;
  window.speechSynthesis?.cancel();
  renderFlashCard();
}

function handleFlashSwipe(startX, startY, endX, endY) {
  if (state.isFlashRecording) return;

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const isHorizontalSwipe = Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
  if (!isHorizontalSwipe) return;

  if (deltaX < 0) {
    showPreviousFlashWord();
  } else {
    showNextFlashWord();
  }
}

function clampIndex(index) {
  if (state.words.length === 0) return 0;
  return Math.min(Math.max(index, 0), state.words.length - 1);
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

function scorePronunciation(targetWord, recordBtn, resultNode, options = {}) {
  const setResult = (message) => {
    resultNode.textContent = message;
    options.onStatusChange?.(message);
  };

  if (!SpeechRecognition) {
    setResult("Speech recognition is not supported on this browser/device.");
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
  setResult("Preparing microphone...");
  options.onRecordingChange?.(true);

  recognition.onstart = () => {
    hasStarted = true;
    setResult("Listening... Speak now.");
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
    setResult(`You said: "${best.original}" | Score: ${best.score}/100`);
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
    setResult(message);
  };

  recognition.onspeechend = () => {
    stopRecognition();
  };

  recognition.onend = () => {
    if (forceStopTimer) clearTimeout(forceStopTimer);
    if (!hasStarted) {
      setResult("Microphone failed to start. Try Chrome/Safari over HTTPS or localhost.");
    } else if (!hasResult && !errorCode) {
      setResult("No speech detected. Try again.");
    }
    recordBtn.disabled = false;
    options.onRecordingChange?.(false);
  };

  try {
    recognition.start();
  } catch (error) {
    recordBtn.disabled = false;
    options.onRecordingChange?.(false);
    setResult(`Microphone failed to start: ${error.message}`);
  }
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
