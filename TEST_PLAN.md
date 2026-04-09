# 🧪 Hot Reload & Güncelleme Sistemi Test Planı

## Test Ortamı

### Hazırlanan Dosyalar
- ✅ **v1.2.0**: `dist/Metin2 Dev Toolkit Setup 1.2.0.exe` (Eski versiyon)
- ✅ **v1.2.1**: `dist/Metin2 Dev Toolkit Setup 1.2.1.exe` (Yeni versiyon)
- ✅ **Güncelleme Bilgisi**: `dist/latest.yml` (v1.2.1 bilgisi)

### Değişiklikler
Dashboard'a test başlığı eklendi:
```
🚀 Metin2 Dev Toolkit v1.2.0 - HOT RELOAD TEST
Bu mesaj değiştirildi! Güncelleme kontrol et butonuna tıkla ve yeni versiyonu indir.
```

---

## Test Adımları

### 1️⃣ **v1.2.0 EXE'yi Aç**
```bash
dist/Metin2 Dev Toolkit Setup 1.2.0.exe
```

**Beklenen Sonuç:**
- ✅ Uygulama açılır
- ✅ Dashboard'da eski başlık görünür (test başlığı YOK)
- ✅ Sağ alt köşede "Güncelleme Kontrol Et" butonu görünür

### 2️⃣ **"Güncelleme Kontrol Et" Butonuna Tıkla**

**Beklenen Sonuç:**
- ✅ Mavi bildirim gösterilir: "Güncelleme Mevcut"
- ✅ v1.2.1 versiyonu gösterilir
- ✅ "İndir" ve "Daha Sonra" butonları görünür

### 3️⃣ **"İndir" Butonuna Tıkla**

**Beklenen Sonuç:**
- ✅ Yeşil bildirim gösterilir: "Güncelleme İndiriliyor"
- ✅ Progress bar gösterilir (0% → 100%)
- ✅ 3 bilgi kartı gösterilir:
  - İlerleme (%)
  - Hız (KB/s)
  - Boyut (MB)

### 4️⃣ **İndirme Tamamlanana Kadar Bekle**

**Beklenen Sonuç:**
- ✅ Progress bar 100% olur
- ✅ Bildirim değişir: "Güncelleme Hazır"
- ✅ "Şimdi Yeniden Başlat" butonu gösterilir

### 5️⃣ **"Şimdi Yeniden Başlat" Butonuna Tıkla**

**Beklenen Sonuç:**
- ✅ Uygulama kapanır
- ✅ Güncelleme uygulanır
- ✅ Uygulama yeniden açılır
- ✅ Dashboard'da YENİ başlık görünür:
  ```
  🚀 Metin2 Dev Toolkit v1.2.0 - HOT RELOAD TEST
  Bu mesaj değiştirildi! Güncelleme kontrol et butonuna tıkla ve yeni versiyonu indir.
  ```

### 6️⃣ **Versiyonu Kontrol Et**

**Beklenen Sonuç:**
- ✅ Uygulama başlığında v1.2.1 gösterilir
- ✅ Tekrar "Güncelleme Kontrol Et" tıkla
- ✅ Bildirim gösterilmez (güncel versiyon)

---

## Dev Modunda Hot Reload Testi

### Adım 1: Dev Modunu Başlat
```bash
npm run electron-dev
```

### Adım 2: Dosya Değiştir
Herhangi bir `.js` dosyasını değiştir ve kaydet.

**Beklenen Sonuç:**
- ✅ Webpack yeniden compile eder
- ✅ Yeşil bildirim gösterilir: "Değişiklikler yüklendi"
- ✅ Saat gösterilir (örn: 14:30:45)
- ✅ 3 saniye sonra bildirim kapanır

### Adım 3: Tekrar Değiştir
Başka bir dosyayı değiştir.

**Beklenen Sonuç:**
- ✅ Aynı işlem tekrarlanır
- ✅ Saat güncellenir
- ✅ Hiç manuel restart gerekmiyor

---

## Beklenen Davranışlar

### ✅ Başarılı Güncelleme
```
v1.2.0 (Eski)
    ↓
"Güncelleme Kontrol Et" tıkla
    ↓
"Güncelleme Mevcut" bildirim
    ↓
"İndir" tıkla
    ↓
"Güncelleme İndiriliyor" (progress bar)
    ↓
"Güncelleme Hazır" (restart butonu)
    ↓
"Şimdi Yeniden Başlat" tıkla
    ↓
v1.2.1 (Yeni) ✅
```

### ✅ Hot Reload
```
Dosya değişir
    ↓
Webpack compile eder
    ↓
"Değişiklikler yüklendi" bildirim
    ↓
Component yeniden render
    ↓
Bildirim kapanır
```

---

## Hata Senaryoları

### ❌ Güncelleme Kontrol Başarısız
- Bildirim gösterilmez
- Console'da hata mesajı görünür
- **Çözüm**: `latest.yml` dosyasını kontrol et

### ❌ İndirme Başarısız
- Progress bar durur
- Hata bildirim gösterilir
- **Çözüm**: İnternet bağlantısını kontrol et

### ❌ Hot Reload Çalışmıyor
- Dosya değişse de bildirim gösterilmez
- **Çözüm**: Electron'u yeniden başlat

---

## Performans Kontrolleri

- ⏱️ Güncelleme kontrol süresi: < 2 saniye
- ⏱️ İndirme hızı: > 1 MB/s (normal internet)
- ⏱️ Hot reload süresi: < 1 saniye
- 💾 Bellek kullanımı: < 300 MB

---

## Sonuç Raporu

Test tamamlandıktan sonra:

```
✅ Güncelleme Sistemi: ÇALIŞIYOR
✅ Hot Reload: ÇALIŞIYOR
✅ UI Göstergeler: ÇALIŞIYOR
✅ Performans: KABUL EDİLEBİLİR

Sonuç: BAŞARILI ✅
```

---

**Not**: Test sırasında herhangi bir sorun olursa, console'u (F12) açarak hata mesajlarını kontrol et!
