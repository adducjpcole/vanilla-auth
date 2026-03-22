import * as auth from '@/auth.js';

const homeUrl = new URL('../', import.meta.url);
if (auth.getCurrentUser()) {
  document.location.href = homeUrl.href;
} else {
  document.documentElement.style.visibility = 'visible';
}
