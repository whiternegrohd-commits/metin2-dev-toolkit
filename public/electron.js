const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const chokidar = require('chokidar');

const isDev = process.env.NODE_ENV === 'development';

// Manual update system (electron-updater yerine)
const https = require('https');
const fs = require('fs');
const { createWriteStream } = require('fs');

let mainWindow;
let fileWatcher = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1200, minHeight: 700,
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true },
    titleBarStyle: 'hidden', frame: false, show: false,
    backgroundColor: '#0F0F0F',
    icon: path.join(__dirname, 'assets/icon.png')
  });

  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
  mainWindow.loadURL(startUrl);
  if (isDev) mainWindow.webContents.openDevTools();
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  if (!isDev) Menu.setApplicationMenu(null);

  // Dev modunda file watcher başlat
  if (isDev) {
    startFileWatcher();
  }
}

function startFileWatcher() {
  if (fileWatcher) return;
  
  const srcPath = path.join(__dirname, '../src');
  fileWatcher = chokidar.watch(srcPath, {
    ignored: /(node_modules|\.git|build|dist)/,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
  });

  fileWatcher.on('change', (filePath) => {
    console.log(`[HOT RELOAD] Dosya değişti: ${filePath}`);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('file-changed', { path: filePath, timestamp: Date.now() });
    }
  });

  console.log('[HOT RELOAD] File watcher başlatıldı');
}

app.whenReady().then(() => {
  createWindow();
  
  // Otomatik güncelleme kontrolü (dev ve prod)
  checkForUpdatesManual();
  
  // Her 1 saatte bir kontrol et
  setInterval(() => {
    if (mainWindow) {
      checkForUpdatesManual();
    }
  }, 60 * 60 * 1000);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── Window Controls ───────────────────────────────────────────────────────────
ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.handle('window-close', () => mainWindow.close());
ipcMain.handle('get-app-version', () => app.getVersion());

// ─── Dialogs ───────────────────────────────────────────────────────────────────
ipcMain.handle('show-message-box', async (e, opts) => dialog.showMessageBox(mainWindow, opts));
ipcMain.handle('select-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('select-file', async (e, filters) => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: filters || [{ name: 'All Files', extensions: ['*'] }] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('save-file-dialog', async (e, filters, defaultName) => {
  const r = await dialog.showSaveDialog(mainWindow, { defaultPath: defaultName || 'output.txt', filters: filters || [{ name: 'All Files', extensions: ['*'] }] });
  return r.canceled ? null : r.filePath;
});

// ─── File System ───────────────────────────────────────────────────────────────
ipcMain.handle('read-file', async (e, filePath) => {
  const fs = require('fs').promises;
  try { return { success: true, data: await fs.readFile(filePath, 'utf8') }; }
  catch (err) { return { success: false, error: err.message }; }
});
ipcMain.handle('write-file', async (e, filePath, data) => {
  const fs = require('fs').promises;
  try { await fs.writeFile(filePath, data, 'utf8'); return { success: true }; }
  catch (err) { return { success: false, error: err.message }; }
});
ipcMain.handle('read-log-tail', async (e, filePath, lines) => {
  const fs = require('fs').promises;
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const all = data.split('\n').filter(l => l.trim());
    return { success: true, lines: all.slice(-(lines || 200)) };
  } catch (err) { return { success: false, error: err.message }; }
});

// ─── Config ────────────────────────────────────────────────────────────────────
ipcMain.handle('save-config', async (e, config) => {
  const fs = require('fs').promises;
  const os = require('os');
  try {
    const dir = path.join(os.homedir(), '.metin2-toolkit');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'config.json'), JSON.stringify(config, null, 2));
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});
ipcMain.handle('get-config', async () => {
  const fs = require('fs').promises;
  const os = require('os');
  try {
    const data = await fs.readFile(path.join(os.homedir(), '.metin2-toolkit', 'config.json'), 'utf8');
    return JSON.parse(data);
  } catch { return null; }
});

// ─── MySQL ─────────────────────────────────────────────────────────────────────
async function createConn(config, withDB = true) {
  const mysql = require('mysql2/promise');
  const cfg = {
    host: config.host, port: config.port || 3306,
    user: config.user, password: config.password,
    connectTimeout: 5000,
    charset: 'utf8mb4'
  };
  if (withDB && config.database) cfg.database = config.database;
  return mysql.createConnection(cfg);
}

