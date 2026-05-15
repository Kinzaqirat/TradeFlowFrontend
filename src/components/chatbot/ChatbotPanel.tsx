"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
  CornerDownLeft,
  Send,
  Sparkles,
  X,
  TrendingUp,
  Shield,
  BarChart2,
  Zap,
} from "lucide-react";
import api from "@/services/api";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUERIES = [
  "Review my win rate",
  "Analyze losing trades",
  "Find my best symbols",
  "Give risk advice",
];

const QUICK_STATS = [
  { icon: TrendingUp, label: "Win Rate", value: "68.4%" },
  { icon: BarChart2,  label: "Avg R:R",  value: "2.3x"  },
  { icon: Shield,     label: "Max DD",   value: "4.1%"  },
  { icon: Zap,        label: "Trades",   value: "142"   },
];

export default function ChatbotPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI trading analyst. Ask me about your performance, risk management, patterns, or get a full trade review.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { message: text });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that. Please check your API configuration.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@600;700;800&display=swap');

        @keyframes tf-bounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.35; }
          40%            { transform: translateY(-6px); opacity: 1;    }
        }
        @keyframes tf-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes tf-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
        @keyframes tf-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes tf-orb-drift {
          0%   { transform: translate(0,0)     scale(1);    }
          100% { transform: translate(20px,-15px) scale(1.04); }
        }

        .tf-panel {
          animation: tf-slide-up 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .tf-typing-dot {
          animation: tf-bounce 1.2s ease-in-out infinite;
        }
        .tf-send-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%);
          background-size: 200% 100%;
          animation: tf-shimmer 2.5s ease-in-out infinite;
        }
        .tf-edge-glow {
          animation: tf-glow-pulse 3s ease-in-out infinite;
        }
        .tf-orb {
          animation: tf-orb-drift 8s ease-in-out infinite alternate;
        }
        .tf-orb-rev {
          animation: tf-orb-drift 10s ease-in-out infinite alternate-reverse;
        }
        .tf-chip {
          transition: all 0.2s ease;
        }
        .tf-chip:hover {
          border-color: rgba(45,212,191,0.4) !important;
          background: rgba(45,212,191,0.1) !important;
          color: #2dd4bf !important;
        }
        .tf-input-wrap:focus-within {
          border-color: rgba(45,212,191,0.45) !important;
          box-shadow: 0 0 0 3px rgba(45,212,191,0.08) !important;
        }
        .tf-stat:hover {
          border-color: rgba(45,212,191,0.25) !important;
          background: rgba(45,212,191,0.07) !important;
        }
        .tf-scroll::-webkit-scrollbar { width: 3px; }
        .tf-scroll::-webkit-scrollbar-track { background: transparent; }
        .tf-scroll::-webkit-scrollbar-thumb {
          background: rgba(45,212,191,0.18);
          border-radius: 99px;
        }
        .tf-close-btn:hover {
          background: rgba(45,212,191,0.07) !important;
          border-color: rgba(45,212,191,0.2) !important;
          color: #2dd4bf !important;
        }
      `}</style>

      <div
        className="tf-panel fixed z-50 flex flex-col overflow-hidden"
        style={{
          bottom: "5.5rem",
          right: "1.5rem",
          width: "min(520px, calc(100vw - 2rem))",
          height: "min(700px, calc(100vh - 6rem))",
          borderRadius: 24,
          border: "1px solid rgba(45,212,191,0.12)",
          background:
            "linear-gradient(170deg, rgba(6,18,24,0.98) 0%, rgba(4,12,18,0.99) 100%)",
          backdropFilter: "blur(48px)",
          boxShadow:
            "0 32px 96px rgba(0,0,0,0.65), 0 0 0 1px rgba(45,212,191,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top glow line */}
        <div
          className="tf-edge-glow pointer-events-none absolute left-0 right-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)",
          }}
        />

        {/* Ambient orbs */}
        <div
          className="tf-orb pointer-events-none absolute"
          style={{
            right: -80, top: -80,
            width: 240, height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,212,191,0.1), transparent 68%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="tf-orb-rev pointer-events-none absolute"
          style={{
            left: -60, bottom: -80,
            width: 220, height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* ── Header ── */}
        <div
          className="relative flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: "1px solid rgba(45,212,191,0.08)",
            background: "rgba(4,12,18,0.6)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Bot avatar */}
            <div className="relative">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(45,212,191,0.22), rgba(6,182,212,0.08))",
                  border: "1px solid rgba(45,212,191,0.3)",
                  color: "#2dd4bf",
                  boxShadow:
                    "0 0 28px rgba(45,212,191,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <Bot size={22} />
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full"
                style={{
                  background: "#2dd4bf",
                  border: "2px solid #040c12",
                  boxShadow: "0 0 10px rgba(45,212,191,0.9)",
                }}
              />
            </div>

            <div>
              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Trading AI
              </h3>
              <p
                className="mt-0.5 flex items-center gap-1.5"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#2dd4bf",
                }}
              >
                <Activity size={10} />
                Online Analyst · Gemini 2.5
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="tf-close-btn flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
            style={{
              border: "1px solid transparent",
              color: "rgba(255,255,255,0.35)",
              background: "transparent",
            }}
            aria-label="Close chat"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Quick stats bar ── */}
        <div
          className="grid grid-cols-4 gap-2 px-6 py-3"
          style={{ borderBottom: "1px solid rgba(45,212,191,0.06)" }}
        >
          {QUICK_STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="tf-stat flex flex-col items-center gap-1 rounded-xl py-2 transition-all duration-200"
              style={{
                border: "1px solid rgba(45,212,191,0.08)",
                background: "rgba(45,212,191,0.03)",
              }}
            >
              <Icon size={13} style={{ color: "rgba(45,212,191,0.6)" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Message thread ── */}
        <div className="tf-scroll relative flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}

          {loading && (
            <div className="flex items-end gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(45,212,191,0.08)",
                  border: "1px solid rgba(45,212,191,0.18)",
                  color: "#2dd4bf",
                }}
              >
                <Bot size={15} />
              </div>
              <div
                style={{
                  borderRadius: "18px 18px 18px 4px",
                  border: "1px solid rgba(45,212,191,0.1)",
                  background: "rgba(45,212,191,0.05)",
                  padding: "14px 18px",
                }}
              >
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="tf-typing-dot h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "#2dd4bf",
                        animationDelay: `${idx * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Suggested chips ── */}
        <div
          className="flex gap-2 overflow-x-auto px-6 pb-3 pt-3"
          style={{ borderTop: "1px solid rgba(45,212,191,0.06)" }}
        >
          {SUGGESTED_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="tf-chip flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11.5px] font-semibold"
              style={{
                border: "1px solid rgba(45,212,191,0.12)",
                background: "rgba(45,212,191,0.04)",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              <Sparkles size={11} />
              {q}
            </button>
          ))}
        </div>

        {/* ── Input bar ── */}
        <div
          className="relative px-6 pb-5 pt-3"
          style={{
            borderTop: "1px solid rgba(45,212,191,0.08)",
            background: "rgba(4,12,18,0.65)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div
            className="tf-input-wrap relative flex items-center gap-2 rounded-2xl p-2 transition-all duration-200"
            style={{
              border: "1px solid rgba(45,212,191,0.12)",
              background: "rgba(45,212,191,0.03)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about trades, risk, or patterns..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[13.5px] font-medium outline-none"
              style={{
                color: "#fff",
                caretColor: "#2dd4bf",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="tf-send-btn relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #2dd4bf, #06b6d4)",
                color: "#021a18",
                boxShadow: "0 8px 24px rgba(45,212,191,0.25)",
              }}
              aria-label="Send message"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>

          <p
            className="mt-2.5 flex items-center justify-center gap-1.5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(45,212,191,0.28)",
            }}
          >
            <CornerDownLeft size={10} />
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </>
  );
}