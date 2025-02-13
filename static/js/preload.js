/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  sendToggleDevTools: (state) => ipcRenderer.send('toggle-devtools', state)
});

// preload.js

// Check if contextBridge and ipcRenderer are available
contextBridge.exposeInMainWorld('electron', {
  setCookie: (name, value) => ipcRenderer.send('set-cookie', name, value),
  getCookie: (name) => ipcRenderer.invoke('get-cookie', name),
  fetchItems: () => ipcRenderer.invoke('fetch-items'),
    submitRating: (itemId, rating) => ipcRenderer.invoke('submit-rating', { itemId, rating })
});
