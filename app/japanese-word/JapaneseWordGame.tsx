"use client";

import { useMemo, useState } from "react";
import {
  buildQuestion,
  getAvailableConjugationTypes,
  groupHints,
  type JapaneseWordQuestion,
} from "./game-data";

function createQuestion() {
  return buildQuestion();
}

export default function JapaneseWordGame() {
  const [question, setQuestion] = useState<JapaneseWordQuestion>(() =>
    createQuestion(),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;

  const summary = useMemo(() => {
    if (!selected) return "";
    const base = isCorrect
      ? `回答正确！${question.verb.dictionary} 的 ${question.answer} 就是给出的变形。`
      : `回答错误。正确答案是 ${question.answer}。`;
    const example = question.verb.exampleSentence?.trim();
    return example ? `${base}<br/><br/>例：${example}` : base;
  }, [isCorrect, question, selected]);

  function resetAnswerState() {
    setSelected(null);
  }

  function nextQuestion() {
    setQuestion(createQuestion());
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

  return (
    <main className="jw-app">
      <h1>日语动词变形辨识游戏</h1>
      <p className="jw-subtitle">
        判断给出的动词变形属于可能形、被动形、使役形还是使役被动形，覆盖一类、二类、三类动词。
      </p>

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
            <p dangerouslySetInnerHTML={{ __html: summary }} />
            <button type="button" className="jw-next-btn" onClick={nextQuestion}>
              下一题
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
