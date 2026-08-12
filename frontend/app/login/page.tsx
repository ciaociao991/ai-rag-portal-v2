"use client";
import { useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@rag.local");
  const [password, setPassword] = useState("demo1234");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Autenticazione in corso…");
    setOk(false);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
      localStorage.setItem("rag_token", data.access_token);
      localStorage.setItem("rag_user", email);
      setMsg(`Accesso riuscito — ruolo: ${data.role}. Token salvato, puoi usare Chat e Documenti.`);
      setOk(true);
    } catch (err: any) {
      setMsg("Errore: " + err.message);
      setOk(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <div className="space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Accesso demo • nessuna registrazione
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink leading-none">Bentornato</h1>
          <p className="text-[13px] leading-relaxed text-muted max-w-md">
            Accedi con l’account demo per caricare documenti e provare la chat RAG. L’autenticazione è locale e minima — il token resta nel browser.
          </p>
          <div className="rounded-xl border border-line bg-white p-4 flex gap-4">
            <div className="flex-1">
              <div className="text-[11px] tracking-widest uppercase font-medium text-muted">Demo</div>
              <div className="font-mono text-[12px] text-ink mt-1">demo@rag.local</div>
              <div className="font-mono text-[12px] text-muted">demo1234</div>
            </div>
            <div className="w-px bg-line" />
            <div className="flex-1">
              <div className="text-[11px] tracking-widest uppercase font-medium text-muted">Admin</div>
              <div className="font-mono text-[12px] text-ink mt-1">admin@rag.local</div>
              <div className="font-mono text-[12px] text-muted">admin1234</div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-muted">API: {API_BASE}</div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="text-[13px] font-semibold tracking-tight text-ink">Accedi</div>
            <div className="text-[12px] text-muted">Inserisci email e password demo</div>
          </CardHeader>
          <CardBody>
            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-ink">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@rag.local"
                  className="mt-1 w-full h-10 rounded-lg border border-line bg-white px-3 text-[13px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-ink">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full h-10 rounded-lg border border-line bg-white px-3 text-[13px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <Button type="submit" className="w-full">
                Entra
              </Button>
            </form>

            {msg && (
              <div className={`mt-4 rounded-lg border px-3 py-3 text-[12px] leading-relaxed whitespace-pre-wrap ${ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {msg}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-[12px]">
              <Link href="/" className="font-medium text-accent hover:text-[#0D5E56]">Vai ai documenti →</Link>
              <Link href="/chat" className="text-muted hover:text-ink">Apri chat</Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
