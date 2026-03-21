import './product-display.js';
import * as auth from '@/auth.js';

if (auth.getCurrentUser()) {
  // If user is authenticated:
  [...document.getElementsByClassName('@unauth')].forEach((v) => v.remove());

  document.getElementById('logout').addEventListener('click', () => {
    auth.logout();

    location.reload();
  });

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

{
  let dropdownBtn = document.getElementById('dropdown1-btn');

  for (let i = 1; dropdownBtn !== null; i++) {
    const dropdownMenu = document.getElementById(`dropdown${i}-menu`);
    dropdownBtn.addEventListener('click', () => {
      dropdownMenu.classList.toggle('hidden');
    });

    dropdownBtn = document.getElementById(`dropdown${i + 1}-btn`);
  }
}
