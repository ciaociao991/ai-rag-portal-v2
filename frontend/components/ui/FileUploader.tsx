"use client";
import { useState, useRef } from "react";
import { Badge } from "./Badge";

function formatKB(n: number) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}
function extTone(name: string): "neutral" | "info" {
  const e = name.split(".").pop()?.toLowerCase();
  return e === "pdf" || e === "docx" ? "info" : "neutral";
}

export function FileUploader({
  files,
  onFiles,
  disabled,
}: {
  files: File[];
  onFiles: (f: File[]) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          onFiles(Array.from(e.dataTransfer.files));
        }}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-[#D0D5DD]"}`}
      >
        <div className="mx-auto h-9 w-9 rounded-[10px] border border-line bg-surface grid place-items-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="1.6">
            <path d="M12 15V6M12 6l-4 4M12 6l4 4M4.5 13.5V17A2.5 2.5 0 0 0 7 19.5h10A2.5 2.5 0 0 0 19.5 17v-2.5" />
          </svg>
        </div>
        <div className="mt-2 text-[13px] font-medium text-ink">Trascina qui i file</div>
        <div className="text-[12px] text-muted">oppure</div>
        <div className="mt-2">
          <input ref={ref} type="file" multiple accept=".pdf,.txt,.docx,.md,.csv" onChange={(e) => onFiles(Array.from(e.target.files || []))} className="hidden" id="fu-picker" disabled={disabled} />
          <label htmlFor="fu-picker" className={`inline-flex h-9 items-center justify-center rounded-[10px] border border-line bg-white px-4 text-[13px] font-medium text-ink cursor-pointer hover:bg-surface ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
            Seleziona file
          </label>
        </div>
        <div className="mt-1.5 text-[11px] text-muted">PDF, TXT, DOCX, MD, CSV — multi-upload</div>
      </div>

      {files.length > 0 && (
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-[12px] font-medium text-ink mb-2">{files.length} file selezionati</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {files.map((f) => (
              <div key={f.name + f.size} className="flex items-center gap-2.5 rounded-[10px] border border-line bg-white px-3 py-2">
                <Badge tone={extTone(f.name)}>{f.name.split(".").pop()?.toUpperCase() || "FILE"}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-ink truncate">{f.name}</div>
                  <div className="text-[11px] text-muted">{formatKB(f.size)}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => { onFiles([]); if (ref.current) ref.current.value = ""; }} className="mt-2 text-[12px] text-muted hover:text-ink">
            Rimuovi selezione
          </button>
        </div>
      )}
    </div>
  );
}
