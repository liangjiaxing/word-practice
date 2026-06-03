"use client";

import { useState } from "react";
import AddWordForm from "./AddWordForm";
import FlashCardPractice from "./FlashCardPractice";
import type { PracticeWord } from "./FlashCardPractice";
import WordItem from "./WordItem";

type PracticeMode = "list" | "flash";

type PracticeModesProps = {
  words: PracticeWord[];
};

export default function PracticeModes({ words }: PracticeModesProps) {
  const [mode, setMode] = useState<PracticeMode>("list");
  const isListMode = mode === "list";

  return (
    <>
      <AddWordForm />

      <div className="mode-switch" role="tablist" aria-label="Practice mode">
        <button
          id="listModeTab"
          type="button"
          className={isListMode ? "mode-btn is-active" : "mode-btn"}
          role="tab"
          aria-selected={isListMode}
          aria-controls="listModePanel"
          onClick={() => setMode("list")}
        >
          List
        </button>
        <button
          id="flashModeTab"
          type="button"
          className={!isListMode ? "mode-btn is-active" : "mode-btn"}
          role="tab"
          aria-selected={!isListMode}
          aria-controls="flashModePanel"
          onClick={() => setMode("flash")}
        >
          Flash Card
        </button>
      </div>

      <section
        id="listModePanel"
        className="practice-panel"
        role="tabpanel"
        aria-labelledby="listModeTab"
        hidden={!isListMode}
      >
        <ul className="word-list" aria-label="Word list">
          {words.map((w) => (
            <WordItem key={w.id} id={w.id} word={w.word} />
          ))}
        </ul>
      </section>

      <section
        id="flashModePanel"
        className="practice-panel"
        role="tabpanel"
        aria-labelledby="flashModeTab"
        hidden={isListMode}
      >
        <FlashCardPractice words={words} />
      </section>
    </>
  );
}
