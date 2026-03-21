/** @type {any} */
const $priceRange = document.querySelector('#price-range');
console.log($priceRange);

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
  $productsDisplay.innerHTML = '';
  $prevPage.disabled = true;
  $nextPage.disabled = true;

  const res = await fetch(
    `https://api.escuelajs.co/api/v1/products?offset=${
      getPage() * 25
    }&limit=25&categoryId=${getCategoryId()}`,
  );
  if (!res.ok) throw new Error('not ok');
  /** @type {Product[]} */
  const prodList = await res.json();
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
  $productsDisplay.append(frag);
  $prevPage.disabled = getPage() === 0;
  $nextPage.disabled = prodList.length !== 25;
}

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

render();

$category.addEventListener('change', () => {
  setCategoryId($category.value);
});

$prevPage.addEventListener('click', () => {
  setPage(getPage() - 1);
});

$nextPage.addEventListener('click', () => {
  setPage(getPage() + 1);
});

export { getCategoryId, getPage };
