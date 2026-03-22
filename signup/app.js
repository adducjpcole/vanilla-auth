import * as auth from '@/auth.js';

const state = (() => {
  let __state__ = {
    username: '',
    email: '',
    password: '',
  };

  return {
    username: () => __state__.username,
    setUsername: (newState) => {
      __state__.username = newState;
      render();
    },
    email: () => __state__.email,
    setEmail: (newState) => {
      __state__.email = newState;
      render();
    },
    password: () => __state__.password,
    setPassword: (newState) => {
      __state__.password = newState;
      render();
    },
    set: (newState) => {
      __state__ = { ...__state__, ...newState };
      render();
    },
  };
})();

const form = document.getElementsByTagName('form').item(0);
const usernameError = document.getElementById('username-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

let hasError = false;
function render() {
  // Assume `state` is trimmed
  hasError = false;

  if (state.username() === '') {
    usernameError.textContent = 'Username is required';
    hasError = true;
  } else if (state.username().trim() !== state.username()) {
    usernameError.textContent =
      'Username cannot have leading or trailing spaces';
    hasError = true;
  } else {
    usernameError.textContent = '';
  }

  if (state.email() === '') {
    emailError.textContent = 'Email is required';
    hasError = true;
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(state.email())
  ) {
    emailError.textContent = 'Invalid email format';
    hasError = true;
  } else if (state.email().trim() !== state.email()) {
    emailError.textContent = 'Email cannot have leading or trailing spaces';
    hasError = true;
  } else {
    emailError.textContent = '';
  }

  if (state.password() === '') {
    passwordError.textContent = 'Password is required';
    hasError = true;
  } else if (state.password().trim() !== state.password()) {
    passwordError.textContent =
      'Password cannot have leading or trailing spaces';
    hasError = true;
  } else {
    passwordError.textContent = '';
  }
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const elems = form.elements;

  state.set({
    username: /** @type {HTMLInputElement} */ (elems.namedItem('username'))
      .value,
    email: /** @type {HTMLInputElement} */ (elems.namedItem('email')).value,
    password: /** @type {HTMLInputElement} */ (elems.namedItem('password'))
      .value,
  });

  if (hasError) return;

  if (!auth.signup(state.username(), state.email(), state.password())) {
    emailError.textContent = 'Email already in-use';
    return;
  }

  document.location.href = '../login/';
});

document.getElementById('redirect-to-login').addEventListener('click', () => {
  document.location.href = '../login/';
});

document.getElementById('redirect-to-home').addEventListener('click', () => {
  document.location.href = '../';
});
