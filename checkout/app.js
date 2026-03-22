import { getCurrentUser } from '@/auth.js';
import { addCartChangeListener, getCart, removeAll } from '@/Cart.js';
import showToast from '@/showToast.js';

{
  const frag = document.createDocumentFragment();
  for (const cartItem of getCart()) {
    const elem = document.createElement('cart-item-display');
    elem.setAttribute('item-id', cartItem.id.toString());

    frag.append(elem);
  }
  document.getElementById('cart-item-displays').append(frag);
}

let total = 0;

{
  const $total = document.getElementById('total');
  function renderTotal() {
    total = getCart().reduce((pv, cv) => pv + cv.price * cv.quantity, 0);
    $total.textContent = total.toString();
  }
  renderTotal();

  addCartChangeListener(renderTotal);
}

{
  const $placeOrder = /** @type {HTMLButtonElement} */ (
    document.getElementById('place-order')
  );

  $placeOrder.addEventListener('click', async () => {
    const cart = getCart();

    if (cart.length === 0) {
      showToast("There's nothing in your cart.");
      return;
    }

    const user = getCurrentUser();
    if (user === null) {
      showToast('Please log in to place your order.');

      localStorage.setItem(
        'redirectAfterLogin',
        import.meta.resolve('../checkout/'),
      );

      $placeOrder.disabled = true;

      setTimeout(() => {
        document.location.href = import.meta.resolve('../login/');
      }, 1200);
      return;
    }

    const payload = {
      user,
      cart,
      total,
      date: new Date(),
    };

    $placeOrder.disabled = true;

    await new Promise((res) => {
      setTimeout(() => res(), 1000 + 7000 * Math.random());
    });

    $placeOrder.disabled = false;
    localStorage.setItem('payload', JSON.stringify(payload));

    const outcome = Math.random();
    if (outcome <= 0.5) {
      showToast('Something went wrong. Please try again.');
    } else {
      showToast('Order placed!');
      removeAll();
    }
  });
}
