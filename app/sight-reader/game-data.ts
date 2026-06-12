export type NotePitch = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface StaffQuestion {
  answer: NotePitch;
  options: NotePitch[];
}

export function buildQuestion(): StaffQuestion {
  const all: NotePitch[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const answer = all[Math.floor(Math.random() * all.length)];
  const pool = all.filter((n) => n !== answer);
  const chosen = new Set<string>();
  while (chosen.size < 3) {
    chosen.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  const out = Array.from(chosen) as NotePitch[];
  out.push(answer);
  return {
    answer,
    options: out.sort(() => Math.random() - 0.5),
  };
}
