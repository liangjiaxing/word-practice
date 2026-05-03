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
      "nai",
      "te",
      "ta",
      "potential",
      "imperative",
      "volitional",
    ]);

    expect(conjugationTypeLabels.potential).toBe("可能形");
    expect(conjugationTypeLabels.imperative).toBe("命令形");
  });

  it("builds a multiple-choice question with four unique choices including the correct answer", () => {
    const random = vi
      .fn<() => number>()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.18)
      .mockReturnValueOnce(0.36)
      .mockReturnValueOnce(0.54)
      .mockReturnValueOnce(0.72)
      .mockReturnValueOnce(0.9);

    const question = buildQuestion(japaneseWordDeck, "potential", random);

    expect(question.type).toBe("potential");
    expect(question.answer).toBe(question.verb.forms.potential);
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.choices).toContain(question.answer);
    expect(question.prompt).toContain("可能形");
    expect(question.prompt).toContain(question.verb.dictionary);
  });
});
