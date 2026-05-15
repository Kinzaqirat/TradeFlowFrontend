"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Hash,
  Loader2,
  Search,
  Target,
  X,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  BarChart2,
  Clock,
  StickyNote,
  Tag,
  Smile,
  ChevronRight,
} from "lucide-react";
import { createTrade } from "@/services/tradeService";
import { Direction, TradeCreate } from "@/types/trade";
import { calculatePnL, classifyResult } from "@/utils/pnlCalculator";
import { formatCurrency } from "@/utils/formatters";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface QuickTradeForm {
  symbol: string;
  asset_type: string;
  direction: Direction;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  exit_price: string;
  quantity: string;
  fees: string;
  notes: string;
  entry_datetime: string;
  exit_datetime: string;
}

type QuickTradePayload = TradeCreate & {
  stop_loss?: number;
  take_profit?: number;
};

const strategyOptions = ["Scalp", "Breakout", "EMA Swing", "Crypto", "Breakout Retest"];
const emotionOptions = [
  { key: "Fear", emoji: "😟", accent: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
  { key: "Neutral", emoji: "😐", accent: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.25)" },
  { key: "FOMO", emoji: "😬", accent: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
];
const assetTypes = ["Crypto", "Stock", "Forex", "Index"];

function createInitialForm(): QuickTradeForm {
  const now = new Date();
  const exit = new Date(now.getTime() + 3600000);
  return {
    symbol: "BTC/USD",
    asset_type: "Crypto",
    direction: "LONG",
    entry_price: "",
    stop_loss: "",
    take_profit: "",
    exit_price: "",
    quantity: "1",
    fees: "0",
    notes: "",
    entry_datetime: now.toISOString().slice(0, 16),
    exit_datetime: exit.toISOString().slice(0, 16),
  };
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response: unknown }).response === "object" &&
    (error as { response: Record<string, unknown> }).response !== null &&
    "data" in (error as { response: Record<string, unknown> }).response
  ) {
    const data = (error as { response: { data: Record<string, unknown> } }).response.data;
    if (typeof data.detail === "string") return data.detail;
  }
  return "Failed to save trade.";
}

/* ─── Reusable field components ─── */

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.38)",
      }}
    >
      {children}
      {required && <span style={{ color: "#00e5b3", marginLeft: 3 }}>*</span>}
    </label>
  );
}

const fieldStyle: React.CSSProperties = {
  height: 42,
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  outline: "none",
  transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
  boxSizing: "border-box" as const,
  padding: "0 12px",
};

