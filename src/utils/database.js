const { ipcRenderer } = window.require ? window.require('electron') : {};

class Database {
  constructor() {
    this.config = null; // App.js'den setConfig ile doldurulur
  }

  setConfig(cfg) {
    this.config = cfg;
  }

  getConfig() {
    // Önce set edilen config, yoksa localStorage'dan oku
    if (this.config) return this.config;
    try {
      const saved = localStorage.getItem('metin2-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.database || null;
      }
    } catch {}
    return null;
  }

  async testConnection(config) {
    const cfg = config || this.getConfig();
    if (!cfg) return { success: false, error: 'Config yok' };
    if (!ipcRenderer) return { success: false, error: 'Electron gerekli' };
    try {
      return await ipcRenderer.invoke('test-mysql-connection', cfg);
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async query(sql, params = []) {
    const cfg = this.getConfig();
    if (!cfg) return { success: false, error: 'Database config ayarlanmamış' };
    if (!ipcRenderer) return { success: false, error: 'Electron gerekli' };
    try {
      return await ipcRenderer.invoke('execute-sql', { sql, params, config: cfg });
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async getShops() {
    return await this.query(`
      SELECT DISTINCT s.npc_vnum, n.name as npc_name, COUNT(s.pos) as item_count
      FROM shop s
      LEFT JOIN npc_proto n ON s.npc_vnum = n.vnum
      GROUP BY s.npc_vnum
      ORDER BY s.npc_vnum
    `);
  }

  async getShopItems(npcVnum) {
    return await this.query(`
      SELECT s.*, i.name as item_name, i.type, i.subtype
      FROM shop s
      LEFT JOIN item_proto i ON s.item_vnum = i.vnum
      WHERE s.npc_vnum = ?
      ORDER BY s.pos
    `, [npcVnum]);
  }

  async updateShopItem(npcVnum, pos, itemVnum, count, price) {
    return await this.query(`
      INSERT INTO shop (npc_vnum, item_vnum, count, price, pos)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE item_vnum=VALUES(item_vnum), count=VALUES(count), price=VALUES(price)
    `, [npcVnum, itemVnum, count, price, pos]);
  }

  async deleteShopItem(npcVnum, pos) {
    return await this.query(`DELETE FROM shop WHERE npc_vnum = ? AND pos = ?`, [npcVnum, pos]);
  }

  async getItems(search = '', type = 'all', limit = 200) {
    let sql = `SELECT vnum, name, type, subtype, size, price FROM item_proto WHERE 1=1`;
    const params = [];
    if (search) { sql += ` AND (name LIKE ? OR vnum LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (type !== 'all') { sql += ` AND type = ?`; params.push(type); }
    sql += ` ORDER BY vnum LIMIT ?`;
    params.push(limit);
    return await this.query(sql, params);
  }
}

export default new Database();
