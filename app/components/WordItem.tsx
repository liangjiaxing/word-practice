"use client";

import { useState } from "react";
import { deleteWord } from "@/app/actions";

interface WordItemProps {
  id: number;
  word: string;
}

export default function WordItem({ id, word }: WordItemProps) {
  const [result, setResult] = useState("");
  const [recording, setRecording] = useState(false);

  function speak() {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function record() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setResult("Speech recognition not supported on this browser.");
      return;
    }

    setRecording(true);
    setResult("Preparing microphone...");

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
      try { recognition.stop(); } catch {}
    };

    recognition.onstart = () => {
      hasStarted = true;
      setResult("Listening... Speak now.");
      forceStopTimer = setTimeout(stopRecognition, 8000);
    };

    recognition.onresult = (event: any) => {
      hasResult = true;
      const target = normalize(word);
      const candidates: string[] = [];
      for (let i = 0; i < event.results[0].length; i++) {
        candidates.push(event.results[0][i].transcript);
      }
      const best = pickBest(target, candidates);
      setResult(`You said: "${best.original}" | Score: ${best.score}/100`);
      stopRecognition();
    };

    recognition.onerror = (event: any) => {
      errorCode = event.error;
      const msg =
        event.error === "not-allowed"
          ? "Microphone permission denied."
          : event.error === "no-speech"
          ? "No speech detected. Try again."
          : `Error: ${event.error}`;
      setResult(msg);
    };

    recognition.onspeechend = () => stopRecognition();

    recognition.onend = () => {
      if (forceStopTimer) clearTimeout(forceStopTimer);
      if (!hasStarted) setResult("Microphone failed to start.");
      else if (!hasResult && !errorCode) setResult("No speech detected. Try again.");
      setRecording(false);
    };

    recognition.start();
  }

  function handleDelete() {
    deleteWord(id);
  }

  return (
    <li className="word-item">
      <span className="word-text">{word}</span>
      <div className="actions">
        <button type="button" className="speak-btn" onClick={speak}>
          Hear
        </button>
        <button type="button" className="record-btn" onClick={record} disabled={recording}>
          {recording ? "Listening..." : "Record"}
        </button>
        <button type="button" className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>
      {result && <p className="result">{result}</p>}
    </li>
  );
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
  const m = a.length + 1, n = b.length + 1;
  const dp = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) dp[i][0] = i;
  for (let j = 0; j < n; j++) dp[0][j] = j;
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[a.length][b.length];
}
