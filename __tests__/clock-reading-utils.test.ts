import { describe, expect, it, vi } from "vitest";
import {
  LEVELS,
  TOTAL_ROUNDS,
  buildQuestion,
  formatTime,
  hourDistance,
  minuteDistance,
  minutesForLevel,
  sameTime,
  timeLabel,
  wrapHour,
  wrapMinute,
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

  it("wraps hours and minutes around the clock face", () => {
    expect(wrapHour(12, 1)).toBe(1);
    expect(wrapHour(1, -1)).toBe(12);
    expect(wrapHour(11, 2)).toBe(1);
    expect(wrapMinute(0, -5)).toBe(55);
    expect(wrapMinute(55, 5)).toBe(0);
  });

  it("measures circular distance", () => {
    expect(hourDistance(12, 1)).toBe(1);
    expect(hourDistance(1, 12)).toBe(1);
    expect(hourDistance(3, 9)).toBe(6);
    expect(minuteDistance(0, 55)).toBe(5);
    expect(minuteDistance(15, 20)).toBe(5);
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

  it("only offers options that are hard to rule out", () => {
    const check = (levelId: (typeof LEVELS)[number]["id"]) => {
      for (let attempt = 0; attempt < 300; attempt += 1) {
        const question = buildQuestion(levelId);
        const answer = { hour: question.hour, minute: question.minute };

        for (const option of question.options) {
          if (sameTime(option, answer)) continue;
          const hoursApart = hourDistance(option.hour, answer.hour);
          const minutesApart = minuteDistance(option.minute, answer.minute);

          if (levelId === "hour") {
            // 只有整点：只能靠时针的位置区分，必须相邻。
            expect(option.minute).toBe(0);
            expect(hoursApart).toBeLessThanOrEqual(2);
          } else if (levelId === "half") {
            // 半点：时针在两数之间，左右相邻的小时最难分辨。
            expect(minutesForLevel("half")).toContain(option.minute);
            if (option.minute === answer.minute) {
              expect(hoursApart).toBeLessThanOrEqual(2);
            } else {
              expect(option.hour).toBe(answer.hour);
            }
          } else {
            // 5 分钟：要么分针只差 5~10 分钟，要么时针差 1 小时且分钟相同。
            if (option.hour === answer.hour) {
              expect([5, 10]).toContain(minutesApart);
            } else {
              expect(hoursApart).toBeLessThanOrEqual(1);
              expect(option.minute).toBe(answer.minute);
            }
          }
        }
      }
    };

    for (const level of LEVELS) check(level.id);
  });

  it("keeps the hardest neighbours in play instead of far-away decoys", () => {
    // 5 分钟难度：两个干扰项应该是同一个钟点、分针相差 5 分钟，
    // 剩下一个应该是相邻的钟点、分针相同。
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const question = buildQuestion("five");
      const answer = { hour: question.hour, minute: question.minute };
      const others = question.options.filter(
        (option) => !sameTime(option, answer),
      );

      const sameHour = others.filter((option) => option.hour === answer.hour);
      const sameMinute = others.filter(
        (option) => option.minute === answer.minute,
      );

      expect(sameHour).toHaveLength(2);
      expect(sameMinute).toHaveLength(1);
      expect(
        sameHour.map((option) => minuteDistance(option.minute, answer.minute)),
      ).toEqual([5, 5]);
      expect(
        hourDistance(sameMinute[0].hour, answer.hour),
      ).toBe(1);
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
