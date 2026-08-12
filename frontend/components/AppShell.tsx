"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* Icons — stroke 1.6, no fill, no emoji, no lucide rounded square */
function IFile(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M7 3.6h6l4.8 4.8V20a1.6 1.6 0 0 1-1.6 1.6H7A1.6 1.6 0 0 1 5.4 20V5.2A1.6 1.6 0 0 1 7 3.6Z" />
      <path d="M13 3.6v5.2H18.2" />
      <path d="M9 13.2h6M9 16.2h4.5" />
    </svg>
  );
}
function IChat(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M7.5 7.5h9M7.5 11.5h5.5M6.2 18.2l1.1-2.6A2 2 0 0 0 7 14V7.2A2 2 0 0 1 9 5.2h8a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H9.4L6.2 18.2Z" />
    </svg>
  );
}
function IShield(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M12 3.4l7 2.9v5.2c0 3.3-2.2 6.1-7 7.1-4.8-.9-7-3.8-7-7.1V6.3l7-2.9Z" />
      <path d="M9.2 12.1l1.8 1.8 3.8-3.8" />
    </svg>
  );
}
function IUser(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M12 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M5.2 18.6a6.8 6.8 0 0 1 13.6 0" />
    </svg>
  );
}
function IMenu(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
      <path d="M5 7.5h14M5 12h14M5 16.5h14" />
    </svg>
  );
}
function IClose(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const nav = [
  { href: "/", label: "Documenti", sub: "Upload e indicizzazione", icon: IFile },
  { href: "/chat", label: "Chat", sub: "Interroga i documenti", icon: IChat },
  { href: "/admin", label: "Sistema", sub: "Stato indici e storage", icon: IShield },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const apiBase = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000" : "http://localhost:8000";

  return (
    <div className="min-h-screen bg-white">
      {open && (
        <button aria-label="Chiudi menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px] lg:hidden" />
      )}

      {/* Sidebar — 272px, premium, no purple, no glass */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[272px] bg-white border-r border-line flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-[64px] px-5 flex items-center justify-between border-b border-line">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[8px] bg-ink flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-[2px] bg-white" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-white/40 -ml-1 mt-1" />
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-semibold tracking-tight text-ink">RAG Portal</div>
              <div className="text-[10px] tracking-widest uppercase text-muted font-medium">Intelligence</div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 -mr-2 text-muted hover:text-ink">
            <IClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="px-2 pb-2 text-[10px] font-semibold tracking-widest uppercase text-muted">Workspace</div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors ${
                    active ? "bg-ink text-white" : "text-ink hover:bg-surface"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-muted group-hover:text-ink"}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-medium leading-none ${active ? "text-white" : "text-ink"}`}>{item.label}</div>
                    <div className={`text-[11px] leading-none mt-1 ${active ? "text-white/60" : "text-muted"}`}>{item.sub}</div>
                  </div>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white/90" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 px-2">
            <div className="rounded-xl border border-line bg-surface p-3">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-muted">Flusso</div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-ink">
                <span className="h-6 w-6 rounded-full bg-white border border-line grid place-items-center text-[10px]">1</span>
                <span className="h-px flex-1 bg-line" />
                <span className="h-6 w-6 rounded-full bg-white border border-line grid place-items-center text-[10px]">2</span>
                <span className="h-px flex-1 bg-line" />
                <span className="h-6 w-6 rounded-full bg-ink text-white grid place-items-center text-[10px]">3</span>
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted">
                <span>Upload</span>
                <span>Indicizza</span>
                <span>Chat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-line space-y-3">
          <Link href="/login" className="flex items-center gap-3 rounded-[10px] border border-line bg-white px-3 py-2.5 hover:bg-surface">
            <span className="h-8 w-8 rounded-full bg-ink text-white grid place-items-center text-xs font-semibold">D</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-ink leading-none">Demo account</div>
              <div className="text-[11px] text-muted truncate">demo@rag.local</div>
            </div>
            <span className="text-[11px] font-medium text-accent">Entra →</span>
          </Link>
          <div className="rounded-lg bg-ink text-white p-3">
            <div className="text-[12px] font-medium">Serve aiuto?</div>
            <div className="text-[11px] text-white/70 mt-0.5">Documenti locali, risposte con citazioni.</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 h-[64px] bg-white/80 backdrop-blur border-b border-line supports-[backdrop-filter]:bg-white/75">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-ink">
                <IMenu className="h-6 w-6" />
              </button>
              <div className="min-w-0 hidden sm:block">
                <div className="text-[13px] font-medium tracking-tight text-ink">
                  {nav.find((n) => pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href)))?.label || "RAG Portal"}
                </div>
                <div className="text-[12px] text-muted truncate">RAG locale • indicizzazione TF-IDF • citazioni verificabili</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-muted">API</span>
                <span className="text-[11px] font-mono text-ink truncate max-w-[220px]" title={apiBase}>
                  {apiBase}
                </span>
              </div>
              <Link href="/admin" className="hidden sm:inline-flex h-9 items-center justify-center rounded-[10px] border border-line bg-white px-3 text-[13px] font-medium text-ink hover:bg-surface">
                Stato
              </Link>
              <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-[10px] bg-ink text-white px-4 text-[13px] font-medium hover:bg-[#151E32]">
                Accedi
              </Link>
            </div>
          </div>
        </header>

        <main className="bg-surface min-h-[calc(100vh-64px)]">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 lg:py-8">{children}</div>
          <footer className="max-w-4xl mx-auto px-4 lg:px-6 pb-8">
            <div className="border-t border-line pt-5 flex flex-col sm:flex-row gap-2 justify-between text-[11px] text-muted">
              <span>RAG Portal • Retrieval Augmented Generation • Dati locali, nessuna telemetria</span>
              <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
