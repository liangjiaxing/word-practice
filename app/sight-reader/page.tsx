"use client";

import { useRef, useState } from "react";
import "./page.css";

export const dynamic = "force-dynamic";

export type NotePitch = "C" | "D" | "E" | "F" | "G" | "A" | "B";

const PITCHES: NotePitch[] = ["C", "D", "E", "F", "G", "A", "B"];

const SVG_W = 240;
const SVG_H = 150;
const STAFF_Y_MIN = 22;
const LINE_GAP = 12;
const NOTE_X = 120;
const SVG_PAD = 24;

const Y_FOR = (index: number) => STAFF_Y_MIN + index * LINE_GAP;

const PITCH_Y: Record<NotePitch, { y: number; ledger: boolean }> = {
  C: { y: Y_FOR(4.5), ledger: true },
  D: { y: Y_FOR(4), ledger: true },
  E: { y: Y_FOR(3.5), ledger: false },
  F: { y: Y_FOR(3), ledger: false },
  G: { y: Y_FOR(2.5), ledger: false },
  A: { y: Y_FOR(2), ledger: false },
  B: { y: Y_FOR(1.5), ledger: false },
};

const STAFF_LINE_INDICES = [0, 1, 2, 3, 4] as const;

function StaffSVG({ pitch }: { pitch: NotePitch }) {
  const { y, ledger } = PITCH_Y[pitch];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      role="img"
      aria-label="五线谱音符"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect width={SVG_W} height={SVG_H} fill="#ffffff" rx={10} ry={10} />
      <ellipse
        cx={NOTE_X}
        cy={y}
        rx={15}
        ry={10}
        transform={`rotate(-14 ${NOTE_X} ${y})`}
        fill="#0f172a"
      />
      {ledger && (
        <line
          x1={NOTE_X - 14}
          y1={y}
          x2={NOTE_X + 14}
          y2={y}
          stroke="#0f172a"
          strokeWidth={1.5}
        />
      )}
      {STAFF_LINE_INDICES.map((i) => {
        const ly = Y_FOR(i);
        return (
          <line
            key={i}
            x1={SVG_PAD}
            y1={ly}
            x2={SVG_W - SVG_PAD}
            y2={ly}
            stroke="#0f172a"
            strokeWidth={1.6}
          />
        );
      })}
    </svg>
  );
}

export default function SightReaderPage() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const [selected, setSelected] = useState<NotePitch | null>(null);
  const [answer, setAnswer] = useState<NotePitch | null>(null);
  const prevRef = useRef<NotePitch | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const totalRounds = 10;
  const currentRound = Math.min(round + 1, totalRounds);
  const finished = round >= totalRounds;

  function newQuestion(prev: NotePitch | null): NotePitch {
    let next: NotePitch;
    if (!prev) {
      next = PITCHES[Math.floor(Math.random() * PITCHES.length)];
    } else {
      do {
        next = PITCHES[Math.floor(Math.random() * PITCHES.length)];
      } while (next === prev);
    }
    prevRef.current = next;
    return next;
  }

  function choose(pitch: NotePitch) {
    if (!answer || selected) return;
    const ok = pitch === answer;
    setSelected(pitch);
    setCorrect(ok);
    if (ok) setScore((s) => s + 1);
  }

  function advance() {
    if (!answer) return;
    if (round + 1 >= totalRounds) {
      setRound(0);
      setScore(0);
      setAnswer(newQuestion(null));
    } else {
      setRound((n) => n + 1);
      setAnswer(newQuestion(answer));
    }
    setSelected(null);
    setCorrect(null);
  }

  if (!answer) {
    setAnswer(newQuestion(prevRef.current));
    return <p className="sr-feedback">正在出题...</p>;
  }

  const feedbackText =
    correct === true
      ? "回答正确！"
      : correct === false
        ? `回答错误，正确答案是 ${answer}`
        : "";

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
          <div className="sr-score">
            {score === 10
              ? "🎉 满分！五线谱小天才"
              : score >= 7
                ? `做对了 ${score} / 10，不错！`
                : `正确率 ${((score / totalRounds) * 100).toFixed(0)}%，继续加油！`}
          </div>
          <button type="button" className="sr-next-btn" onClick={() => setRound(0)}>
            再来一次
          </button>
        </div>
      ) : (
        <div className="sr-card">
          <StaffSVG pitch={answer} />
          <div className="sr-choice-grid">
            {PITCHES.map((option) => {
              let cls = "sr-choice";
              if (selected) {
                if (option === answer) cls += " correct";
                else if (option === selected) cls += " wrong";
              }
              return (
                <button
                  key={option}
                  type="button"
                  className={cls}
                  onClick={() => choose(option)}
                  disabled={!!selected}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {selected && (
            <>
              <div className={correct ? "sr-feedback success" : "sr-feedback error"}>
                <p>{feedbackText}</p>
              </div>
              <button type="button" className="sr-next-btn" onClick={advance}>
                {round + 1 >= totalRounds ? "完成任务 →" : "下一题 →"}
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
