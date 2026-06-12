export type NotePitch = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface StaffQuestion {
  answer: NotePitch;
  options: NotePitch[];
  svg: string;
}

const ALL_NOTES: NotePitch[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SVG_W = 180;
const SVG_H = 100;
const PAD = 18;
const LEFT = PAD;
const RIGHT = SVG_W - PAD;
const STAFF_Y_TOP = 30;
const STAFF_GAP = 8;
const Y_FOR = (idx: number) => STAFF_Y_TOP + idx * STAFF_GAP;
const NOTE_X = 70;
const TEXTS: Record<NotePitch, string> = {
  C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'B',
};

function pitchForIndex(idx: number): NotePitch {
  const map: NotePitch[] = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];
  return map[idx];
}

function yForNote(pitch: NotePitch) {
  const idx = ALL_NOTES.indexOf(pitch);
  return Y_FOR(idx);
}

function staffLines(): string {
  const lines = [0, 2, 4, 6];
  return lines
    .map((i) => {
      const y = Y_FOR(i);
      return `<line x1="${LEFT}" y1="${y}" x2="${RIGHT}" y2="${y}" stroke="#0f172a" stroke-width="2" />`;
    })
    .join('');
}

function drawClef(pitch: NotePitch): string {
  // Very simplified clef: a small labeled icon plus a bolded g/f line.
  // We're not trying to match typographic perfection, just readability.
  const label = pitch === 'C' || pitch === 'D' ? 'F' : 'G';
  const refLineIdx = pitch === 'C' || pitch === 'D' ? 0 : 2;
  const refY = Y_FOR(refLineIdx);
  return (
    `<g>` +
    `<text x="${LEFT - 4}" y="${refY + 4}" font-size="14" fill="#0f172a" font-family="serif">${label}</text>` +
    `<line x1="${LEFT}" y1="${refY}" x2="${RIGHT}" y2="${refY}" stroke="#0f172a" stroke-width="2.4" />` +
    `</g>`
  );
}

function ledgerIfC(pitch: NotePitch, y: number): string {
  if (pitch !== 'C') return '';
  return (
    `<line x1="${NOTE_X - 10}" y1="${y}" x2="${NOTE_X + 10}" y2="${y}" stroke="#0f172a" stroke-width="2" />`
  );
}

function buildOptions(answer: NotePitch): NotePitch[] {
  const pool = ALL_NOTES.filter((n) => n !== answer);
  const chosen = new Set<string>();
  while (chosen.size < 3) {
    chosen.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  const out = Array.from(chosen) as NotePitch[];
  out.push(answer);
  return out.sort(() => Math.random() - 0.5);
}

export function buildQuestion(): StaffQuestion {
  const idx = Math.floor(Math.random() * 7);
  const answer = pitchForIndex(idx);
  const y = yForNote(answer);

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="五线谱音符">`,
    `<rect width="${SVG_W}" height="${SVG_H}" fill="#ffffff" rx="10" ry="10" />`,
    staffLines(),
    drawClef(answer),
    ledgerIfC(answer, y),
    `<ellipse cx="${NOTE_X}" cy="${y}" rx="7" ry="5" transform="rotate(-14 ${NOTE_X} ${y})" fill="#0f172a" />`,
    `<text x="${NOTE_X + 12}" y="${y + 5}" font-size="18" fill="#0f172a" font-family="sans-serif">${TEXTS[answer]}</text>`,
    `</svg>`,
  ].join('');

  return { answer, options: buildOptions(answer), svg };
}
