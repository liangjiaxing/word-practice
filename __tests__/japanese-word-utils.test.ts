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
    const question = buildQuestion(japaneseWordDeck, "potential");

    expect(question.type).toBe("potential");
    expect(question.answer).toBe(question.verb.forms.potential);
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.choices).toContain(question.answer);
    expect(question.prompt).toContain("可能形");
    expect(question.prompt).toContain(question.verb.dictionary);
  });

  it("reuses next available distractors when same-verb forms are exhausted", () => {
    const random = vi.fn<() => number>().mockReturnValue(0);

    const question = buildQuestion(japaneseWordDeck, "potential", random);
    const distractors = question.choices.filter((choice) => choice !== question.answer);

    expect(question).toBeDefined();
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
  });
});
