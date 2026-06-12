"use client";

import { useState } from "react";
import "./page.css";

export type NotePitch = "C" | "D" | "E" | "F" | "G" | "A" | "B";

const SVG_W = 240;
const SVG_H = 170;
const STAFF_Y_TOP = 22;
const STAFF_GAP = 12;
const Y_FOR = (idx: number) => STAFF_Y_TOP + idx * STAFF_GAP;
const NOTE_X = 120;

// Treble clef, y grows downward.
// Top staff line index 0  -> F5
//                   2  -> D5
//                   4  -> B4
//                   6  -> G4
//                8(bottom) -> E4
// Spaces between lines: between 0-2=E5, between 2-4=C5, between 4-6=A4, between 6-8=F4
const PITCH_INDEX: Record<NotePitch, number> = {
  E: 8, // bottom staff line
  F: 7,
  G: 6,
  A: 5,
  B: 4,
  C: 3, // 3rd space (C5)
  D: 2, // 4th line
};

function yForNote(pitch: NotePitch) {
  return Y_FOR(PITCH_INDEX[pitch]);
}

function StaffSVG({ pitch }: { pitch: NotePitch }) {
  // 5 staff line indices: 0,2,4,6,8
  const lineIndices = [0, 2, 4, 6, 8];
  const y = yForNote(pitch);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      role="img"
      aria-label="五线谱音符"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect width={SVG_W} height={SVG_H} fill="#ffffff" rx={10} ry={10} />

      {/* Notehead (rendered first so staff line cuts through it for on-line notes) */}
      <ellipse
        cx={NOTE_X}
        cy={y}
        rx={16}
        ry={11}
        transform={`rotate(-14 ${NOTE_X} ${y})`}
        fill="#0f172a"
      />

      {/* Ledger line for C5 (middle C area below staff) */}
      {pitch === "C" && (
        <line
          x1={NOTE_X - 12}
          y1={y}
          x2={NOTE_X + 12}
          y2={y}
          stroke="#0f172a"
          strokeWidth={4}
        />
      )}

      {/* 5 staff lines (rendered after note so line passes through on-line noteheads) */}
      {lineIndices.map((i) => {
        const ly = Y_FOR(i);
        return (
          <line
            key={i}
            x1={24}
            y1={ly}
            x2={SVG_W - 24}
            y2={ly}
            stroke="#0f172a"
            strokeWidth={1.8}
          />
        );
      })}
    </svg>
  );
}

export default function SightReaderPage() {
  const [question, setQuestion] = useState<{ answer: NotePitch }>(() => makeQuestion());
  const [choice, setChoice] = useState<NotePitch | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const totalRounds = 10;
  const currentRound = Math.min(round + 1, totalRounds);
  const finished = round >= totalRounds;

  function makeQuestion(): { answer: NotePitch } {
    const all: NotePitch[] = ["C", "D", "E", "F", "G", "A", "B"];
    const answer = all[Math.floor(Math.random() * all.length)];
    return { answer };
  }

  function pick(pitch: NotePitch) {
    if (state !== "idle") return;
    const ok = pitch === question.answer;
    setChoice(pitch);
    setState(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
  }

  function next() {
    if (state === "idle") return;
    if (round + 1 >= totalRounds) {
      setRound(0);
      setScore(0);
      setQuestion(makeQuestion());
      setChoice(null);
      setState("idle");
      return;
    }
    setRound((n) => n + 1);
    setQuestion(makeQuestion());
    setChoice(null);
    setState("idle");
  }

  const feedbackText =
    state === "correct" ? "回答正确！" : `回答错误，正确答案是 ${question.answer}`;

  const scoreText = (() => {
    if (!finished) return "";
    if (score === 10) return "🎉 满分！五线谱小天才";
    if (score >= 7) return `做对了 ${score} / 10，不错！`;
    return `正确率 ${((score / totalRounds) * 100).toFixed(0)}%，继续加油！`;
  })();

  const options: NotePitch[] = ["C", "D", "E", "F", "G", "A", "B"];

  return (
    <main className="sr-app">
      <h1>五线谱辨识游戏</h1>
      <p className="sr-subtitle">选出这个音符的音名 C D E F G A B，共 10 题。</p>
      <div className="sr-meta">
        <span>第 {currentRound} / {totalRounds} 题</span>
        <span>正确 {score}</span>
      </div>

      {finished ? (
        <div className="sr-feedback success">
          <div className="sr-score">{scoreText}</div>
          <button type="button" className="sr-next-btn" onClick={() => setRound(0)}>
            再来一次
          </button>
        </div>
      ) : (
        <div className="sr-card">
          <StaffSVG pitch={question.answer} />

          <div className="sr-choice-grid">
            {options.map((option) => {
              const isCorrect = option === question.answer;
              let cls = "sr-choice";
              if (state !== "idle") {
                if (isCorrect) cls += " correct";
                else if (state === "wrong" && option === choice) cls += " wrong";
              }
              return (
                <button
                  key={option}
                  type="button"
                  className={cls}
                  onClick={() => pick(option)}
                  disabled={state !== "idle"}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {state !== "idle" && (
            <div className={state === "correct" ? "sr-feedback success" : "sr-feedback error"}>
              <p>{feedbackText}</p>
            </div>
          )}
          {state !== "idle" && (
            <button type="button" className="sr-next-btn" onClick={next}>
              {round + 1 >= totalRounds ? "完成任务 →" : "下一题 →"}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
