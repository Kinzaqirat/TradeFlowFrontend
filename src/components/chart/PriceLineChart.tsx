import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";

interface PriceDataPoint {
  date: string;
  close: number;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{
    value: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", fontSize: 11, backdropFilter: "blur(8px)" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 600 }}>{label}</div>
        <div style={{ color: "#fff", fontFamily: "monospace", fontWeight: 800, fontSize: 14 }}>
          {formatCurrency(val)}
        </div>
      </div>
    );
  }
  return null;
};

export default function PriceLineChart({ data = [], symbol = "" }: { data: PriceDataPoint[], symbol?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (data.length === 0) return null;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Live</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{symbol} Price Action</div>
        </div>
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          Daily Close History
        </div>
      </div>
      <div className="w-full h-[420px] min-w-0" style={{ minWidth: 0, minHeight: 0 }}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={Math.floor(data.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
