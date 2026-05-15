"use client";
/**
 * Chart screenshot export using html2canvas.
 * Captures the chart container and triggers PNG download.
 */
import { useState } from "react";
import html2canvas from "html2canvas";

interface ChartExportProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export default function ChartExport({
  chartRef,
  filename = "chart",
}: ChartExportProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleExport = async () => {
    if (!chartRef.current || state === "loading") return;
    setState("loading");
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#0c1220",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setState("done");
      setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      console.error("Chart export failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2200);
    }
  };

  /* ── Icon variants ──────────────────────────────────────────────── */
  const CameraIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );

  const SpinnerIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        style={{ animation: "ce-spin 1s linear infinite" }} />
    </svg>
  );

  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  const config = {
    idle:    { icon: <CameraIcon />,  label: "Save as PNG",   color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", glow: "none" },
    loading: { icon: <SpinnerIcon />, label: "Capturing…",    color: "rgba(0,229,179,0.75)",   bg: "rgba(0,229,179,0.06)",   border: "rgba(0,229,179,0.2)",    glow: "none" },
    done:    { icon: <CheckIcon />,   label: "Saved!",        color: "#00e5b3",                bg: "rgba(0,229,179,0.1)",    border: "rgba(0,229,179,0.35)",   glow: "0 0 14px rgba(0,229,179,0.2)" },
    error:   { icon: <ErrorIcon />,   label: "Failed",        color: "#ff4d6a",                bg: "rgba(255,77,106,0.08)",  border: "rgba(255,77,106,0.3)",   glow: "none" },
  }[state];

  return (
    <>
      <style>{`
        @keyframes ce-spin { to { transform: rotate(360deg); } }
        .ce-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 9px;
          border: 1px solid;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: color 0.18s, background 0.18s, border-color 0.18s, box-shadow 0.18s;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .ce-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .ce-btn:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        .ce-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .ce-btn:disabled {
          cursor: not-allowed;
        }
      `}</style>

      <button
        className="ce-btn"
        onClick={handleExport}
        disabled={state === "loading"}
        aria-label="Export chart as PNG"
        style={{
          color: config.color,
          background: config.bg,
          borderColor: config.border,
          boxShadow: config.glow,
        }}
      >
        {config.icon}
        {config.label}
      </button>
    </>
  );
}