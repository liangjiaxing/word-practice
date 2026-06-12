"use client";

import { useMemo, useState } from "react";
import type { StaffQuestion } from "./game-data";
import "./page.css";

type NotePitch = StaffQuestion["answer"];

const OPTIONS: NotePitch[] = ["C", "D", "E", "F", "G", "A", "B"];
const SVG_W = 180;
const SVG_H = 100;
const PAD = 18;
const LEFT = PAD;
const RIGHT = SVG_W - PAD;
const STAFF_Y_TOP = 30;
const STAFF_GAP = 8;
const Y_FOR = (idx: number) => STAFF_Y_TOP + idx * STAFF_GAP;
const NOTE_X = 70;

const PITCH_INDEX: Record<NotePitch, number> = {
  C: 5,
  D: 6,
  E: 0,
  F: 1,
  G: 2,
  A: 3,
  B: 4,
};

function yForNote(pitch: NotePitch) {
  return Y_FOR(PITCH_INDEX[pitch]);
}

function Staff({ pitch }: { pitch: NotePitch }) {
  const lineIndices = [0, 2, 4, 6];
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

      {lineIndices.map((i) => {
        const ly = Y_FOR(i);
        return (
          <line
            key={i}
            x1={LEFT} y1={ly} x2={RIGHT} y2={ly}
            stroke="#0f172a"
            strokeWidth={1.6}
          />
        );
      })}

      <ellipse
        cx={NOTE_X}
        cy={y}
        rx={6.5}
        ry={4.8}
        transform={`rotate(-14 ${NOTE_X} ${y})`}
        fill="#0f172a"
      />

      {pitch === "C" && (
        <line
          x1={NOTE_X - 10} y1={y}
          x2={NOTE_X + 10} y2={y}
          stroke="#0f172a"
          strokeWidth={2}
        />
      )}
    </svg>
  );
}

export default function SightReaderGame() {
  const [sequence, setSequence] = useState<StaffQuestion[]>(() => [
    import("./game-data").then((m) => m.buildQuestion()),
  ]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [questions, setQuestions] = useState<StaffQuestion[]>([]);

  const question = questions[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === question?.answer;

  const finished = index >= 10;

  const scoreText = useMemo(() => {
    if (!finished) return "";
    if (correctCount === 10) return "🎉 满分！";
    if (correctCount >= 7) return `做对了 ${correctCount} / 10，不错！`;
    return `正确率 ${((correctCount / 10) * 100).toFixed(0)}%，继续加油！`;
  }, [finished, correctCount]);

  const options = useMemo(() => {
    if (!question) return OPTIONS;
    const pool = OPTIONS.filter((n) => n !== question.answer);
    const chosen = new Set<string>();
    while (chosen.size < 3) {
      chosen.add(pool[Math.floor(Math.random() * pool.length)]);
    }
    const out = Array.from(chosen) as NotePitch[];
    out.push(question.answer);
    return out.sort(() => Math.random() - 0.5);
  }, [question]);

  function reset() {
    setSequence(
      Array.from({ length: 10 }, () =>
        import("./game-data").then((m) => m.buildQuestion()),
      ),
    );
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setAnsweredCount(0);
    setQuestions([]);
  }

  function pick(option: string) {
    if (isAnswered || answeredCount >= 10 || !question) return;
    setSelected(option);
    setAnsweredCount((n) => n + 1);
    if (option === question.answer) {
      setCorrectCount((n) => n + 1);
    }
  }

  function next() {
    if (!isAnswered) return;
    if (index + 1 >= 10) {
      reset();
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
  }

  if (!question) {
    return (
      <main className="sr-app">
        <h1>五线谱辨识游戏</h1>
        <p className="sr-subtitle">正在出题...</p>
      </main>
    );
  }

  return (
    <main className="sr-app">
      <h1>五线谱辨识游戏</h1>
      <p className="sr-subtitle">选出这个音符的音名 C D E F G A B，共 10 题。</p>

      <div className="sr-meta">
        <span>第 {Math.min(index + 1, 10)} / 10 题</span>
        <span>正确 {correctCount}</span>
      </div>

      {finished ? (
        <div className="sr-feedback success">
          <div className="sr-score">{scoreText}</div>
          <button type="button" className="sr-next-btn" onClick={reset}>
            再来一次
          </button>
        </div>
      ) : (
        <div className="sr-card">
          <Staff pitch={question.answer as NotePitch} />

          <div className="sr-choice-grid">
            {options.map((option) => {
              const isChoiceCorrect = option === question.answer;
              const stateClass = !isAnswered
                ? ""
                : isChoiceCorrect
                  ? " correct"
                  : option === selected
                    ? " wrong"
                    : "";

              return (
                <button
                  key={option}
                  type="button"
                  data-choice="true"
                  data-correct={isChoiceCorrect ? "true" : "false"}
                  className={`sr-choice${stateClass}`}
                  onClick={() => pick(option)}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered ? (
            <div className={isCorrect ? "sr-feedback success" : "sr-feedback error"}>
              <p>{isCorrect ? "回答正确！" : `回答错误，正确答案是 ${question.answer}`}</p>
            </div>
          ) : null}

          {isAnswered ? (
            <button type="button" className="sr-next-btn" onClick={next}>
              {index + 1 >= 10 ? "完成任务 →" : "下一题 →"}
            </button>
          ) : null}
        </div>
      )}
    </main>
  );
}
