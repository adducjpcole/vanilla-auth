
/**
 * @typedef {{email: string, password: string, username: string}} User
 */

/** @type {User[]} */
let users = JSON.parse(localStorage.getItem("users") || "[]");
/** @type {User|null} */
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

/**
 * Adds a user into users table
 * 
 * @param {string} username
 * @param {string} email
 * @param {string} password
 */
export function signup(username, email, password) {
    /** @type {User} */
    const user = {
        username,
        email,
        password
    };

    users.push(user);

    localStorage.setItem("users", JSON.stringify(users));
}

/**
 * Returns user if it exists in users table
 *
 * @param {string} email
 * @param {string} password
 */
export function login(email, password) {
    const user = users.find((value) => value.email === email && value.password === password);

    if (user === undefined)
        return null;

    // document.location.href = "home.html";
    return structuredClone(user);
}

/**
 * Returns authenticated user
 *
 * @returns {User|null}
 */
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

/**
 * Deletes currentUser
 * 
 * @returns If currentUser existed
 */
export function logout() {
    if (currentUser) return false;

    currentUser = null;
    localStorage.removeItem("currentUser");

    return true;
}


