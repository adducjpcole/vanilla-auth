export function generateTabName() {
  return 'tab-' + Math.random().toString(36).substr(2, 9);
}

export function removeRecentAuthTabIfCurrent() {
  if (window.name === localStorage.getItem('recentAuthTab'))
    localStorage.removeItem('recentAuthTab');
}
