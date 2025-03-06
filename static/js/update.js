const { dialog } = require('electron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Define the GitHub repository information
const GITHUB_OWNER = 'BroWo1'; // Replace with your actual GitHub username
const GITHUB_REPO = 'GPE-Hub'; // Replace with your actual repository name
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

// Get the current version from package.json
function getCurrentVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageData.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '0.0.0'; // Default if version cannot be determined
  }
}

// Simple version comparison function
function isNewerVersion(current, latest) {
  // Remove any 'v' prefix
  current = current.replace(/^v/, '');
  latest = latest.replace(/^v/, '');

  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false; // Versions are equal
}

// Main function to check for updates
async function checkUpdate(mainWindow, ipcMain) {
  console.log('Checking for updates...');
  try {
    // Get the current version
    const currentVersion = getCurrentVersion();
    console.log(`Current version: ${currentVersion}`);

    // Fetch the latest release from GitHub
    console.log(`Fetching from GitHub API: ${GITHUB_API_URL}`);
    const response = await axios.get(GITHUB_API_URL);
    const latestRelease = response.data;
    const latestVersion = latestRelease.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present

    console.log(`Latest version: ${latestVersion}`);

    // Compare versions
    if (isNewerVersion(currentVersion, latestVersion)) {
      // Newer version available, show dialog
      const releaseNotes = latestRelease.body || 'No release notes available.';
      const downloadUrl = latestRelease.html_url;

      // Create a dialog to notify the user
      const dialogOptions = {
        type: 'info',
        buttons: ['Download', 'Later'],
        title: 'Update Available',
        message: `A new version of GPE Hub is available!`,
        detail: `Current version: ${currentVersion}\nLatest version: ${latestVersion}\n\nRelease notes:\n${releaseNotes}`,
        icon: path.join(__dirname, '..', 'imgs', 'logo.ico')
      };

      // Show the dialog
      dialog.showMessageBox(mainWindow, dialogOptions).then(({ response }) => {
        if (response === 0) {
          // User clicked "Download"
          require('electron').shell.openExternal(downloadUrl);
        }
      });

      // Also send a notification
      const { Notification } = require('electron');
      const notification = new Notification({
        title: 'Update Available',
        body: `GPE Hub ${latestVersion} is now available. Click to update.`,
        icon: path.join(__dirname, '..', 'imgs', 'logo.ico')
      });

      notification.on('click', () => {
        require('electron').shell.openExternal(downloadUrl);
      });

      notification.show();

      return true;
    } else {
      console.log('Application is up to date.');
      return false;
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

// Set up IPC handler for manual update checks
function setupIpcHandlers(mainWindow, ipcMain) {
  ipcMain.handle('check-for-updates', async () => {
    return await checkUpdate(mainWindow, ipcMain);
  });
}

// Main export function - log that update checker is initialized for debugging
module.exports = function(mainWindow, ipcMain) {
  console.log('Update checker initialized');

  // Check for updates immediately on startup
  checkUpdate(mainWindow, ipcMain);

  // Set up IPC handlers for manual update checks
  setupIpcHandlers(mainWindow, ipcMain);

  // Optionally check for updates periodically (e.g., once a day)
  setInterval(() => {
    checkUpdate(mainWindow, ipcMain);
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Return the checkUpdate function in case it's needed elsewhere
  return checkUpdate;
};