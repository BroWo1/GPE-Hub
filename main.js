// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray, Menu, ipcMain, session} = require('electron')
const path = require('node:path')

const userDataPath = path.join(process.env.LOCALAPPDATA || '', 'GPEHub');
app.setPath('userData', userDataPath);

let tray = null
let mainWindow = null

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 400,
    minWidth: 600,
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

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

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