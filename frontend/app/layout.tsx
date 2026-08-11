import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RAG Portal — Document Chat",
  description: "Upload, indicizza e interroga i tuoi documenti con RAG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Acceptance: frontend mostra in console il valore di API_BASE dopo la build
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  return (
    <html lang="it">
      <body className="min-h-screen antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("[RAG] API_BASE =", ${JSON.stringify(apiBase)});`,
          }}
        />
        <header className="border-b border-line sticky top-0 bg-white/90 backdrop-blur z-10">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight text-ink text-[15px]">
              RAG Portal <span className="text-muted font-normal">— documenti → risposte</span>
            </a>
            <nav className="flex gap-4 text-sm">
              <a className="hover:underline" href="/">Upload</a>
              <a className="hover:underline" href="/chat">Chat</a>
              <a className="hover:underline" href="/admin">Admin</a>
              <a className="hover:underline" href="/login">Login</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
        <footer className="max-w-6xl mx-auto px-5 py-10 text-xs text-muted border-t border-line mt-12">
          API: <span className="font-mono">{apiBase}</span> — usa <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code> per puntare al backend.
        </footer>
      </body>
    </html>
  );
}
