const VIEW = 300;
const CENTER = VIEW / 2;
const RIM = 144;
const MINUTE_TICK_OUTER = 142;
const MINUTE_TICK_MAJOR_INNER = 127;
const MINUTE_TICK_MINOR_INNER = 135;
const MINUTE_NUMBER_RADIUS = 116;
const HOUR_NUMBER_RADIUS = 92;
const HOUR_HAND_LENGTH = 72;
const MINUTE_HAND_LENGTH = 118;
const HAND_TAIL = 16;

const DEG = Math.PI / 180;

function pointAt(radius: number, angleDeg: number) {
  const rad = angleDeg * DEG;
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  };
}

const HOUR_MARKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_TICKS = Array.from({ length: 60 }, (_, i) => i);

export interface ClockFaceProps {
  /** 1 - 12 */
  hour: number;
  /** 0 - 59 */
  minute: number;
  /** 教学辅助：在外圈标出 5 / 10 / ... / 60，方便数分针 */
  showMinuteNumbers?: boolean;
}

export default function ClockFace({
  hour,
  minute,
  showMinuteNumbers = false,
}: ClockFaceProps) {
  const minuteAngle = minute * 6;
  // 时针每分钟走 0.5°，所以半点时正好在两个小时数字中间。
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-label="钟面"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <circle cx={CENTER} cy={CENTER} r={RIM} fill="#ffffff" />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RIM}
        fill="none"
        stroke="#13203a"
        strokeWidth={5}
      />

      {MINUTE_TICKS.map((tick) => {
        const angle = tick * 6;
        const major = tick % 5 === 0;
        const inner = major ? MINUTE_TICK_MAJOR_INNER : MINUTE_TICK_MINOR_INNER;
        const from = pointAt(inner, angle);
        const to = pointAt(MINUTE_TICK_OUTER, angle);
        return (
          <line
            key={tick}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={major ? "#13203a" : "#c3cddd"}
            strokeWidth={major ? 3 : 1.4}
            strokeLinecap="round"
          />
        );
      })}

      {showMinuteNumbers &&
        MINUTE_TICKS.filter((tick) => tick % 5 === 0).map((tick) => {
          const label = tick === 0 ? 60 : tick;
          const pos = pointAt(MINUTE_NUMBER_RADIUS, tick * 6);
          return (
            <text
              key={`m-${tick}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={600}
              fill="#7c8aa5"
            >
              {label}
            </text>
          );
        })}

      {HOUR_MARKS.map((mark) => {
        const pos = pointAt(HOUR_NUMBER_RADIUS, mark * 30);
        return (
          <text
            key={`h-${mark}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={30}
            fontWeight={800}
            fill="#13203a"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            {mark}
          </text>
        );
      })}

      <g transform={`rotate(${hourAngle} ${CENTER} ${CENTER})`}>
        <line
          x1={CENTER}
          y1={CENTER + HAND_TAIL}
          x2={CENTER}
          y2={CENTER - HOUR_HAND_LENGTH}
          stroke="#e2453a"
          strokeWidth={13}
          strokeLinecap="round"
        />
      </g>
      <g transform={`rotate(${minuteAngle} ${CENTER} ${CENTER})`}>
        <line
          x1={CENTER}
          y1={CENTER + HAND_TAIL}
          x2={CENTER}
          y2={CENTER - MINUTE_HAND_LENGTH}
          stroke="#0067cf"
          strokeWidth={8}
          strokeLinecap="round"
        />
      </g>

      <circle cx={CENTER} cy={CENTER} r={9} fill="#13203a" />
      <circle cx={CENTER} cy={CENTER} r={3.6} fill="#ffffff" />
    </svg>
  );
}
