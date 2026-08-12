"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconDocs(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5v4.5H18.5" />
      <path d="M8.5 12.5h7M8.5 16h5" />
    </svg>
  );
}
function IconChat(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M8 8.5h8M8 12h6M6 18.5l1.2-2.4A2 2 0 0 0 7 14V7A2 2 0 0 1 9 5h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.6L6 18.5Z" />
    </svg>
  );
}
function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 3.5l7 3v5.5c0 4-2.7 6.8-7 7.5-4.3-.7-7-3.5-7-7.5V6.5l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

const nav = [
  { href: "/", label: "Documenti", desc: "Upload e indicizzazione", icon: IconDocs },
  { href: "/chat", label: "Chat", desc: "Interroga i documenti", icon: IconChat },
  { href: "/admin", label: "Amministrazione", desc: "Stato indici e file", icon: IconShield },
  { href: "/login", label: "Accesso", desc: "Account demo", icon: IconUser },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const apiBase = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") : "";

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Chiudi menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-line bg-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-line">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ink flex items-center justify-center text-white text-[13px] font-semibold tracking-tight">
              RAG
            </div>
            <div className="leading-none">
              <div className="text-[14px] font-semibold tracking-tight text-ink">RAG Portal</div>
              <div className="text-[11px] text-muted tracking-wide">Document Intelligence</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 -mr-2 text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-medium tracking-widest text-muted uppercase">Menu</div>
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  active ? "bg-ink text-white" : "text-ink hover:bg-surface"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-white" : "text-muted"}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium leading-none ${active ? "text-white" : "text-ink"}`}>{item.label}</div>
                  <div className={`text-[11px] leading-none mt-1 ${active ? "text-white/70" : "text-muted"}`}>{item.desc}</div>
                </div>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="rounded-lg border border-line bg-surface p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide text-muted uppercase">Backend</span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-ink truncate" title={apiBase}>
              {apiBase || "http://localhost:8000"}
            </div>
            <div className="text-[11px] text-muted">NEXT_PUBLIC_API_BASE_URL</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[280px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-[64px] border-b border-line bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-ink">
                <IconMenu className="h-6 w-6" />
              </button>
              <div className="hidden lg:block">
                <div className="text-[13px] font-medium text-ink tracking-tight">
                  {nav.find((n) => n.href === pathname || (n.href !== "/" && pathname.startsWith(n.href)))?.label || "RAG Portal"}
                </div>
                <div className="text-[12px] text-muted hidden sm:block">Workspace locale • Tutti i dati restano sul dispositivo</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink hover:bg-surface">
                <span className="h-6 w-6 rounded-full bg-ink text-white grid place-items-center text-[11px] font-semibold">D</span>
                Demo
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-ink text-white lg:hidden">
                <IconUser className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="bg-surface min-h-[calc(100vh-64px)]">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">{children}</div>
          <footer className="max-w-5xl mx-auto px-4 lg:px-8 pb-10">
            <div className="border-t border-line pt-6 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-[12px] text-muted">
              <span>© RAG Portal • Retrieval Augmented Generation • Documenti locali, risposte contestuali</span>
              <span className="font-mono text-[11px]">API: {apiBase}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
