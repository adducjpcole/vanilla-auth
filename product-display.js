import DualRangeInput from './components/DualRangeInput/index.js';

/** @type {DualRangeInput} */
const $priceRange = document.querySelector('#price-range');

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
/** @type {HTMLButtonElement} */
const $prevPage = document.querySelector('#prev-page');
/** @type {HTMLButtonElement} */
const $nextPage = document.querySelector('#next-page');

async function render() {
  $prevPage.disabled = true;
  $nextPage.disabled = true;

  /** @type {Product[]} */
  let prodList;

  try {
    const priceRange = getPriceRange();

    // Doesn't play nicely with 0 for some reason
    const res = await fetch(
      `https://api.escuelajs.co/api/v1/products?offset=${
        getPage() * 25
      }&limit=25&categoryId=${getCategoryId()}&price_min=${
        priceRange.minPrice > 0 ? priceRange.minPrice : Number.EPSILON
      }&price_max=${priceRange.minPrice === priceRange.maxPrice ? Number.EPSILON : priceRange.maxPrice}`,
    );
    console.log(res.url);
    prodList = await res.json();
  } catch (err) {
    console.error('not ok');
    throw new err();
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
  let minPrice = 0;
  let maxPrice = Number.MAX_SAFE_INTEGER;

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

(async () => {
  try {
    let offset = 0;
    const limit = 50;
    let max = 0;

    while (true) {
      const res = await fetch(
        `https://api.escuelajs.co/api/v1/products?offset=${offset}&limit=${limit}`,
      );
      const products = await res.json();

      if (products.length === 0) break;

      for (const p of products) {
        if (p.price > max) max = p.price;
      }

      offset += limit;
    }

    const maxPriceDisplays = document.getElementsByClassName('$max-price');
    for (let i = 0; i < maxPriceDisplays.length; i++) {
      const elem = maxPriceDisplays.item(i);
      elem.textContent = `$${max}`;
    }

    $priceRange.setAttribute('max', max.toString());
    $priceRange.setAttribute('value-min', '0');
    $priceRange.setAttribute('value-max', max.toString());
  } catch {
    $priceRange.setAttribute('max', '1000');
  }
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
  const min = Number.parseFloat($priceRange.getAttribute('value-min'));
  const max = Number.parseFloat($priceRange.getAttribute('value-max'));

  setPriceRange(min, max);
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
