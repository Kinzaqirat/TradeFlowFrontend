"use client";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  const Icon = isUser ? User : Bot;

  return (
    <div
      className={`flex items-end gap-3 ${
        isUser ? "justify-end" : "justify-start"
      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {!isUser && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(6,182,212,0.08))",
            border: "1px solid rgba(45,212,191,0.25)",
            color: "#2dd4bf",
            boxShadow: "0 0 16px rgba(45,212,191,0.12)",
          }}
        >
          <Icon size={15} />
        </div>
      )}

      <div
        className="max-w-[80%] whitespace-pre-wrap px-4 py-3 text-[13.5px] leading-relaxed"
        style={
          isUser
            ? {
                borderRadius: "18px 18px 4px 18px",
                background: "linear-gradient(135deg, #2dd4bf, #06b6d4)",
                color: "#021a18",
                fontWeight: 600,
                border: "1px solid rgba(45,212,191,0.4)",
                boxShadow: "0 8px 28px rgba(45,212,191,0.22)",
              }
            : {
                borderRadius: "18px 18px 18px 4px",
                background: "rgba(45,212,191,0.05)",
                border: "1px solid rgba(45,212,191,0.1)",
                color: "rgba(255,255,255,0.88)",
              }
        }
      >
        {content}
      </div>

      {isUser && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "rgba(45,212,191,0.08)",
            border: "1px solid rgba(45,212,191,0.15)",
            color: "rgba(45,212,191,0.7)",
          }}
        >
          <Icon size={15} />
        </div>
      )}
    </div>
  );
}