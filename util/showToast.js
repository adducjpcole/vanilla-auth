const toastContainer = document.getElementById('toast-container');

export default function showToast(message = 'Added to cart') {
  const toast = document.createElement('div');

  toast.className =
    'flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-white shadow-lg transition-all opacity-0 translate-y-2';

  toast.textContent = message;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}
