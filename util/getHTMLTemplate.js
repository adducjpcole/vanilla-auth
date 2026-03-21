/** @type {Map<RequestInfo | URL, Promise<DocumentFragment>>} */
const pool = new Map();

/**
 * @param {RequestInfo | URL} input
 */
export default async function getHTMLTemplate(input) {
  if (!pool.has(input)) {
    const templatePromise = fetch(input)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `Failed to load template: ${res.status} ${res.statusText}`,
          );

        return res.text();
      })
      .then((html) => {
        const tpl = document.createElement('template');
        tpl.innerHTML = html.trim();
        return tpl.content;
      });

    pool.set(input, templatePromise);
  }

  return pool.get(input);
}
