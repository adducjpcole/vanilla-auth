import * as auth from '@/auth.js';

if (auth.getCurrentUser()) {
  document.location.href = import.meta.resolve('../');
} else {
  document.documentElement.style.visibility = 'visible';
}
