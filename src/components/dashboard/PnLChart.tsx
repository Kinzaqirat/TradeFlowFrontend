"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";
import { useEffect, useState } from "react";

interface PnLDataPoint {
  date: string;
  pnl: number;
  trades: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
        <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
        <div style={{ color: val >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontFamily: "monospace", fontWeight: 700 }}>
          {formatCurrency(val)}
        </div>
      </div>
    );
  }
  return null;
};

export default function PnLChart({ data = [] }: { data: PnLDataPoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  let cumulative = 0;
  const chartData = data.map((d) => {
    cumulative += Number(d.pnl || 0);
    return {
      date: d.date.slice(5), // MM-DD
      cumulative: parseFloat(cumulative.toFixed(2)),
      trades: d.trades,
    };
  });

  const isPositive = cumulative >= 0;
  const color = isPositive ? "var(--accent-green)" : "var(--accent-red)";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Equity Curve</div>
        <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
          {data.length > 0
            ? `${data[0].date.slice(0, 7)} – ${data[data.length - 1].date.slice(0, 7)}`
            : "No data"}
        </div>
      </div>
      <div className="h-[280px] min-h-0 min-w-0" style={{ minWidth: 0 }}>
        {mounted && <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 2 }} />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--accent-blue)"
              strokeWidth={3}
              fill="url(#pnlGrad)"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: "var(--accent-blue)" }}
            />
          </AreaChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}
