# 🚀 Metin2 Dev Toolkit - Release Rehberi

Bu rehber, Metin2 Dev Toolkit'in yeni versiyonlarını nasıl yayınlayacağınızı adım adım anlatır.

## 📋 Ön Gereksinimler

### 1. GitHub Repository Oluştur
```bash
# GitHub'da yeni repo oluştur: metin2-dev-toolkit
# Repo URL'ini kopyala
```

### 2. GitHub CLI Kurulumu (Opsiyonel)
```bash
# Windows için:
winget install GitHub.cli
# veya https://cli.github.com/ adresinden indir
```

### 3. Repository'yi GitHub'a Push Et
```bash
# Remote ekle (GITHUB_USERNAME'i kendi kullanıcı adınla değiştir)
git remote add origin https://github.com/GITHUB_USERNAME/metin2-dev-toolkit.git

# Push et
git branch -M main
git push -u origin main
```

## 🔄 Güncelleme Süreci

### Yöntem 1: Otomatik Release (Önerilen)

#### A. Patch Güncelleme (1.1.0 → 1.1.1)
```bash
npm run version-patch
```

#### B. Minor Güncelleme (1.1.0 → 1.2.0)
```bash
npm run version-minor
```

#### C. Major Güncelleme (1.1.0 → 2.0.0)
```bash
npm run version-major
```

### Yöntem 2: Manuel Release

#### 1. Versiyonu Güncelle
```bash
# package.json'da version'ı manuel değiştir
# Örnek: "version": "1.2.0"
```

#### 2. Build Al
```bash
npm run electron-pack
```

#### 3. GitHub'a Tag Push Et
```bash
git add .
git commit -m "Release v1.2.0"
git tag v1.2.0
git push origin main --tags
```

#### 4. GitHub Release Oluştur
- GitHub repo'ya git
- "Releases" → "Create a new release"
- Tag: `v1.2.0`
- Title: `Metin2 Dev Toolkit v1.2.0`
- Dosyaları yükle:
  - `dist/Metin2 Dev Toolkit Setup 1.2.0.exe`
  - `dist/Metin2 Dev Toolkit Setup 1.2.0.exe.blockmap`
  - `dist/latest.yml`

## 📁 Yayınlanması Gereken Dosyalar

Her release'de şu dosyalar olmalı:
- ✅ `*.exe` - Ana kurulum dosyası
- ✅ `*.exe.blockmap` - Delta güncelleme için
- ✅ `latest.yml` - Güncelleme metadata'sı

## 🔧 GitHub Actions (Otomatik Build)

Repository'de GitHub Actions aktif. Tag push ettiğinde otomatik:
1. Build alır
2. Release oluşturur
3. Dosyaları yükler

### Actions'ı Aktifleştir:
1. GitHub repo → "Actions" tab
2. Workflow'u enable et
3. Tag push et: `git push --tags`

## 🎯 Kullanıcı Deneyimi

### İlk Kurulum:
1. Kullanıcı `Metin2 Dev Toolkit Setup 1.1.0.exe` indirir
2. Kurar ve kullanır

### Güncelleme:
1. Yeni versiyon (1.2.0) yayınlanır
2. Kullanıcı uygulamayı açar
3. "Güncelleme mevcut" bildirimi gelir
4. Arka planda indirir
5. "Yeniden başlat" der
6. Otomatik güncellenir ✨

## 🐛 Sorun Giderme

### Auto-updater Çalışmıyor:
- `package.json`'da `publish` ayarlarını kontrol et
- GitHub release'de `latest.yml` dosyası var mı?
- Repository public mi?

### Build Hatası:
- Node.js 18+ kullanıyor musun?
- `npm ci` ile temiz kurulum yap
- `dist/` klasörünü sil ve tekrar build al

### GitHub Actions Hatası:
- Repository'de "Actions" aktif mi?
- `GITHUB_TOKEN` permissions yeterli mi?

## 📝 Changelog Örneği

```markdown
## v1.2.0 - 2024-01-15

### ✨ Yeni Özellikler
- Proto Editor tam implementasyonu
- Gelişmiş filtreleme sistemi
- Toplu düzenleme desteği

### 🐛 Hata Düzeltmeleri
- Shop Manager drag&drop sorunu
- NPC önizleme performansı

### 🔧 İyileştirmeler
- UI responsiveness
- Memory kullanımı optimizasyonu
```

## 🚀 Hızlı Başlangıç

```bash
# 1. Repo'yu GitHub'a push et
git remote add origin https://github.com/USERNAME/metin2-dev-toolkit.git
git push -u origin main

# 2. İlk release'i oluştur
npm run version-minor

# 3. Kullanıcılar artık otomatik güncelleme alacak! 🎉
```

---

**Not**: `GITHUB_USERNAME` kısmını kendi GitHub kullanıcı adınla değiştirmeyi unutma!