"use client";
import { useEffect, useState } from "react";
import { API_BASE, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<any>(null);

  async function load() {
    try {
      const [stats, h] = await Promise.all([apiFetch("/admin/stats"), apiFetch("/health")]);
      setData(stats);
      setHealth(h);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  const files = data?.files || [];
  const vs = data?.vector_store || {};

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">Amministrazione</h1>
          <p className="text-[13px] text-muted mt-1">Stato del sistema, indici vettoriali e libreria file. Utile per diagnosticare build, variabili d’ambiente e indicizzazione.</p>
        </div>
        <Button variant="secondary" onClick={load}>Aggiorna</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-[11px] tracking-widest uppercase text-muted font-medium">Health</div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${health?.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-[13px] font-semibold text-ink">{health?.status || "—"}</span>
              <Badge tone={health?.status === "ok" ? "success" : "warning"}>{health?.version || "v?"}</Badge>
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted truncate">{API_BASE}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-[11px] tracking-widest uppercase text-muted font-medium">Vector store</div>
            <div className="mt-2 text-[22px] font-semibold tracking-tight text-ink">{vs.total_chunks ?? "—"} <span className="text-[12px] font-normal text-muted">chunk</span></div>
            <div className="text-[12px] text-muted">{vs.indexed_files ?? 0} file indicizzati • vocab {vs.vocab_size ?? 0}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-[11px] tracking-widest uppercase text-muted font-medium">Libreria</div>
            <div className="mt-2 text-[22px] font-semibold tracking-tight text-ink">{files.length} <span className="text-[12px] font-normal text-muted">file</span></div>
            <div className="text-[12px] text-muted">{files.filter((f: any) => f.indexed).length} indicizzati • {files.filter((f: any) => !f.indexed).length} in attesa</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-ink">Health</div>
              <Badge tone="neutral">{health ? "online" : "offline"}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <pre className="text-[11px] font-mono leading-relaxed bg-surface border border-line rounded-lg p-3 overflow-auto max-h-[260px]">{health ? JSON.stringify(health, null, 2) : "Caricamento…"}</pre>
            <div className="mt-3 text-[11px] font-mono text-muted">GET /health • timeout Railway 60s</div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-[13px] font-semibold text-ink">Vector store</div>
          </CardHeader>
          <CardBody>
            <pre className="text-[11px] font-mono leading-relaxed bg-surface border border-line rounded-lg p-3 overflow-auto max-h-[260px]">{data ? JSON.stringify(vs, null, 2) : "Caricamento…"}</pre>
            <div className="mt-3 text-[11px] text-muted">TF-IDF • top_k configurabile • persistenza JSON</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-ink">File • {files.length}</div>
            <div className="text-[11px] text-muted">Ordinati per data di caricamento</div>
          </div>
        </CardHeader>
        {files.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-[13px] font-medium text-ink">Nessun file</div>
            <div className="text-[12px] text-muted">Carica documenti dalla sezione Documenti.</div>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-surface border-y border-line">
                <tr className="text-[11px] tracking-wide uppercase text-muted">
                  <th className="px-5 py-2.5 font-medium">File</th>
                  <th className="px-5 py-2.5 font-medium text-center">Stato</th>
                  <th className="px-5 py-2.5 font-medium text-center">Chunk</th>
                  <th className="px-5 py-2.5 font-medium">Caricato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {files.map((f: any) => (
                  <tr key={f.id} className="hover:bg-surface/60">
                    <td className="px-5 py-3 font-mono text-[12px] text-ink truncate max-w-[320px]">{f.filename}</td>
                    <td className="px-5 py-3 text-center">{f.indexed ? <Badge tone="success">indicizzato</Badge> : <Badge tone="warning">in attesa</Badge>}</td>
                    <td className="px-5 py-3 text-center text-[12px] text-ink">{f.chunks}</td>
                    <td className="px-5 py-3 text-[12px] text-muted">{new Date(f.uploaded_at).toLocaleString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
