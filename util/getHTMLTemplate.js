/** @type {Map<RequestInfo | URL, Promise<HTMLTemplateElement>>} */
const pool = new Map();

/**
 * @param {RequestInfo | URL} input
 */
export default async function getHTMLTemplate(input) {
  if (!pool.has(input)) {
    const tplPromise = fetch(input)
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
        return tpl;
      });

    pool.set(input, tplPromise);
  }

  return pool.get(input);
}
