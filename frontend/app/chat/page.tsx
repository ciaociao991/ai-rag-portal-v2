"use client";
import { useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Source = { filename: string; score: number; text: string; chunk_index: number };

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{ q: string; a: string; sources: Source[] }>>([]);

  async function ask() {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rag_token") : null;
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setAnswer(data.answer);
      setSources(data.sources || []);
      setHistory((h) => [{ q, a: data.answer, sources: data.sources || [] }, ...h].slice(0, 10));
      setQuestion("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Chat</h1>
        <p className="text-[13px] text-muted mt-1">Interroga i documenti indicizzati — le risposte citano sempre le fonti.</p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="hidden sm:grid h-8 w-8 place-items-center rounded-lg bg-ink text-white text-xs font-semibold">Q</div>
            <div className="flex-1">
              <label className="text-[12px] font-medium text-ink">Domanda</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
                }}
                rows={3}
                placeholder="Es: Quali sono i punti principali del documento caricato? Riassumi in 5 punti."
                className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-[13px] leading-relaxed placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button onClick={ask} disabled={loading || !question.trim()}>
                  {loading ? "Cerco…" : "Chiedi"}
                </Button>
                <span className="text-[11px] text-muted">⌘+Invio per inviare • {API_BASE}</span>
                <Link href="/" className="ml-auto text-[12px] font-medium text-muted hover:text-ink">
                  Carica documenti →
                </Link>
              </div>
              {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 whitespace-pre-wrap">{error}</div>}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Answer */}
      {loading && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 text-muted">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[13px]">Sto cercando nei documenti indicizzati…</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-3/4 rounded bg-surface animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-surface animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-surface animate-pulse" />
            </div>
          </CardBody>
        </Card>
      )}

      {answer && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent-soft border border-line grid place-items-center text-accent text-xs font-semibold">AI</div>
              <div className="text-[13px] font-semibold text-ink">Risposta</div>
              <Badge tone="info">{sources.length} fonti</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="prose prose-sm max-w-none text-[13px] leading-relaxed text-ink whitespace-pre-wrap">{answer}</div>

            {sources.length > 0 && (
              <div className="pt-4 border-t border-line">
                <div className="text-[11px] font-medium tracking-widest uppercase text-muted mb-3">Fonti citate</div>
                <div className="grid gap-3">
                  {sources.map((s, i) => (
                    <div key={i} className="rounded-xl border border-line bg-surface p-3">
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <Badge tone="neutral">{s.filename}</Badge>
                        <span className="text-muted">chunk {s.chunk_index}</span>
                        <span className="ml-auto text-[11px] font-medium text-accent">score {s.score.toFixed(3)}</span>
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-ink/80">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="text-[12px] font-semibold tracking-tight text-ink">Cronologia recente</div>
          </CardHeader>
          <div className="divide-y divide-line">
            {history.map((h, i) => (
              <div key={i} className="p-4 hover:bg-surface/50">
                <div className="text-[12px] font-medium text-ink">Q: {h.q}</div>
                <div className="text-[12px] text-muted mt-1 line-clamp-2">{h.a}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!answer && !loading && history.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-surface border border-line grid place-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="1.6">
              <path d="M8 8.5h8M8 12h6M6 18.5l1.2-2.4A2 2 0 0 0 7 14V7A2 2 0 0 1 9 5h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.6L6 18.5Z" />
            </svg>
          </div>
          <div className="mt-3 text-[13px] font-medium text-ink">Nessuna conversazione</div>
          <div className="text-[12px] text-muted max-w-md mx-auto mt-1">Carica e indicizza almeno un documento, poi poni la prima domanda. Suggerimento: “Riassumi il contenuto principale in 3 punti con citazioni”.</div>
          <Link href="/" className="inline-flex mt-4 h-9 items-center justify-center rounded-lg bg-ink text-white px-4 text-[13px] font-medium">
            Carica documenti
          </Link>
        </div>
      )}
    </div>
  );
}
