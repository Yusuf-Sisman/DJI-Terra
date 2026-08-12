# Terra Rehber

**An interactive training guide that walks you through photogrammetry and LiDAR data processing in DJI Terra, step by step from raw flight data to delivery package.**

Terra Rehber is a bilingual (Turkish / English) web application built for surveyors and drone pilots. It branches on the decisions you make at each step: it shows only the steps relevant to your scenario and hides the rest. By the end you have a personalised "processing recipe" for your specific project.

---

## The problem

DJI Terra is powerful software, but its interface assumes you already know what each setting does, which order to choose things in, and how your choices affect the output. The official documentation explains parameters one by one but never ties them together inside a workflow. Users hit these problems:

- Picking the wrong coordinate system — the output shifts by metres and the quality report does not flag it.
- Skipping the vertical datum — elevations come out 40–50 metres wrong and nobody notices until after delivery.
- Choosing the wrong scene or resolution — the model breaks down or the accuracy budget fails.
- Not understanding the control strategy — flying without RTK FIX drifts the model by metres.
- Not planning memory for LiDAR — the job crashes halfway or produces layered point clouds.

Terra Rehber shows these mistakes **before the decision is made**. Every option card carries a "what this choice does" list and, where needed, a warning box.

---

## Scope

The guide covers two processing pipelines end to end:

### Photogrammetry pipeline

Producing orthomosaics, surface models and 3D models from overlapping drone imagery (Zenmuse P1, Phantom 4 RTK, Mavic 3E, M4E and similar). Decision points covered:

| Decision | Options |
|----------|---------|
| Positioning strategy | RTK/PPK only · Ground control points (GCP) · No control |
| Output type | 2D map (DOM + DSM) · 3D model (mesh + point cloud) |
| Scene type (2D) | Field · Urban · Fruit Tree |
| Reconstruction resolution | High (1/1) · Medium (1/2) · Low (1/4) |
| Model quality (3D) | High · Medium · Low |
| Output format (3D) | CAD/GIS · Viewer/web · All |

### LiDAR pipeline

Converting raw scan data from laser scanners such as the Zenmuse L1 / L2 into point clouds. Decision points covered:

| Decision | Options |
|----------|---------|
| Position correction source | Network RTK (CORS/NTRIP) · Own base station · PPK post-processing |
| Point density | By distance (10 cm) · By percentage (100% / 25% / 6.25%) |
| Effective distance range | User-defined lower and upper bound |
| Accuracy optimisation + smoothing | Optimisation on · Both on · Both off |
| Ground classification | Classify + DEM + contours · Classify only · Raw cloud |

### Shared closing

Both pipelines converge at the output coordinate system selection, processing, quality assessment and delivery steps. In total the guide contains **28 steps**, **13 decision points** and **1 conditional step** (the GCP marking screen appears only when GCP is selected as the control strategy).

---

## Features

### Adapts to knowledge level

At the start the user picks a level:

- **Beginner** — Every technical term is explained in plain language with analogies. Each step says exactly where to click on screen. An open glossary strip below the step lists the plain definitions of every term used there.
- **Intermediate** — Standard professional language; fundamentals are not re-taught. Terms appear as tooltips on hover instead of inline text. The focus is on cause and effect and how settings shape the output.
- **Advanced** — Dense technical treatment: adjustment constraints, numeric tolerances, EPSG codes. An extra "technical note" box opens on every step. Click-by-click instructions are hidden; the user is assumed to know the interface.

The level can be changed at any time from the top bar without losing progress. The current step redraws instantly — only the text changes, position and decisions are preserved.

### Region-aware coordinate reference systems

At the start the user picks a working region. Seven regions are defined:

