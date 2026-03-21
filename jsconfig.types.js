/** @file */
/** @global */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} image
 * @property {string} creationAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} title
 * @property {string} slug
 * @property {number} price
 * @property {string} description
 * @property {Category} category
 * @property {string[]} images
 * @property {string} creationAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 */

/**
 * @typedef {CustomEvent<{ id: number }>} AddToCartEvent
 */
