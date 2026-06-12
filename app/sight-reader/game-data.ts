export type NotePitch = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface StaffQuestion {
  answer: NotePitch;
  options: NotePitch[];
  svg: string;
}

const STAFF_TOP = 36;
const STAFF_STEP = 7; // half-step of one staff position (unit spacing)
const STAFF_BOTTOM = STAFF_TOP + STAFF_STEP * 8; // line 5

function pitchForLine(line: number): NotePitch {
  const list: NotePitch[] = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];
  return list[((line % 7) + 7) % 7];
}

function yForPitch(pitch: NotePitch, basePitch: NotePitch = 'E'): number {
  const notes: NotePitch[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return notes.indexOf(pitch) * STAFF_STEP;
}

function buildOptions(answer: NotePitch): NotePitch[] {
  const all: NotePitch[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const pool = all.filter((n) => n !== answer);
  const chosen = new Set<string>();
  while (chosen.size < 3) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.add(pool[idx]);
  }
  const out = Array.from(chosen) as NotePitch[];
  out.push(answer);
  return out.sort(() => Math.random() - 0.5);
}

export function buildQuestion(): StaffQuestion {
  const line = Math.floor(Math.random() * 7);
  const answer = pitchForLine(line);
  const y = STAFF_TOP + line * STAFF_STEP;

  const clefVariation = Math.random() < 0.5;
  const clefRotation = clefVariation ? 0 : 0;

  const clefTransform = `
    <path d="M22 88c-3-4-6-7-6-12 0-6 4-10 10-10 4 0 8 2.5 9 6.5 1 4.5-1.5 9.5-5 12.5l8 9.5c3.5 4 5.5 8.5 5.5 13.5 0 7.5-5 14-12 14-6 0-11-4-13-9.5-1.5-4-2-7.5-1.5-10.5l4.5 1c-0.3 2-0.1 5.5 1 8 2 4 6 7 10.5 7 4.5 0 8.5-3 10-7.5 1.5-3.5 1.5-7 0.5-9.5l-3.5-5.5-5.5 3.5 2 10 6-9" fill="#0f172a" transform="translate(-4 8) scale(0.18)" />`;

  const lines = Array.from({ length: 5 }, (_, i) => {
    const ly = STAFF_TOP + i * STAFF_STEP * 2;
    return `<line x1="28" y1="${ly}" x2="112" y2="${ly}" stroke="#0f172a" stroke-width="1.6" />`;
  }).join('');

  const stem =
    y > STAFF_TOP + STAFF_STEP * 4
      ? `<line x1="68" y1="${y}" x2="68" y2="-14" stroke="#0f172a" stroke-width="1.8" />`
      : `<line x1="68" y1="${y}" x2="68" y2="${16 + STAFF_STEP * 4}" stroke="#0f172a" stroke-width="1.8" />`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 80" role="img" aria-label="五线谱音符">` +
    `<rect width="140" height="80" fill="#ffffff" rx="10" ry="10" />` +
    lines +
    clefTransform +
    `<ellipse cx="60" cy="${y}" rx="7" ry="5" transform="rotate(-12 60 ${y})" fill="#0f172a" />` +
    stem +
    `</svg>`;

  return {
    answer,
    options: buildOptions(answer),
    svg,
  };
}
