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
import fetchJSON from '@/fetchJson.js';

const PAGE_LIMIT = 25;

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

$category.addEventListener('change', () =>
  setState({ categoryId: $category.value, page: 0 }),
);

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

    /** @type {Product} */
    const prod = await fetchJSON(
      `https://api.escuelajs.co/api/v1/products/${ev.detail.id}`,
    );

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
  priceMin: Number.parseFloat($priceRange.getAttribute('value-min')),
  priceMax: Number.parseFloat($priceRange.getAttribute('value-max')),
  /** @type {Product[]|null} */
  products: null,
};

/**
 * @template {Partial<typeof state>} T
 * @param {T} patch
 */
function setState(patch) {
  if (
    patch.page &&
    (patch.page < 0 ||
      (patch.page > state.page && state.products.length <= PAGE_LIMIT))
  )
    patch.page = state.page;

  Object.assign(state, patch);
  render(state);
}

/**
 * @param {number} page
 * @param {string} categoryId
 * @param {number} priceMin
 * @param {number} priceMax
 */
function buildProductURL(page, categoryId, priceMin, priceMax) {
  // Use Number.EPSILON because it doesn't play nicely with 0 for some reason
  const params = new URLSearchParams({
    offset: (page * PAGE_LIMIT).toString(),
    limit: (PAGE_LIMIT + 1).toString(),
    categoryId,
    price_min: (priceMin || Number.EPSILON).toString(),
    price_max: (priceMax || Number.EPSILON).toString(),
  });

  return `https://api.escuelajs.co/api/v1/products?${params}`;
}

/**
 * @param {Product[]} products
 */
function createProductElements(products) {
  const frag = document.createDocumentFragment();

  products.forEach((prod, idx) => {
    if (idx === PAGE_LIMIT) return;

    const elem = document.createElement('product-display');
    elem.setAttribute('prod-id', `${prod.id}`);
    elem.setAttribute('prod-title', prod.title);
    elem.setAttribute('price', `${prod.price}`);
    elem.setAttribute('image', prod.images[0]);

    frag.append(elem);
  });

  return frag;
}

let requestId = 0;
const debouncedRender = debounce(
  /** @param {typeof state} state */ async (state) => {
    const id = ++requestId;

    state.products = await fetchJSON(
      buildProductURL(
        state.page,
        state.categoryId,
        state.priceMin,
        state.priceMax,
      ),
    );

    // Ignore old responses that replied late
    if (id !== requestId) return;

    $productsStart.textContent = `${state.products.length > 0 ? state.page * PAGE_LIMIT + 1 : 0}`;
    $productsEnd.textContent = `${state.page * PAGE_LIMIT + (state.products.length - 1)}`;
    $productsDisplay.innerHTML = '';
    $productsDisplay.append(createProductElements(state.products));
    $prevPage.disabled = state.page === 0;
    $nextPage.disabled = state.products.length !== PAGE_LIMIT;
  },
  300,
);

/**
 * @param {typeof state} state
 */
function render(state) {
  $prevPage.disabled = true;
  $nextPage.disabled = true;
  $valueMinPrice.textContent = `$${state.priceMin}`;
  $valueMaxPrice.textContent = `$${state.priceMax}`;

  debouncedRender(state);
}

$priceRange.addEventListener('input', () =>
  setState({
    priceMin: Number.parseFloat($priceRange.getAttribute('real-value-min')),
    priceMax: Number.parseFloat($priceRange.getAttribute('real-value-max')),
  }),
);
$prevPage.addEventListener('click', () => setState({ page: state.page - 1 }));
$nextPage.addEventListener('click', () => setState({ page: state.page + 1 }));

render(state);

export default state;
