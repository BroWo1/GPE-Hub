// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray, Menu, ipcMain, session, screen} = require('electron')
const path = require('node:path')
const axios = require('axios');

let userDataPath;
if (process.platform === 'win32') {
  userDataPath = path.join(process.env.LOCALAPPDATA, 'GPEHub');
} else if (process.platform === 'darwin') {
  // You can use the default or customize it, e.g., in the user's home directory
  userDataPath = path.join(process.env.HOME, 'Library', 'Application Support', 'GPEHub');
} else {
  // For Linux or other platforms
  userDataPath = path.join(process.env.HOME, '.config', 'GPEHub');
}
app.setPath('userData', userDataPath);


let tray = null
let mainWindow = null
let ballWindow = null;

function createBallWindow() {
  if (ballWindow === null) {
    ballWindow = new BrowserWindow({
      width: 70,
      height: 70,
      frame: false,              // Remove the title bar
      transparent: true,         // Make the background transparent
      alwaysOnTop: true,         // Keep window always on top
      resizable: false,
      skipTaskbar: true,         // Don’t show in taskbar
      webPreferences: {
        nodeIntegration: false,   // Enable Node integration (or use preload/contextBridge in newer Electron versions)
        contextIsolation: true,  // (Set to true with preload if you need more security)
        preload: path.join(__dirname, 'static', 'js', 'preload.js')
      }
    });

    // Set the window to always be on top with a specific level
    ballWindow.setAlwaysOnTop(true, 'screen-saver');

    ballWindow.loadFile(path.join(__dirname, 'views', 'ball.html')); // Load the HTML that draws the ball
  }

function snapToRight() {
    const bounds = ballWindow.getBounds();
    const { x, y, width, height } = bounds;
    const screenBounds = screen.getPrimaryDisplay().workArea;

    const targetX = screenBounds.width - width;
    const targetY = y; // Maintain current Y position

    const edgeThreshold = 500; // Distance from the right edge to trigger snapping

    if (screenBounds.width - (x + width) <= edgeThreshold) {
        const duration = 500; // Total duration of the movement in milliseconds
        const startTime = Date.now(); // Start time of the animation

        const easeInOut = (t) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        const moveWindow = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1); // Normalize time (0 to 1)

            const easingFactor = easeInOut(t); // Calculate easing factor
            const newX = x + (targetX - x) * easingFactor;
            ballWindow.setBounds({ x: newX, y: targetY, width, height });

            if (t < 1) {
                setTimeout(moveWindow, 16); // Call the function again after a short delay (16ms for ~60fps)
            } else {
                ballWindow.setBounds({ x: targetX, y: targetY, width, height }); // Ensure exact target position
            }
        };

        setTimeout(moveWindow, 16); // Start the animation loop
    }
}

ipcMain.on('create-ball-window', () => {
  createBallWindow();
});

ipcMain.on('delete-ball-window', () => {
  if (ballWindow !== null) {
    ballWindow.close();
    ballWindow = null;
  }
});

ipcMain.on('snap-to-right', snapToRight);
}



function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 475,
    minWidth: 633,
    icon: path.join(__dirname, 'static', 'imgs', 'logo.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'static', 'js', 'preload.js')
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'views', 'index.html'))
  mainWindow.on('ready-to-show', () =>{
    mainWindow.show()
  })
  mainWindow.setMenu(null)

  ipcMain.handle('fetch-items', async () => {
    try {
        const response = await axios.get('http://117.72.120.34:8000/items');
        return response.data;
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    }
});

  const fs = require('fs');
const marked = require('marked');
ipcMain.handle('parse-markdown', async (event, markdownText) => {
    // Parse the markdown text and return the result
    const html = marked.parse(markdownText);

    // Log the parsed HTML to ensure it's a string
    console.log("Parsed HTML:", html);

    return html; // Send back the parsed HTML
});

