"use client";

import { useEffect, useMemo, useState } from "react";
import { buildQuestion, type StaffQuestion } from "./game-data";
import "./page.css";

export default function SightReaderPage() {
  const [sequence, setSequence] = useState<StaffQuestion[]>(() => {
    const q = buildQuestion();
    return [q];
  });
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const question = sequence[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;

  function reset() {
    setSequence((prev) => {
      const all: StaffQuestion[] = [...prev, buildQuestion()];
      if (isAnswered && index + 1 >= 10) {
        setSelected(null);
        setAnsweredCount(0);
        setCorrectCount(0);
        setIndex(0);
        return [buildQuestion()];
      }
      return all;
    });
  }

  function pick(option: string) {
    if (isAnswered || answeredCount >= 10) return;
    setSelected(option);
    setAnsweredCount((n) => n + 1);
    if (option === question.answer) {
      setCorrectCount((n) => n + 1);
    }
  }

  function next() {
    setIndex((n) => n + 1);
    setSelected(null);
    if (!isAnswered) return;
    if (index + 1 >= 10) {
      setTimeout(() => {
        setSelected(null);
        setAnsweredCount(0);
        setCorrectCount(0);
        setIndex(0);
      }, 0);
      return;
    }
  }

  const finished = index >= 10;
  const scoreText = finished
    ? correctCount === 10
      ? "🎉 满分！五线谱小天才"
      : correctCount >= 7
        ? `做对了 ${correctCount} 题 / 10`
        : `正确率 ${((correctCount / 10) * 100).toFixed(0)}%，继续加油！`
    : "";

  return (
    <main className="sr-app">
      <h1>五线谱辨识游戏</h1>
      <p className="sr-subtitle">
        听/看谱子，选出对应的音名 C D E F G A B。共 10 题，最后打分。
      </p>

      <div className="sr-meta">
        <span>第 {index + 1} / 10 题</span>
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
          <div className="sr-prompt">读出下列音符（高音或低音谱号）对应的唱名</div>

          <div className="sr-staff-wrap" dangerouslySetInnerHTML={{ __html: question.svg }} />

          <div className="sr-warning">
            ⚠️ 暂不支持音频播放，请通过视觉判断后进行选择。
          </div>

          <div className="sr-choice-grid">
            {question.options.map((option) => {
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
