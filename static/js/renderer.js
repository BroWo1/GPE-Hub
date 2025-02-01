// renderer.js
console.log('Preload loaded')
window.addEventListener('DOMContentLoaded', () => {
  const externalElements = document.querySelectorAll('[data-external-link]');

  externalElements.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();

      const url = element.getAttribute('data-external-link');
      console.log('Clicked element; window.electronAPI:', window.electronAPI);

      if (url) {
        // Log the function reference before calling it
        console.log('openExternalLink exists?', typeof window.electronAPI.openExternalLink);
        window.electronAPI.openExternalLink(url);
      } else {
        console.warn('No URL found for this element.');
      }
    });
  });
});
