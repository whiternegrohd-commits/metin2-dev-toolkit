# 🚀 Hızlı Test Rehberi

## Sorun Çözüldü! ✅

### Yapılan Düzeltmeler
1. **Electron Handler**: `check-for-updates` handler'ı düzgün implement edildi
2. **TopBar Download Butonu**: Şimdi güncelleme kontrol fonksiyonunu çalıştırıyor
3. **Console Logging**: Debug için detaylı log mesajları eklendi
4. **Bildirim Sistemi**: TopBar'da kontrol sonuçları gösterilir

---

## Test Adımları

### 1️⃣ **v1.2.0 EXE'yi Aç**
```
dist/Metin2 Dev Toolkit Setup 1.2.0.exe
```

### 2️⃣ **İki Yoldan Güncelleme Kontrol Et**

#### Yol 1: TopBar Download Butonu (Kırmızı ok)
- Sağ üst köşedeki **download ikonu**'na tıkla
- Icon döner (loading)
- Bildirim gösterilir

#### Yol 2: UpdateNotification Butonu (Sağ alt)
- Sağ alt köşedeki **"Güncelleme Kontrol Et"** butonuna tıkla
- Mavi bildirim gösterilir

### 3️⃣ **Beklenen Sonuçlar**

#### TopBar Download Butonu
```
Tıkla
  ↓
Icon döner (2 saniye)
  ↓
Bildirim gösterilir (TopBar'da)
  ↓
Mavi "Güncelleme Mevcut" bildirim (sağ alt)
```

#### UpdateNotification Butonu
```
Tıkla
  ↓
Mavi "Güncelleme Mevcut" bildirim
  ↓
"İndir" butonuna tıkla
  ↓
Yeşil "Güncelleme İndiriliyor" (progress bar)
  ↓
"Güncelleme Hazır" (restart butonu)
  ↓
"Şimdi Yeniden Başlat" tıkla
  ↓
v1.2.2 açılır ✅
```

---

## Debug Bilgisi

### Console'u Açmak (F12)
Eğer sorun olursa console'u açarak şu mesajları ara:

```
[TOPBAR] Güncelleme kontrol başlatıldı
[TOPBAR] Kontrol sonucu: { success: true, ... }

[UPDATE-NOTIFICATION] Güncelleme kontrol başlatıldı
[UPDATE-NOTIFICATION] Kontrol sonucu: { success: true, ... }

[UPDATE] Yeni versiyon mevcut: { version: '1.2.2', ... }
```

### Hata Mesajları
```
[TOPBAR] Kontrol hatası: ...
[UPDATE-NOTIFICATION] Kontrol hatası: ...
[UPDATE] Kontrol hatası: ...
```

---

## Versiyonlar

| Versiyon | Dosya | Durum |
|----------|-------|-------|
| 1.2.0 | `Metin2 Dev Toolkit Setup 1.2.0.exe` | Eski (test için) |
| 1.2.1 | `Metin2 Dev Toolkit Setup 1.2.1.exe` | Orta |
| 1.2.2 | `Metin2 Dev Toolkit Setup 1.2.2.exe` | Yeni (latest) |

---

## Sonraki Adımlar

1. ✅ v1.2.0 aç
2. ✅ Download butonuna tıkla
3. ✅ "Güncelleme Mevcut" bildirim görsün
4. ✅ "İndir" tıkla
5. ✅ İndirme tamamlanana kadar bekle
6. ✅ "Şimdi Yeniden Başlat" tıkla
7. ✅ v1.2.2 açılacak

**Başarılı! 🎉**

---

## Notlar

- 📍 Download butonu (TopBar) ve "Güncelleme Kontrol Et" (sağ alt) aynı işlevi yapıyor
- 🔄 Her ikisine de tıklayabilirsin
- 📊 Bildirimler TopBar'da ve sağ alt köşede gösterilir
- 🐛 Sorun olursa F12 ile console'u aç ve log mesajlarını kontrol et

---

**Hazırız! Test et! 🚀**
