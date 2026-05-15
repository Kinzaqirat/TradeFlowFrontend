"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatbotPanel from "./ChatbotPanel";

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes tf-btn-ping {
          0%  { transform: scale(1);   opacity: 0.7; }
          70% { transform: scale(2);   opacity: 0;   }
          100%{ transform: scale(2);   opacity: 0;   }
        }
        @keyframes tf-btn-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes tf-btn-glow {
          0%, 100% { box-shadow: 0 16px 45px rgba(45,212,191,0.28), 0 4px 12px rgba(45,212,191,0.18), inset 0 1px 0 rgba(255,255,255,0.15); }
          50%       { box-shadow: 0 20px 55px rgba(45,212,191,0.42), 0 6px 18px rgba(45,212,191,0.25), inset 0 1px 0 rgba(255,255,255,0.18); }
        }

        .tf-fab {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 50;
          width: 68px;
          height: 68px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          outline: none;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }

        .tf-fab-open {
          background: rgba(6,18,24,0.95);
          border: 1px solid rgba(45,212,191,0.18);
          color: rgba(255,255,255,0.7);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          transform: rotate(90deg) scale(0.88);
        }
        .tf-fab-open:hover {
          border-color: rgba(45,212,191,0.35);
          color: #2dd4bf;
          transform: rotate(90deg) scale(0.93);
        }

        .tf-fab-closed {
          background: linear-gradient(135deg, #2dd4bf, #06b6d4);
          border: 1px solid rgba(45,212,191,0.45);
          color: #021a18;
          animation: tf-btn-glow 3s ease-in-out infinite;
          transform: scale(1);
          overflow: hidden;
        }
        .tf-fab-closed::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%);
          background-size: 200% 100%;
          animation: tf-btn-shimmer 3s ease-in-out infinite;
        }
        .tf-fab-closed:hover {
          transform: scale(1.1) translateY(-2px);
        }
        .tf-fab-closed:active {
          transform: scale(0.95);
        }

        .tf-ping-wrap {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
        }
        .tf-ping-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ff4d6a;
          border: 2px solid #04080e;
          box-shadow: 0 0 12px rgba(255,77,106,0.75);
          position: relative;
          z-index: 1;
        }
        .tf-ping-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255,77,106,0.5);
          animation: tf-btn-ping 1.8s ease-out infinite;
        }
        .tf-fab-icon {
          transition: transform 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .tf-fab-closed:hover .tf-fab-icon {
          transform: translateY(-2px) scale(1.05);
        }
      `}</style>

      {open && <ChatbotPanel onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`tf-fab ${open ? "tf-fab-open" : "tf-fab-closed"}`}
        aria-label={open ? "Close trading AI chat" : "Open trading AI chat"}
      >
        {open ? (
          <X size={26} className="tf-fab-icon" />
        ) : (
          <>
            <MessageCircle size={28} strokeWidth={2.4} className="tf-fab-icon" />
            <div className="tf-ping-wrap">
              <div className="tf-ping-ring" />
              <div className="tf-ping-dot" />
            </div>
          </>
        )}
      </button>
    </>
  );
}