/**
 * @typedef {{email: string, password: string, username: string}} User
 */

/** @type {User[]} */
const users = JSON.parse(localStorage.getItem('users') || '[]');

/**
 * Adds a user into users table
 *
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns True if successful and false if there's someone has the same email
 */
export function signup(username, email, password) {
  const same = users.find((value) => value.email === email);
  if (same !== undefined) return false;

  users.push({
    username,
    email,
    password,
  });
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

const homeUrl = new URL('../', import.meta.url);

/**
 * Returns user if it exists in users table
 *
 * @param {string} email
 * @param {string} password
 */
export function login(email, password) {
  const user = users.find(
    (value) => value.email === email && value.password === password,
  );

  if (user === undefined) return null;

  localStorage.setItem('currentUser', JSON.stringify(user));

  document.location.href =
    localStorage.getItem('redirectAfterLogin') || homeUrl.href;

  return structuredClone(user);
}

const initiallyHadRedirectAfterLogin =
  localStorage.getItem('redirectAfterLogin') !== null;
window.addEventListener('unload', () => {
  if (initiallyHadRedirectAfterLogin)
    localStorage.removeItem('redirectAfterLogin');
});

/**
 * Returns current session's user
 *
 * @returns {User|null}
 */
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

/**
 * Deletes current user and returns `true` if successful
 */
export function logout() {
  let currentUser = getCurrentUser();
  if (currentUser === null) return false;

  localStorage.removeItem('currentUser');
  return true;
}
