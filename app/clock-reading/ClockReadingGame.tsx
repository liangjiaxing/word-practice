"use client";

import { useState } from "react";
import ClockFace from "./ClockFace";
import {
  LEVELS,
  TOTAL_ROUNDS,
  buildQuestion,
  formatTime,
  sameTime,
  timeLabel,
  type ClockLevel,
  type TimeQuestion,
  type TimeValue,
} from "./game-data";

export default function ClockReadingGame() {
  const [level, setLevel] = useState<ClockLevel | null>(null);
  const [question, setQuestion] = useState<TimeQuestion | null>(null);
  const [selected, setSelected] = useState<TimeValue | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function start(next: ClockLevel) {
    setLevel(next);
    setQuestion(buildQuestion(next));
    setSelected(null);
    setRound(0);
    setScore(0);
    setFinished(false);
  }

  function backToMenu() {
    setLevel(null);
    setQuestion(null);
    setSelected(null);
    setFinished(false);
  }

  function choose(option: TimeValue) {
    if (!question || selected) return;
    setSelected(option);
    if (sameTime(option, question)) setScore((value) => value + 1);
  }

  function advance() {
    if (!level || !question) return;
    if (round + 1 >= TOTAL_ROUNDS) {
      setFinished(true);
      return;
    }
    setQuestion(buildQuestion(level, Math.random, question));
    setRound((value) => value + 1);
    setSelected(null);
  }

  if (!level || !question) {
    return (
      <main className="cr-app">
        <h1>🕐 认时钟</h1>
        <p className="cr-subtitle">
          看看钟面，它是几点？选一个难度开始吧，一共 {TOTAL_ROUNDS} 题。
        </p>
        <div className="cr-level-grid">
          {LEVELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="cr-level-card"
              onClick={() => start(item.id)}
            >
              <span className="cr-level-clock">
                <ClockFace
                  hour={item.preview.hour}
                  minute={item.preview.minute}
                  showMinuteNumbers={item.id !== "hour"}
                />
              </span>
              <span className="cr-level-name">{item.label}</span>
              <span className="cr-level-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const currentRound = Math.min(round + 1, TOTAL_ROUNDS);
  const isCorrect = selected ? sameTime(selected, question) : null;

  if (finished) {
    return (
      <main className="cr-app">
        <h1>🕐 认时钟</h1>
        <div className="cr-result">
          <p className="cr-result-emoji">
            {score === TOTAL_ROUNDS ? "🏆" : score >= 7 ? "🎉" : "💪"}
          </p>
          <p className="cr-score">
            {score === TOTAL_ROUNDS
              ? "满分！时钟小专家！"
              : `做对了 ${score} / ${TOTAL_ROUNDS} 题`}
          </p>
          <p className="cr-stars">
            {"⭐".repeat(score)}
            {"☆".repeat(TOTAL_ROUNDS - score)}
          </p>
          <div className="cr-actions">
            <button type="button" className="cr-next-btn" onClick={() => start(level)}>
              再来一次
            </button>
            <button type="button" className="cr-secondary-btn" onClick={backToMenu}>
              换个难度
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cr-app">
      <h1>🕐 认时钟</h1>
      <div className="cr-meta">
        <span>
          第 {currentRound} / {TOTAL_ROUNDS} 题
        </span>
        <span>⭐ {score}</span>
      </div>

      <div className="cr-card">
        <p className="cr-prompt">现在是几点？</p>
        <div className="cr-clock-wrap">
          <ClockFace
            hour={question.hour}
            minute={question.minute}
            showMinuteNumbers={level !== "hour"}
          />
        </div>

        <div className="cr-option-grid">
          {question.options.map((option) => {
            let cls = "cr-option";
            if (selected) {
              if (sameTime(option, question)) cls += " correct";
              else if (sameTime(option, selected)) cls += " wrong";
            }
            return (
              <button
                key={formatTime(option)}
                type="button"
                className={cls}
                onClick={() => choose(option)}
                disabled={Boolean(selected)}
              >
                <span className="cr-option-time">{formatTime(option)}</span>
                <span className="cr-option-label">{timeLabel(option)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className={isCorrect ? "cr-feedback success" : "cr-feedback error"}>
          <p>
            {isCorrect
              ? "🎉 答对啦！"
              : `再想想～答案是 ${formatTime(question)}（${timeLabel(question)}）`}
          </p>
          <button type="button" className="cr-next-btn" onClick={advance}>
            {round + 1 >= TOTAL_ROUNDS ? "看看成绩 →" : "下一题 →"}
          </button>
        </div>
      )}

      <div className="cr-footer">
        <button type="button" className="cr-secondary-btn" onClick={backToMenu}>
          ← 换个难度
        </button>
      </div>
    </main>
  );
}
