import * as auth from '@/auth.js';

const state = (() => {
  let __state__ = {
    email: '',
    password: '',
  };

  return {
    email: () => __state__.email,
    setEmail: (newState) => {
      __state__.email = newState;
    },
    password: () => __state__.password,
    setPassword: (newState) => {
      __state__.password = newState;
    },
    set: (newState) => {
      __state__ = { ...__state__, ...newState };
    },
  };
})();

const form = document.getElementsByTagName('form').item(0);
const loginError = document.getElementById('login-error');

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const elems = form.elements;

  state.set({
    email: /** @type {HTMLInputElement} */ (elems.namedItem('email')).value,
    password: /** @type {HTMLInputElement} */ (elems.namedItem('password'))
      .value,
  });

  const user = auth.login(state.email(), state.password());

  if (!user) {
    loginError.textContent = 'Invalid email or password';
    return;
  } else {
    loginError.textContent = '';
  }

  // User redirect is already done by `auth.login()`
});

document.getElementById('redirect-to-signup').addEventListener('click', () => {
  document.location.href = '../signup/';
});

document.getElementById('redirect-to-home').addEventListener('click', () => {
  document.location.href = '../';
});
