const { autoUpdater } = require('electron-updater');
var mainWin = null;

const checkUpdate = (win, ipcMain) => {
  autoUpdater.autoDownload = true; // 自动下载
  autoUpdater.autoInstallOnAppQuit = true; // 应用退出后自动安装
  mainWin = win;
  // 检测是否有更新包并通知
  autoUpdater.checkForUpdatesAndNotify().catch();
  // 监听渲染进程的 install 事件，触发退出应用并安装
  ipcMain.handle('install', () => autoUpdater.quitAndInstall());
};

module.exports = checkUpdate;