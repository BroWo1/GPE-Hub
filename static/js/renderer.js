// renderer.js
window.addEventListener('DOMContentLoaded', () => {
  // Select all elements with the data-external-link attribute
  const externalElements = document.querySelectorAll('[data-external-link]');

  externalElements.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default behavior if necessary

      // Retrieve the URL from the data attribute
      const url = element.getAttribute('data-external-link');

      if (url) {
        // Use the exposed API to open the URL in the default browser
        window.electronAPI.openExternalLink(url);
      } else {
        console.warn('No URL found for this element.');
      }
    });
  });
});
