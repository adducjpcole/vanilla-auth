import * as Cart from '@/Cart.js';

{
  // init
  const $cartItemDisplays = document.getElementById('cart-item-displays');
  const cartItems = Cart.getCart();

  const frag = document.createDocumentFragment();
  for (const cartItem of cartItems) {
    const elem = document.createElement('cart-item-display');
    elem.setAttribute('item-id', cartItem.id.toString());

    frag.append(elem);
  }
  $cartItemDisplays.append(frag);
}

{
  const $total = document.getElementById('total');
  function renderTotal() {
    const cartItems = Cart.getCart();
    $total.innerText = cartItems
      .reduce((pv, cv) => pv + cv.price * cv.quantity, 0)
      .toString();
  }
  renderTotal();

  Cart.addCartChangeListener(renderTotal);
}
