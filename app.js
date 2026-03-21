import * as auth from '@/auth.js';
import * as productDisplay from './product-display.js';

{
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');

  dropdownBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
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
