# Terra Rehber

**DJI Terra ile fotogrametri ve LiDAR verisi işlemeyi ham veriden teslime kadar adım adım anlatan, interaktif ve çift dilli (TR/EN) bir eğitim rehberi.**

Harita mühendisleri ve drone pilotları için tasarlandı. Rehber, kullanıcının seçimlerine göre dallanır; bilgi seviyesine göre kullandığı terminolojiyi ve çalışılan bölgeye göre gösterdiği koordinat referans sistemlerini otomatik uyarlar.

Yalnızca HTML + CSS + vanilla JavaScript ile yazıldı. Build aracı, paket yöneticisi ya da derleme adımı gerektirmez — dört dosyayı bir sunucuya koymak yeterlidir.

---

## Öne çıkan özellikler

- **Bilgi seviyesi sistemi.** Başlangıç, Orta ve İleri olmak üzere üç seviye. Her adım metni üç ayrı sürümde yazılıdır: başlangıçta terimler günlük dille açıklanır ve adım altında bir terim şeridi çıkar; orta seviyede terimler tooltip olarak kalır; ileri seviyede sayısal toleranslar ve EPSG kodları içeren ek teknik not kutusu açılır. Seviye, ilerleme kaybolmadan istenildiği an değiştirilebilir.
- **Bölgeye göre koordinat referans sistemleri.** Yedi bölge (Türkiye, Avrupa, Birleşik Krallık, Kuzey Amerika, Okyanusya, Doğu Afrika, Küresel) için yatay ve düşey datumlar, EPSG kodlarıyla ve tek tıkla kopyalanabilir biçimde listelenir. Bölgeye özel tuzaklar (TUREF ↔ 3° Gauss-Krüger sağa değeri farkı gibi) ayrıca uyarılır.
- **Sonuç odaklı seçimler.** Her seçenek kartında "bunu seçersen ne olur" listesi ve gerektiğinde uyarı kutusu bulunur.
- **Dallanan senaryo.** Fotogrametri ve LiDAR için ayrı iş akışları; konumlama stratejisi (RTK / GCP / kontrolsüz), çıktı türü (2B / 3B) ve LiDAR parametreleri (yoğunluk, sınıflandırma, optimizasyon) seçimine göre gereksiz adımlar gizlenir.
- **Karar kaydı ve yazdırma.** Rehber sonunda verilen tüm kararların ve gerekçelerinin bulunduğu bir "reçete" çıkar; yazdırılabilir veya PDF olarak alınıp proje dosyasına eklenebilir.
- **Çift dil.** Tüm içerik Türkçe ve İngilizce; tek tıkla geçiş.

---

## Dosya yapısı

| Dosya | Sorumluluk |
|-------|-----------|
| `index.html` | Sayfa iskeleti, üst bar ve script yükleme sırası |
| `data.js` | **İçerik katmanı** — arayüz etiketleri, bilgi seviyeleri, bölgesel CRS veritabanı, terim sözlüğü, görseller ve dallanan adım grafiği |
| `app.js` | **Motor katmanı** — durum yönetimi, koşullu dallanma, seviyeye/bölgeye duyarlı render, geçiş animasyonları, tooltip ve karar kaydı |
| `style.css` | Uçuş konsolu / telemetri estetiği; renk, tipografi ve düzen |

İçerik motordan ayrılmıştır: yeni adım, bölge veya terim eklemek için yalnızca `data.js` düzenlenir. Dosyanın başındaki yorum bloğu nasıl ekleneceğini anlatır.

---

## Yerel çalıştırma

`index.html` dosyasını doğrudan tarayıcıda açabilirsin. Bazı tarayıcılar `file://` üzerinden bazı özellikleri kısıtladığı için basit bir yerel sunucu önerilir:

```bash
# Python 3 ile
python3 -m http.server 8000

# veya Node.js ile
npx serve
```

Ardından tarayıcıda `http://localhost:8000` adresini aç.

---

## GitHub Pages'te yayınlama

Proje statik olduğu için ek bir yapılandırma gerekmez.

1. Yeni bir GitHub deposu oluştur (ör. `terra-rehber`).
2. Bu klasördeki dosyaları depoya gönder:

   ```bash
   git init
   git add .
   git commit -m "Terra Rehber ilk sürüm"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADIN/terra-rehber.git
   git push -u origin main
   ```

3. Depoda **Settings → Pages** yolunu izle.
4. **Source** altında **Deploy from a branch** seç; branch olarak `main`, klasör olarak `/ (root)` ata ve kaydet.
5. Birkaç dakika içinde siten `https://KULLANICI_ADIN.github.io/terra-rehber/` adresinde yayınlanır.

Depo içindeki `.nojekyll` dosyası, GitHub Pages'in Jekyll işlemesini atlamasını sağlar ve dosyaların olduğu gibi sunulmasını garanti eder.

### Cloudflare Pages alternatifi

Cloudflare Pages panelinden depoyu bağla; **build command** alanını boş bırak ve **output directory** olarak kök dizini (`/`) ver. Derleme adımı yoktur.

---

## İçerik ekleme veya düzenleme

Tüm metin, adım, bölge ve terim `data.js` içindedir. `app.js`'e dokunmaya gerek yoktur.

- **Yeni adım:** `STEPS` nesnesine yeni bir anahtar ekle. `type` alanı `content`, `choice`, `crs`, `process` veya `complete` olabilir. Metinleri `i18n.tr` ve `i18n.en` altına yaz; gövde metnini seviyeye göre `body: { b, i, a }` biçiminde ver.
- **Yeni bölge:** `REGIONS` içine aynı şemayla bir anahtar ekle, `STEPS.region.choices` içine `set: { region: 'anahtar' }` taşıyan bir kart koy.
- **Yeni terim:** `GLOSSARY` içine `def` (teknik) ve `simple` (sade) tanımlarıyla ekle; metinde `[[anahtar]]` yazarak bağla.
- **Gerçek ekran görüntüsü:** `VISUALS` içindeki SVG dizesini `<img src="img/adim.png" alt="...">` ile değiştirmen yeterli.

---

## Teknik notlar

- Teknik veriler DJI'nin resmi kullanım kılavuzundan ve doğrulanmış EPSG kayıtlarından alınmıştır.
- Tipografi: başlıklar Chakra Petch, gövde Inter, kod/veri JetBrains Mono (Google Fonts üzerinden).
- İkonlar Phosphor Icons (CDN üzerinden).
- Erişilebilirlik: klavye odağı görünür, `prefers-reduced-motion` desteklenir, mobil uyumludur.

---

## Lisans

Kullanacağın lisansı buraya ekleyebilirsin (ör. MIT). Bir lisans belirtmezsen depo varsayılan olarak tüm hakları saklı sayılır.
