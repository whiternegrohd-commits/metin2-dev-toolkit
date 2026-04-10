# GitHub Release Oluşturma Kılavuzu

## Otomatik Yol (Önerilen)

Eğer GitHub CLI kurulu ise:

```bash
gh release create v1.3.1 \
  dist/Metin2\ Dev\ Toolkit\ 1.3.1.exe \
  dist/latest.yml \
  --title "Metin2 Dev Toolkit v1.3.1" \
  --notes "Sunucu Yönetim Paneli eklendi: ServerManager, PlayerList, QuestEditor, QueryBuilder"
```

## Manuel Yol

1. GitHub'a git: https://github.com/whiternegrohd-commits/metin2-dev-toolkit/releases
2. "Create a new release" butonuna tıkla
3. Tag: `v1.3.1`
4. Title: `Metin2 Dev Toolkit v1.3.1`
5. Description:
```
## Yeni Özellikler

### 🖥️ Sunucu Yönetimi
- Sunucu başlatma/durdurma/yeniden başlatma
- Gerçek zamanlı istatistikler
- Sunucu günlüğü

### 👥 Oyuncu Listesi
- Oyuncu arama ve sıralama
- Oyuncu yasaklama/silme
- Detaylı oyuncu bilgileri

### 📖 Quest Editörü
- Quest CRUD işlemleri
- Quest arama ve filtreleme
- Ödül yönetimi

### 🔍 Query Builder
- SQL sorguları yazma ve çalıştırma
- Sonuçları CSV olarak export
- Kaydedilen sorguları yönetme

## Dosyalar

- `Metin2 Dev Toolkit 1.3.1.exe` - Portable uygulaması
- `latest.yml` - Güncelleme bilgisi
```

6. Dosyaları ekle:
   - `dist/Metin2 Dev Toolkit 1.3.1.exe`
   - `dist/latest.yml`

7. "Publish release" butonuna tıkla

## Sonra Ne Olur?

Kullanıcılar:
1. Uygulamayı açarlar
2. Otomatik güncelleme kontrolü yapılır
3. Yeni versiyon varsa bildirim gösterilir
4. "İndir" butonuna tıklarlar
5. Otomatik kurulur

**Bitti!** 🚀
