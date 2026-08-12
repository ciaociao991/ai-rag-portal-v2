"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { API_BASE, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type FileEntry = {
  id: string;
  filename: string;
  size: number;
  indexed: boolean;
  chunks: number;
  uploaded_at: string;
};

function formatKB(n: number) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}
function extLabel(name: string) {
  const e = name.split(".").pop()?.toUpperCase() || "";
  if (e === "PDF") return { label: "PDF", tone: "info" as const };
  if (e === "DOCX") return { label: "DOCX", tone: "info" as const };
  if (e === "TXT" || e === "MD") return { label: e, tone: "neutral" as const };
  return { label: e || "FILE", tone: "neutral" as const };
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      const data = await apiFetch("/files");
      setEntries(data.files || []);
    } catch (e: any) {
      setStatus(e.message);
      setShowStatus(true);
    }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { console.log("[RAG] API_BASE =", API_BASE); }, []);

  function onFilesPicked(list: FileList | null) {
    if (!list) return;
    setFiles(Array.from(list));
  }

  async function doUpload() {
    if (files.length === 0) return;
    setBusy(true);
    setStatus("Caricamento in corso…");
    setShowStatus(false);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch(`${API_BASE}/files/upload`, {
        method: "POST",
        headers: (() => {
          const t = localStorage.getItem("rag_token");
          return t ? { Authorization: `Bearer ${t}` } : undefined;
        })(),
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStatus(`Caricati ${data.uploaded.length} file. Ora premi Indicizza per renderli interrogabili.`);
      setShowStatus(true);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      await refresh();
    } catch (e: any) {
      setStatus("Errore upload: " + e.message);
      setShowStatus(true);
    } finally { setBusy(false); }
  }

  async function doIndexAll() {
    setBusy(true);
    setStatus("Indicizzazione in corso…");
    try {
      const res = await fetch(`${API_BASE}/files/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(localStorage.getItem("rag_token") ? { Authorization: `Bearer ${localStorage.getItem("rag_token")}` } : {}) },
        body: JSON.stringify([]),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(j));
      setStatus(j.indexed?.length ? `Indicizzati ${j.indexed.length} file: ${j.indexed.map((x: any) => x.filename).join(", ")}` : j.message || "Niente da indicizzare — tutti i file sono già indicizzati.");
      setShowStatus(true);
      await refresh();
    } catch (e: any) {
      setStatus("Errore indicizzazione: " + e.message);
      setShowStatus(true);
    } finally { setBusy(false); }
  }

  const indexedCount = entries.filter((e) => e.indexed).length;
  const totalChunks = entries.reduce((a, b) => a + (b.chunks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">Documenti</h1>
          <p className="text-[13px] text-muted mt-1 max-w-2xl">
            Carica <span className="font-medium text-ink">PDF, TXT, DOCX, MD</span> — poi indicizza e interroga dalla chat. I documenti restano locali al backend configurato.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{entries.length} file</Badge>
          <Badge tone="success">{indexedCount} indicizzati</Badge>
          <Badge tone="info">{totalChunks} chunk</Badge>
        </div>
      </div>

      {/* Upload card — elegante */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold tracking-tight text-ink">Aggiungi documenti</div>
              <div className="text-[12px] text-muted">Trascina i file o selezionali — multi-upload supportato</div>
            </div>
            <Link href="/chat" className="hidden sm:inline-flex text-[13px] font-medium text-accent hover:text-[#0D5E56]">
              Vai alla chat →
            </Link>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFilesPicked(e.dataTransfer.files);
            }}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-[#D0D5DD]"
            }`}
          >
            <div className="mx-auto h-10 w-10 rounded-lg border border-line bg-surface grid place-items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="1.6">
                <path d="M12 16V6M12 6l-4 4M12 6l4 4M4.5 14.5V17A2.5 2.5 0 0 0 7 19.5h10A2.5 2.5 0 0 0 19.5 17v-2.5" />
              </svg>
            </div>
            <div className="mt-3 text-[13px] font-medium text-ink">Trascina qui i file</div>
            <div className="text-[12px] text-muted">oppure</div>
            <div className="mt-3">
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.md,.csv"
                onChange={(e) => onFilesPicked(e.target.files)}
                className="hidden"
                id="file-picker"
              />
              <label htmlFor="file-picker" className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-white px-4 text-[13px] font-medium text-ink cursor-pointer hover:bg-surface">
                Seleziona file
              </label>
            </div>
            <div className="mt-2 text-[11px] text-muted">PDF, TXT, DOCX, MD, CSV — fino a più file per volta</div>
          </div>

          {/* Selected files preview */}
          {files.length > 0 && (
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-[12px] font-medium text-ink mb-2">{files.length} file pronti per l’upload</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {files.map((f) => {
                  const m = extLabel(f.name);
                  return (
                    <div key={f.name + f.size} className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2">
                      <Badge tone={m.tone}>{m.label}</Badge>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-ink truncate">{f.name}</div>
                        <div className="text-[11px] text-muted">{formatKB(f.size)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => { setFiles([]); if (inputRef.current) inputRef.current.value = ""; }} className="mt-2 text-[12px] text-muted hover:text-ink">
                Rimuovi selezione
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" disabled={busy || files.length === 0} onClick={doUpload}>
              {busy ? "Elaborazione…" : `Carica ${files.length ? `(${files.length})` : ""}`}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={doIndexAll}>
              Indicizza
            </Button>
            <Link href="/chat" className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-accent hover:bg-accent-soft border border-transparent">
              Interroga in chat →
            </Link>
            <span className="ml-auto text-[11px] font-mono text-muted hidden sm:inline">API: {API_BASE}</span>
          </div>

          {status && (
            <div className="flex items-start gap-3 rounded-lg border border-line bg-surface px-3 py-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
              <p className="text-[12px] leading-relaxed text-ink whitespace-pre-wrap flex-1">{status}</p>
              <button onClick={() => setShowStatus(true)} className="text-[11px] font-medium text-accent hover:underline">
                Dettagli
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* File list — card + table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold tracking-tight text-ink">Libreria</div>
            <Button variant="ghost" size="sm" onClick={refresh} className="border border-line bg-white">
              Aggiorna
            </Button>
          </div>
        </CardHeader>
        {entries.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl border border-dashed border-line grid place-items-center bg-surface">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.6">
                <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
              </svg>
            </div>
            <div className="mt-3 text-[13px] font-medium text-ink">Nessun documento</div>
            <div className="text-[12px] text-muted">Carica il primo PDF o TXT per iniziare.</div>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-surface border-y border-line">
                <tr className="text-[11px] tracking-wide text-muted uppercase">
                  <th className="px-5 py-2.5 font-medium">File</th>
                  <th className="px-5 py-2.5 font-medium text-right">Dimensione</th>
                  <th className="px-5 py-2.5 font-medium text-center">Stato</th>
                  <th className="px-5 py-2.5 font-medium text-center">Chunk</th>
                  <th className="px-5 py-2.5 font-medium">Caricato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((e) => {
                  const m = extLabel(e.filename);
                  return (
                    <tr key={e.id} className="hover:bg-surface/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Badge tone={m.tone}>{m.label}</Badge>
                          <span className="font-mono text-[12px] text-ink truncate max-w-[260px]" title={e.filename}>
                            {e.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[12px] text-muted">{formatKB(e.size)}</td>
                      <td className="px-5 py-3 text-center">
                        {e.indexed ? <Badge tone="success">indicizzato</Badge> : <Badge tone="warning">da indicizzare</Badge>}
                      </td>
                      <td className="px-5 py-3 text-center text-[12px] text-ink">{e.chunks}</td>
                      <td className="px-5 py-3 text-[12px] text-muted">{new Date(e.uploaded_at).toLocaleString("it-IT")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showStatus} onClose={() => setShowStatus(false)} title="Dettaglio operazione">
        <p className="text-[13px] leading-relaxed text-ink whitespace-pre-wrap font-mono text-xs bg-surface border border-line rounded-lg p-3">{status || "Nessun dettaglio."}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setShowStatus(false)}>Chiudi</Button>
        </div>
      </Modal>
    </div>
  );
}
