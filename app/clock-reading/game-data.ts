export type ClockLevel = "hour" | "half" | "five";

export interface TimeValue {
  /** 1 - 12 */
  hour: number;
  /** 0 - 59 */
  minute: number;
}

export interface TimeQuestion extends TimeValue {
  options: TimeValue[];
}

export interface LevelInfo {
  id: ClockLevel;
  label: string;
  hint: string;
  preview: TimeValue;
}

export const LEVELS: LevelInfo[] = [
  {
    id: "hour",
    label: "整点",
    hint: "分针指着 12，时针指着几就是几点",
    preview: { hour: 3, minute: 0 },
  },
  {
    id: "half",
    label: "半点",
    hint: "分针指着 6，就是几点半",
    preview: { hour: 3, minute: 30 },
  },
  {
    id: "five",
    label: "5 分钟",
    hint: "分针走一大格是 5 分钟，时针在两数之间",
    preview: { hour: 3, minute: 15 },
  },
];

export const TOTAL_ROUNDS = 10;

const MINUTES_BY_LEVEL: Record<ClockLevel, number[]> = {
  hour: [0],
  half: [0, 30],
  five: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
};

const HOURS: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

export function minutesForLevel(level: ClockLevel): number[] {
  return [...MINUTES_BY_LEVEL[level]];
}

export function formatTime(time: TimeValue): string {
  return `${time.hour}:${String(time.minute).padStart(2, "0")}`;
}

export function timeLabel(time: TimeValue): string {
  if (time.minute === 0) return `${time.hour}点整`;
  if (time.minute === 30) return `${time.hour}点半`;
  return `${time.hour}点${time.minute}分`;
}

export function sameTime(a: TimeValue, b: TimeValue): boolean {
  return a.hour === b.hour && a.minute === b.minute;
}

function timeKey(time: TimeValue): string {
  return `${time.hour}-${time.minute}`;
}

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 生成一道认时钟题目。
 *
 * 干扰项刻意分成两类，逼小朋友同时看时针和分针：
 * - 同一个钟点、不同分钟（考察分针）
 * - 同一个分钟、不同钟点（考察时针）
 */
export function buildQuestion(
  level: ClockLevel,
  random: () => number = Math.random,
  previous: TimeValue | null = null,
): TimeQuestion {
  const minutes = MINUTES_BY_LEVEL[level];

  let answer: TimeValue = { hour: pick(HOURS, random), minute: pick(minutes, random) };
  let guard = 0;
  while (previous && sameTime(answer, previous) && guard < 50) {
    answer = { hour: pick(HOURS, random), minute: pick(minutes, random) };
    guard += 1;
  }

  const sameHourPool = shuffle(
    minutes
      .filter((minute) => minute !== answer.minute)
      .map((minute) => ({ hour: answer.hour, minute })),
    random,
  );
  const sameMinutePool = shuffle(
    HOURS.filter((hour) => hour !== answer.hour).map((hour) => ({
      hour,
      minute: answer.minute,
    })),
    random,
  );

  // 先取 2 个同钟点的干扰项（"几点"对、"几分"错），再补同分钟不同钟点的。
  const chosen: TimeValue[] = [];
  const used = new Set<string>([timeKey(answer)]);
  const wantSameHour = Math.min(sameHourPool.length, 2);

  for (const candidate of sameHourPool.slice(0, wantSameHour)) {
    chosen.push(candidate);
    used.add(timeKey(candidate));
  }
  for (const pool of [sameMinutePool, sameHourPool]) {
    for (const candidate of pool) {
      if (chosen.length >= 3) break;
      if (used.has(timeKey(candidate))) continue;
      chosen.push(candidate);
      used.add(timeKey(candidate));
    }
  }

  return {
    ...answer,
    options: shuffle([answer, ...chosen], random),
  };
}