- **Türkiye** — TUREF / TM27–TM45 zones (EPSG 5253–5259), TUDKA99 vertical datum, TG-03/TG-09 geoid. Warnings: the easting trap between TUREF and 3-degree Gauss-Krüger (11 million metres difference), the ~1 m TUREF↔WGS84 gap, regionally varying ED50 transformation parameters. A practical workaround for Terra not shipping the Turkish national geoid.
- **Europe** — ETRS89 / UTM zones (EPSG 25831–25835), EVRF and national datums (DHHN2016, NAP, NGF-IGN69, Alicante). Warning: the ~2.5 cm/year ETRS89↔WGS84 drift.
- **United Kingdom** — OSGB36 / British National Grid (EPSG 27700), ODN vertical datum, OSTN15/OSGM15 grid files. Warning: ~50 m vertical error if the geoid file is not loaded.
- **North America** — NAD83(2011), State Plane logic, NAVD88 + GEOID18. Warning: the 3.28× consequence of mixing feet and metres.
- **Australia / New Zealand** — GDA2020 / MGA zones, AHD + AUSGeoid2020, NZGD2000. Warning: 1.8 m shift from GDA94 to GDA2020.
- **East Africa** — Arc 1960 and WGS84 UTM zones. Warning: the 150–300 m gap between the two datums and the 10,000,000 m northing offset in southern-hemisphere zones.
- **Other / Global** — WGS84 UTM zone calculation (326xx / 327xx), EGM96 and EGM2008 global geoids.

Every EPSG code can be copied to the clipboard with a single click. Region information appears twice in the guide: once as an introduction at the start, and again as a reference when configuring Terra's output coordinate system at the end.

### Outcome-oriented choice cards

At every decision point, options are presented as cards. Each card contains:

- **Title and description** — what the option is.
- **"What this choice does" list** — concrete outcomes: output format produced, expected accuracy, processing time impact, file size.
- **Warning box** (where applicable) — a risk or constraint that comes with this choice, displayed in a red-framed alert.

### Conditional branching

Choices are recorded through state variables (for example `control = gcp`). Subsequent steps are automatically skipped or shown based on these variables. The GCP marking screen opens only when GCP is selected as the control strategy; if RTK or no-control is chosen, the step never appears. The user does not need to be aware of this — the flow simply proceeds naturally.

### Glossary

The guide contains 23 technical terms. Each term has two separate definitions:

- **Technical definition** — the standard professional definition, shown at Intermediate and Advanced level.
- **Plain definition** — a jargon-free explanation enriched with analogies, shown at Beginner level.

Terms in the text are underlined; hovering reveals the definition. At Beginner level an additional open strip below each step lists the plain definitions of every term used there.

### Processing recipe and decision log

When the guide is complete, every decision the user made is displayed as an ordered list. For each decision:

- Which question was asked and which answer was given.
- The primary consequence of that answer.

The recipe can be printed from the browser or saved as a PDF. It serves as a reminder six months later of which settings were chosen and why; it is recommended to include it in the delivery package alongside the accuracy report.

### Bilingual

All content — step text, option descriptions, warnings, the glossary, UI labels, region names and CRS notes — is written in both Turkish and English. A single button in the top bar switches the language; the page does not reload, the current step is redrawn instantly in the other language.

---

## File structure

| File | Size | Responsibility |
|------|------|---------------|
| `index.html` | ~4 KB | Page skeleton, font and icon CDN links, script load order |
| `data.js` | ~188 KB | All content: UI labels, knowledge levels, the CRS database for 7 regions, a 23-term glossary, step visuals (SVG), and the 28-step branching graph |
| `app.js` | ~24 KB | Engine: state management, conditional branching engine, level/region-aware rendering, transition animations, tooltip system, decision log generation |
| `style.css` | ~33 KB | Flight-console aesthetic: colour palette, typography, card layouts, CRS tables, print styles, responsive and reduced-motion rules |

Content is fully separated from the engine. Adding a new step, region or term requires editing only `data.js`; `app.js` and `style.css` do not change.

---

## Design

The visual language is inspired by flight consoles and telemetry interfaces:

- **Background:** `#0a0e13` (deep navy-black) with a faint grid texture
- **Accent colours:** Amber `#ff8f3f` (setup and photogrammetry), Teal `#3edbd1` (LiDAR and general information), Violet `#a98bff` (decision points and advanced level)
- **Signature element:** HUD corner brackets on the console — they fire a short focus-lock pulse on every step transition
- **Typography:** Chakra Petch (headings), Inter (body text), JetBrains Mono (code, EPSG, data)
- **Icons:** Phosphor Icons (CDN, 54 unique icons)

