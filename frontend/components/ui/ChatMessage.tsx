import { Badge } from "./Badge";

export function ChatMessage({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <div className="h-7 w-7 rounded-[8px] bg-accent-soft border border-line grid place-items-center text-[11px] font-semibold text-accent flex-shrink-0">AI</div>}
      <div className={`max-w-[75%] rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${isUser ? "bg-ink text-white border-ink" : "bg-white border-line text-ink shadow-card"}`}>
        {children}
      </div>
      {isUser && <div className="h-7 w-7 rounded-full bg-ink text-white grid place-items-center text-[11px] font-semibold flex-shrink-0">Tu</div>}
    </div>
  );
}

export function SourceCard({ filename, chunk, score, text }: { filename: string; chunk: number; score: number; text: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-2 text-[11px] font-mono">
        <Badge tone="neutral">{filename}</Badge>
        <span className="text-muted">chunk {chunk}</span>
        <span className="ml-auto text-accent font-medium">score {score.toFixed(3)}</span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink/80 line-clamp-4">{text}</p>
    </div>
  );
}
