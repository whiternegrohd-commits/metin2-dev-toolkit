# 🚀 Otomatik Güncelleme Sistemi

## Nasıl Çalışır?

### **Kullanıcı Tarafı (Eski Sürüm)**

1. **Uygulama Başlangıcı**
   - Electron başladığında otomatik güncelleme kontrolü yapılır
   - GitHub'dan `latest.yml` dosyası kontrol edilir
   - Yeni versiyon varsa bildirim gösterilir

2. **Güncelleme Bildirimi**
   - Sağ alt köşede "Güncelleme Mevcut" mesajı
   - "İndir" butonuna tıkla
   - İndirme başlar (ilerleme göstergesi gösterilir)

3. **İndirme Süreci**
   - Hız, kalan süre, yüzde gösterilir
   - Arka planda indirilir (uygulama kullanılabilir)
   - İndirme tamamlandığında "Şimdi Yeniden Başlat" butonu gösterilir

4. **Kurulum**
   - "Şimdi Yeniden Başlat" butonuna tıkla
   - Yeni sürüm otomatik kurulur
   - Uygulama yeniden başlar

---

## Geliştirici Tarafı (Yeni Sürüm Yayınlama)

### **Adım 1: Sürüm Numarasını Güncelle**

```bash
npm version patch    # 1.3.0 → 1.3.1
npm version minor    # 1.3.0 → 1.4.0
npm version major    # 1.3.0 → 2.0.0
```

Bu komut:
- `package.json` versiyonunu günceller
- Git tag oluşturur
- GitHub'a push eder

### **Adım 2: Build Oluştur**

```bash
npm run build
```

### **Adım 3: EXE Paketi Oluştur**

```bash
npm run electron-pack
```

Bu komut `dist/` klasöründe oluşturur:
- `Metin2 Dev Toolkit Setup 1.3.1.exe` (installer)
- `Metin2 Dev Toolkit 1.3.1.exe` (portable)
- `latest.yml` (versiyon bilgisi)
- `*.blockmap` (delta update dosyası)

### **Adım 4: GitHub Release Oluştur**

```bash
npm run release
```

Bu komut otomatik olarak:
1. GitHub'da release oluşturur
2. EXE dosyalarını upload eder
3. `latest.yml` dosyasını upload eder
4. Release notlarını ekler

---

## Dosya Yapısı

### **dist/ Klasörü (Yayınlanacak Dosyalar)**

```
dist/
├── Metin2 Dev Toolkit Setup 1.3.1.exe    ← Installer
├── Metin2 Dev Toolkit 1.3.1.exe          ← Portable
├── latest.yml                             ← Versiyon bilgisi
├── Metin2 Dev Toolkit 1.3.1.exe.blockmap ← Delta update
└── builder-effective-config.yaml
```

### **latest.yml İçeriği**

```yaml
version: 1.3.1
path: Metin2 Dev Toolkit 1.3.1.exe
releaseDate: '2024-01-15'
```

---

## Güncelleme Akışı

```
┌─────────────────────────────────────────────────────────┐
│ Kullanıcı Uygulamayı Açar (v1.3.0)                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Electron: GitHub'dan latest.yml kontrol et              │
│ (https://github.com/.../releases/download/...)          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Yeni versiyon? │
        └────┬───────┬──┘
             │       │
            EVET    HAYIR
             │       │
             ▼       ▼
        Bildir   Sessiz
             │
             ▼
    ┌──────────────────┐
    │ Kullanıcı İndir  │
    │ butonuna tıkla   │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ İndirme Başla            │
    │ (İlerleme gösterilir)    │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ İndirme Tamamlandı       │
    │ "Yeniden Başlat" butonu  │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Kullanıcı Yeniden Başlat │
    │ butonuna tıkla           │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ EXE Çalıştırıl           │
    │ (Kurulum başlar)         │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Uygulama Yeniden Başlar  │
    │ (v1.3.1)                 │
    └──────────────────────────┘
```

---

## Otomatik Güncelleme Kontrolü

### **Kontrol Zamanları**

1. **Uygulama Başlangıcı** - Hemen kontrol et
2. **Her 1 Saat** - Arka planda kontrol et
3. **Manuel** - "Güncelleme Kontrol Et" butonuna tıkla

### **Kod (electron.js)**

```javascript
// Uygulama başlangıcında
app.whenReady().then(() => {
  createWindow();
  checkForUpdatesManual();  // Hemen kontrol et
  
  // Her 1 saatte bir
  setInterval(() => {
    if (mainWindow) {
      checkForUpdatesManual();
    }
  }, 60 * 60 * 1000);
});
```

---

## Hata Durumları

### **GitHub'a Bağlanılamıyor**
- Sessiz başarısız olur
- Kullanıcı bilgilendirilmez
- Uygulama normal çalışır

### **İndirme Başarısız**
- Hata mesajı gösterilir
- "Daha Sonra" butonuyla kapatılabilir
- Sonra tekrar deneyebilir

### **Kurulum Başarısız**
- Hata mesajı gösterilir
- Kullanıcı manuel kurulum yapabilir

---

## Sürüm Yönetimi

### **Semantic Versioning**

```
MAJOR.MINOR.PATCH
  1  .  3  .  0

MAJOR: Büyük değişiklikler (1.0.0 → 2.0.0)
MINOR: Yeni özellikler (1.3.0 → 1.4.0)
PATCH: Bug fixler (1.3.0 → 1.3.1)
```

### **Komutlar**

```bash
npm version patch    # 1.3.0 → 1.3.1
npm version minor    # 1.3.0 → 1.4.0
npm version major    # 1.3.0 → 2.0.0
```

---

## GitHub Actions (Opsiyonel)

Otomatik build ve release için `.github/workflows/release.yml` oluşturabilirsin:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - run: npm run electron-pack
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/**
```

---

## Kontrol Listesi

### **Yeni Sürüm Yayınlamadan Önce**

- [ ] Tüm testler geçti
- [ ] `package.json` versiyonu güncellendi
- [ ] Build hatasız oluştu
- [ ] EXE dosyaları oluştu
- [ ] `latest.yml` doğru versiyon içeriyor

### **Yayınlama Sonrası**

- [ ] GitHub Release oluşturuldu
- [ ] EXE dosyaları upload edildi
- [ ] `latest.yml` upload edildi
- [ ] Release notları yazıldı

---

## Sorun Giderme

### **Güncelleme Kontrol Edilmiyor**

1. İnternet bağlantısını kontrol et
2. GitHub'a erişimi kontrol et
3. `latest.yml` dosyasının GitHub'da olduğunu kontrol et

### **İndirme Başarısız**

1. İnternet hızını kontrol et
2. Disk alanını kontrol et
3. Antivirus'ü kontrol et

### **Kurulum Başarısız**

1. Eski sürümü tamamen kapat
2. Antivirus'ü geçici olarak kapat
3. Admin olarak çalıştır

---

## Özet

✅ **Otomatik Kontrol** - Uygulama başlangıcında ve her saatte  
✅ **Kolay İndirme** - Tek buton tıklaması  
✅ **İlerleme Göstergesi** - Hız, kalan süre, yüzde  
✅ **Otomatik Kurulum** - Yeniden başlat ve bitti  
✅ **Hata Yönetimi** - Sorunlar sessizce işlenir  

**Kullanıcı deneyimi:** Basit, hızlı, güvenli! 🚀
