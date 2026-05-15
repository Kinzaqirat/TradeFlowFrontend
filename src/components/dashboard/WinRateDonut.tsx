"use client";

interface WinRateDonutProps {
  value: number; // 0-100
}

export default function WinRateDonut({ value }: WinRateDonutProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        {/* Track */}
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="8"
        />
        {/* Fill */}
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke="var(--accent-green)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{value.toFixed(0)}%</span>
      </div>
    </div>
  );
}