Four files, no build tools, no compilation step. Drop them on GitHub Pages, Cloudflare Pages or any static server.

---
---

# Terra Rehber

**DJI Terra yazılımıyla fotogrametri ve LiDAR verisi işlemeyi, ham uçuş verisinden teslimat paketine kadar adım adım anlatan interaktif eğitim rehberi.**

Terra Rehber, harita mühendisleri ve drone pilotları için tasarlanmış çift dilli (Türkçe / İngilizce) bir web uygulamasıdır. Kullanıcının her adımda verdiği kararlara göre dallanır: yalnızca o senaryoya ait adımları gösterir, gerisini gizler. Sonuçta kullanıcı, kendi projesine özel bir "işleme reçetesi" elde eder.

---

## Sorun

DJI Terra güçlü bir yazılımdır ancak arayüzü, kullanıcının hangi ayarın ne yaptığını, hangi sırayla neyi seçmesi gerektiğini ve seçimlerinin çıktıyı nasıl etkilediğini önceden bildiğini varsayar. Resmi belgeler parametreleri tek tek açıklar ama bunları bir iş akışı içinde birbirine bağlamaz. Sonuç olarak kullanıcılar şu sorunlarla karşılaşır:

- Doğru koordinat sistemini seçememek — çıktı metrelerce kayık olur ve hata rapor sayfasında görünmez.
- Düşey datumu atlamak — rakımlar 40–50 metre yanlış çıkar ve farkına ancak teslimattan sonra varılır.
- Sahne veya çözünürlük ayarını yanlış seçmek — model bozuk çıkar ya da doğruluk bütçesi tutmaz.
- Kontrol noktası stratejisini bilmemek — RTK FIX olmadan uçuş metre mertebesinde kayar.
- LiDAR'da bellek planlaması yapmamak — işlem yarıda düşer veya katmanlı nokta bulutu üretilir.

Terra Rehber, bu hataları **karar verilmeden önce** gösterir. Her seçenek kartında "bunu seçersen ne olur" listesi ve gerektiğinde uyarı kutusu bulunur.

---

## Kapsam

Rehber iki ana işleme hattını uçtan uca kapsar:

### Fotogrametri hattı

Örtüşen drone fotoğraflarından (Zenmuse P1, Phantom 4 RTK, Mavic 3E, M4E vb.) ortomozaik, yüzey modeli ve 3B model üretimi. Kapsanan karar noktaları:

| Karar | Seçenekler |
|-------|-----------|
| Konumlama stratejisi | Yalnız RTK/PPK · Yer kontrol noktalarıyla (GCP) · Kontrolsüz |
| Çıktı türü | 2B harita (DOM + DSM) · 3B model (mesh + nokta bulutu) |
| Sahne tipi (2B) | Field (tarla) · Urban (şehir) · Fruit Tree (meyve ağacı) |
| Yeniden yapılandırma çözünürlüğü | High (1/1) · Medium (1/2) · Low (1/4) |
| Model kalitesi (3B) | High · Medium · Low |
| Çıktı formatı (3B) | CAD/CBS · Görüntüleyici/web · Tümü |

### LiDAR hattı

Zenmuse L1 / L2 gibi lazer tarayıcılardan ham tarama verisinin nokta bulutuna dönüştürülmesi. Kapsanan karar noktaları:

| Karar | Seçenekler |
|-------|-----------|
| Konum düzeltme kaynağı | Ağ RTK (CORS/NTRIP) · Kendi baz istasyonu · PPK son işlem |
| Nokta yoğunluğu | Mesafeye göre (10 cm) · Yüzde (100% / 25% / 6,25%) |
| Etkin mesafe aralığı | Kullanıcı tanımlı alt ve üst sınır |
| Doğruluk optimizasyonu + yumuşatma | Optimizasyon açık · İkisi açık · İkisi kapalı |
| Zemin sınıflandırması | Sınıflandır + DEM + eğri · Yalnız sınıflandır · Ham bulut |

### Ortak kapanış

Her iki hat da çıktı koordinat sistemi seçimi, işleme, kalite değerlendirme ve teslimat adımlarında birleşir. Toplamda **28 adım**, **13 karar noktası** ve **1 koşullu adım** (GCP kontrol noktası ekranı yalnızca GCP seçildiğinde gösterilir) içerir.

