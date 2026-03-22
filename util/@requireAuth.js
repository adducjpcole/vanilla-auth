import * as auth from '@/auth.js';

const loginUrl = new URL('../login/', import.meta.url);
if (!auth.getCurrentUser()) {
  document.location.href = loginUrl.href;
} else {
  document.documentElement.style.visibility = 'visible';
}
