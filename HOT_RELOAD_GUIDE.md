# 🔥 Hot Reload & Otomatik Güncelleme Rehberi

## Dev Modunda Hot Reload

Artık dosya değişikliğini yaptığında **otomatik olarak** uygulama güncelleniyor!

### Nasıl Çalışır?

1. **Electron file watcher** `src/` klasörünü izler
2. Dosya değiştiğinde → React component'ler otomatik yeniden render olur
3. Ekranda yeşil bildirim görünür: "Değişiklikler yüklendi"

### Başlatma

```bash
npm run electron-dev
```

Bu komut:
- React dev server'ı başlatır (port 3000)
- Electron uygulamasını açar
- DevTools otomatik açılır
- File watcher aktif olur

### Desteklenen Dosyalar

✅ Tüm `.js` ve `.jsx` dosyaları  
✅ CSS dosyaları  
✅ Context dosyaları  
✅ Utils dosyaları  

❌ `public/electron.js` değişirse manuel restart gerekir

---

## Production'da Otomatik Güncelleme

### Kurulum

1. **GitHub Release'i ayarla**
   - Repo'da "Releases" sekmesine git
   - `electron-builder` otomatik `.exe` ve `.blockmap` dosyaları oluşturur

2. **Versiyonu güncelle**
   ```bash
   npm run version-patch    # 1.2.0 → 1.2.1
   npm run version-minor    # 1.2.0 → 1.3.0
   npm run version-major    # 1.2.0 → 2.0.0
   ```

3. **Otomatik yayınla**
   ```bash
   npm run release
   ```
   Bu komut:
   - Build oluşturur
   - GitHub Release'e yükler
   - Kullanıcılar otomatik güncelleme bildirimini alır

### Kullanıcı Tarafında

1. Uygulama başladığında otomatik güncelleme kontrol eder
2. Yeni versiyon varsa → Bildirim gösterilir
3. "İndir" butonuna tıkla → İndirme başlar
4. İndirme tamamlanınca → "Şimdi Yeniden Başlat" butonu görünür
5. Tıkla → Uygulama yeniden başlar ve güncellenir

### Güncelleme Durumları

| Durum | Gösterim |
|-------|----------|
| Kontrol ediliyor | Sessiz (arka planda) |
| Yeni versiyon var | Mavi bildirim + "İndir" butonu |
| İndiriliyor | Yeşil progress bar + hız göstergesi |
| İndirme tamamlandı | Yeşil bildirim + "Şimdi Yeniden Başlat" |
| Hata | Kırmızı bildirim |

---

## Geliştirme Akışı

### Hızlı Geliştirme Döngüsü

```
1. Dosya değiştir
   ↓
2. Ctrl+S ile kaydet
   ↓
3. Uygulama otomatik güncellenir (1-2 saniye)
   ↓
4. Yeşil bildirim görünür
   ↓
5. Tekrar 1'e git
```

### Electron Main Process Değişirse

`public/electron.js` değiştirirsen:
1. Uygulamayı kapat
2. `npm run electron-dev` tekrar çalıştır

---

## Sorun Giderme

### Hot Reload çalışmıyor

```bash
# 1. Electron'u kapat
# 2. Tekrar başlat
npm run electron-dev

# 3. DevTools'ta console'u kontrol et
# [HOT RELOAD] Dosya değişti: ... mesajı görünmeli
```

### Güncelleme indirmiyor

1. GitHub Release'in doğru formatında olduğunu kontrol et
2. `package.json` versiyonunu kontrol et
3. `electron-updater` config'ini kontrol et (`public/electron.js`)

### Yeniden başlatma başarısız

- Uygulamayı manuel kapat
- Tekrar aç
- Güncelleme otomatik uygulanacak

---

## İpuçları

💡 **DevTools açık tutun** - Console'da hot reload mesajlarını görebilirsin  
💡 **Sık commit et** - Hata olursa geri dönebilirsin  
💡 **Versiyonu düzenli güncelle** - Kullanıcılar yeni özellikleri takip edebilir  

---

## Teknik Detaylar

### Hot Reload Mimarisi

```
src/ dosyası değişir
    ↓
chokidar file watcher algılar
    ↓
electron.js → file-changed event gönderir
    ↓
React App.js → hotReloadKey state'i günceller
    ↓
Router key değişir → tüm component'ler yeniden render
    ↓
UpdateNotification → yeşil bildirim gösterir
```

### Güncelleme Mimarisi

```
Uygulama başlar
    ↓
electron-updater → GitHub Release'i kontrol eder
    ↓
Yeni versiyon varsa → update-available event
    ↓
UpdateNotification → bildirim gösterir
    ↓
Kullanıcı "İndir" tıklar
    ↓
electron-updater → dosyaları indirir
    ↓
İndirme tamamlanınca → update-downloaded event
    ↓
autoUpdater.quitAndInstall() → yeniden başlat + güncelle
```

---

**Sorular? GitHub Issues'e açabilirsin!** 🚀
