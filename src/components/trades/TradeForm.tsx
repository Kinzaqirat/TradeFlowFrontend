"use client";
import { useState, useEffect } from "react";
import { calculatePnL, calculatePnLPercent, classifyResult } from "@/utils/pnlCalculator";
import { formatCurrency, formatPercent, getPnLColor } from "@/utils/formatters";
import Button from "@/components/ui/Button";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Hash, Percent, FileText, ArrowRight } from "lucide-react";

interface TradeFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
      {children}
    </label>
  );
}

function InputWrapper({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}

const inputClass = (hasIcon = false) =>
  `w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl ${
    hasIcon ? "pl-9" : "px-4"
  } pr-4 py-3 text-sm font-medium outline-none focus:border-[var(--accent-blue)] transition-colors placeholder:text-[var(--text-muted)] font-mono`;

export default function TradeForm({ initialData, onSubmit, loading }: TradeFormProps) {
  const [formData, setFormData] = useState({
    symbol: initialData?.symbol || "",
    direction: initialData?.direction || "LONG",
    entry_datetime: initialData?.entry_datetime
      ? new Date(initialData.entry_datetime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    exit_datetime: initialData?.exit_datetime
      ? new Date(initialData.exit_datetime).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    entry_price: initialData?.entry_price || "",
    exit_price: initialData?.exit_price || "",
    quantity: initialData?.quantity || "",
    fees: initialData?.fees ?? 0,
    notes: initialData?.notes || "",
  });

  const [preview, setPreview] = useState({ pnl: 0, pnl_percent: 0, result: "BREAKEVEN" });
  const [touched, setTouched] = useState(false);

  const set = (k: string, v: any) => setFormData((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (formData.entry_price && formData.exit_price && formData.quantity) {
      setTouched(true);
      const pnl = calculatePnL(
        formData.direction as any,
        Number(formData.entry_price),
        Number(formData.exit_price),
        Number(formData.quantity),
        Number(formData.fees)
      );
      const pnl_pct = calculatePnLPercent(pnl, Number(formData.entry_price), Number(formData.quantity));
      setPreview({ pnl, pnl_percent: pnl_pct, result: classifyResult(pnl) });
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      entry_price: Number(formData.entry_price),
      exit_price: Number(formData.exit_price),
      quantity: Number(formData.quantity),
      fees: Number(formData.fees),
      entry_datetime: new Date(formData.entry_datetime).toISOString(),
      exit_datetime: new Date(formData.exit_datetime).toISOString(),
    });
  };

  const pnlPositive = preview.pnl > 0;
  const pnlNegative = preview.pnl < 0;
  const pnlColor = pnlPositive
    ? "text-emerald-400"
    : pnlNegative
    ? "text-red-400"
    : "text-[var(--text-secondary)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Row 1: Symbol + Direction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Symbol</FieldLabel>
          <InputWrapper icon={<Hash className="w-3.5 h-3.5" />}>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => set("symbol", e.target.value.toUpperCase())}
              className={inputClass(true) + " font-bold tracking-wider"}
              placeholder="BTC/USD"
              required
            />
          </InputWrapper>
        </div>

        <div>
          <FieldLabel>Direction</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => set("direction", "LONG")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                formData.direction === "LONG"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/10"
                  : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-muted)]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Long
            </button>
            <button
              type="button"
              onClick={() => set("direction", "SHORT")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                formData.direction === "SHORT"
                  ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-sm shadow-red-500/10"
                  : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-muted)]"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Short
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Datetimes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Entry Date / Time</FieldLabel>
          <InputWrapper icon={<Calendar className="w-3.5 h-3.5" />}>
            <input
              type="datetime-local"
              value={formData.entry_datetime}
              onChange={(e) => set("entry_datetime", e.target.value)}
              className={inputClass(true)}
              required
            />
          </InputWrapper>
        </div>
        <div>
          <FieldLabel>Exit Date / Time</FieldLabel>
          <InputWrapper icon={<Calendar className="w-3.5 h-3.5" />}>
            <input
              type="datetime-local"
              value={formData.exit_datetime}
              onChange={(e) => set("exit_datetime", e.target.value)}
              className={inputClass(true)}
              required
            />
          </InputWrapper>
        </div>
      </div>

      {/* Row 3: Entry / Exit Price inline with arrow */}
      <div>
        <FieldLabel>Price</FieldLabel>
        <div className="flex items-center gap-2">
          <InputWrapper icon={<DollarSign className="w-3.5 h-3.5" />}>
            <input
              type="number"
              step="0.0001"
              value={formData.entry_price}
              onChange={(e) => set("entry_price", e.target.value)}
              className={inputClass(true)}
              placeholder="Entry"
              required
            />
          </InputWrapper>
          <ArrowRight className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
          <InputWrapper icon={<DollarSign className="w-3.5 h-3.5" />}>
            <input
              type="number"
              step="0.0001"
              value={formData.exit_price}
              onChange={(e) => set("exit_price", e.target.value)}
              className={inputClass(true)}
              placeholder="Exit"
              required
            />
          </InputWrapper>
        </div>
      </div>

      {/* Row 4: Quantity + Fees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Quantity</FieldLabel>
          <InputWrapper icon={<Hash className="w-3.5 h-3.5" />}>
            <input
              type="number"
              step="0.0001"
              value={formData.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              className={inputClass(true)}
              placeholder="1.0"
              required
            />
          </InputWrapper>
        </div>
        <div>
          <FieldLabel>Fees</FieldLabel>
          <InputWrapper icon={<Percent className="w-3.5 h-3.5" />}>
            <input
              type="number"
              step="0.01"
              value={formData.fees}
              onChange={(e) => set("fees", e.target.value)}
              className={inputClass(true)}
              placeholder="0.00"
            />
          </InputWrapper>
        </div>
      </div>

      {/* Notes */}
      <div>
        <FieldLabel>Notes</FieldLabel>
        <InputWrapper icon={<FileText className="w-3.5 h-3.5" />}>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={inputClass(true) + " font-sans"}
            placeholder="Scalp · Breakout · Confirmed setup"
          />
        </InputWrapper>
      </div>

      {/* P/L Preview */}
      <div className={`rounded-xl border p-4 transition-all ${
        !touched
          ? "bg-[var(--bg-elevated)] border-[var(--border)]"
          : pnlPositive
          ? "bg-emerald-500/5 border-emerald-500/20"
          : pnlNegative
          ? "bg-red-500/5 border-red-500/20"
          : "bg-[var(--bg-elevated)] border-[var(--border)]"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
              Estimated P / L
            </div>
            <div className={`text-2xl font-bold font-mono leading-none ${touched ? pnlColor : "text-[var(--text-muted)]"}`}>
              {touched
                ? `${pnlPositive ? "+" : ""}${formatCurrency(preview.pnl)}`
                : "—"}
            </div>
            {touched && (
              <div className={`text-xs font-mono mt-1 ${pnlColor} opacity-70`}>
                {pnlPositive ? "+" : ""}{formatPercent(preview.pnl_percent)}
              </div>
            )}
          </div>

          <div className={`flex flex-col items-end gap-2`}>
            {touched && (
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${
                preview.result === "WIN"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : preview.result === "LOSS"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-gray-500/10 border-gray-500/30 text-gray-400"
              }`}>
                {preview.result}
              </span>
            )}
            {formData.entry_price && formData.exit_price && formData.quantity && (
              <div className="text-[10px] text-[var(--text-muted)] text-right">
                {Number(formData.quantity)} × {formatCurrency(Number(formData.exit_price) - Number(formData.entry_price))} / unit
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider"
        isLoading={loading}
      >
        {initialData ? "Update Trade" : "Save Trade"}
      </Button>
    </form>
  );
}