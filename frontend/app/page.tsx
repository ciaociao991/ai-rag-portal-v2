"use client";
import { useState, useEffect } from "react";
import { API_BASE, apiFetch } from "@/lib/api";

type FileEntry = {
  id: string;
  filename: string;
  size: number;
  indexed: boolean;
  chunks: number;
  uploaded_at: string;
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const data = await apiFetch("/files");
      setEntries(data.files || []);
    } catch (e: any) {
      setStatus(e.message);
    }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { console.log("[RAG] API_BASE =", API_BASE); }, []);

  async function doUpload() {
    if (files.length === 0) return;
    setBusy(true);
    setStatus("Caricamento...");
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
      setStatus(`Caricati ${data.uploaded.length} file. Ora indicizza.`);
      await refresh();
    } catch (e: any) {
      setStatus("Errore upload: " + e.message);
    } finally { setBusy(false); }
  }

  async function doIndex() {
    setBusy(true);
    setStatus("Indicizzazione in corso...");
    try {
      const data = await apiFetch("/files/index", { method: "POST", body: JSON.stringify([]), headers: { "Content-Type": "application/json" } });
      // if [] means index all non-indexed; backend also accepts []
      // alternative: POST with no body file_ids. We'll also try without body if needed.
      setStatus(`Indicizzati: ${JSON.stringify(data.indexed)}`);
      await refresh();
    } catch (e: any) {
      // fallback: try POST without body
      try {
        const data2 = await apiFetch("/files/index", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
        setStatus(`Indicizzati: ${JSON.stringify(data2)}`);
        await refresh();
      } catch (e2: any) {
        setStatus("Errore indicizzazione: " + e.message);
      }
    } finally { setBusy(false); }
  }

  // Actually backend expects file_ids array or null. Let's handle both: send [] then if fails send null
  async function doIndexAll() {
    setBusy(true);
    setStatus("Indicizzazione...");
    try {
      // send empty to trigger "all non-indexed"
      const res = await fetch(`${API_BASE}/files/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(localStorage.getItem("rag_token") ? { Authorization: `Bearer ${localStorage.getItem("rag_token")}` } : {}) },
        body: JSON.stringify([]),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(j));
      setStatus(j.indexed?.length ? `Indicizzati ${j.indexed.length} file (${j.indexed.map((x:any)=>x.filename).join(", ")})` : j.message || "Niente da indicizzare");
      await refresh();
    } catch (e: any) {
      setStatus("Errore: " + e.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Carica documenti</h1>
        <p className="text-sm text-muted mt-1">PDF, TXT, DOCX. Dopo l&apos;upload premi <b>Indicizza</b>, poi vai in <a className="underline" href="/chat">Chat</a> per interrogare.</p>
      </div>

      <div className="border border-line rounded-lg p-5 bg-white max-w-3xl">
        <label className="block text-sm font-medium mb-2">Seleziona file multipli</label>
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.docx,.md,.csv"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:border file:border-line file:rounded file:bg-white file:text-sm"
        />
        {files.length > 0 && <p className="text-xs text-muted mt-2">{files.length} file selezionati: {files.map(f=>f.name).join(", ")}</p>}
        <div className="flex gap-3 mt-4">
          <button disabled={busy || files.length===0} onClick={doUpload} className="px-4 py-2 bg-ink text-white text-sm rounded disabled:opacity-40">Upload</button>
          <button disabled={busy} onClick={doIndexAll} className="px-4 py-2 border border-line text-sm rounded bg-white hover:bg-slate-50">Indicizza</button>
          <a href="/chat" className="px-4 py-2 text-sm underline">Vai alla chat →</a>
        </div>
        {status && <p className="text-sm mt-4 p-3 bg-slate-50 border border-line rounded font-mono text-xs whitespace-pre-wrap">{status}</p>}
        <p className="text-xs text-muted mt-3">API: <span className="font-mono">{API_BASE}</span></p>
      </div>

      <div className="max-w-3xl">
        <h2 className="text-sm font-semibold mb-3">File caricati</h2>
        {entries.length===0 ? <p className="text-sm text-muted">Nessun file.</p> :
          <div className="border border-line rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-muted">
                <tr><th className="text-left p-2 font-medium">Nome</th><th className="p-2">Size</th><th className="p-2">Indicizzato</th><th className="p-2">Chunk</th></tr>
              </thead>
              <tbody>
                {entries.map(e=>(
                  <tr key={e.id} className="border-t border-line">
                    <td className="p-2 font-mono text-xs">{e.filename}</td>
                    <td className="p-2 text-center text-xs">{(e.size/1024).toFixed(1)} KB</td>
                    <td className="p-2 text-center">{e.indexed ? "✓" : "—"}</td>
                    <td className="p-2 text-center">{e.chunks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}
