type SpeechRecognitionResultLike = ArrayLike<{ transcript: string }>;

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onspeechend: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

type ScorePronunciationOptions = {
  word: string;
  onResult: (message: string) => void;
  onRecordingChange?: (recording: boolean) => void;
};

export function speakWord(word: string) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function scorePronunciation({
  word,
  onResult,
  onRecordingChange,
}: ScorePronunciationOptions) {
  const SpeechRecognition =
    (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onResult("Speech recognition not supported on this browser.");
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
  let forceStopTimer: ReturnType<typeof setTimeout> | null = null;

  const stopRecognition = () => {
    if (stopRequested) return;
    stopRequested = true;
    try {
      recognition.stop();
    } catch {
      // Some browsers throw if stop() is called before recognition fully starts.
    }
  };

  onRecordingChange?.(true);
  onResult("Preparing microphone...");

  recognition.onstart = () => {
    hasStarted = true;
    onResult("Listening... Speak now.");
    forceStopTimer = setTimeout(stopRecognition, 8000);
  };

  recognition.onresult = (event) => {
    hasResult = true;
    const target = normalize(word);
    const candidates: string[] = [];
    const firstResult = event.results[0];

    for (let i = 0; i < firstResult.length; i += 1) {
      candidates.push(firstResult[i].transcript);
    }

    const best = pickBest(target, candidates);
    onResult(`You said: "${best.original}" | Score: ${best.score}/100`);
    stopRecognition();
  };

  recognition.onerror = (event) => {
    errorCode = event.error;
    const message =
      event.error === "not-allowed"
        ? "Microphone permission denied."
        : event.error === "no-speech"
          ? "No speech detected. Try again."
          : `Error: ${event.error}`;
    onResult(message);
  };

  recognition.onspeechend = () => stopRecognition();

  recognition.onend = () => {
    if (forceStopTimer) clearTimeout(forceStopTimer);
    if (!hasStarted) onResult("Microphone failed to start.");
    else if (!hasResult && !errorCode) onResult("No speech detected. Try again.");
    onRecordingChange?.(false);
  };

  try {
    recognition.start();
  } catch (error) {
    if (forceStopTimer) clearTimeout(forceStopTimer);
    onRecordingChange?.(false);
    const message = error instanceof Error ? error.message : "unknown error";
    onResult(`Microphone failed to start: ${message}`);
  }
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}

function pickBest(target: string, candidates: string[]) {
  let best = { original: "", score: 0 };
  for (const text of candidates) {
    const norm = normalize(text);
    const score = similarity(target, norm);
    if (score > best.score) best = { original: text.trim(), score };
  }
  return best;
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (a === b) return 100;
  const dist = levenshtein(a, b);
  return Math.max(0, Math.round((1 - dist / Math.max(a.length, b.length)) * 100));
}

function levenshtein(a: string, b: string) {
  const m = a.length + 1;
  const n = b.length + 1;
  const dp = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i += 1) dp[i][0] = i;
  for (let j = 0; j < n; j += 1) dp[0][j] = j;
  for (let i = 1; i < m; i += 1) {
    for (let j = 1; j < n; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}
