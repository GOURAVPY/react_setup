import { serverEnabled, serverUrl } from "../components/pixie/brain";

// Talks to the server's cloud browser (server/cloudBrowser.js): a real Chrome
// at Hyperbeam, for sites that won't show inside the Browser window.

const ENDPOINT = "/api/cloud-browser";

// is it switched on (a Hyperbeam key is set) with minutes left this month?
export const getCloudStatus = async () => {
  if (!serverEnabled) return { enabled: false };
  try {
    const response = await fetch(serverUrl(ENDPOINT));
    return response.ok ? await response.json() : { enabled: false };
  } catch {
    return { enabled: false };
  }
};

// starts a session at `url`, near the visitor ({ region, country, language }):
// { id, embedUrl, adminToken, endsAt }. Throws an Error whose .code says why
// not ("month", "visitor", "unavailable", "off").
export const startCloud = async (url, place = {}) => {
  const response = await fetch(serverUrl(ENDPOINT), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, ...place }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Cloud browser: ${data.error ?? response.status}`);
    error.code = data.error ?? "unavailable";
    throw error;
  }
  return data;
};

// ends a session; works even while the page is closing
export const endCloud = (id) => {
  const url = serverUrl(`${ENDPOINT}/end`);
  const body = JSON.stringify({ id });
  if (navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }))) return;
  fetch(url, { method: "POST", body, keepalive: true }).catch(() => {});
};

export const googleSearch = (query) =>
  `https://www.google.com/search?q=${encodeURIComponent(query)}`;
