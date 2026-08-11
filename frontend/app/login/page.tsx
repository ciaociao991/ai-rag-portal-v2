"use client";
import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@rag.local");
  const [password, setPassword] = useState("demo1234");
  const [msg, setMsg] = useState("");

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Login...");
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
      setMsg(`Login ok — token salvato. Ruolo: ${data.role}`);
    } catch (err: any) {
      setMsg("Errore: " + err.message);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-[22px] font-semibold tracking-tight">Login</h1>
      <p className="text-sm text-muted">Account demo: <span className="font-mono">demo@rag.local / demo1234</span> e <span className="font-mono">admin@rag.local / admin1234</span></p>
      <form onSubmit={doLogin} className="border border-line rounded-lg p-5 bg-white space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 border border-line rounded p-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 border border-line rounded p-2 text-sm" />
        </div>
        <button type="submit" className="w-full py-2 bg-ink text-white rounded text-sm">Entra</button>
        {msg && <p className="text-xs font-mono bg-slate-50 border border-line rounded p-3 whitespace-pre-wrap">{msg}</p>}
      </form>
      <p className="text-xs text-muted font-mono">API: {API_BASE}</p>
    </div>
  );
}
