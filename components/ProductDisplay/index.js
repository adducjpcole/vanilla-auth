// Exported purely for static analysis purposes

import getHTMLTemplate from '@/getHTMLTemplate.js';

export default class ProductDisplay extends HTMLElement {
  static observedAttributes = [
    'prod-id',
    'prod-title',
    'price',
    'image',
    'adding-to-cart',
  ];

  #isInitialized = false;
  #isBound = false;

  constructor() {
    super();

    this.prodId = -1;
    this.prodTitle = '';
    this.price = 0;
    this.image = '';
  }

  async connectedCallback() {
    await this.#build();
    this.#syncFromAttributes();
    this.#bind();
  }

  #bind() {
    if (this.#isBound) return;

    this.$addToCart.addEventListener('click', this.#dispatchAddToCart);

    this.#isBound = true;
  }

  disconnectedCallback() {
    if (!this.#isBound) return;

    this.$addToCart.removeEventListener('click', this.#dispatchAddToCart);

    this.#isBound = false;
  }

  /**
   * Usage:
   * ```js
   * document.querySelector("my-element")
   *   .addEventListener("addtocart", () => {
   *     console.log("Add to cart clicked!");
   *   });
   * ```
   */
  #dispatchAddToCart = () => {
    if (this.hasAttribute('adding-to-cart')) return;

    this.dispatchEvent(
      new CustomEvent('addtocart', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.prodId,
        },
      }),
    );
  };

  attributeChangedCallback() {
    if (!this.#isInitialized) return;
    this.#syncFromAttributes();
  }

  async #build() {
    if (this.#isInitialized) return;

    const tpl = await getHTMLTemplate(
      new URL('./template.html', import.meta.url),
    );
    this.appendChild(tpl.content.cloneNode(true));

    /** @type {HTMLParagraphElement} */
    this.$prodTitle = this.querySelector('#prod-title');
    /** @type {HTMLParagraphElement} */
    this.$price = this.querySelector('#price');
    /** @type {HTMLImageElement} */
    this.$image = this.querySelector('#image');
    /** @type {HTMLButtonElement} */
    this.$addToCart = this.querySelector('#add-to-cart');

    this.#isInitialized = true;
  }

  #loaderSrc = new URL(
    '../../public/loader-circle [rose-500].png',
    import.meta.url,
  );
  #addToCartSrc = new URL(
    '../../public/shopping-cart [rose-500].png',
    import.meta.url,
  );

  #syncFromAttributes() {
    this.prodId = this.#getNumberAttr('prod-id', this.prodId);
    this.prodTitle = this.#getAttr('prod-title', 'No Title Found');
    this.price = this.#getNumberAttr('price', this.price);
    this.image = this.#getAttr('image', this.image);

    this.$prodTitle.textContent = this.prodTitle;
    this.$price.textContent = `$${this.price}`;
    if (this.$image.src !== this.image) this.$image.src = this.image;

    const addToCart = /** @type {HTMLImageElement} */ (
      this.$addToCart.firstElementChild
    );

    if (this.hasAttribute('adding-to-cart')) {
      this.$addToCart.classList.add('animate-spin');
      addToCart.src = this.#loaderSrc.href;
    } else {
      this.$addToCart.classList.remove('animate-spin');
      addToCart.src = this.#addToCartSrc.href;
    }
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

customElements.define('product-display', ProductDisplay);
