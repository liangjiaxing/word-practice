"use client";

import { useState } from "react";
import { deleteSentence } from "../actions";

interface SentenceItemProps {
  id: number;
  sentence: string;
  translation: string;
}

export default function SentenceItem({
  id,
  sentence,
  translation,
}: SentenceItemProps) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  return (
    <li className="sentence-item">
      <div className="sentence-text">{sentence}</div>
      <div className="translation-text">{translation}</div>
      <div className="actions">
        <button
          type="button"
          onClick={speak}
          disabled={speaking}
        >
          {speaking ? "朗读中..." : "🔊 朗读"}
        </button>
        <button
          type="button"
          className="delete-btn"
          onClick={() => deleteSentence(id)}
        >
          删除
        </button>
      </div>
    </li>
  );
}
