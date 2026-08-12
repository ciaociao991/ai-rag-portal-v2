import "./globals.css";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "RAG Portal — Document Intelligence",
  description: "Upload, indicizza e interroga i tuoi documenti con RAG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  return (
    <html lang="it">
      <body className="min-h-screen antialiased bg-surface">
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("[RAG] API_BASE =", ${JSON.stringify(apiBase)});`,
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
