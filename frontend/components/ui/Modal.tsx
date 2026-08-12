"use client";
import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Chiudi" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white border border-line rounded-[14px] shadow-card max-h-[85vh] overflow-hidden flex flex-col motion-safe:animate-[in_150ms_ease-out]"
        style={{ animation: "in 150ms ease-out" }}
      >
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-[10px] border border-line bg-white text-muted hover:text-ink hover:bg-surface">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-auto">{children}</div>
      </div>
      <style>{`@media(prefers-reduced-motion:reduce){[role=dialog]{animation:none!important}} @keyframes in{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