// Latin1 → UTF-8 encoding düzeltici
function fixEncoding(str) {
  if (!str || typeof str !== 'string') return str;
  try {
    // Bozuk karakter tespiti - ? veya replacement char içeriyorsa dönüştür
    if (!str.includes('?') && !str.includes('\uFFFD')) return str;
    const buf = Buffer.from(str, 'latin1');
    const decoded = buf.toString('utf8');
    // Eğer daha okunabilir hale geldiyse kullan
    return decoded;
  } catch { return str; }
}

ipcMain.handle('test-mysql-connection', async (e, config) => {
  try {
    const conn = await createConn(config, true);
    await conn.ping();
    await conn.end();
    return { success: true, message: 'Bağlantı başarılı!' };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('list-databases', async (e, config) => {
  try {
    const conn = await createConn(config, false);
    const [rows] = await conn.execute('SHOW DATABASES');
    await conn.end();
    const skip = ['information_schema', 'performance_schema', 'mysql', 'sys'];
    return { success: true, databases: rows.map(r => Object.values(r)[0]).filter(d => !skip.includes(d)) };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('execute-sql', async (e, { sql, params, config }) => {
  try {
    const conn = await createConn(config, true);
    const [rows] = await conn.execute(sql, params || []);
    await conn.end();
    return { success: true, data: rows };
  } catch (err) { return { success: false, error: err.message }; }
});

// Akıllı server stats - birden fazla tablo/kolon kombinasyonu dener
ipcMain.handle('get-server-stats', async (e, config) => {
  if (!config?.host) return { success: false, playerCount: 0, dbOnline: false };
  try {
    const conn = await createConn(config, true);

    // Online oyuncu - farklı Metin2 sürümlerinde farklı kolonlar
    let playerCount = 0;
    const playerQueries = [
      'SELECT COUNT(*) as cnt FROM player WHERE logoff_time = 0',
      'SELECT COUNT(*) as cnt FROM player WHERE online = 1',
      'SELECT COUNT(*) as cnt FROM player WHERE last_play > DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
    ];
    for (const q of playerQueries) {
      try {
        const [rows] = await conn.execute(q);
        playerCount = Number(rows[0]?.cnt) || 0;
        break;
      } catch {}
    }

    await conn.end();
    return { success: true, playerCount, dbOnline: true };
  } catch (err) {
    return { success: false, playerCount: 0, dbOnline: false, error: err.message };
  }
});

// Otomatik shop tablosu tespiti + veri çekme
ipcMain.handle('get-shops-auto', async (e, config) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);

    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('shop','player_shop','shop_item','shopitem','npc_proto','item_proto','item_proto_shop')
    `, [config.database]);
    const tableNames = tables.map(t => t.TABLE_NAME);

    let shops = [];

    if (tableNames.includes('shop') && tableNames.includes('shop_item')) {
      const [rows] = await conn.execute(`
        SELECT s.vnum as shop_id,
               s.name as npc_name,
               s.npc_vnum,
               COUNT(si.item_vnum) as item_count
        FROM shop s
        LEFT JOIN shop_item si ON si.shop_vnum = s.vnum
        GROUP BY s.vnum, s.name, s.npc_vnum
        ORDER BY s.vnum
        LIMIT 500
      `);
      shops = rows.map(r => ({ ...r, npc_name: fixEncoding(r.npc_name) }));
    } else if (tableNames.includes('player_shop')) {
      const [rows] = await conn.execute(`
        SELECT ps.id as shop_id, ps.name as npc_name, ps.id as npc_vnum,
               COUNT(si.id) as item_count
        FROM player_shop ps
        LEFT JOIN shop_item si ON si.shop_id = ps.id
        GROUP BY ps.id, ps.name
        ORDER BY ps.id
        LIMIT 500
      `).catch(() => [[]]);
      shops = rows.map(r => ({ ...r, npc_name: fixEncoding(r.npc_name) }));
    }

    await conn.end();
    return { success: true, shops, tableNames };
  } catch (err) { return { success: false, error: err.message, shops: [], tableNames: [] }; }
});

// Shop items çekme - item_proto_shop desteği eklendi
ipcMain.handle('get-shop-items-auto', async (e, config, shopId, tableNames) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    let items = [];

    // item ismi için hangi tablo kullanılacak
    const itemTable = tableNames?.includes('item_proto_shop') ? 'item_proto_shop' :
                      tableNames?.includes('item_proto') ? 'item_proto' : null;

    const itemJoin = itemTable
      ? `LEFT JOIN ${itemTable} ip ON ip.vnum = si.item_vnum`
      : '';
    const itemName = itemTable
      ? `COALESCE(CONVERT(ip.name USING utf8mb4), CONCAT('Item #', si.item_vnum))`
      : `CONCAT('Item #', si.item_vnum)`;

    if (tableNames?.includes('shop') && tableNames?.includes('shop_item')) {
      const sql = `
        SELECT si.shop_vnum, si.item_vnum, si.count,
               ${itemName} as item_name,
               ${itemTable ? 'ip.type, ip.subtype' : 'NULL as type, NULL as subtype'},
               (@pos := @pos + 1) - 1 as pos
        FROM shop_item si
        ${itemJoin}
        CROSS JOIN (SELECT @pos := 0) r
        WHERE si.shop_vnum = ?
        ORDER BY si.item_vnum
      `;
      const [rows] = await conn.execute(sql, [shopId]).catch(async () => {
        const [r] = await conn.execute(`
          SELECT si.shop_vnum, si.item_vnum, si.count,
                 CONCAT('Item #', si.item_vnum) as item_name,
                 NULL as type, NULL as subtype,
                 (@pos := @pos + 1) - 1 as pos
          FROM shop_item si CROSS JOIN (SELECT @pos := 0) r
          WHERE si.shop_vnum = ? ORDER BY si.item_vnum
        `, [shopId]).catch(() => [[]]);
        return [r];
      });
      items = rows.map(r => ({ ...r, item_name: fixEncoding(r.item_name) }));
    } else if (tableNames?.includes('player_shop') && tableNames?.includes('shop_item')) {
      const [rows] = await conn.execute(`
        SELECT si.*, si.pos,
               COALESCE(CONVERT(ip.name USING utf8mb4), CONCAT('Item #', si.item_vnum)) as item_name,
               ip.type, ip.subtype
        FROM shop_item si
        LEFT JOIN item_proto ip ON ip.vnum = si.item_vnum
        WHERE si.shop_id = ?
        ORDER BY si.pos
      `, [shopId]).catch(() => [[]]);
      items = rows.map(r => ({ ...r, item_name: fixEncoding(r.item_name) }));
    }

    await conn.end();
    return { success: true, data: items };
  } catch (err) { return { success: false, error: err.message }; }
});

// Yeni dükkan oluştur
ipcMain.handle('create-shop', async (e, config, shopData) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    // Mevcut max vnum'u bul
    const [maxRows] = await conn.execute('SELECT MAX(vnum) as maxVnum FROM shop');
    const newVnum = (maxRows[0]?.maxVnum || 0) + 1;
    await conn.execute(
      'INSERT INTO shop (vnum, name, npc_vnum) VALUES (?, ?, ?)',
      [newVnum, shopData.name || `Shop #${newVnum}`, shopData.npcVnum || newVnum]
    );
    await conn.end();
    return { success: true, vnum: newVnum };
  } catch (err) { return { success: false, error: err.message }; }
});

// Shop item güncelle (shop_item tablosu için)
ipcMain.handle('update-shop-item', async (e, config, shopVnum, itemVnum, count, tableNames) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    if (tableNames?.includes('shop_item')) {
      // Önce var mı kontrol et
      const [existing] = await conn.execute(
        'SELECT * FROM shop_item WHERE shop_vnum = ? AND item_vnum = ?',
        [shopVnum, itemVnum]
      );
      if (existing.length > 0) {
        await conn.execute(
          'UPDATE shop_item SET count = ? WHERE shop_vnum = ? AND item_vnum = ?',
          [count, shopVnum, itemVnum]
        );
      } else {
        await conn.execute(
          'INSERT INTO shop_item (shop_vnum, item_vnum, count) VALUES (?, ?, ?)',
          [shopVnum, itemVnum, count]
        );
      }
    }
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// Shop item sil
ipcMain.handle('delete-shop-item', async (e, config, shopVnum, itemVnum, tableNames) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    if (tableNames?.includes('shop_item')) {
      await conn.execute('DELETE FROM shop_item WHERE shop_vnum = ? AND item_vnum = ?', [shopVnum, itemVnum]);
    }
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// item_proto veya item_proto_shop'tan item listesi çek
ipcMain.handle('get-items-from-db', async (e, config, search, limit) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('item_proto','item_proto_shop')
    `, [config.database]);
    const tableNames = tables.map(t => t.TABLE_NAME);
    const tbl = tableNames.includes('item_proto') ? 'item_proto' : tableNames.includes('item_proto_shop') ? 'item_proto_shop' : null;
    if (!tbl) { await conn.end(); return { success: false, error: 'item_proto tablosu bulunamadı' }; }

    let sql = `SELECT vnum, CONVERT(name USING utf8mb4) as name, type, subtype FROM ${tbl} WHERE 1=1`;
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR vnum LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY vnum LIMIT ?';
    params.push(limit || 200);

    const [rows] = await conn.execute(sql, params);
    await conn.end();
    return { success: true, data: rows.map(r => ({ ...r, name: fixEncoding(r.name) })) };
  } catch (err) { return { success: false, error: err.message }; }
});

// Dashboard için son aktiviteler - gerçek DB'den
ipcMain.handle('get-recent-activity', async (e, config) => {
  if (!config?.host) return { success: false, activities: [] };
  try {
    const conn = await createConn(config, true);
    const activities = [];

    // Son değiştirilen shop_item kayıtları (eğer timestamp varsa)
    try {
      const [shopItems] = await conn.execute(`
        SELECT si.shop_vnum, si.item_vnum, s.name as shop_name
        FROM shop_item si
        LEFT JOIN shop s ON s.vnum = si.shop_vnum
        ORDER BY si.item_vnum DESC LIMIT 3
      `);
      shopItems.forEach(r => activities.push({
        action: `Shop "${fixEncoding(r.shop_name) || '#' + r.shop_vnum}" güncellendi`,
        type: 'info'
      }));
    } catch {}

    // Son quest kayıtları
    try {
      const [quests] = await conn.execute('SELECT name FROM quest ORDER BY id DESC LIMIT 2');
      quests.forEach(r => activities.push({ action: `Quest: ${fixEncoding(r.name)}`, type: 'success' }));
    } catch {}

    // Player sayısı
    try {
      const [players] = await conn.execute('SELECT COUNT(*) as cnt FROM player');
      activities.push({ action: `Toplam ${players[0].cnt} kayıtlı oyuncu`, type: 'info' });
    } catch {}

    await conn.end();
    return { success: true, activities };
  } catch (err) { return { success: false, activities: [] }; }
});



// ─── FTP ───────────────────────────────────────────────────────────────────────
ipcMain.handle('test-ftp-connection', async (e, config) => {
  if (!config?.host) return { success: false, error: 'FTP host girilmedi' };
  const net = require('net');
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => { socket.destroy(); resolve({ success: true, message: 'FTP bağlantısı başarılı!' }); });
    socket.on('timeout', () => { socket.destroy(); resolve({ success: false, error: 'Bağlantı zaman aşımı' }); });
    socket.on('error', (err) => resolve({ success: false, error: err.message }));
    socket.connect(config.port || 21, config.host);
  });
});

// ─── Path Validation ───────────────────────────────────────────────────────────
ipcMain.handle('validate-paths', async (e, paths) => {
  const fs = require('fs').promises;
  const results = [];
  if (paths.client) { try { await fs.access(paths.client); results.push('Client ✓'); } catch { results.push('Client bulunamadı'); } }
  if (paths.server) { try { await fs.access(paths.server); results.push('Server ✓'); } catch { results.push('Server bulunamadı'); } }
  return { success: true, message: results.join(', ') || 'Yol girilmedi' };
});

// ─── Ping ──────────────────────────────────────────────────────────────────────
ipcMain.handle('ping-server', async (e, host, port) => {
  const net = require('net');
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(3000);
    socket.on('connect', () => { const ping = Date.now() - start; socket.destroy(); resolve({ success: true, ping }); });
    socket.on('timeout', () => { socket.destroy(); resolve({ success: false, ping: -1 }); });
    socket.on('error', () => resolve({ success: false, ping: -1 }));
    socket.connect(port || 3306, host);
  });
});

// ─── Uptime ────────────────────────────────────────────────────────────────────
const appStartTime = Date.now();
ipcMain.handle('get-uptime', () => {
  const s = Math.floor((Date.now() - appStartTime) / 1000);
  return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
});

// ─── NPC List ──────────────────────────────────────────────────────────────────
ipcMain.handle('read-npclist', async (e, serverPath) => {
  const fs = require('fs').promises;
  try {
    const filePath = path.join(serverPath, 'root', 'npclist.txt');
    const data = await fs.readFile(filePath, 'utf8');
    const npcs = data.split('\n').filter(l => l.trim()).map((line, idx) => {
      const parts = line.split('\t');
      return { id: idx, code: parts[0]?.trim() || '', model: parts[1]?.trim() || '' };
    }).filter(n => n.code);
    return { success: true, npcs, filePath };
  } catch (err) { return { success: false, error: err.message }; }
});
ipcMain.handle('write-npclist', async (e, serverPath, npcs) => {
  const fs = require('fs').promises;
  try {
    const filePath = path.join(serverPath, 'root', 'npclist.txt');
    await fs.writeFile(filePath, npcs.map(n => `${n.code}\t${n.model}`).join('\n') + '\n', 'utf8');
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});
// ─── Map Management ────────────────────────────────────────────────────────────
ipcMain.handle('get-maps', async (e, config) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    const [rows] = await conn.execute(`
      SELECT id, name, x, y, width, height, type, description
      FROM map_info
      ORDER BY id
      LIMIT 500
    `).catch(() => [[]]);
    await conn.end();
    return { success: true, data: rows };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('create-map', async (e, config, mapData) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute(`
      INSERT INTO map_info (name, x, y, width, height, type, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      mapData.name,
      mapData.x,
      mapData.y,
      mapData.width,
      mapData.height,
      mapData.type,
      mapData.description
    ]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('update-map', async (e, config, mapData) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute(`
      UPDATE map_info
      SET name = ?, x = ?, y = ?, width = ?, height = ?, type = ?, description = ?
      WHERE id = ?
    `, [
      mapData.name,
      mapData.x,
      mapData.y,
      mapData.width,
      mapData.height,
      mapData.type,
      mapData.description,
      mapData.id
    ]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('delete-map', async (e, config, mapId) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute('DELETE FROM map_info WHERE id = ?', [mapId]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// ─── Server Management ─────────────────────────────────────────────────────────
ipcMain.handle('start-server', async (e, config) => {
  // Placeholder - gerçek sunucu başlatma işlemi
  return { success: true, message: 'Sunucu başlatıldı' };
});

ipcMain.handle('stop-server', async (e, config) => {
  // Placeholder - gerçek sunucu durdurma işlemi
  return { success: true, message: 'Sunucu durduruldu' };
});

// ─── Player Management ──────────────────────────────────────────────────────────
ipcMain.handle('get-players', async (e, config) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    const [rows] = await conn.execute(`
      SELECT id, name, level, exp, gold, job, map_index, last_login
      FROM player
      ORDER BY level DESC
      LIMIT 1000
    `);
    await conn.end();
    return { success: true, data: rows };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('delete-player', async (e, config, playerId) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute('DELETE FROM player WHERE id = ?', [playerId]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('ban-player', async (e, config, playerId) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute('UPDATE player SET status = 1 WHERE id = ?', [playerId]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// ─── Quest Management ──────────────────────────────────────────────────────────
ipcMain.handle('get-quests', async (e, config) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    const [rows] = await conn.execute(`
      SELECT id, name, description, level_min, level_max, reward_exp, reward_gold, reward_item
      FROM quest
      ORDER BY id
      LIMIT 500
    `).catch(() => [[]]);
    await conn.end();
    return { success: true, data: rows };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('create-quest', async (e, config, questData) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute(`
      INSERT INTO quest (name, description, level_min, level_max, reward_exp, reward_gold, reward_item)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      questData.name,
      questData.description,
      questData.level_min,
      questData.level_max,
      questData.reward_exp,
      questData.reward_gold,
      questData.reward_item
    ]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('update-quest', async (e, config, questData) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute(`
      UPDATE quest
      SET name = ?, description = ?, level_min = ?, level_max = ?, reward_exp = ?, reward_gold = ?, reward_item = ?
      WHERE id = ?
    `, [
      questData.name,
      questData.description,
      questData.level_min,
      questData.level_max,
      questData.reward_exp,
      questData.reward_gold,
      questData.reward_item,
      questData.id
    ]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

ipcMain.handle('delete-quest', async (e, config, questId) => {
  if (!config?.host) return { success: false, error: 'Config yok' };
  try {
    const conn = await createConn(config, true);
    await conn.execute('DELETE FROM quest WHERE id = ?', [questId]);
    await conn.end();
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// ─── Updates ───────────────────────────────────────────────────────────────────
const GITHUB_REPO = 'https://github.com/whiternegrohd-commits/metin2-dev-toolkit/releases/download';
const LATEST_YML_URL = `${GITHUB_REPO}/latest/latest.yml`;

// ─── Manual Update System ──────────────────────────────────────────────────────

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function parseYaml(content) {
  const lines = content.split('\n');
  const result = {};
  let currentKey = null;
  
  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (key.trim() === 'version') {
        result.version = value.replace(/'/g, '').replace(/"/g, '');
      } else if (key.trim() === 'path') {
        result.path = value.replace(/'/g, '').replace(/"/g, '');
      } else if (key.trim() === 'releaseDate') {
        result.releaseDate = value.replace(/'/g, '').replace(/"/g, '');
      }
    }
  }
  
  return result;
}

async function checkForUpdatesManual() {
  try {
    console.log('[UPDATE] Manuel güncelleme kontrolü başlatıldı...');
    
    // Lokal latest.yml'i oku (dist klasöründen)
    const localYmlPath = path.join(__dirname, '../dist/latest.yml');
    
    if (!fs.existsSync(localYmlPath)) {
      console.log('[UPDATE] latest.yml bulunamadı:', localYmlPath);
      return;
    }
    
    const ymlContent = fs.readFileSync(localYmlPath, 'utf8');
    const remoteInfo = parseYaml(ymlContent);
    const currentVersion = app.getVersion();
    
    console.log(`[UPDATE] Mevcut versiyon: ${currentVersion}, Uzak versiyon: ${remoteInfo.version}`);
    
    if (remoteInfo.version !== currentVersion) {
      console.log('[UPDATE] Yeni versiyon mevcut!');
      if (mainWindow) {
        mainWindow.webContents.send('update-available', {
          version: remoteInfo.version,
          releaseDate: remoteInfo.releaseDate,
          path: remoteInfo.path
        });
      }
    } else {
      console.log('[UPDATE] Güncel versiyon kullanılıyor');
      if (mainWindow) {
        mainWindow.webContents.send('update-not-available');
      }
    }
  } catch (err) {
    console.error('[UPDATE] Kontrol hatası:', err.message);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', { error: err.message });
    }
  }
}

ipcMain.handle('check-for-updates', async () => {
  console.log('[UPDATE] Güncelleme kontrol başlatıldı...');
  try {
    const localYmlPath = path.join(__dirname, '../dist/latest.yml');
    
    if (!fs.existsSync(localYmlPath)) {
      return { success: false, error: 'latest.yml bulunamadı' };
    }
    
    const ymlContent = fs.readFileSync(localYmlPath, 'utf8');
    const remoteInfo = parseYaml(ymlContent);
    const currentVersion = app.getVersion();
    
    return {
      success: true,
      currentVersion,
      remoteVersion: remoteInfo.version,
      hasUpdate: remoteInfo.version !== currentVersion,
      updateInfo: remoteInfo
    };
  } catch (err) {
    console.error('[UPDATE] Kontrol hatası:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('download-update', async (e, remoteInfo) => {
  try {
    console.log('[UPDATE] İndirme başlatıldı:', remoteInfo.path);
    
    const downloadUrl = `${GITHUB_REPO}/${remoteInfo.version}/${remoteInfo.path}`;
    const downloadPath = path.join(app.getPath('downloads'), remoteInfo.path);
    
    let lastProgress = 0;
    
    await new Promise((resolve, reject) => {
      const file = createWriteStream(downloadPath);
      https.get(downloadUrl, (response) => {
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const percent = Math.round((downloadedSize / totalSize) * 100);
          
          if (percent - lastProgress >= 5) {
            lastProgress = percent;
            console.log(`[UPDATE] İndiriliyor: ${percent}%`);
            if (mainWindow) {
              mainWindow.webContents.send('download-progress', {
                percent,
                transferred: downloadedSize,
                total: totalSize
              });
            }
          }
        });
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    });
    
    console.log('[UPDATE] İndirme tamamlandı:', downloadPath);
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', { path: downloadPath });
    }
    
    return { success: true, path: downloadPath };
  } catch (err) {
    console.error('[UPDATE] İndirme hatası:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('install-update', async (e, exePath) => {
  try {
    console.log('[UPDATE] Kurulum başlatıldı:', exePath);
    
    // EXE'yi çalıştır
    const { spawn } = require('child_process');
    spawn(exePath, [], { detached: true });
    
    // Uygulamayı kapat
    setTimeout(() => {
      app.quit();
    }, 1000);
    
    return { success: true };
  } catch (err) {
    console.error('[UPDATE] Kurulum hatası:', err);
    return { success: false, error: err.message };
  }
});
