"use client";

import { useRef, useState } from "react";
import "./page.css";

export type NotePitch = "C" | "D" | "E" | "F" | "G" | "A" | "B";

const SVG_W = 240;
const SVG_H = 150;
const STAFF_Y_MIN = 22;
const LINE_GAP = 12;
const NOTE_X = 120;
const SVG_PAD = 24;

// Vertical index from the top staff line.
// Staff lines sit at 0, 1, 2, 3, 4.
// Every half step = 0.5 index (6px with 12px line gap).
// Below staff: 4.5 = first ledger line, 5 = second ledger line.
const Y_FOR = (index: number) => STAFF_Y_MIN + index * LINE_GAP;

const NOTE_LINE_INDEX: Record<NotePitch, number> = {
  E: 4, // bottom staff line
  F: 3.5,
  G: 3,
  A: 2.5,
  B: 2,
  D: 4.5, // first ledger below staff (D4)
  C: 5, // second ledger below staff (C4)
};

const STAFF_LINE_INDICES = [0, 1, 2, 3, 4] as const;

function yForPitch(pitch: NotePitch) {
  return Y_FOR(NOTE_LINE_INDEX[pitch]);
}

function StaffSVG({ pitch }: { pitch: NotePitch }) {
  const y = yForPitch(pitch);
  const showCLedger = pitch === "C" || pitch === "D";

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

      {showCLedger && (
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
  const [question, setQuestion] = useState<{ answer: NotePitch }>(() => makeQuestion(null));
  const [choice, setChoice] = useState<NotePitch | null>(null);
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const prevAnswerRef = useRef<NotePitch | null>(null);

  const totalRounds = 10;
  const currentRound = Math.min(round + 1, totalRounds);
  const finished = round >= totalRounds;

  function makeQuestion(prev: NotePitch | null): { answer: NotePitch } {
    const all: NotePitch[] = ["C", "D", "E", "F", "G", "A", "B"];
    let answer: NotePitch;
    if (!prev) {
      answer = all[Math.floor(Math.random() * all.length)];
    } else {
      do {
        answer = all[Math.floor(Math.random() * all.length)];
      } while (answer === prev);
    }
    prevAnswerRef.current = answer;
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
      prevAnswerRef.current = null;
      setRound(0);
      setScore(0);
      setQuestion(makeQuestion(null));
      setChoice(null);
      setState("idle");
      return;
    }
    setRound((n) => n + 1);
    setQuestion(makeQuestion(question.answer));
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
