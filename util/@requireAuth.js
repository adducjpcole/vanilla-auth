import * as auth from '@/auth.js';

if (!auth.getCurrentUser()) {
  document.location.href = '/login/';
} else {
  window.addEventListener('beforeunload', () => auth.logout());

  document.documentElement.style.visibility = 'visible';
}
