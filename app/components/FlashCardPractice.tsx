"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { scorePronunciation, speakWord } from "./speechPractice";

export type PracticeWord = {
  id: number;
  word: string;
};

type FlashCardPracticeProps = {
  words: PracticeWord[];
};

export default function FlashCardPractice({ words }: FlashCardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [results, setResults] = useState<Record<number, string>>({});
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const currentWord = words[currentIndex];

  useEffect(() => {
    setCurrentIndex((index) => clampIndex(index, words.length));
  }, [words.length]);

  function showWord(index: number) {
    if (recording || words.length === 0) return;

    const nextIndex = clampIndex(index, words.length);
    if (nextIndex === currentIndex) return;

    window.speechSynthesis?.cancel();
    setCurrentIndex(nextIndex);
  }

  function showPreviousWord() {
    showWord(currentIndex - 1);
  }

  function showNextWord() {
    showWord(currentIndex + 1);
  }

  function handleSpeak() {
    if (!currentWord) return;
    speakWord(currentWord.word);
  }

  function handleRecord() {
    if (!currentWord) return;
    const wordId = currentWord.id;

    scorePronunciation({
      word: currentWord.word,
      onResult(message) {
        setResults((current) => ({ ...current, [wordId]: message }));
      },
      onRecordingChange: setRecording,
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if ((event.target as Element).closest("button")) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (!pointerStart.current || (event.target as Element).closest("button")) return;

    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    const isHorizontalSwipe = Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
    pointerStart.current = null;

    if (!isHorizontalSwipe) return;
    if (deltaX < 0) showNextWord();
    else showPreviousWord();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousWord();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextWord();
    }
  }

  const hasWords = words.length > 0;
  const result = currentWord ? results[currentWord.id] ?? "" : "";

  return (
    <div className="flash-shell">
      <button
        type="button"
        className="flash-nav"
        aria-label="Previous word"
        onClick={showPreviousWord}
        disabled={!hasWords || recording || currentIndex === 0}
      >
        &#8249;
      </button>

      <article
        id="flashCard"
        className="flash-card"
        tabIndex={0}
        aria-label={currentWord ? `Flash card: ${currentWord.word}` : "Flash card"}
        aria-live="polite"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="flash-counter">
          {hasWords ? `Word ${currentIndex + 1} of ${words.length}` : "No words"}
        </span>
        <span className={hasWords ? "flash-word" : "flash-word flash-empty"}>
          {currentWord?.word ?? "No words yet"}
        </span>
        <div className="actions flash-actions">
          <button type="button" onClick={handleSpeak} disabled={!hasWords || recording}>
            Hear
          </button>
          <button type="button" onClick={handleRecord} disabled={!hasWords || recording}>
            {recording ? "Listening..." : "Record"}
          </button>
        </div>
        <p className="result flash-result" aria-live="polite">
          {result}
        </p>
      </article>

      <button
        type="button"
        className="flash-nav"
        aria-label="Next word"
        onClick={showNextWord}
        disabled={!hasWords || recording || currentIndex === words.length - 1}
      >
        &#8250;
      </button>
    </div>
  );
}

function clampIndex(index: number, total: number) {
  if (total === 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}
