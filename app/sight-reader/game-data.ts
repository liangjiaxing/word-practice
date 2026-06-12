export type NotePitch = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface StaffQuestion {
  answer: NotePitch;
  options: NotePitch[];
  svg: string;
}

// Ordered pitch list from bottom (E) upward.
const PITCHES: NotePitch[] = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];

// Layout constants in SVG user units
const VIEW_W = 160;
const VIEW_H = 110;
const MARGIN_X = 16;
const STAFF_X1 = MARGIN_X;
const STAFF_X2 = VIEW_W - MARGIN_X;
const STAFF_TOP_Y = 30; // bottom staff line (E)
const STAFF_LINE_GAP = 10; // half-step in y
const NOTE_X = 74; // where note sits between clef and right side

function pitchForIndex(idx: number): NotePitch {
  return PITCHES[((idx % 7) + 7) % 7];
}

function yForPitch(pitch: NotePitch): number {
  const base = pitch === 'C' || pitch === 'D' ? PITCHES.indexOf(pitch) : PITCHES.indexOf(pitch);
  // line 0 (E) -> STAFF_TOP_Y, each step +STAFF_LINE_GAP upward
  return STAFF_TOP_Y + base * STAFF_LINE_GAP;
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
  const idx = Math.floor(Math.random() * 7);
  const answer = pitchForIndex(idx);
  const y = yForPitch(answer);

  // Staff lines: E, G, B, D, F (indices 0,2,4,6,8). Within our 7-pitch range, lines are at 0,2,4,6.
  const lineIndices = [0, 2, 4, 6];
  const staffLines = lineIndices
    .map((i) => {
      const ly = STAFF_TOP_Y + i * STAFF_LINE_GAP;
      return `<line x1="${STAFF_X1}" y1="${ly}" x2="${STAFF_X2}" y2="${ly}" stroke="#0f172a" stroke-width="1.6" />`;
    })
    .join('');

  // Treble clef glyph, positioned so its spiral lines up on the G line (index 2 -> y = STAFF_TOP_Y + 2*STAFF_LINE_GAP)
  const gLineY = STAFF_TOP_Y + 2 * STAFF_LINE_GAP;
  const clef = `
    <g transform="translate(${STAFF_X1 - 2}, ${gLineY}) scale(0.22)">
      <path d="M20 88c-3-4-6-7-6-12 0-6 4-10 10-10 4 0 8 2.5 9 6.5 1 4.5-1.5 9.5-5 12.5l8 9.5c3.5 4 5.5 8.5 5.5 13.5 0 7.5-5 14-12 14-6 0-11-4-13-9.5-1.5-4-2-7.5-1.5-10.5l4.5 1c-0.3 2-0.1 5.5 1 8 2 4 6 7 10.5 7 4.5 0 8.5-3 10-7.5 1.5-3.5 1.5-7 0.5-9.5l-3.5-5.5-5.5 3.5 2 10 6-9"
        fill="#0f172a" transform="translate(22 -46) scale(1.2)" />
    </g>`;

  // Ledger line if needed (for middle C which sits below bottom staff line)
  const ledger = answer === 'C'
    ? `<line x1="${NOTE_X - 8}" y1="${y}" x2="${NOTE_X + 8}" y2="${y}" stroke="#0f172a" stroke-width="1.6" />`
    : '';

  // Notehead
  const notehead = `<ellipse cx="${NOTE_X}" cy="${y}" rx="6.5" ry="4.8" transform="rotate(-14 ${NOTE_X} ${y})" fill="#0f172a" />`;

  // Stem
  const stemDir = y <= STAFF_TOP_Y + 3 * STAFF_LINE_GAP ? 'up' : 'down';
  const stem = stemDir === 'up'
    ? `<line x1="${NOTE_X + 6}" y1="${y}" x2="${NOTE_X + 6}" y2="${y - 28}" stroke="#0f172a" stroke-width="1.8" />`
    : `<line x1="${NOTE_X - 6}" y1="${y}" x2="${NOTE_X - 6}" y2="${y + 28}" stroke="#0f172a" stroke-width="1.8" />`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="五线谱音符">` +
    `<rect width="${VIEW_W}" height="${VIEW_H}" fill="#ffffff" rx="10" ry="10" />` +
    staffLines +
    clef +
    ledger +
    notehead +
    stem +
    `</svg>`;

  return {
    answer,
    options: buildOptions(answer),
    svg,
  };
}
