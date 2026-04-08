const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Ana pencereyi oluştur
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
    backgroundColor: '#0F0F0F',
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // React uygulamasını yükle
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Development modunda DevTools'u aç
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Menü çubuğunu kaldır (production'da)
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();
  
  // Auto-updater'ı başlat (sadece production'da)
  if (!isDev) {
    checkForUpdates();
  }
});

// Auto-updater fonksiyonları
function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify();
}

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => {
  console.log('Güncellemeler kontrol ediliyor...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Güncelleme mevcut:', info.version);
  
  // Kullanıcıya bildirim göster
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Güncelleme Mevcut',
    message: `Yeni versiyon (${info.version}) mevcut!`,
    detail: 'Güncelleme arka planda indiriliyor...',
    buttons: ['Tamam']
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Güncelleme yok:', info.version);
});

autoUpdater.on('error', (err) => {
  console.log('Auto-updater hatası:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "İndirme hızı: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - İndirilen ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  
  // Progress'i ana pencereye gönder
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Güncelleme indirildi:', info.version);
  
  // Kullanıcıya restart seçeneği sun
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Güncelleme Hazır',
    message: `Yeni versiyon (${info.version}) indirildi!`,
    detail: 'Uygulamayı yeniden başlatarak güncellemeyi uygulayabilirsiniz.',
    buttons: ['Şimdi Yeniden Başlat', 'Daha Sonra'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manuel güncelleme kontrolü
ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
    return { success: true, message: 'Güncellemeler kontrol ediliyor...' };
  } else {
    return { success: false, message: 'Development modunda güncelleme kontrolü yapılamaz.' };
  }
});

// Uygulama versiyonu
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// Pencere kontrolü
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

// Dosya sistemi işlemleri
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// MySQL bağlantısı test etme
ipcMain.handle('test-mysql-connection', async (event, config) => {
  const mysql = require('mysql2/promise');
  try {
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    return { success: true, message: 'Bağlantı başarılı!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});