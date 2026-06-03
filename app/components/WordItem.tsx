"use client";

import { useState } from "react";
import { deleteWord } from "@/app/actions";
import { scorePronunciation, speakWord } from "./speechPractice";

interface WordItemProps {
  id: number;
  word: string;
}

export default function WordItem({ id, word }: WordItemProps) {
  const [result, setResult] = useState("");
  const [recording, setRecording] = useState(false);

  function speak() {
    speakWord(word);
  }

  function record() {
    scorePronunciation({
      word,
      onResult: setResult,
      onRecordingChange: setRecording,
    });
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
