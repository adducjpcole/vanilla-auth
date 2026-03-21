import * as auth from '@/auth.js';

{
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');

  dropdownBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });
}

{
  /**
   * @param {number} page
   * @returns {Promise<Product[]>}
   */
  async function getProducts(page) {
    return fetch(
      `https://api.escuelajs.co/api/v1/products?offset=${page * 25}&limit=25`,
    )
      .then((res) => res.json())
      .then((json) => {
        return json;
      });
  }

  /** @type {HTMLSpanElement} */
  const $productsStart = document.querySelector('#products-start');
  /** @type {HTMLSpanElement} */
  const $productsEnd = document.querySelector('#products-end');
  const $productsDisplay = document.querySelector('#product-displays');
  /** @type {HTMLButtonElement} */
  const $prevPage = document.querySelector('#prev-page');
  /** @type {HTMLButtonElement} */
  const $nextPage = document.querySelector('#next-page');

  const [setCurPage, getCurPage] = (() => {
    let page = 0;

    return [
      (/** @type {number} */ newPage) => {
        if (newPage < 0 || (newPage > page && $nextPage.disabled)) return;

        $productsDisplay.innerHTML = '';
        $prevPage.disabled = true;
        $nextPage.disabled = true;
        page = newPage;

        getProducts(newPage).then((prodList) => {
          const frag = document.createDocumentFragment();

          prodList.forEach((prod) => {
            const elem = document.createElement('product-display');
            elem.setAttribute('prod-id', `${prod.id}`);
            elem.setAttribute('prod-title', prod.title);
            elem.setAttribute('price', `${prod.price}`);
            elem.setAttribute('image', prod.images[0]);
            frag.append(elem);
          });

          $productsStart.innerText = `${newPage * 25 + 1}`;
          $productsEnd.innerText = `${newPage * 25 + prodList.length}`;
          $productsDisplay.append(frag);
          $prevPage.disabled = page === 0;
          $nextPage.disabled = prodList.length !== 25;
        });
      },
      () => {
        return page;
      },
    ];
  })();
  setCurPage(0);

  $prevPage.addEventListener('click', () => {
    setCurPage(getCurPage() - 1);
  });

  $nextPage.addEventListener('click', () => {
    setCurPage(getCurPage() + 1);
  });
}

if (auth.getCurrentUser()) {
  // If user is authenticated:
  [...document.getElementsByClassName('@unauth')].forEach((v) => v.remove());

  document.getElementById('logout').addEventListener('click', () => {
    auth.logout();

    location.reload();
  });

  {
    const usernameDisplays = document.getElementsByClassName('$username');
    for (let i = 0; i < usernameDisplays.length; i++) {
      const elem = usernameDisplays.item(i);
      elem.textContent = auth.getCurrentUser().username;
    }

    const emailDisplays = document.getElementsByClassName('$email');
    for (let i = 0; i < emailDisplays.length; i++) {
      const elem = emailDisplays.item(i);
      elem.textContent = auth.getCurrentUser().email;
    }
  }
} else {
  // Else, if user is unauthenticated:
  [...document.getElementsByClassName('@auth')].forEach((v) => v.remove());

  document.getElementById('signup').addEventListener('click', () => {
    document.location.href = '/signup/';
  });

  document.getElementById('login').addEventListener('click', () => {
    document.location.href = '/login/';
  });
}
