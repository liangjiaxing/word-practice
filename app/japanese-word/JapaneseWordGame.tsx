"use client";

import { useMemo, useState } from "react";
import {
  buildQuestion,
  conjugationTypeLabels,
  getAvailableConjugationTypes,
  groupHints,
  type JapaneseWordQuestion,
} from "./game-data";

const drillTypes = getAvailableConjugationTypes();

function createQuestion(type: string) {
  let question: JapaneseWordQuestion;
  do {
    question = buildQuestion();
  } while (question.answer !== conjugationTypeLabels[type as keyof typeof conjugationTypeLabels]);
  return question;
}

export default function JapaneseWordGame() {
  const [activeType, setActiveType] = useState<string>(drillTypes[0]);
  const [question, setQuestion] = useState<JapaneseWordQuestion>(() =>
    createQuestion(drillTypes[0]),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;

  const summary = useMemo(() => {
    if (!selected) return "";
    return isCorrect
      ? `回答正确！${question.verb.dictionary} 的 ${question.answer} 就是给出的变形。`
      : `回答错误。正确答案是 ${question.answer}。`;
  }, [isCorrect, question, selected]);

  function resetAnswerState() {
    setSelected(null);
  }

  function chooseType(type: string) {
    setActiveType(type);
    setQuestion(createQuestion(type));
    resetAnswerState();
    setCorrectCount(0);
    setAnsweredCount(0);
  }

  function finishAnswer(answer: string) {
    if (isAnswered) return;
    setSelected(answer);
    setAnsweredCount((count) => count + 1);
    if (answer === question.answer) {
      setCorrectCount((count) => count + 1);
    }
  }

  function nextQuestion() {
    setQuestion(createQuestion(activeType));
    resetAnswerState();
  }

  return (
    <main className="jw-app">
      <h1>日语动词变形辨识游戏</h1>
      <p className="jw-subtitle">
        判断给出的动词变形属于可能形、被动形、使役形还是使役被动形，覆盖一类、二类、三类动词。
      </p>

      <section className="jw-panel" aria-label="drill type selector">
        <div className="jw-panel-header">
          <strong>选择练习类型</strong>
          <span className="jw-progress">
            已答对 {correctCount} / {answeredCount}
          </span>
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
      </section>

      <section className="jw-card" aria-live="polite">
        <div className="jw-card-topline">{question.prompt}</div>
        <div className="jw-word">{question.verb.dictionary}</div>
        <div className="jw-meaning">意思：{question.verb.meaning}</div>

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
                onClick={() => finishAnswer(choice)}
                disabled={isAnswered}
              >
                {choice}
              </button>
            );
          })}
        </div>

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
