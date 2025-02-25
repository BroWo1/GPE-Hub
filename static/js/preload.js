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

// Construct the absolute path to the marked.min.js file
contextBridge.exposeInMainWorld('electronAPI', {
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  sendToggleDevTools: (state) => ipcRenderer.send('toggle-devtools', state),
    convertMarkdown: async (markdownText) => {
        // Send the markdown text to the main process for parsing
        const htmlContent = await ipcRenderer.invoke('parse-markdown', markdownText);

        // Log htmlContent to see if it's a string
        console.log("HTML content received:", htmlContent);

        // Ensure that htmlContent is a string before returning
        if (typeof htmlContent === 'string') {
            return htmlContent;
        } else {
            console.error('Error: Parsed content is not a string');
            return '';
        }
    },
    openMenu: () => ipcRenderer.send('open-menu'),
    snapToRight: () => ipcRenderer.send('snap-to-right'),
    moveLeft: () => ipcRenderer.send('move-to-left'),
    createBallWindow: () => ipcRenderer.send('create-ball-window'),
    deleteBallWindow: () => ipcRenderer.send('delete-ball-window'),
    isBallWindowOpen: () => ipcRenderer.invoke('is-ball-window-open')
});

// preload.js

// Check if contextBridge and ipcRenderer are available
contextBridge.exposeInMainWorld('electron', {
  setCookie: (name, value) => ipcRenderer.send('set-cookie', name, value),
  getCookie: (name) => ipcRenderer.invoke('get-cookie', name),
  fetchItems: () => ipcRenderer.invoke('fetch-items'),
    submitRating: (itemId, rating) => ipcRenderer.invoke('submit-rating', { itemId, rating }),
  chatGPTRequest: async (query, model, prompt1) => {
        try {
            const response = await fetch('http://117.72.120.34:3000/api/chatgpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, model, prompt1 }),
            });

            const data = await response.json();
            return data.response;

        } catch (error) {
            console.error('Error:', error);
            return 'Error: Unable to connect to the server.';
        }
    },
    imageRequest: async (model, imageBase64) => {
    try {
        const response = await fetch('http://117.72.120.34:3000/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                imageBase64 // Send the Base64-encoded image
            }),
        });

        // Check if the response status is OK (200)
        if (response.ok) {
            const data = await response.json();
            return data.response;
        } else {
            const errorMessage = await response.text();  // Get the error message if not a successful response
            console.error('Error response from server:', errorMessage);
            return `Error: ${response.status} - ${errorMessage}`;
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Error: Unable to connect to the server.';
    }
}

});
