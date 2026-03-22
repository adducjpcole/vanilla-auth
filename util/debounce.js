/**
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {number} delay
 * @returns {(...args: Parameters<F>) => void}
 */
export default function debounce(fn, delay) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