function NumField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  required,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.22)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            {icon}
          </span>
        )}
        <input
          type="number"
          step="0.0001"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          style={{
            ...fieldStyle,
            paddingLeft: icon ? 34 : 12,
            opacity: readOnly ? 0.5 : 1,
            cursor: readOnly ? "default" : "text",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,229,179,0.5)";
            e.currentTarget.style.background = "rgba(0,229,179,0.04)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,179,0.07)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}

export default function QuickAddModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<QuickTradeForm>(createInitialForm);
  const [strategies, setStrategies] = useState<string[]>(["Breakout"]);
  const [emotion, setEmotion] = useState("Neutral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"setup" | "risk" | "meta">("setup");

  const set = (key: keyof QuickTradeForm, value: string) =>
    setForm((c) => ({ ...c, [key]: value }));

  const toggleStrategy = (value: string) =>
    setStrategies((c) =>
      c.includes(value) ? c.filter((i) => i !== value) : [...c, value]
    );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const preview = useMemo(() => {
    const exitPrice = form.exit_price || form.take_profit;
    if (!form.entry_price || !exitPrice || !form.quantity) {
      return { pnl: 0, pnlPercent: 0, result: "BREAKEVEN", touched: false };
    }
    const pnl = calculatePnL(
      form.direction,
      Number(form.entry_price),
      Number(exitPrice),
      Number(form.quantity),
      Number(form.fees)
    );
    const invested = Number(form.entry_price) * Number(form.quantity);
    return {
      pnl,
      pnlPercent: invested ? (pnl / invested) * 100 : 0,
      result: classifyResult(pnl),
      touched: true,
    };
  }, [form]);

  const riskAmount = useMemo(() => {
    if (!form.entry_price || !form.stop_loss || !form.quantity) return 0;
    return Math.abs(Number(form.entry_price) - Number(form.stop_loss)) * Number(form.quantity);
  }, [form.entry_price, form.stop_loss, form.quantity]);

  const rrValue = useMemo(() => {
    if (!form.entry_price || !form.stop_loss || !form.take_profit) return null;
    const entry = Number(form.entry_price);
    const stop = Number(form.stop_loss);
    const target = Number(form.take_profit);
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const value = risk ? reward / risk : null;
    return value && Number.isFinite(value) ? value : null;
  }, [form.entry_price, form.stop_loss, form.take_profit]);

  const pnlColor = preview.pnl > 0 ? "#34d399" : preview.pnl < 0 ? "#f87171" : "rgba(255,255,255,0.25)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: QuickTradePayload = {
        symbol: form.symbol.trim().toUpperCase(),
        direction: form.direction,
        entry_price: Number(form.entry_price),
        exit_price: Number(form.exit_price || form.take_profit || form.entry_price),
        stop_loss: form.stop_loss ? Number(form.stop_loss) : undefined,
        take_profit: form.take_profit ? Number(form.take_profit) : undefined,
        quantity: Number(form.quantity),
        fees: Number(form.fees),
        notes: form.notes || undefined,
        tags: [form.asset_type, ...strategies, emotion],
        entry_datetime: new Date(form.entry_datetime).toISOString(),
        exit_datetime: new Date(form.exit_datetime).toISOString(),
      };
      await createTrade(payload);
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "setup" as const, label: "Setup", icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "risk" as const, label: "Risk", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "meta" as const, label: "Meta", icon: <Tag className="w-3.5 h-3.5" /> },
  ];

  /* ─── shared section divider ─── */
  const SectionDivider = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ color: "#00e5b3", opacity: 0.7, display: "flex" }}>{icon}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      {/* Modal shell */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          borderRadius: 20,
          background: "#080f1c",
          border: "1px solid rgba(0,229,179,0.14)",
          boxShadow: "0 0 0 1px rgba(0,229,179,0.06), 0 32px 80px rgba(0,0,0,0.85)",
          overflow: "hidden",
          color: "#fff",
        }}
      >
        {/* Top ambient line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(0,229,179,0.55) 50%, transparent)",
            pointerEvents: "none",
          }}
        />

        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(0,229,179,0.1)",
                border: "1px solid rgba(0,229,179,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#00e5b3",
              }}
            >
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", margin: 0 }}>New Trade</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", margin: 0 }}>Log a position to your journal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── SYMBOL / ASSET / DIRECTION ROW ── */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          {/* Symbol */}
          <div>
            <FieldLabel required>Symbol</FieldLabel>
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 15,
                  height: 15,
                  color: "rgba(255,255,255,0.25)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={form.symbol}
                onChange={(e) => set("symbol", e.target.value.toUpperCase())}
                placeholder="BTC/USD"
                required
                style={{
                  ...fieldStyle,
                  paddingLeft: 34,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,229,179,0.5)";
                  e.currentTarget.style.background = "rgba(0,229,179,0.04)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,179,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Asset type */}
          <div>
            <FieldLabel>Asset</FieldLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {assetTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("asset_type", type)}
                  style={{
                    height: 42,
                    padding: "0 12px",
                    borderRadius: 10,
                    border: form.asset_type === type
                      ? "1px solid rgba(0,229,179,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: form.asset_type === type
                      ? "rgba(0,229,179,0.1)"
                      : "rgba(255,255,255,0.02)",
                    color: form.asset_type === type ? "#00e5b3" : "rgba(255,255,255,0.38)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Direction toggle */}
          <div>
            <FieldLabel>Direction</FieldLabel>
            <div
              style={{
                display: "flex",
                height: 42,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.09)",
                overflow: "hidden",
              }}
            >
              {(["LONG", "SHORT"] as Direction[]).map((dir, i) => {
                const isActive = form.direction === dir;
                const isLong = dir === "LONG";
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => set("direction", dir)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0 18px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      borderRight: i === 0 ? "1px solid rgba(255,255,255,0.09)" : "none",
                      background: isActive
                        ? isLong ? "#059669" : "#dc2626"
                        : "rgba(255,255,255,0.02)",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                      transition: "all 0.15s",
                      border: "none",
                    }}
                  >
                    {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {dir === "LONG" ? "Long" : "Short"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ padding: "14px 24px 0", display: "flex", gap: 4 }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: isActive ? "1px solid rgba(0,229,179,0.2)" : "1px solid transparent",
                  background: isActive ? "rgba(0,229,179,0.08)" : "transparent",
                  color: isActive ? "#00e5b3" : "rgba(255,255,255,0.3)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── FORM BODY ── */}
        <form
          id="quick-trade-form"
          onSubmit={handleSubmit}
          style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}
        >
          {/* ── SETUP TAB ── */}
          {activeTab === "setup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <SectionDivider icon={<DollarSign className="w-3.5 h-3.5" />} label="Price Levels" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <NumField
                    label="Entry Price"
                    value={form.entry_price}
                    onChange={(v) => set("entry_price", v)}
                    placeholder="34,500.00"
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                    required
                  />
                  <NumField
                    label="Exit Price"
                    value={form.exit_price}
                    onChange={(v) => set("exit_price", v)}
                    placeholder="36,000.00"
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                  />
                  <NumField
                    label="Lot Size"
                    value={form.quantity}
                    onChange={(v) => set("quantity", v)}
                    placeholder="1.0"
                    icon={<Hash className="w-3.5 h-3.5" />}
                    required
                  />
                </div>
              </div>

              <div>
                <SectionDivider icon={<Clock className="w-3.5 h-3.5" />} label="Timing" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Entry Time", key: "entry_datetime" as const },
                    { label: "Exit Time", key: "exit_datetime" as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <FieldLabel>{label}</FieldLabel>
                      <input
                        type="datetime-local"
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        style={fieldStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(0,229,179,0.5)";
                          e.currentTarget.style.background = "rgba(0,229,179,0.04)";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,179,0.07)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionDivider icon={<StickyNote className="w-3.5 h-3.5" />} label="Notes" />
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Describe your setup rationale, confluences, market structure..."
                  style={{
                    ...fieldStyle,
                    height: 96,
                    padding: "10px 12px",
                    resize: "none",
                    lineHeight: 1.6,
                    fontFamily: "inherit",
                    fontSize: 13,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,229,179,0.5)";
                    e.currentTarget.style.background = "rgba(0,229,179,0.04)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,179,0.07)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* ── RISK TAB ── */}
          {activeTab === "risk" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <SectionDivider icon={<Target className="w-3.5 h-3.5" />} label="Risk Parameters" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <NumField
                    label="Stop Loss"
                    value={form.stop_loss}
                    onChange={(v) => set("stop_loss", v)}
                    placeholder="33,800.00"
                    icon={<Target className="w-3.5 h-3.5" />}
                  />
                  <NumField
                    label="Take Profit"
                    value={form.take_profit}
                    onChange={(v) => set("take_profit", v)}
                    placeholder="36,500.00"
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                  />
                  <NumField
                    label="Fees"
                    value={form.fees}
                    onChange={(v) => set("fees", v)}
                    placeholder="0.00"
                    icon={<DollarSign className="w-3.5 h-3.5" />}
                  />
                </div>
              </div>

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {/* Risk Amount */}
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.025)",
                    padding: "14px 16px",
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    Risk Amount
                  </p>
                  <p style={{ margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#f87171" }}>
                    {riskAmount ? formatCurrency(riskAmount) : "—"}
                  </p>
                  {form.entry_price && riskAmount ? (
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.28)" }}>
                      {((riskAmount / (Number(form.entry_price) * Number(form.quantity || 1))) * 100).toFixed(2)}% of position
                    </p>
                  ) : null}
                </div>

                {/* R:R Ratio */}
                <div
                  style={{
                    borderRadius: 12,
                    border: rrValue && rrValue >= 2 ? "1px solid rgba(52,211,153,0.22)" : "1px solid rgba(255,255,255,0.07)",
                    background: rrValue && rrValue >= 2 ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.025)",
                    padding: "14px 16px",
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    R:R Ratio
                  </p>
                  <p style={{ margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: rrValue && rrValue >= 2 ? "#34d399" : rrValue ? "#fbbf24" : "rgba(255,255,255,0.2)" }}>
                    {rrValue ? `1 : ${rrValue.toFixed(2)}` : "—"}
                  </p>
                  {rrValue && (
                    <p style={{ margin: 0, fontSize: 11, color: rrValue >= 2 ? "rgba(52,211,153,0.55)" : "rgba(251,191,36,0.55)" }}>
                      {rrValue >= 2 ? "✓ Good ratio" : "Below 1:2 target"}
                    </p>
                  )}
                </div>

                {/* Est P&L */}
                <div
                  style={{
                    borderRadius: 12,
                    border: preview.pnl > 0
                      ? "1px solid rgba(52,211,153,0.22)"
                      : preview.pnl < 0
                      ? "1px solid rgba(248,113,113,0.22)"
                      : "1px solid rgba(255,255,255,0.07)",
                    background: preview.pnl > 0
                      ? "rgba(52,211,153,0.05)"
                      : preview.pnl < 0
                      ? "rgba(248,113,113,0.05)"
                      : "rgba(255,255,255,0.025)",
                    padding: "14px 16px",
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    Est. P&L
                  </p>
                  <p style={{ margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: pnlColor }}>
                    {preview.touched ? `${preview.pnl > 0 ? "+" : ""}${formatCurrency(preview.pnl)}` : "—"}
                  </p>
                  {preview.touched && (
                    <p style={{ margin: 0, fontSize: 11, color: preview.pnl > 0 ? "rgba(52,211,153,0.55)" : "rgba(248,113,113,0.55)" }}>
                      {preview.result}
                    </p>
                  )}
                </div>
              </div>

              {/* Price zone bar */}
              {form.entry_price && form.stop_loss && form.take_profit && (
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.025)",
                    padding: "14px 16px",
                  }}
                >
                  <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    Price Zone
                  </p>
                  <div style={{ position: "relative", height: 8, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: "0 70% 0 0", background: "linear-gradient(90deg, #ef4444, #fbbf24)", borderRadius: 99 }} />
                    <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.7)" }} />
                    <div style={{ position: "absolute", left: "30%", right: 0, top: 0, bottom: 0, background: "linear-gradient(90deg, #fbbf24, #34d399)", borderRadius: "0 99px 99px 0" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    <span>SL {formatCurrency(Number(form.stop_loss))}</span>
                    <span style={{ color: "rgba(255,255,255,0.55)" }}>Entry {formatCurrency(Number(form.entry_price))}</span>
                    <span>TP {formatCurrency(Number(form.take_profit))}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── META TAB ── */}
          {activeTab === "meta" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <SectionDivider icon={<Tag className="w-3.5 h-3.5" />} label="Strategy Tags" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {strategyOptions.map((item) => {
                    const active = strategies.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleStrategy(item)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: active ? "1px solid rgba(0,229,179,0.35)" : "1px solid rgba(255,255,255,0.09)",
                          background: active ? "rgba(0,229,179,0.1)" : "rgba(255,255,255,0.025)",
                          color: active ? "#00e5b3" : "rgba(255,255,255,0.38)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {active && (
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "rgba(0,229,179,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              color: "#00e5b3",
                              fontWeight: 900,
                            }}
                          >
                            ✓
                          </span>
                        )}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <SectionDivider icon={<Smile className="w-3.5 h-3.5" />} label="Trade Emotion" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {emotionOptions.map((opt) => {
                    const active = emotion === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setEmotion(opt.key)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "18px 0",
                          borderRadius: 12,
                          border: active ? `1px solid ${opt.border}` : "1px solid rgba(255,255,255,0.08)",
                          background: active ? opt.bg : "rgba(255,255,255,0.02)",
                          color: active ? opt.accent : "rgba(255,255,255,0.35)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 26 }}>{opt.emoji}</span>
                        {opt.key}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                borderRadius: 10,
                border: "1px solid rgba(248,113,113,0.22)",
                background: "rgba(248,113,113,0.07)",
                padding: "12px 14px",
                fontSize: 13,
                color: "#fca5a5",
              }}
            >
              <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* ── FOOTER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
          }}
        >
          {/* Live P&L pill */}
          <div>
            {preview.touched ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 14px",
                  borderRadius: 99,
                  border: preview.pnl > 0 ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(248,113,113,0.25)",
                  background: preview.pnl > 0 ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                }}
              >
                {preview.pnl > 0 ? (
                  <TrendingUp style={{ width: 14, height: 14, color: "#34d399" }} />
                ) : (
                  <TrendingDown style={{ width: 14, height: 14, color: "#f87171" }} />
                )}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: pnlColor,
                  }}
                >
                  {preview.pnl > 0 ? "+" : ""}{formatCurrency(preview.pnl)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: preview.pnl > 0 ? "rgba(52,211,153,0.6)" : "rgba(248,113,113,0.6)" }}>
                  {preview.result}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
                Fill entry & exit to preview P&L
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 38,
                padding: "0 18px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="quick-trade-form"
              disabled={loading}
              style={{
                height: 38,
                padding: "0 22px",
                borderRadius: 10,
                border: "none",
                background: loading ? "rgba(0,229,179,0.4)" : "#00e5b3",
                color: "#021a12",
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#00f5c3";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "#00e5b3";
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                  Saving…
                </>
              ) : (
                <>
                  <Zap style={{ width: 14, height: 14 }} />
                  Add Trade
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}