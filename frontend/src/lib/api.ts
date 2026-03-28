const BASE = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || "";

export async function sendMessage(
  message: string,
  sessionId: string,
  lang: string = "en-IN"
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId, lang }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Failed to get response");
  }
  if (!res.body) throw new Error("No response body");
  return res.body.getReader();
}

export async function loadHistory(sessionId: string): Promise<{ role: "user" | "assistant"; content: string }[]> {
  try {
    const res = await fetch(`${BASE}/api/conversation/${sessionId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch { return []; }
}

export async function clearHistory(sessionId: string): Promise<void> {
  await fetch(`${BASE}/api/conversation/${sessionId}`, { method: "DELETE" });
}