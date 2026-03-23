import showToast from '@/showToast.js';
import DualRangeInput from '../util/DualRangeInput/index.js';
import ProductDisplay from '../components/ProductDisplay/index.js';
import {
  addToCart,
  findItemIndex,
  getItem,
  setItemQuantityByIndex,
} from '@/Cart.js';
import debounce from '@/debounce.js';

/** @type {HTMLSelectElement} */
const $category = document.querySelector('#category');

fetch('https://api.escuelajs.co/api/v1/categories')
  .then((res) => res.json())
  .then((/** @type {Category[]} */ categories) => {
    const frag = document.createDocumentFragment();
    categories.forEach((category) => {
      const elem = document.createElement('option');
      elem.value = category.id.toString();
      elem.setAttribute('name', elem.value);
      elem.textContent = category.name.toUpperCase();

      frag.appendChild(elem);
    });

    $category.appendChild(frag);
  });

const $productsStart = /** @type {HTMLSpanElement} */ (
  document.querySelector('#products-start')
);
const $productsEnd = /** @type {HTMLSpanElement} */ (
  document.querySelector('#products-end')
);
const $productsDisplay = document.querySelector('#product-displays');

$productsDisplay.addEventListener(
  'addtocart',
  async (/** @type {AddToCartEvent} */ ev) => {
    const elem = /** @type {ProductDisplay} */ (ev.target);
    elem.setAttribute('adding-to-cart', '');

    const res = await fetch(
      `https://api.escuelajs.co/api/v1/products/${ev.detail.id}`,
    );
    /** @type {Product} */
    const prod = await res.json();

    const itemIdx = findItemIndex(prod.id);
    if (itemIdx !== -1) {
      setItemQuantityByIndex(itemIdx, getItem(itemIdx).quantity + 1);
    } else {
      addToCart({
        id: prod.id,
        name: prod.title,
        price: prod.price,
        quantity: 1,
      });
    }

    elem.removeAttribute('adding-to-cart');
    showToast('Added to cart!');
  },
);

const $prevPage = /** @type {HTMLButtonElement} */ (
  document.querySelector('#prev-page')
);
const $nextPage = /** @type {HTMLButtonElement} */ (
  document.querySelector('#next-page')
);
const $priceRange = /** @type {DualRangeInput} */ (
  document.querySelector('#price-range')
);
const $valueMinPrice = /** @type {HTMLParagraphElement} */ (
  document.querySelector('#value-min-price')
);
const $valueMaxPrice = /** @type {HTMLParagraphElement} */ (
  document.querySelector('#value-max-price')
);

const state = {
  page: 0,
  categoryId: '',
  priceRange: {
    min: Number.parseFloat($priceRange.getAttribute('value-min')),
    max: Number.parseFloat($priceRange.getAttribute('value-max')),
  },
};

/**
 * @param {number} value
 */
function setPage(value) {
  if (value < 0 || (value > state.page && $nextPage.disabled)) return;
  state.page = value;

  render();
}

/**
 * @param {string} value
 */
function setCategoryId(value) {
  state.categoryId = value;

  setPage(0);
  // render();
}

/**
 * @param {number} min
 * @param {number} max
 */
function setPriceRange(min, max) {
  state.priceRange.min = min;
  state.priceRange.max = max;

  render();
}

/**
 * @param {number} page
 * @param {string} categoryId
 * @param {{min: number, max: number}} price
 */
function buildProductURL(page, categoryId, price) {
  // Doesn't play nicely with 0 for some reason
  const params = new URLSearchParams({
    offset: (page * 25).toString(),
    limit: '25',
    categoryId,
    price_min: (price.min || Number.EPSILON).toString(),
    price_max: (price.max || Number.EPSILON).toString(),
  });

  return `https://api.escuelajs.co/api/v1/products?${params}`;
}

/**
 * @param {Product[]} products
 */
function createProductElements(products) {
  const frag = document.createDocumentFragment();

  products.forEach((prod) => {
    const elem = document.createElement('product-display');
    elem.setAttribute('prod-id', `${prod.id}`);
    elem.setAttribute('prod-title', prod.title);
    elem.setAttribute('price', `${prod.price}`);
    elem.setAttribute('image', prod.images[0]);

    frag.append(elem);
  });

  return frag;
}

let isRendered = true;
const debouncedRender = debounce(async () => {
  const res = await fetch(
    buildProductURL(state.page, state.categoryId, state.priceRange),
  );
  /** @type {Product[]} */
  const products = await res.json();

  if (products.length === 0 && state.page > 0) {
    setPage(state.page - 1);
    return;
  }

  $productsStart.textContent = `${products.length > 0 ? state.page * 25 + 1 : 0}`;
  $productsEnd.textContent = `${state.page * 25 + products.length}`;
  $productsDisplay.innerHTML = '';
  $productsDisplay.append(createProductElements(products));
  $prevPage.disabled = state.page === 0;
  $nextPage.disabled = products.length !== 25;
  isRendered = true;
}, 300);

function render() {
  if (isRendered) {
    $productsDisplay.innerHTML = `<img src="./public/loader-circle [rose-500].png" class="animate-spin">`;
    isRendered = false;
  }

  $prevPage.disabled = true;
  $nextPage.disabled = true;
  $valueMinPrice.textContent = `$${state.priceRange.min}`;
  $valueMaxPrice.textContent = `$${state.priceRange.max}`;

  debouncedRender();
}

$priceRange.addEventListener('input', () =>
  setPriceRange(
    Number.parseFloat($priceRange.getAttribute('real-value-min')),
    Number.parseFloat($priceRange.getAttribute('real-value-max')),
  ),
);
$category.addEventListener('change', () => setCategoryId($category.value));
$prevPage.addEventListener('click', () => setPage(state.page - 1));
$nextPage.addEventListener('click', () => setPage(state.page + 1));

render();

export default state;
