import showToast from '@/showToast.js';
import DualRangeInput from './components/DualRangeInput/index.js';
import ProductDisplay from './components/ProductDisplay/index.js';
import {
  addToCart,
  findItemIndex,
  getItem,
  setItemQuantityByIndex,
} from '@/Cart.js';

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
      elem.innerText = category.name.toUpperCase();

      frag.appendChild(elem);
    });

    $category.appendChild(frag);
  });

/** @type {HTMLSpanElement} */
const $productsStart = document.querySelector('#products-start');
/** @type {HTMLSpanElement} */
const $productsEnd = document.querySelector('#products-end');
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

/** @type {HTMLButtonElement} */
const $prevPage = document.querySelector('#prev-page');
/** @type {HTMLButtonElement} */
const $nextPage = document.querySelector('#next-page');

/** @type {DualRangeInput} */
const $priceRange = document.querySelector('#price-range');

/** @type {HTMLParagraphElement} */
const $valueMinPrice = document.querySelector('#value-min-price');
/** @type {HTMLParagraphElement} */
const $valueMaxPrice = document.querySelector('#value-max-price');

async function render() {
  const priceRange = getPriceRange();

  $productsDisplay.innerHTML = `<img src="./public/loader-circle [rose-500].png" class="animate-spin">`;
  $prevPage.disabled = true;
  $nextPage.disabled = true;
  $valueMinPrice.innerText = `$${priceRange.minPrice}`;
  $valueMaxPrice.innerText = `$${priceRange.maxPrice}`;

  /** @type {Product[]} */
  let prodList;

  try {
    // Doesn't play nicely with 0 for some reason
    const res = await fetch(
      `https://api.escuelajs.co/api/v1/products?offset=${
        getPage() * 25
      }&limit=25&categoryId=${getCategoryId()}&price_min=${
        priceRange.minPrice > 0 ? priceRange.minPrice : Number.EPSILON
      }&price_max=${priceRange.maxPrice > 0 ? priceRange.maxPrice : Number.EPSILON}`,
    );
    prodList = await res.json();
  } catch (err) {
    throw err;
  }

  const frag = document.createDocumentFragment();

  prodList.forEach((prod) => {
    const elem = document.createElement('product-display');
    elem.setAttribute('prod-id', `${prod.id}`);
    elem.setAttribute('prod-title', prod.title);
    elem.setAttribute('price', `${prod.price}`);
    elem.setAttribute('image', prod.images[0]);
    frag.append(elem);
  });

  $productsStart.innerText = `${prodList.length > 0 ? getPage() * 25 + 1 : 0}`;
  $productsEnd.innerText = `${getPage() * 25 + prodList.length}`;
  $productsDisplay.innerHTML = '';
  $productsDisplay.append(frag);
  $prevPage.disabled = getPage() === 0;
  $nextPage.disabled = prodList.length !== 25;
}

const [setPriceRange, getPriceRange] = (() => {
  let minPrice = Number.parseFloat($priceRange.getAttribute('value-min'));
  let maxPrice = Number.parseFloat($priceRange.getAttribute('value-max'));

  return [
    (/** @type {number} */ min, /** @type {number} */ max) => {
      minPrice = min;
      maxPrice = max;

      render();
    },
    () => {
      return { minPrice, maxPrice };
    },
  ];
})();

const [setCategoryId, getCategoryId] = (() => {
  let categoryId = '';

  return [
    (/** @type {string} */ value) => {
      categoryId = value;
      setPage(0);
    },
    () => categoryId,
  ];
})();

const [setPage, getPage] = (() => {
  let page = 0;

  return [
    async (/** @type {number} */ value) => {
      if (value < 0 || (value > page && $nextPage.disabled)) return;
      page = value;

      render();
    },
    () => {
      return page;
    },
  ];
})();

$priceRange.addEventListener('change', () => {
  setPriceRange(
    Number.parseFloat($priceRange.getAttribute('real-value-min')),
    Number.parseFloat($priceRange.getAttribute('real-value-max')),
  );
});

$category.addEventListener('change', () => {
  setCategoryId($category.value);
});

$prevPage.addEventListener('click', () => {
  setPage(getPage() - 1);
});

$nextPage.addEventListener('click', () => {
  setPage(getPage() + 1);
});

render();

export { getCategoryId, getPage };
