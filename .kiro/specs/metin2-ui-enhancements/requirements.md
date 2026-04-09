# Requirements Document: Metin2 Dev Toolkit UI/UX Enhancements

## Introduction

Bu dokümanda Metin2 Dev Toolkit'e eklenecek üç UI/UX iyileştirmesi tanımlanmıştır:

1. **Canlı İstatistik Grafiği (Sparkline)**: Dashboard'da online oyuncu sayısının son 24 saatlik zaman serisi verilerini görselleştiren küçük bir çizgi grafiği
2. **Modül Durum Göstergeleri**: Her modül kartında son kullanım zamanını gösteren dinamik göstergeler
3. **Karanlık Mod Varyasyonları**: Mevcut koyu tema yanında "OLED Black" ve "Midnight Blue" alternatif tema seçenekleri

Proje React 18 + Tailwind CSS tabanlı Electron masaüstü uygulamasıdır ve MySQL veritabanı entegrasyonuna sahiptir.

## Glossary

- **Dashboard**: Ana kontrol paneli, sistem istatistiklerini ve modül kartlarını gösteren sayfa
- **Sparkline**: Küçük, etiketli eksenleri olmayan çizgi grafiği, zaman serisi verilerini kompakt şekilde gösterir
- **Online_Player_Count**: Veritabanında aktif olan oyuncu sayısı
- **Module_Card**: Dashboard'da modülleri temsil eden kartlar (Shop Manager, Proto Editor vb.)
- **Last_Used_Timestamp**: Bir modülün son ne zaman açıldığı/kullanıldığı zamanı
- **Theme_Variant**: Uygulamanın görsel stilini tanımlayan renk ve stil seti
- **AppContext**: React Context API ile global state yönetimi
- **LanguageContext**: Çok dilli destek için global dil ayarları
- **localStorage**: Tarayıcı/Electron uygulamasında kalıcı veri depolama
- **Database**: MySQL veritabanı, oyuncu ve sistem verilerini içerir
- **Settings_Modal**: Kullanıcı ayarlarını değiştirmek için modal pencere

---

## Requirements

### Requirement 1: Canlı İstatistik Grafiği (Sparkline)

**User Story:** Bir sunucu yöneticisi olarak, Dashboard'da online oyuncu sayısının son 24 saatlik trendini görmek istiyorum, böylece sunucunun yoğunluk dönemlerini hızlıca analiz edebilirim.

#### Acceptance Criteria

