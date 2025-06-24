export function generateCodeVerifier(length = 128) {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2))
    .join("")
    .substring(0, length);
}

export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
