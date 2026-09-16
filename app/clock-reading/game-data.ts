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

export function wrapHour(hour: number, delta: number): number {
  return ((hour - 1 + delta + 120) % 12) + 1;
}

export function wrapMinute(minute: number, delta: number): number {
  return (minute + delta + 60) % 60;
}

export function hourDistance(a: number, b: number): number {
  const raw = Math.abs(a - b) % 12;
  return Math.min(raw, 12 - raw);
}

export function minuteDistance(a: number, b: number): number {
  const raw = Math.abs(a - b) % 60;
  return Math.min(raw, 60 - raw);
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
 * 按难度排出干扰项的优先级（越靠前越难排除）。
 *
 * 原则：干扰项必须是"隔壁"的时刻，不能一眼排除。
 * - five：分针差 5 分钟（3:15 vs 3:10 / 3:20，逼孩子数格子）
 *         + 时针差 1 小时但分钟相同（3:15 vs 4:15，逼孩子看清时针走没走过格）
 * - half：半点时时针正好在两数之间，所以左右相邻的小时最难分辨
 * - hour：只有整点，用相邻 1~2 个小时来考，时针指哪个数必须看准
 */
function distractorTiers(
  level: ClockLevel,
  answer: TimeValue,
): TimeValue[] {
  const { hour, minute } = answer;
  const sameHour = (delta: number): TimeValue => ({
    hour,
    minute: wrapMinute(minute, delta),
  });
  const sameMinute = (delta: number): TimeValue => ({
    hour: wrapHour(hour, delta),
    minute,
  });
  const otherMinute =
    level === "half"
      ? MINUTES_BY_LEVEL.half.filter((value) => value !== minute).map((value) => ({
          hour,
          minute: value,
        }))
      : [];

  if (level === "hour") {
    return [
      sameMinute(1),
      sameMinute(-1),
      sameMinute(2),
      sameMinute(-2),
      sameMinute(3),
    ];
  }

  if (level === "half") {
    return [
      sameMinute(1),
      sameMinute(-1),
      ...otherMinute,
      sameMinute(2),
      sameMinute(-2),
    ];
  }

  return [
    sameHour(5),
    sameHour(-5),
    sameMinute(1),
    sameMinute(-1),
    sameHour(10),
    sameHour(-10),
    sameMinute(2),
    sameMinute(-2),
    sameHour(15),
  ];
}

/**
 * 生成一道认时钟题目。
 *
 * 干扰项全部取自答案的"邻居"，并按难度分层取前 3 个，所以不会出现
 * "3:15 的选项里有 10:50" 这种一眼就能排除的情况。
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

  // distractorTiers 已经按"越难排除越靠前"排好，取前 3 个不同的即可；
  // 选项顺序最后统一打乱，所以同层的先后不影响出题。
  const chosen: TimeValue[] = [];
  const used = new Set<string>([timeKey(answer)]);
  for (const candidate of distractorTiers(level, answer)) {
    if (chosen.length >= 3) break;
    if (used.has(timeKey(candidate))) continue;
    chosen.push(candidate);
    used.add(timeKey(candidate));
  }

  return {
    ...answer,
    options: shuffle([answer, ...chosen], random),
  };
}