1. WHEN Dashboard yüklendiğinde, THE Dashboard SHALL "Online Oyuncu" kartında son 24 saatlik veri noktalarını gösteren bir Sparkline grafiği göster
2. WHEN her 5 dakikada bir veri güncellemesi yapıldığında, THE Sparkline SHALL yeni veri noktasını grafiğe ekle ve en eski veriyi kaldır (24 saatlik pencere korunsun)
3. WHEN kullanıcı Sparkline'ın üzerine geldiğinde, THE Tooltip SHALL seçilen saatin oyuncu sayısını ve tam zamanını göster
4. WHEN veritabanı bağlantısı koptuğunda, THE Sparkline SHALL gri renkte gösterilsin ve "Veri Alınamıyor" mesajı göster
5. WHEN uygulama başlatıldığında, THE Sparkline SHALL localStorage'dan önceki verileri yükle ve eksik saatleri veritabanından sor
6. THE Sparkline SHALL maksimum 24 veri noktası içer ve her noktanın genişliği eşit olsun
7. THE Sparkline SHALL renk olarak cyber-green (#00FF7F) kullan ve hover durumunda vivid-blue (#0080FF) göster

#### Technical Constraints

- Sparkline grafiği recharts veya Chart.js gibi harici kütüphane kullanmadan SVG ile uygulanabilir
- Veri depolama: localStorage'da son 24 saatlik veri tutulacak, veritabanında ise günlük özet tutulabilir
- Performans: Sparkline render etme süresi 50ms'den az olmalı
- Veri güncelleme: Her 5 dakikada bir otomatik güncelleme, manuel refresh butonu da olabilir

#### Dependencies

- Database.query() fonksiyonu ile player tablosundan COUNT sorgusu
- AppContext'ten global state erişimi
- localStorage API

---

### Requirement 2: Modül Durum Göstergeleri

**User Story:** Bir geliştirici olarak, her modülün son ne zaman kullanıldığını görmek istiyorum, böylece hangi araçları sık kullandığımı ve hangilerini ihmal ettiğimi takip edebilirim.

#### Acceptance Criteria

1. WHEN Dashboard modül kartları gösterildiğinde, THE Module_Card SHALL kartın sağ üst köşesinde "Last used: X hours ago" veya "Last used: X minutes ago" göster
2. WHEN modül kartına tıklanıp modül açıldığında, THE System SHALL o modülün Last_Used_Timestamp'ini güncelle ve localStorage'a kaydet
3. WHEN modül hiç açılmamışsa, THE Module_Card SHALL "Never used" göster
4. WHEN Last_Used_Timestamp 1 saatten az ise, THE Indicator SHALL cyber-green renkte gösterilsin
5. WHEN Last_Used_Timestamp 1-24 saat arasında ise, THE Indicator SHALL vivid-blue renkte gösterilsin
6. WHEN Last_Used_Timestamp 24 saatten fazla ise, THE Indicator SHALL text-muted renkte gösterilsin
7. WHEN kullanıcı göstergenin üzerine geldiğinde, THE Tooltip SHALL tam tarih ve saati göster (örn: "2024-01-15 14:30:45")
8. THE Indicator SHALL maksimum 30 piksel genişliğinde olsun ve kartın tasarımını bozmayacak şekilde yerleştirilsin

#### Technical Constraints

- Veri depolama: localStorage'da modül başına son kullanım zamanı tutulacak
- Zaman hesaplaması: İstemci tarafında yapılacak, sunucu saati ile senkronize edilebilir
- Performans: Gösterge render etme süresi 10ms'den az olmalı
- Veri yapısı: `{ moduleId: string, lastUsed: timestamp, count: number }`

#### Dependencies

- localStorage API
- React useEffect hook ile modül açılış olaylarını takip
- Tooltip bileşeni (lucide-react Icon + custom tooltip)

---

### Requirement 3: Karanlık Mod Varyasyonları

**User Story:** Bir kullanıcı olarak, farklı koyu tema seçenekleri arasında seçim yapmak istiyorum, böylece gözlerim için en rahat tema bulabilirim.

#### Acceptance Criteria

1. WHEN Settings Modal açıldığında, THE Settings_Modal SHALL "Theme" bölümünde üç tema seçeneği göster: "Cyber Green" (mevcut), "OLED Black", "Midnight Blue"
2. WHEN bir tema seçildiğinde, THE System SHALL seçilen temayı AppContext'e kaydet ve localStorage'a persist et
3. WHEN uygulama başlatıldığında, THE System SHALL localStorage'dan kaydedilen temayı yükle ve uygula
4. WHEN "OLED Black" tema seçildiğinde, THE System SHALL arka plan rengini #000000 (saf siyah) yap ve diğer renkleri buna göre ayarla
5. WHEN "Midnight Blue" tema seçildiğinde, THE System SHALL arka plan rengini #0A1428 (gece mavisi) yap ve accent renkleri mavi tonlarında ayarla
6. WHEN tema değiştirildiğinde, THE System SHALL tüm açık sayfalar ve modallar dahil tüm UI'ı anında güncelle (sayfa yenileme gerekmez)
7. THE Theme_Variant SHALL tailwind.config.js'de tanımlanmış renk paletleri kullan ve CSS custom properties ile override edilebilir olsun
8. WHEN kullanıcı tema seçeneğinin üzerine geldiğinde, THE Preview SHALL seçilen temada küçük bir önizleme göster

#### Technical Constraints

- Tema depolama: localStorage'da tema adı tutulacak
- Tema uygulama: Tailwind CSS class'ları veya CSS custom properties ile yapılacak
- Performans: Tema değişimi 100ms'den az sürmeli
- Uyumluluk: Tüm mevcut bileşenler yeni temalarla uyumlu olmalı
- Renk paletleri:
  - **Cyber Green** (mevcut): dark-bg (#0F0F0F), cyber-green (#00FF7F), vivid-blue (#0080FF)
  - **OLED Black**: dark-bg (#000000), cyber-green (#00FF7F), vivid-blue (#0080FF)
  - **Midnight Blue**: dark-bg (#0A1428), cyber-green (#00FF7F), vivid-blue (#0080FF)

#### Dependencies

- AppContext ile global state yönetimi
- localStorage API
- tailwind.config.js renk tanımları
- CSS custom properties (optional)

---

## Implementation Notes

### Data Storage Strategy

1. **Sparkline Verileri**: 
   - localStorage'da: `sparklineData: [{ hour: string, count: number }, ...]` (24 saat)
   - Veritabanında: Günlük özet tablosu (opsiyonel, uzun vadeli analiz için)

2. **Modül Kullanım Zamanları**:
   - localStorage'da: `moduleUsage: { 'shop-manager': timestamp, 'proto-editor': timestamp, ... }`
   - Veritabanında: Tutulmayabilir (isteğe bağlı)

3. **Tema Seçimi**:
   - localStorage'da: `theme: 'cyber-green' | 'oled-black' | 'midnight-blue'`
   - AppContext'te: Global state olarak tutulacak

### Performance Considerations

- Sparkline: SVG render etme, 50ms'den az
- Modül göstergeleri: Basit string formatting, 10ms'den az
- Tema değişimi: CSS class toggle, 100ms'den az
- Veri güncelleme: 5 dakikalık interval, arka planda yapılacak

### UX Considerations

- Sparkline hover tooltip'i, grafik üzerinde takip etmeli
- Modül göstergeleri, kartın tasarımını bozmayacak şekilde yerleştirilmeli
- Tema seçimi, anında görsel geri bildirim vermelidir
- Tüm yeni özellikler LanguageContext ile çeviri desteği almalıdır

---

## Glossary Definitions (Extended)

- **Sparkline**: Bağlam içinde veri trendini gösteren, etiketli eksenleri olmayan küçük çizgi grafiği
- **Tooltip**: Fare üzerine geldiğinde gösterilen bilgi kutusu
- **Theme_Variant**: Uygulamanın renk ve stil setini tanımlayan konfigürasyon
- **localStorage**: Electron uygulamasında kalıcı veri depolama (tarayıcı API)
- **CSS Custom Properties**: CSS değişkenleri, dinamik stil değişimi için
- **Tailwind CSS**: Utility-first CSS framework, renk ve stil tanımları için
