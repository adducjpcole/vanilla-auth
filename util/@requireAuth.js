import * as auth from '@/auth.js';

if (!auth.getCurrentUser()) {
  document.location.href = import.meta.resolve('../login/');
} else {
  document.documentElement.style.visibility = 'visible';
}
