document.addEventListener('DOMContentLoaded', async () => {
  // Get current language from main process
  const currentLang = await window.electron.getLanguage();

  // Function to translate elements
  const translateElements = () => {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      // Get translation from main process
      window.electron.translate(key).then(translation => {
        if (translation) {
          element.textContent = translation;
        }
      });
    });
  };

  // Initial translation
  translateElements();
});