import * as auth from '@/auth.js';

if (auth.getCurrentUser()) {
  document.location.href = '/';
} else {
  document.documentElement.style.visibility = 'visible';
}
