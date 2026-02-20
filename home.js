import * as auth from './auth.js';

const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

dropdownBtn.addEventListener('click', () => {
  dropdownMenu.classList.toggle('hidden');
});

document.getElementById('redirect-to-login').addEventListener('click', () => {
  auth.logout();

  document.location.href = 'login.html';
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
