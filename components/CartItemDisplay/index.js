// Exported purely for static analysis purposes

import getHTMLTemplate from '@/getHTMLTemplate.js';
import * as Cart from '@/Cart.js';

export default class CartItemDisplay extends HTMLElement {
  static observedAttributes = ['item-id'];

  #isInitialized = false;
  #isBound = false;

  constructor() {
    super();

    this.itemId = -1;
    this.itemIdx = -1;
  }

  async connectedCallback() {
    await this.#build();
    this.#syncFromAttributes();
    this.#bind();
    this.#update();
  }

  #bind() {
    if (this.#isBound) return;

    Cart.addCartChangeListener(this.#onCartChange);
    this.$subQuantity.addEventListener('click', this.#subQuantity);
    this.$addQuantity.addEventListener('click', this.#addQuantity);

    this.#isBound = true;
  }

  disconnectedCallback() {
    if (!this.#isBound) return;

    Cart.removeCartChangeListener(this.#onCartChange);
    this.$subQuantity.removeEventListener('click', this.#subQuantity);
    this.$addQuantity.removeEventListener('click', this.#addQuantity);

    this.#isBound = false;
  }

  #onCartChange = () => {
    this.itemIdx = Cart.findItemIndex(this.itemId);
    if (this.itemIdx === -1) {
      this.remove();
      return;
    }

    this.#update();
  };

  #subQuantity = () => {
    const quant = Cart.getItem(this.itemIdx).quantity;
    if (quant === 1) {
      Cart.removeFromCartByIndex(this.itemIdx);
      return;
    }

    Cart.setItemQuantityByIndex(this.itemIdx, quant - 1);
  };

  #addQuantity = () => {
    const quant = Cart.getItem(this.itemIdx).quantity;
    Cart.setItemQuantityByIndex(this.itemIdx, quant + 1);
  };

  attributeChangedCallback() {
    if (!this.#isInitialized) return;
    this.#syncFromAttributes();
  }

  async #build() {
    if (this.#isInitialized) return;

    const tpl = await getHTMLTemplate(import.meta.resolve('./template.html'));
    this.appendChild(tpl.content.cloneNode(true));

    /** @type {HTMLParagraphElement} */
    this.$name = this.querySelector('#name');
    /** @type {HTMLSpanElement} */
    this.$price = this.querySelector('#price');
    this.$quantity = /** @type {[HTMLSpanElement, HTMLParagraphElement]} */ ([
      ...this.getElementsByClassName('$quantity'),
    ]);
    /** @type {HTMLButtonElement} */
    this.$subQuantity = this.querySelector('#sub-quantity');
    /** @type {HTMLButtonElement} */
    this.$addQuantity = this.querySelector('#add-quantity');
    /** @type {HTMLButtonElement} */
    this.$subtotal = this.querySelector('#subtotal');

    this.#isInitialized = true;
  }

  #update = () => {
    const item = Cart.getItem(this.itemIdx);

    this.$name.textContent = item.name;
    this.$price.textContent = item.price.toString();

    for (const $quantity of this.$quantity) {
      $quantity.textContent = item.quantity.toString();
    }

    const subtotal = (item.quantity * item.price).toString();
    this.$subtotal.textContent = subtotal;
  };

  #syncFromAttributes() {
    this.itemId = this.#getNumberAttr('item-id', -1);
    this.itemIdx = Cart.findItemIndex(this.itemId);
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

customElements.define('cart-item-display', CartItemDisplay);
