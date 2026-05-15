"use client";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
