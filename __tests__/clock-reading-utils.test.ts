import { describe, expect, it, vi } from "vitest";
import {
  LEVELS,
  TOTAL_ROUNDS,
  buildQuestion,
  formatTime,
  minutesForLevel,
  sameTime,
  timeLabel,
} from "@/app/clock-reading/game-data";

describe("clock-reading game data helpers", () => {
  it("formats times and Chinese labels", () => {
    expect(formatTime({ hour: 7, minute: 0 })).toBe("7:00");
    expect(formatTime({ hour: 7, minute: 5 })).toBe("7:05");
    expect(formatTime({ hour: 12, minute: 30 })).toBe("12:30");

    expect(timeLabel({ hour: 7, minute: 0 })).toBe("7点整");
    expect(timeLabel({ hour: 7, minute: 30 })).toBe("7点半");
    expect(timeLabel({ hour: 7, minute: 45 })).toBe("7点45分");
  });

  it("compares times by hour and minute", () => {
    expect(sameTime({ hour: 3, minute: 30 }, { hour: 3, minute: 30 })).toBe(true);
    expect(sameTime({ hour: 3, minute: 30 }, { hour: 3, minute: 0 })).toBe(false);
    expect(sameTime({ hour: 3, minute: 30 }, { hour: 4, minute: 30 })).toBe(false);
  });

  it("offers three levels with matching candidate minutes", () => {
    expect(LEVELS.map((level) => level.id)).toEqual(["hour", "half", "five"]);
    expect(minutesForLevel("hour")).toEqual([0]);
    expect(minutesForLevel("half")).toEqual([0, 30]);
    expect(minutesForLevel("five")).toHaveLength(12);
    expect(TOTAL_ROUNDS).toBe(10);
  });

  it("builds four unique options including the answer at every level", () => {
    for (const level of LEVELS) {
      for (let attempt = 0; attempt < 200; attempt += 1) {
        const question = buildQuestion(level.id);
        const keys = question.options.map(formatTime);

        expect(question.options).toHaveLength(4);
        expect(new Set(keys).size).toBe(4);
        expect(keys).toContain(formatTime(question));
        expect(question.hour).toBeGreaterThanOrEqual(1);
        expect(question.hour).toBeLessThanOrEqual(12);
        expect(minutesForLevel(level.id)).toContain(question.minute);
        for (const option of question.options) {
          expect(minutesForLevel(level.id)).toContain(option.minute);
        }
      }
    }
  });

  it("keeps questions answerable with a deterministic random source", () => {
    const random = vi.fn<() => number>().mockReturnValue(0);

    for (const level of LEVELS) {
      const question = buildQuestion(level.id, random);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(formatTime)).size).toBe(4);
      expect(question.options.map(formatTime)).toContain(formatTime(question));
    }
  });

  it("does not repeat the previous question when alternatives exist", () => {
    const previous = { hour: 5, minute: 30 };

    for (let attempt = 0; attempt < 100; attempt += 1) {
      const question = buildQuestion("half", Math.random, previous);
      expect(sameTime(question, previous)).toBe(false);
    }
  });
});
