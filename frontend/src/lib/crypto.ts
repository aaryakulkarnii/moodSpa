const KEY_PREFIX = "moodspa_key_";

async function getOrCreateKey(sessionId: string): Promise<CryptoKey> {
  const stored = localStorage.getItem(KEY_PREFIX + sessionId);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exported = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(KEY_PREFIX + sessionId, btoa(String.fromCharCode(...new Uint8Array(exported))));
  return key;
}

export async function encryptText(sessionId: string, plaintext: string): Promise<string> {
  const key = await getOrCreateKey(sessionId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptText(sessionId: string, encoded: string): Promise<string> {
  try {
    const key = await getOrCreateKey(sessionId);
    const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plaintext);
  } catch {
    // Old unencrypted message — return as-is
    return encoded;
  }
}