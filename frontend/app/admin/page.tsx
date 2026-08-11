"use client";
import { useEffect, useState } from "react";
import { API_BASE, apiFetch } from "@/lib/api";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<any>(null);

  async function load() {
    try {
      const [stats, h] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/health"),
      ]);
      setData(stats);
      setHealth(h);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-[22px] font-semibold tracking-tight">Pannello amministrativo</h1>
      {error && <p className="text-sm text-red-600 font-mono">{error}</p>}
      {health && (
        <div className="border border-line rounded-lg p-4 bg-white">
          <h2 className="text-sm font-semibold mb-2">Health</h2>
          <pre className="text-xs font-mono bg-slate-50 p-3 rounded border border-line overflow-auto">{JSON.stringify(health, null, 2)}</pre>
          <p className="text-xs text-muted mt-2">API_BASE: <span className="font-mono">{API_BASE}</span></p>
        </div>
      )}
      {data && (
        <>
          <div className="border border-line rounded-lg p-4 bg-white">
            <h2 className="text-sm font-semibold mb-2">Vector store</h2>
            <pre className="text-xs font-mono bg-slate-50 p-3 rounded border border-line">{JSON.stringify(data.vector_store, null, 2)}</pre>
          </div>
          <div className="border border-line rounded-lg p-4 bg-white">
            <h2 className="text-sm font-semibold mb-2">File ({data.files?.length || 0})</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-muted"><tr><th className="text-left p-2">File</th><th className="p-2">Indexed</th><th className="p-2">Chunks</th><th className="p-2">Uploaded</th></tr></thead>
                <tbody>
                  {(data.files||[]).map((f:any)=>(
                    <tr key={f.id} className="border-t border-line">
                      <td className="p-2 font-mono text-xs">{f.filename}</td>
                      <td className="p-2 text-center">{f.indexed ? "✓" : "—"}</td>
                      <td className="p-2 text-center">{f.chunks}</td>
                      <td className="p-2 text-xs">{new Date(f.uploaded_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <button onClick={load} className="px-4 py-2 border border-line rounded text-sm bg-white">Aggiorna</button>
    </div>
  );
}
