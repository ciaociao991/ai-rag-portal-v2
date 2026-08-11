export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

// Log after build/runtime (client + server)
if (typeof window !== "undefined") {
  console.log("[RAG] API_BASE =", API_BASE);
} else {
  console.log("[RAG] API_BASE (server) =", API_BASE);
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("rag_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = { ...(init.headers as Record<string, string>), ...authHeaders() };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}
