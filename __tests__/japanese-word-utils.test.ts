import { describe, expect, it, vi } from "vitest";
import {
  buildQuestion,
  conjugationTypeLabels,
  getAvailableConjugationTypes,
  japaneseWordDeck,
} from "@/app/japanese-word/game-data";

describe("japanese-word game data helpers", () => {
  it("exposes the study types needed for memorizing verb forms", () => {
    expect(getAvailableConjugationTypes()).toEqual([
      "passive",
      "potential",
      "causative",
      "causativepassive",
    ]);

    expect(conjugationTypeLabels.passive).toBe("被动形");
    expect(conjugationTypeLabels.causative).toBe("使役形");
  });

  it("builds a multiple-choice question with four unique choices including the correct answer", () => {
    const question = buildQuestion();

    expect(question.type).toBeDefined();
    expect(["passive", "potential", "causative", "causativepassive"]).toContain(question.type);
    expect(question.verb).toBeDefined();
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.choices).toContain(question.answer);
    expect(question.prompt).toContain("何形ですか？");
  });

  it("generates quizzes that remain answerable when the deck is deterministic", () => {
    const random = vi.fn<() => number>().mockReturnValue(0);

    const question = buildQuestion(random);

    expect(question).toBeDefined();
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.choices).toContain(question.answer);
  });
});
