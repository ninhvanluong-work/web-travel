interface ProgressCircleProps {
  progress: number;
}

export function ProgressCircle({ progress }: ProgressCircleProps) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width="52" height="52" className="rotate-[-90deg]">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
    </svg>
  );
}