ipcMain.on('open-menu', (event) => {
  const menuTemplate = [
    {
      label: 'Open',
      click: () => {
        mainWindow.show()
      }
    },{ type: 'separator' },
      {
      label: 'AI', // New menu item
      click: () => {
        // Create a new BrowserWindow for ai.html
        let aiWindow = new BrowserWindow({
          width: 800,
          height: 600,
          minHeight: 475,
          minWidth: 633,
          icon: path.join(__dirname, 'static', 'imgs', 'logo.ico'),
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'static', 'js', 'preload.js')
          }
        })

        aiWindow.loadFile(path.join(__dirname, 'views', 'ai.html'))
        aiWindow.on('ready-to-show', () => {
          aiWindow.show()
        })
        aiWindow.setMenu(null)
      }
    },
      {
      label: 'Notes', // New menu item
      click: () => {
        // Create a new BrowserWindow for ai.html
        let noteWindow = new BrowserWindow({
          width: 800,
          height: 600,
          minHeight: 475,
          minWidth: 633,
          icon: path.join(__dirname, 'static', 'imgs', 'logo.ico'),
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'static', 'js', 'preload.js')
          }
        })

        noteWindow.loadFile(path.join(__dirname, 'views', 'notes.html'))
        noteWindow.on('ready-to-show', () => {
          noteWindow.show()
        })
        noteWindow.setMenu(null)
      }}
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  // Use the sender's window for popup
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});



// Submit the rating to the server
ipcMain.handle('submit-rating', async (event, { itemId, rating }) => {
    try {
        const response = await axios.post('http://117.72.120.34:8000/rate', {
            itemId,
            rating
        });
        return { message: 'Rating submitted' };
    } catch (error) {
        console.error('Error submitting rating:', error);
        return { message: 'Error submitting rating' };
    }
});

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function createTray() {
  // Initialize tray with icon
  tray = new Tray(path.join(__dirname, 'static', 'imgs', 'logo.ico')) // Update the path as necessary

  // Define a context menu for the tray icon
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWindow.show()
      }
    },
      {
      label: 'AI', // New menu item
      click: () => {
        // Create a new BrowserWindow for ai.html
        let aiWindow = new BrowserWindow({
          width: 800,
          height: 600,
          minHeight: 475,
          minWidth: 633,
          icon: path.join(__dirname, 'static', 'imgs', 'logo.ico'),
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'static', 'js', 'preload.js')
          }
        })

        aiWindow.loadFile(path.join(__dirname, 'views', 'ai.html'))
        aiWindow.on('ready-to-show', () => {
          aiWindow.show()
        })
        aiWindow.setMenu(null)
      }
    },
      { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('GPE Hub') // Tooltip when hovering over the tray icon
  tray.setContextMenu(contextMenu)

  // Optionally, toggle main window visibility on tray icon click
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  createTray()
  createBallWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('before-quit', () => {
  app.isQuitting = true
})

// Handling 'set-cookie' from renderer process
ipcMain.on('set-cookie', (event, name, value) => {
  const cookieName = `${name}_set_name`;
  const thirtyDaysFromNow = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // seconds since epoch

  session.defaultSession.cookies.set({
    url: 'http://localhost',
    name: cookieName,
    value: value || '',
    path: '/',
    expirationDate: thirtyDaysFromNow  // cookie will expire in 30 days
  })
  .then(() => {
    event.reply('cookie-set-success');
  })
  .catch((error) => {
    event.reply('cookie-set-failure', error);
  });
});

// Handling 'get-cookie' from renderer process and returning the value
ipcMain.handle('get-cookie', async (event, name) => {
  const cookieName = `${name}_set_name`;
  try {
    const cookies = await session.defaultSession.cookies.get({ url: 'http://localhost' }); // Adjust URL
    const cookie = cookies.find(cookie => cookie.name === cookieName);
    if (cookie) {
      return cookie.value;  // Return the cookie value
    } else {
      return null;  // Return null if the cookie is not found
    }
  } catch (error) {
    console.error('Failed to retrieve cookie:', error);
    return null;  // Return null in case of an error
  }
});
const { shell} = require('electron');

ipcMain.on('open-external-link', (event, url) => {
  shell.openExternal(url);
});

// Listen for our IPC message to toggle DevTools
ipcMain.on('toggle-devtools', (event, shouldOpen) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (shouldOpen) {
    win.webContents.openDevTools();
  } else {
    win.webContents.closeDevTools();
  }

});