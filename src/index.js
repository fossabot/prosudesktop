import { app, BrowserWindow } from 'electron';
var isDev = require("electron-is-dev")
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
app.on('ready', () =>{
  // First run, show "Thank You splashscreen"
  if(process.argv[1] == "--squirrel-firstrun"){
    startingSplash();
  // Show loader window
  }else{
    loadingWindow();
    //startingSplash();
  }
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let splashWin, loadingWin, mainWindow;

const loadingWindow = () => {
  // Create the browser window.
  loadingWin = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    frame: false
  });

  // and load the index.html of the app.
  loadingWin.loadURL(`file://${__dirname}/index.html`);
  loadingWin.webContents.on('did-finish-load', () => {
    loadingWin.show();
  });
  loadingWin.once('show', () => {
    if(isDev){ // Don't check for updates if this is a development environment
      loadingWin.webContents.executeJavaScript(`$(".status").text("Skipping update check while in development")`)
    }else{
      loadingWin.webContents.executeJavaScript(`$(".status").text("Checking for updates...")`)
      var updater = require("./util/updater");
      updater.on('update-available', () => {
        loadingWin.webContents.executeJavaScript(`$(".status").text("Update available! Downloading...")`)
      });
      updater.on('update-not-available', () => {
        loadingWin.webContents.executeJavaScript(`$(".status").text("No update available")`)
        // Continue starting
      });
      updater.on('update-downloaded', (e, n, name) => {
        loadingWin.webContents.executeJavaScript(`$(".status").text("Version ${name} downloaded. Installing in 3 seconds...")`);
        setTimeout(() => {
          updater.quitAndInstall();
        }, 3000);
      });
      updater.on('error', () => {
        loadingWin.webContents.executeJavaScript(`$(".status").text("An error occurred checking for updates")`)
      })
      updater.checkForUpdates()
    }
  })
  // Emitted when the window is closed.
  loadingWin.on('closed', () => {
    loadingWin = null;
  });
};

const startingSplash = () => {
  splashWin = new BrowserWindow({
    width: 800,
    height: 400,
    show: false,
    frame: false
  });
  splashWin.loadURL(`file://${__dirname}/views/first_install_splash.html`);
  splashWin.webContents.on('did-finish-load', () => {
    splashWin.show();
  });
  splashWin.on('close', () => {
    loadingWindow();
    splashWin.hide();
  })
  splashWin.on('closed', () => {
    splashWin = null;
  })
}
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
