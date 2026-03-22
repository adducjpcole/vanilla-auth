/**
 * @type {CartItem[]}
 */
const cart = JSON.parse(localStorage.getItem('cart') || '[]');

/**
 * @type {Set<() => void>}
 */
const onCartChangeListeners = new Set();

/**
 * @param {CartItem} cartItem
 */
export function addToCart(cartItem) {
  cart.push(cartItem);
  localStorage.setItem('cart', JSON.stringify(cart));

  for (const listener of onCartChangeListeners) listener();
}

/**
 * @param {number} itemIdx
 */
export function removeFromCartByIndex(itemIdx) {
  const removedItem = cart.splice(itemIdx, 1)[0];
  localStorage.setItem('cart', JSON.stringify(cart));

  for (const listener of onCartChangeListeners) listener();
  return removedItem;
}

/**
 * @param {number} itemId
 * @returns Removed item or, if no item was removed, null.
 */
export function removeFromCart(itemId) {
  const idx = cart.findIndex((v) => v.id === itemId);
  if (idx === -1) return null;

  return removeFromCartByIndex(idx);
}

/**
 * @param {number} itemIdx
 * @param {number} quantity
 */
export function setItemQuantityByIndex(itemIdx, quantity) {
  cart[itemIdx].quantity = quantity;
  localStorage.setItem('cart', JSON.stringify(cart));

  for (const listener of onCartChangeListeners) listener();
}

/**
 * @param {number} itemId
 * @param {number} quantity
 */
export function setItemQuantity(itemId, quantity) {
  const idx = cart.findIndex((v) => v.id === itemId);
  if (idx === -1)
    throw new Error(`Failed to set quantity of item with id ${itemId}`);

  setItemQuantityByIndex(idx, quantity);
}

/**
 * @param {number} itemIdx
 */
export function getItem(itemIdx) {
  return cart[itemIdx];
}

export function getCart() {
  return [...cart];
}

/**
 * @param {number} itemId
 */
export function findItemIndex(itemId) {
  return cart.findIndex((v) => v.id === itemId);
}

/**
 * @param {() => void} listener
 */
export function addCartChangeListener(listener) {
  onCartChangeListeners.add(listener);
}

/**
 * @param {() => void} listener
 */
export function removeCartChangeListener(listener) {
  onCartChangeListeners.delete(listener);
}

export function getCartSize() {
  return cart.reduce((pv, cv) => pv + cv.quantity, 0);
}
