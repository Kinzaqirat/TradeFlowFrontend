"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface Props {
  distribution: Record<string, number>;
}

const COLORS = {
  WIN: "#00e5b3",
  LOSS: "#ff4d6a",
  BREAKEVEN: "#3b82f6",
};

export default function TradeDistributionChart({ distribution }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const data = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-[var(--text-secondary)]">
        No trade data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-48 h-48 min-w-0 min-h-0">
        {mounted && <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS] || "#888"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </PieChart>
        </ResponsiveContainer>}
      </div>
      
      <div className="w-full space-y-3 pt-4 border-t border-[var(--border)]">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: COLORS[entry.name as keyof typeof COLORS] || "#888" }}
              />
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{entry.name}</span>
            </div>
            <span className="text-sm font-bold font-mono">
              {((entry.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
