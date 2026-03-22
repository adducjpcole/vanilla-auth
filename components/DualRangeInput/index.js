import getHTMLTemplate from '@/getHTMLTemplate.js';

/**
 * Special thanks to Stanko for https://github.com/Stanko/dual-range-input
 *
 * I don't understand the math behind it (apart from that it is the midpoint)
 * but it works.
 */
export default class DualRangeInput extends HTMLElement {
  static observedAttributes = [
    'min',
    'max',
    'step',
    'precision',
    'in-min',
    'in-max',
    'disabled',
    'name-min',
    'name-max',
    'aria-label-min',
    'aria-label-max',
  ];

  #isInitialized = false;
  #isBound = false;

  constructor() {
    super();

    this.precision = 3;

    // These decide how midpoint is rounded
    this.updateFloor = () => this.#update('floor');
    this.updateCeil = () => this.#update('ceil');

    // Bubble change event outside shadow DOM
    this.onChange = () => {
      this.dispatchEvent(
        new Event('change', {
          bubbles: true,
          composed: true,
        }),
      );
    };
  }

  async connectedCallback() {
    await this.#build();
    this.#syncFromAttributes();
    this.#bind();
    this.#update();

    this.$min.dataset.ready = 'true';
    this.$max.dataset.ready = 'true';
  }

  #bind() {
    if (this.#isBound) return;

    this.$min.addEventListener('input', this.updateCeil);
    this.$max.addEventListener('input', this.updateFloor);

    this.$min.addEventListener('focus', this.updateCeil);
    this.$max.addEventListener('focus', this.updateFloor);

    this.$min.addEventListener('mousedown', this.updateCeil);
    this.$max.addEventListener('mousedown', this.updateFloor);

    this.$min.addEventListener('touchstart', this.updateCeil, {
      passive: true,
    });
    this.$max.addEventListener('touchstart', this.updateFloor, {
      passive: true,
    });

    this.$min.addEventListener('change', this.onChange);
    this.$max.addEventListener('change', this.onChange);

    this.#isBound = true;
  }

  disconnectedCallback() {
    if (!this.#isBound) return;

    this.$min.removeEventListener('input', this.updateCeil);
    this.$max.removeEventListener('input', this.updateFloor);

    this.$min.removeEventListener('focus', this.updateCeil);
    this.$max.removeEventListener('focus', this.updateFloor);

    this.$min.removeEventListener('mousedown', this.updateCeil);
    this.$max.removeEventListener('mousedown', this.updateFloor);

    this.$min.removeEventListener('touchstart', this.updateCeil);
    this.$max.removeEventListener('touchstart', this.updateFloor);

    this.$min.removeEventListener('change', this.onChange);
    this.$max.removeEventListener('change', this.onChange);

    this.#isBound = false;
  }

  attributeChangedCallback() {
    if (!this.#isInitialized) return;
    this.#syncFromAttributes();
    this.#update();
  }

  async #build() {
    if (this.#isInitialized) return;

    const tpl = await getHTMLTemplate(import.meta.resolve('./template.html'));
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    /** @type {HTMLInputElement} */
    this.$min = this.shadowRoot.querySelector('#min');
    /** @type {HTMLInputElement} */
    this.$max = this.shadowRoot.querySelector('#max');

    this.#isInitialized = true;
  }

  #syncFromAttributes() {
    this.precision = this.#getNumberAttr('precision', this.precision);

    const min = this.#getAttr('min', '0');
    const max = this.#getAttr('max', '100');
    const step = this.#getAttr('step', '1');

    this.$min.min = min;
    this.$max.max = max;

    this.$min.step = step;
    this.$max.step = step;

    const valueMin = this.#getAttr('value-min', min);
    if (valueMin < min) this.setAttribute('value-min', min);

    const valueMax = this.#getAttr('value-max', max);
    if (valueMax > max) this.setAttribute('value-max', max);

    this.$min.value = valueMin;
    this.$max.value = valueMax;

    if (this.hasAttribute('disabled')) {
      this.$min.disabled = true;
      this.$max.disabled = true;
    } else {
      this.$min.disabled = false;
      this.$max.disabled = false;
    }

    const nameMin = this.#getAttr('name-min');
    const nameMax = this.#getAttr('name-max');
    if (nameMin !== null) this.$min.name = nameMin;
    if (nameMax !== null) this.$max.name = nameMax;

    const ariaLabelMin = this.#getAttr('aria-label-min');
    const ariaLabelMax = this.#getAttr('aria-label-max');
    if (ariaLabelMin !== null)
      this.$min.setAttribute('aria-label', ariaLabelMin);
    if (ariaLabelMax !== null)
      this.$max.setAttribute('aria-label', ariaLabelMax);
  }

  /**
   * @param {"ceil"|"floor"} method
   */
  #update(method = 'ceil') {
    const min = parseFloat(this.$min.min);
    const max = parseFloat(this.$max.max);
    const step = parseFloat(this.$min.step) || 1;
    const minValue = parseFloat(this.$min.value);
    const maxValue = parseFloat(this.$max.value);

    const midValue = (maxValue - minValue) / 2;
    const mid = minValue + Math[method](midValue / step) * step;

    const range = max - min;

    const leftWidth = (((mid - min) / range) * 100).toFixed(this.precision);
    const rightWidth = (((max - mid) / range) * 100).toFixed(this.precision);

    this.$min.style.flexBasis = `calc(${leftWidth}% + var(--dri-thumb-width))`;
    this.$max.style.flexBasis = `calc(${rightWidth}% + var(--dri-thumb-width))`;

    this.$min.max = mid.toFixed(this.precision);
    this.$max.min = mid.toFixed(this.precision);

    const minFill = (minValue - min) / (mid - min) || 0;
    const maxFill = (maxValue - mid) / (max - mid) || 0;

    const minFillPercentage = (minFill * 100).toFixed(this.precision);
    const maxFillPercentage = (maxFill * 100).toFixed(this.precision);

    const minFillThumb = (0.5 - minFill).toFixed(this.precision);
    const maxFillThumb = (0.5 - maxFill).toFixed(this.precision);

    this.$min.style.setProperty(
      '--dri-gradient-position',
      `calc(${minFillPercentage}% + (${minFillThumb} * var(--dri-thumb-width)))`,
    );

    this.$max.style.setProperty(
      '--dri-gradient-position',
      `calc(${maxFillPercentage}% + (${maxFillThumb} * var(--dri-thumb-width)))`,
    );

    this.setAttribute('real-value-min', this.$min.value);
    this.setAttribute('real-value-max', this.$max.value);
  }

  /**
   * @param {string} name
   */
  #getAttr(name, fallback = '') {
    const raw = this.getAttribute(name);
    return raw === null || raw === '' ? fallback : raw;
  }

  /**
   * @param {string} name
   */
  #getNumberAttr(name, fallback = 0) {
    const raw = this.getAttribute(name);
    const num = raw === null ? NaN : Number(raw);
    return Number.isFinite(num) ? num : fallback;
  }
}

customElements.define('dual-range-input', DualRangeInput);
