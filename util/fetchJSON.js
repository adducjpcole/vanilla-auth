/**
 * @param {RequestInfo | URL} url
 * @returns {Promise<object>}
 */
export default async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.url}`);
  return res.json();
}
