"use client";
import { useState } from "react";
import { API_BASE } from "@/lib/api";

type Source = { filename: string; score: number; text: string; chunk_index: number };

export default function ChatPage() {
  const [question, setQuestion] = useState("Cos'è il contenuto principale dei documenti caricati?");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    if (!question.trim()) return;
    setLoading(true); setError(""); setAnswer(""); setSources([]);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rag_token") : null;
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-[22px] font-semibold tracking-tight">Chat RAG</h1>
      <p className="text-sm text-muted">Poni domande sul contenuto dei documenti indicizzati. La risposta cita le fonti.</p>

      <div className="border border-line rounded-lg p-4 bg-white space-y-3">
        <label className="text-sm font-medium">Domanda</label>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={3} className="w-full border border-line rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
        <div className="flex gap-3">
          <button onClick={ask} disabled={loading} className="px-4 py-2 bg-ink text-white text-sm rounded disabled:opacity-40">
            {loading ? "Cerco..." : "Chiedi"}
          </button>
          <span className="text-xs text-muted self-center font-mono">{API_BASE}</span>
        </div>
        {error && <p className="text-sm text-red-600 font-mono whitespace-pre-wrap">{error}</p>}
      </div>

      {answer && (
        <div className="border border-line rounded-lg p-5 bg-white">
          <h2 className="text-sm font-semibold mb-2">Risposta</h2>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>
          {sources.length>0 && (
            <div className="mt-5 border-t border-line pt-4">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Fonti ({sources.length})</h3>
              <ul className="space-y-2">
                {sources.map((s,i)=>(
                  <li key={i} className="text-xs border border-line rounded p-3 bg-slate-50">
                    <span className="font-mono font-medium">{s.filename} · chunk {s.chunk_index} · score {s.score.toFixed(3)}</span>
                    <p className="mt-1 text-muted leading-relaxed">{s.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