---

## Özellikler

### Bilgi seviyesine göre uyarlama

Rehber başında kullanıcı bilgi seviyesini seçer:

- **Başlangıç** — Her teknik terim günlük dille ve benzetmelerle açıklanır. Her adımda ekranda tam olarak nereye tıklanacağı yazılır. Adımın altında kullanılan terimlerin sade tanımlarını içeren açık bir terim şeridi çıkar.
- **Orta** — Standart mesleki dil kullanılır, temel kavramlar tekrar anlatılmaz. Terimler açık yazılmaz, fareyle üstüne gelindiğinde tooltip olarak görünür. Vurgu neden-sonuç ilişkisinde ve ayarların çıktıya etkisindedir.
- **İleri** — Yoğun teknik anlatım: dengeleme kısıtları, sayısal toleranslar, EPSG kodları. Her adımda ek bir "teknik not" kutusu açılır. Tıkla-yap listeleri gizlenir; kullanıcının ekranı zaten bildiği varsayılır.

Seviye, ilerleme kaybolmadan üst bardaki düğmeden istenildiği an değiştirilebilir. Aynı adım anında yeniden çizilir — yalnızca metin değişir, konum ve kararlar korunur.

### Bölgeye göre koordinat referans sistemleri

Rehber başında kullanıcı çalışma bölgesini seçer. Yedi bölge tanımlıdır:

- **Türkiye** — TUREF / TM27–TM45 dilimleri (EPSG 5253–5259), TUDKA99 düşey datumu, TG-03/TG-09 jeoidi. Uyarılar: TUREF ile 3 derece Gauss-Krüger arasındaki sağa değeri tuzağı (11 milyon metre fark), TUREF↔WGS84 ~1 m farkı, ED50 dönüşüm parametrelerinin bölgeden bölgeye değişmesi. Terra'nın Türkiye ulusal jeoidini içermemesine karşı pratik çözüm önerisi.
- **Avrupa** — ETRS89 / UTM dilimleri (EPSG 25831–25835), EVRF ve ülke datumları (DHHN2016, NAP, NGF-IGN69, Alicante). Uyarı: ETRS89↔WGS84 yıllık ~2,5 cm kayma.
- **Birleşik Krallık** — OSGB36 / British National Grid (EPSG 27700), ODN düşey datumu, OSTN15/OSGM15 ızgara dosyaları. Uyarı: jeoit dosyası yüklenmezse ~50 m düşey hata.
- **Kuzey Amerika** — NAD83(2011), State Plane mantığı, NAVD88 + GEOID18. Uyarı: ayak/metre karışıklığının 3,28 katlık sonucu.
- **Avustralya / Yeni Zelanda** — GDA2020 / MGA dilimleri, AHD + AUSGeoid2020, NZGD2000. Uyarı: GDA94→GDA2020 1,8 m kayma.
- **Doğu Afrika** — Arc 1960 ve WGS84 UTM dilimleri. Uyarı: iki datum arasındaki 150–300 m fark ve güney yarımküre dilimlerinde 10.000.000 m yukarı değeri.
- **Diğer / Küresel** — WGS84 UTM dilim hesaplaması (326xx / 327xx), EGM96 ve EGM2008 küresel jeoit.

Her bölgenin EPSG kodları tek tıkla panoya kopyalanabilir. Bölge bilgisi rehberde iki kez gösterilir: başta genel tanışma, sonda Terra'nın çıktı ayarı yapılırken referans olarak.

### Sonuç odaklı seçim kartları

Her karar noktasında seçenekler kart biçiminde sunulur. Her kartta şunlar bulunur:

- **Başlık ve açıklama** — seçeneğin ne olduğu.
- **"Bunu seçersen ne olur" listesi** — somut sonuçlar: üretilecek çıktı formatı, beklenen doğruluk, işlem süresi etkisi, dosya boyutu.
- **Uyarı kutusu** (gerektiğinde) — bu seçimle birlikte gelen risk veya kısıtlama; kırmızı çerçevede dikkat çekecek biçimde.

### Koşullu dallanma

