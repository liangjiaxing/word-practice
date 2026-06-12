export type NotePitch = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export interface StaffQuestion {
  answer: string;
  options: string[];
  svg: string;
}

function pitchForLine(line: number): string {
  const list: string[] = ["E", "F", "G", "A", "B", "C", "D"];
  return list[((line % 7) + 7) % 7];
}

function yForLine(line: number): number {
  return 24 - line * 2;
}

function buildOptions(answer: string): string[] {
  const all: string[] = ["C", "D", "E", "F", "G", "A", "B"];
  const pool = all.filter((n) => n !== answer);
  const chosen = new Set<string>();
  while (chosen.size < 3) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.add(pool[idx]);
  }
  const out: string[] = Array.from(chosen);
  out.push(answer);
  return out.sort(() => Math.random() - 0.5);
}

export function buildQuestion(): StaffQuestion {
  const line = Math.floor(Math.random() * 7);
  const answer = pitchForLine(line);
  const y = yForLine(line);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120" role="img" aria-label="五线谱音符">` +
    `<rect width="140" height="120" fill="#ffffff" rx="12" ry="12" />` +
    `<g stroke="#0f172a" stroke-width="1.6" stroke-linecap="round">` +
    `<g transform="translate(6 6) scale(0.28)">` +
    `<path d="M20 88c-3-4-6-7-6-12 0-6 4-10 10-10 4 0 8 2.5 9 6.5 1 4.5-1.5 9.5-5 12.5l8 9.5c3.5 4 5.5 8.5 5.5 13.5 0 7.5-5 14-12 14-6 0-11-4-13-9.5-1.5-4-2-7.5-1.5-10.5l4.5 1c-0.3 2-0.1 5.5 1 8 2 4 6 7 10.5 7 4.5 0 8.5-3 10-7.5 1.5-3.5 1.5-7 0.5-9.5l-3.5-5.5-5.5 3.5 2 10 6-9" fill="#0f172a" transform="translate(22 -46) scale(1.2)" />` +
    `<g stroke-width="1.4">` +
    Array.from({ length: 5 }, (_, i) => {
      const py = 18 + i * 12;
      return `<line x1="18" y1="${py}" x2="122" y2="${py}" />`;
    }).join("") +
    `</g>` +
    `</g>` +
    `</g>` +
    `<g transform="translate(0 0)">` +
    `<ellipse cx="62" cy="${y}" rx="6" ry="4.5" transform="rotate(-15 62 ${y})" fill="#0f172a" />` +
    `</g>` +
    `</svg>`;

  return {
    answer,
    options: buildOptions(answer),
    svg,
  };
}
