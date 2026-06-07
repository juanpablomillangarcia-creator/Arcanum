"use client";

import { useEffect } from "react";

// Mobile-first overlay: a bottom sheet on phones, a centered modal at md+.
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <button aria-label="Cerrar" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full md:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl border p-4 md:p-6 shadow-2xl"
        style={{ borderColor: "var(--line-bright)", background: "linear-gradient(180deg, var(--bg-card), var(--bg-deep))" }}
      >
        <div className="md:hidden mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--line-bright)" }} />
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-[var(--font-title)] text-xl text-ink">{title}</h2>}
          <button onClick={onClose} className="ml-auto grid place-items-center w-9 h-9 text-ink-dim hover:text-ink rounded-md focus-ring">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