Seçimler durum değişkenleri aracılığıyla kaydedilir (örneğin `control = gcp`). Sonraki adımlar bu değişkenlere göre otomatik atlanır veya gösterilir. GCP kontrol noktası ekranı yalnızca kontrol stratejisi olarak GCP seçildiğinde açılır; RTK veya kontrolsüz seçildiyse bu adım hiç görünmez. Kullanıcı bunun farkında bile olmaz — akış doğal ilerler.

### Terim sözlüğü

Rehber 23 teknik terim içerir. Her terimin iki ayrı tanımı vardır:

- **Teknik tanım** — Orta ve İleri seviyede gösterilen standart mesleki tanım.
- **Sade tanım** — Başlangıç seviyesinde gösterilen, jargon içermeyen, benzetmelerle zenginleştirilmiş açıklama.

Metinde geçen terimler altı çizili olarak işaretlenir; fareyle üstüne gelindiğinde tanımı açılır. Başlangıç seviyesinde ayrıca her adımın altında o adımda geçen terimlerin sade tanımlarını listeleyen açık bir şerit bulunur.

### İşleme reçetesi ve karar kaydı

Rehber tamamlandığında kullanıcının verdiği tüm kararlar sıralı bir liste olarak gösterilir. Her karar için:

- Hangi soruya hangi cevabın verildiği
- O cevabın birincil sonucu

Bu reçete tarayıcıdan yazdırılabilir veya PDF olarak kaydedilebilir. Aynı işi altı ay sonra tekrarlamak gerektiğinde hangi ayarların neden seçildiğini hatırlatır; teslimat dosyasında doğruluk raporunun yanına eklenmesi önerilir.

### Çift dil

Tüm içerik — adım metinleri, seçenek açıklamaları, uyarılar, terim sözlüğü, arayüz etiketleri, bölge adları ve CRS notları — hem Türkçe hem İngilizce olarak yazılmıştır. Üst bardaki tek düğmeyle geçiş yapılır; sayfa yeniden yüklenmez, mevcut adım anında diğer dilde yeniden çizilir.

---

## Dosya yapısı

| Dosya | Boyut | Sorumluluk |
|-------|-------|-----------|
| `index.html` | ~4 KB | Sayfa iskeleti, font ve ikon CDN bağlantıları, script yükleme sırası |
| `data.js` | ~188 KB | Tüm içerik: arayüz etiketleri, bilgi seviyeleri, 7 bölgenin CRS veritabanı, 23 terimlik sözlük, adım görselleri (SVG), 28 adımlık dallanan graf |
| `app.js` | ~24 KB | Motor: durum yönetimi, koşullu dallanma motoru, seviyeye/bölgeye duyarlı render, geçiş animasyonları, tooltip sistemi, karar kaydı üretimi |
| `style.css` | ~33 KB | Uçuş konsolu estetiği: renk paleti, tipografi, kart düzenleri, CRS tabloları, yazdırma, responsive ve reduced-motion kuralları |

İçerik motordan tamamen ayrılmıştır. Yeni adım, bölge veya terim eklemek için yalnızca `data.js` düzenlenir; `app.js` ve `style.css` değişmez.

---

## Tasarım

Görsel dil, uçuş konsolu ve telemetri arayüzlerinden esinlenmiştir:

- **Zemin:** `#0a0e13` (derin lacivert-siyah) üzerine hafif ızgara dokusu
- **Vurgu renkleri:** Amber `#ff8f3f` (hazırlık ve fotogrametri), Teal `#3edbd1` (LiDAR ve genel bilgi), Violet `#a98bff` (karar noktaları ve ileri seviye)
- **İmza öğe:** Konsol köşelerindeki HUD braketleri — her adım geçişinde kısa bir odaklanma pulsu yapar
- **Tipografi:** Chakra Petch (başlıklar), Inter (gövde metin), JetBrains Mono (kod, EPSG, veri)
- **İkonlar:** Phosphor Icons (CDN, 54 benzersiz ikon)

Dört dosyadan oluşur, build aracı veya derleme adımı gerektirmez. Doğrudan GitHub Pages, Cloudflare Pages veya herhangi bir statik sunucuya konulabilir.
