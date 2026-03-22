const $toastContainer = document.getElementById('toast-container');

/**
 * @param {string} message
 */
export default function showToast(message) {
  const $toast = document.createElement('div');

  $toast.className =
    'flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-white shadow-lg transition-all';
  $toast.textContent = message;

  $toastContainer.appendChild($toast);

  setTimeout(() => {
    $toast.classList.add('opacity-0', 'translate-y-2');

    setTimeout(() => {
      $toast.remove();
    }, 300);
  }, 2000);
}
