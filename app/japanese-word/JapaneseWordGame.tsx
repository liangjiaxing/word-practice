"use client";

import { useMemo, useState } from "react";
import {
  buildQuestion,
  conjugationTypeLabels,
  getAvailableConjugationTypes,
  groupHints,
  japaneseWordDeck,
  type ConjugationType,
  type JapaneseWordQuestion,
} from "./game-data";

const drillTypes = getAvailableConjugationTypes();
type AnswerMode = "choice" | "input";

function createQuestion(type: ConjugationType) {
  return buildQuestion(japaneseWordDeck, type);
}

function normalizeAnswer(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export default function JapaneseWordGame() {
  const [activeType, setActiveType] = useState<ConjugationType>(drillTypes[0]);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("choice");
  const [question, setQuestion] = useState<JapaneseWordQuestion>(() => createQuestion(drillTypes[0]));
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;

  const summary = useMemo(() => {
    if (!selected) return "";
    return isCorrect
      ? `回答正确！${question.verb.dictionary} 的 ${conjugationTypeLabels[question.type]} 就是 ${question.answer}。`
      : `回答错误。正确答案是 ${question.answer}。`;
  }, [isCorrect, question, selected]);

  function resetAnswerState() {
    setSelected(null);
    setTypedAnswer("");
  }

  function chooseType(type: ConjugationType) {
    setActiveType(type);
    setQuestion(createQuestion(type));
    resetAnswerState();
    setCorrectCount(0);
    setAnsweredCount(0);
  }

  function chooseMode(mode: AnswerMode) {
    setAnswerMode(mode);
    resetAnswerState();
  }

  function finishAnswer(answer: string) {
    if (isAnswered) return;
    setSelected(answer);
    setAnsweredCount((count) => count + 1);
    if (answer === question.answer) {
      setCorrectCount((count) => count + 1);
    }
  }

  function handleChoice(choice: string) {
    finishAnswer(choice);
  }

  function submitTypedAnswer() {
    const normalized = normalizeAnswer(typedAnswer);
    if (!normalized || isAnswered) return;
    finishAnswer(normalized);
  }

  function nextQuestion() {
    setQuestion(createQuestion(activeType));
    resetAnswerState();
  }

  return (
    <main className="jw-app">
      <h1>日语单词变形记忆游戏</h1>
      <p className="jw-subtitle">
        从基础形选出指定变形，专门练习可能形、命令形、意向形等常见词形。
      </p>

      <section className="jw-panel" aria-label="drill type selector">
        <div className="jw-panel-header">
          <strong>选择练习类型</strong>
          <span className="jw-progress">已答对 {correctCount} / {answeredCount}</span>
        </div>
        <div className="jw-chip-row">
          {drillTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={type === activeType ? "jw-chip active" : "jw-chip"}
              onClick={() => chooseType(type)}
            >
              {conjugationTypeLabels[type]}
            </button>
          ))}
        </div>
        <p className="jw-current-type">当前练习：{conjugationTypeLabels[activeType]}</p>

        <div className="jw-mode-row" role="group" aria-label="answer mode selector">
          <button
            type="button"
            className={answerMode === "choice" ? "jw-chip active" : "jw-chip"}
            onClick={() => chooseMode("choice")}
          >
            选择模式
          </button>
          <button
            type="button"
            className={answerMode === "input" ? "jw-chip active" : "jw-chip"}
            onClick={() => chooseMode("input")}
          >
            输入模式
          </button>
        </div>
      </section>

      <section className="jw-card" aria-live="polite">
        <div className="jw-card-topline">{question.prompt}</div>
        <div className="jw-word">{question.verb.dictionary}</div>
        <div className="jw-meaning">意思：{question.verb.meaning}</div>

        {answerMode === "choice" ? (
          <div className="jw-choice-grid">
            {question.choices.map((choice) => {
              const isChoiceCorrect = choice === question.answer;
              const stateClass = !isAnswered
                ? ""
                : isChoiceCorrect
                  ? " correct"
                  : choice === selected
                    ? " wrong"
                    : "";

              return (
                <button
                  key={choice}
                  type="button"
                  data-choice="true"
                  data-correct={isChoiceCorrect ? "true" : "false"}
                  className={`jw-choice${stateClass}`}
                  onClick={() => handleChoice(choice)}
                  disabled={isAnswered}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="jw-input-area">
            <input
              type="text"
              className="jw-input"
              placeholder="输入你记住的变形"
              value={typedAnswer}
              onChange={(event) => setTypedAnswer(event.target.value)}
              disabled={isAnswered}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitTypedAnswer();
                }
              }}
            />
            <button
              type="button"
              className="jw-submit-btn"
              onClick={submitTypedAnswer}
              disabled={isAnswered || !normalizeAnswer(typedAnswer)}
            >
              提交答案
            </button>
          </div>
        )}

        <div className="jw-hint">
          <strong>记忆提示：</strong>
          {groupHints[question.verb.group]}
        </div>

        {isAnswered ? (
          <div className={isCorrect ? "jw-feedback success" : "jw-feedback error"}>
            <p>{summary}</p>
            <button type="button" className="jw-next-btn" onClick={nextQuestion}>
              下一题
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
