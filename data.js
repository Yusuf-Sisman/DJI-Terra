/* =====================================================================
   TERRA REHBER — data.js  (İÇERİK KATMANI)
   ---------------------------------------------------------------------
   Bu dosya SADECE içerik barındırır. Motor (app.js) buna hiç dokunmadan
   çalışır. Yeni adım / bölge / terim eklemek için yalnızca burayı
   düzenlemeniz yeterlidir.

   YAPI
     UI        → arayüz etiketleri (buton, başlık vb.)
     LEVELS    → bilgi seviyesi tanımları
     REGIONS   → bölgeye göre koordinat referans sistemleri (EPSG'li)
     GLOSSARY  → tooltip terimleri (seviyeye göre iki ayrı tanım)
     VISUALS   → adım görselleri (SVG)
     STEPS     → dallanan adım grafiği

   SEVİYE SİSTEMİ
     Her adım metni üç sürümde yazılır:
       b = Başlangıç  (terim yok, günlük dil, analoji)
       i = Orta       (standart mesleki dil)
       a = İleri      (yoğun teknik dil, sayısal tolerans, EPSG)
     Kullanıcı başta seviyesini seçer; app.js doğru sürümü gösterir.

   YENİ ADIM EKLEME
     1) STEPS içine yeni bir anahtar açın.
     2) type: 'content' | 'choice' | 'crs' | 'process' | 'complete' | 'welcome'
     3) i18n.tr ve i18n.en içine metinleri yazın (body → {b,i,a}).
     4) 'choice' adımlarında her seçeneğe next (hedef adım id'si),
        impact (sonuç maddeleri) ve gerekiyorsa warn (uyarı) verin.
     5) Bir seçim durum değişkeni ayarlayacaksa set: { anahtar: 'değer' }
        yazın; app.js bunu otomatik kaydeder ve koşullu adımlarda kullanır.
     6) Bir adımı koşullu göstermek için showIf: (v) => v.control === 'gcp'
   ===================================================================== */

'use strict';

/* =====================================================================
   1. ARAYÜZ ETİKETLERİ
   ===================================================================== */

const UI = {
  tr: {
    htmlLang: 'tr',
    brandName: 'TERRA REHBER',
    brandTag: 'DJI Terra Veri İşleme Eğitimi',
    back: 'Geri',
    restart: 'Baştan başla',
    stepWord: 'AŞAMA',
    impactTitle: 'Bunu seçersen ne olur',
    warnTitle: 'Dikkat',
    proTitle: 'Teknik not',
    termsTitle: 'Bu adımdaki terimler',
    checklistTitle: 'Ekranda yapman gerekenler',
    levelBadge: { b: 'Başlangıç', i: 'Orta', a: 'İleri' },
    changeLevel: 'Seviye',
    crsHorizontal: 'Yatay koordinat sistemi (Horizontal Datum Settings)',
    crsVertical: 'Düşey datum / yükseklik (Geoid Settings)',
    crsTips: 'Bu bölge için pratik notlar',
    crsCopy: 'Kopyala',
    crsCopied: 'Kopyalandı',
    logTitle: 'Verdiğin kararlar',
    logEmpty: 'Henüz bir seçim yapılmadı.',
    phases: ['Hazırlık', 'Veri', 'Ayarlar', 'İşleme', 'Çıktı'],
    printBtn: 'Bu reçeteyi yazdır / PDF al',
    srcTitle: 'Kaynaklar',
  },
  en: {
    htmlLang: 'en',
    brandName: 'TERRA GUIDE',
    brandTag: 'DJI Terra Data Processing Training',
    back: 'Back',
    restart: 'Start over',
    stepWord: 'PHASE',
    impactTitle: 'What this choice does',
    warnTitle: 'Watch out',
    proTitle: 'Technical note',
    termsTitle: 'Terms used in this step',
    checklistTitle: 'What to do on screen',
    levelBadge: { b: 'Beginner', i: 'Intermediate', a: 'Advanced' },
    changeLevel: 'Level',
    crsHorizontal: 'Horizontal coordinate system (Horizontal Datum Settings)',
    crsVertical: 'Vertical datum / height (Geoid Settings)',
    crsTips: 'Practical notes for this region',
    crsCopy: 'Copy',
    crsCopied: 'Copied',
    logTitle: 'Your decisions',
    logEmpty: 'No choices made yet.',
    phases: ['Setup', 'Data', 'Settings', 'Processing', 'Output'],
    printBtn: 'Print / save this recipe',
    srcTitle: 'Sources',
  },
};

/* =====================================================================
   2. BİLGİ SEVİYELERİ
   ===================================================================== */

const LEVELS = {
  b: { icon: 'ph-leaf', accent: 'var(--teal)' },
  i: { icon: 'ph-compass-tool', accent: 'var(--amber)' },
  a: { icon: 'ph-function', accent: 'var(--violet)' },
};

/* =====================================================================
   3. BÖLGESEL KOORDİNAT REFERANS SİSTEMLERİ
   ---------------------------------------------------------------------
   Yeni bölge eklemek: aynı şemayla yeni bir anahtar açın ve
   STEPS.region.choices içine set:{region:'anahtar'} olan bir kart ekleyin.
   ===================================================================== */

const REGIONS = {
  turkiye: {
    icon: 'ph-map-pin-line',
    i18n: {
      tr: { name: 'Türkiye', sub: 'TUREF / TUDKA99' },
      en: { name: 'Türkiye', sub: 'TUREF / TUDKA99' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'TUREF (Türkiye Ulusal Referans Çerçevesi, GRS80 elipsoidi)', pick: 'Çalışma alanının boylamına en yakın dilim orta meridyenini seç. Fark 1,5°\'yi geçerse komşu dilime geç.' },
        en: { datum: 'TUREF (Turkish National Reference Frame, GRS80 ellipsoid)', pick: 'Pick the zone whose central meridian is closest to your site. If the gap exceeds 1.5°, move to the neighbouring zone.' },
      },
      systems: [
        { epsg: '5253', name: 'TUREF / TM27', note: { tr: 'Orta meridyen 27° D — Ege kıyısı, İzmir batısı', en: 'CM 27°E — Aegean coast, west of İzmir' } },
        { epsg: '5254', name: 'TUREF / TM30', note: { tr: 'Orta meridyen 30° D — İstanbul, Bursa, Antalya', en: 'CM 30°E — İstanbul, Bursa, Antalya' } },
        { epsg: '5255', name: 'TUREF / TM33', note: { tr: 'Orta meridyen 33° D — Ankara, Konya, Mersin', en: 'CM 33°E — Ankara, Konya, Mersin' } },
        { epsg: '5256', name: 'TUREF / TM36', note: { tr: 'Orta meridyen 36° D — Samsun, Kayseri, Adana doğusu', en: 'CM 36°E — Samsun, Kayseri, east of Adana' } },
        { epsg: '5257', name: 'TUREF / TM39', note: { tr: 'Orta meridyen 39° D — Trabzon, Sivas, Malatya', en: 'CM 39°E — Trabzon, Sivas, Malatya' } },
        { epsg: '5258', name: 'TUREF / TM42', note: { tr: 'Orta meridyen 42° D — Erzurum, Diyarbakır doğusu', en: 'CM 42°E — Erzurum, east of Diyarbakır' } },
        { epsg: '5259', name: 'TUREF / TM45', note: { tr: 'Orta meridyen 45° D — Van, Hakkâri, Iğdır', en: 'CM 45°E — Van, Hakkâri, Iğdır' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'TUDKA99 — Türkiye Ulusal Düşey Kontrol Ağı 1999',
          detail: 'Antalya mareograf istasyonunun 1936–1971 deniz seviyesi ortalaması sıfır yüzeyi kabul edilir; yükseklikler Helmert ortometrik yüksekliktir. Ülke jeoidi TG-03 / TG-09 ile GNSS yüksekliğinden ortometriğe geçilir.',
          terra: 'DJI Terra\'nın jeoit veritabanında Türkiye ulusal jeoidi (TG serisi) hazır gelmez. Pratikte iki yol vardır: çıktıyı elipsoit yüksekliğinde ya da EGM2008 ile alıp dönüşümü NetCAD/Global Mapper gibi bir yazılımda yapmak, ya da ortometrik yükseklikli yer kontrol noktalarını Terra\'ya vererek modeli doğrudan TUDKA99\'a oturtmak.',
        },
        en: {
          datum: 'TUDKA99 — Turkish National Vertical Control Network 1999',
          detail: 'Zero surface is the 1936–1971 mean sea level at the Antalya tide gauge; heights are Helmert orthometric. The national geoid models TG-03 / TG-09 convert GNSS heights to orthometric.',
          terra: 'DJI Terra does not ship the Turkish national geoid (TG series) in its database. Two practical routes: export in ellipsoidal height or EGM2008 and transform in NetCAD/Global Mapper, or feed Terra ground control points that already carry orthometric heights so the model is pulled onto TUDKA99 directly.',
        },
      },
    },
    tips: [
      { tr: 'Aynı dilim iki farklı EPSG ailesiyle tanımlıdır. TUREF / TM33 (5255) sağa değeri 500.000 m\'den başlar; TUREF / 3 derece Gauss-Krüger dilim 11 (5271) ise dilim numarasını başa ekler ve 11.500.000 m gibi bir sağa değeri üretir. Kurum hangi aileyi istiyorsa onu seç — sayılar 11 milyon fark eder.', en: 'The same zone exists in two EPSG families. TUREF / TM33 (5255) gives eastings starting at 500,000 m, while TUREF / 3-degree Gauss-Krüger zone 11 (5271) prefixes the zone number and yields eastings like 11,500,000 m. Match whichever family the client asks for — the difference is 11 million metres.' },
      { tr: 'TUREF ile WGS84 arasındaki fark yaklaşık 1 m seviyesindedir. Kadastro ve büyük ölçekli harita işlerinde bu fark kabul edilemez; TUSAGA-Aktif (CORS-TR) düzeltmesiyle çalış ve çıktıyı doğrudan TUREF diliminde al.', en: 'TUREF and WGS84 agree only to about 1 m. That is unacceptable for cadastral and large-scale mapping work; use TUSAGA-Aktif (CORS-TR) corrections and export directly in the TUREF zone.' },
      { tr: 'ED50 tabanlı eski paftalarla çalışıyorsan Terra çıktısını ED50\'ye çevirmek yerine, eski veriyi TUREF\'e taşımak daha doğrudur; ED50 dönüşüm parametreleri bölgeden bölgeye değişir.', en: 'If you work with legacy ED50 sheets, migrate the old data to TUREF rather than converting the Terra output to ED50 — ED50 transformation parameters vary regionally.' },
    ],
  },

  europe: {
    icon: 'ph-globe-hemisphere-west',
    i18n: {
      tr: { name: 'Avrupa', sub: 'ETRS89 / EVRF' },
      en: { name: 'Europe', sub: 'ETRS89 / EVRF' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'ETRS89 (Avrupa Karasal Referans Sistemi 1989, GRS80)', pick: 'Avrupa levhasına sabitlenmiş bir datumdur; WGS84 ile arasındaki fark yılda ~2,5 cm büyür ve bugün onlarca santimetreye ulaşmıştır.' },
        en: { datum: 'ETRS89 (European Terrestrial Reference System 1989, GRS80)', pick: 'Fixed to the Eurasian plate; its offset from WGS84 grows ~2.5 cm per year and is now several decimetres.' },
      },
      systems: [
        { epsg: '25831', name: 'ETRS89 / UTM zone 31N', note: { tr: '0°–6° D — İspanya doğusu, Fransa batısı', en: '0°–6°E — eastern Spain, western France' } },
        { epsg: '25832', name: 'ETRS89 / UTM zone 32N', note: { tr: '6°–12° D — Almanya, İtalya, Danimarka', en: '6°–12°E — Germany, Italy, Denmark' } },
        { epsg: '25833', name: 'ETRS89 / UTM zone 33N', note: { tr: '12°–18° D — Polonya, Avusturya, Balkanlar', en: '12°–18°E — Poland, Austria, the Balkans' } },
        { epsg: '25834', name: 'ETRS89 / UTM zone 34N', note: { tr: '18°–24° D — Romanya, Yunanistan doğusu', en: '18°–24°E — Romania, eastern Greece' } },
        { epsg: '25835', name: 'ETRS89 / UTM zone 35N', note: { tr: '24°–30° D — Finlandiya, Bulgaristan, Trakya', en: '24°–30°E — Finland, Bulgaria, Thrace' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'EVRF (Avrupa Düşey Referans Çerçevesi) veya ülke datumu',
          detail: 'Kıta ölçeğinde EVRF2007 / EVRF2019 kullanılır. Ülke içi teslimatlarda çoğunlukla ulusal datum istenir: Almanya DHHN2016, Hollanda NAP, Fransa NGF-IGN69, İspanya Alicante.',
          terra: 'Terra\'nın "Geoid Settings" penceresinde ülke datumunu EPSG kodu veya adıyla arat. Gerekli jeoit dosyası yoksa Terra indirme bağlantısı sunar; dosyayı içeri aktarmadan yeniden yapılandırmayı başlatma.',
        },
        en: {
          datum: 'EVRF (European Vertical Reference Frame) or the national datum',
          detail: 'EVRF2007 / EVRF2019 serve at continental scale. National deliverables usually require the local datum: DHHN2016 in Germany, NAP in the Netherlands, NGF-IGN69 in France, Alicante in Spain.',
          terra: 'Search the national datum by EPSG code or name in Terra\'s Geoid Settings. If the geoid file is missing Terra offers a download link — import it before starting reconstruction.',
        },
      },
    },
    tips: [
      { tr: 'RTK düzeltmesini ETRS89 yayınlayan bir ağdan alıyorsan çıktıyı da ETRS89 tabanlı UTM diliminde ver; WGS84 UTM seçmek onlarca santimetrelik sistematik bir kayma bırakır.', en: 'If your RTK network broadcasts ETRS89, export in an ETRS89-based UTM zone; picking WGS84 UTM leaves a systematic shift of several decimetres.' },
      { tr: 'Bazı ülkeler UTM yerine kendi ulusal projeksiyonunu ister (İsviçre LV95, Hollanda RD New). Teslim şartnamesini işe başlamadan oku.', en: 'Some countries require a national projection instead of UTM (LV95 in Switzerland, RD New in the Netherlands). Read the delivery spec before you fly.' },
    ],
  },

  uk: {
    icon: 'ph-map-trifold',
    i18n: {
      tr: { name: 'Birleşik Krallık', sub: 'OSGB36 / ODN' },
      en: { name: 'United Kingdom', sub: 'OSGB36 / ODN' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'OSGB36 — British National Grid', pick: 'Tek bir ülke ızgarası vardır, dilim seçimi yoktur. Ancak OSGB36 eski bir datumdur; GNSS\'ten dönüşüm OSTN15 ızgara dosyasıyla yapılır.' },
        en: { datum: 'OSGB36 — British National Grid', pick: 'A single national grid, no zone choice. OSGB36 is a legacy datum; conversion from GNSS uses the OSTN15 grid shift file.' },
      },
      systems: [
        { epsg: '27700', name: 'OSGB36 / British National Grid', note: { tr: 'Ulusal ızgara — kadastro ve mühendislik teslimatlarının standardı', en: 'National grid — the standard for cadastral and engineering deliverables' } },
        { epsg: '4326', name: 'WGS84 (coğrafi)', note: { tr: 'Ham GNSS/RTK verisinin geldiği sistem; teslimat için uygun değildir', en: 'The system raw GNSS/RTK data arrives in; not suitable for delivery' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'ODN — Ordnance Datum Newlyn',
          detail: 'Newlyn (Cornwall) mareograf ortalamasına dayanır. GNSS elipsoit yüksekliğinden ODN\'ye geçiş OSGM15 jeoit modeliyle yapılır; fark ülke genelinde yaklaşık 45–57 m\'dir.',
          terra: 'Terra\'da ODN\'yi seçtiğinde OSGM15 dosyasının yüklü olduğundan emin ol. Yüklü değilse çıktı sessizce elipsoit yüksekliğinde kalır ve rakımlar ~50 m yanlış çıkar.',
        },
        en: {
          datum: 'ODN — Ordnance Datum Newlyn',
          detail: 'Based on mean sea level at Newlyn, Cornwall. OSGM15 converts GNSS ellipsoidal height to ODN; the separation runs roughly 45–57 m nationally.',
          terra: 'When selecting ODN in Terra, confirm the OSGM15 file is loaded. Without it the output silently stays ellipsoidal and elevations come out ~50 m wrong.',
        },
      },
    },
    tips: [
      { tr: 'OSTN15 ve OSGM15 dosyaları Ordnance Survey tarafından ücretsiz dağıtılır. Terra bu dönüşümü tam desteklemiyorsa çıktıyı ETRS89 / UTM 30N alıp dönüşümü QGIS ile yapmak daha güvenlidir.', en: 'OSTN15 and OSGM15 are distributed free by Ordnance Survey. If Terra does not fully support the shift, exporting in ETRS89 / UTM 30N and transforming in QGIS is safer.' },
    ],
  },

  namerica: {
    icon: 'ph-flag',
    i18n: {
      tr: { name: 'Kuzey Amerika', sub: 'NAD83 / NAVD88' },
      en: { name: 'North America', sub: 'NAD83 / NAVD88' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'NAD83(2011) — Kuzey Amerika Datumu', pick: 'ABD\'de teslimat genellikle State Plane dilimlerinde istenir; her eyaletin kendi EPSG kodu vardır. Ayak/metre karışıklığına dikkat.' },
        en: { datum: 'NAD83(2011) — North American Datum', pick: 'US deliverables are usually requested in State Plane zones; each state has its own EPSG code. Beware the feet/metre mix-up.' },
      },
      systems: [
        { epsg: '6318', name: 'NAD83(2011) (coğrafi)', note: { tr: 'Baz istasyonu koordinatlarının tanımlandığı temel datum', en: 'The base datum in which base station coordinates are defined' } },
        { epsg: '26910', name: 'NAD83 / UTM zone 10N', note: { tr: 'Batı kıyısı — State Plane istenmiyorsa güvenli tercih', en: 'West coast — a safe pick when State Plane is not required' } },
        { epsg: '6340', name: 'NAD83(2011) / UTM zone 11N', note: { tr: 'İç batı eyaletleri', en: 'Interior western states' } },
        { epsg: '3857', name: 'Web Mercator', note: { tr: 'Sadece web haritası gösterimi için; ölçüm ve alan hesabı için ASLA kullanma', en: 'Web display only; never use for measurement or area computation' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'NAVD88 — Kuzey Amerika Düşey Datumu 1988 (EPSG:5703)',
          detail: 'GEOID18 modeli elipsoit yüksekliğini NAVD88 ortometrik yüksekliğe çevirir. Kanada\'da karşılığı CGVD2013\'tür.',
          terra: 'Terra\'da "Geoid Settings" altında NAVD88 height (5703) ara ve GEOID18 dosyasını yükle. Yüklemezsen çıktı elipsoit yüksekliğinde kalır — ABD\'de bu fark bölgeye göre -20 ile -35 m arasındadır.',
        },
        en: {
          datum: 'NAVD88 — North American Vertical Datum of 1988 (EPSG:5703)',
          detail: 'GEOID18 converts ellipsoidal to NAVD88 orthometric height. The Canadian equivalent is CGVD2013.',
          terra: 'In Terra\'s Geoid Settings search NAVD88 height (5703) and load the GEOID18 file. Without it the output stays ellipsoidal — across the US that gap runs −20 to −35 m.',
        },
      },
    },
    tips: [
      { tr: 'State Plane dilimlerinin çoğunun hem "US survey feet" hem metre sürümü vardır ve EPSG kodları farklıdır. Yanlışını seçersen koordinatlar 3,28 kat kayar.', en: 'Most State Plane zones exist in both US survey feet and metres with different EPSG codes. Pick the wrong one and coordinates shift by a factor of 3.28.' },
      { tr: 'NAD83 ve WGS84 arasında kıta genelinde 1–2 m fark vardır. Baz istasyonunu OPUS ile çözdüysen sonuç NAD83(2011)\'dedir; Terra\'da baz koordinatını da aynı sistemde gir.', en: 'NAD83 and WGS84 differ by 1–2 m across the continent. If you solved your base with OPUS the result is NAD83(2011); enter the base coordinate in Terra in that same system.' },
    ],
  },

  oceania: {
    icon: 'ph-compass-rose',
    i18n: {
      tr: { name: 'Avustralya / Yeni Zelanda', sub: 'GDA2020 / AHD' },
      en: { name: 'Australia / New Zealand', sub: 'GDA2020 / AHD' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'GDA2020 — Avustralya Jeosentrik Datumu 2020', pick: 'MGA2020 dilimleri 6°\'lik UTM dilimleridir; dilim numarası 46–59 arasıdır ve EPSG kodu 7800 + dilim numarası olarak gider.' },
        en: { datum: 'GDA2020 — Geocentric Datum of Australia 2020', pick: 'MGA2020 zones are 6° UTM zones numbered 46–59; the EPSG code is 7800 + zone number.' },
      },
      systems: [
        { epsg: '7850', name: 'GDA2020 / MGA zone 50', note: { tr: 'Batı Avustralya — Perth', en: 'Western Australia — Perth' } },
        { epsg: '7854', name: 'GDA2020 / MGA zone 54', note: { tr: 'Güney Avustralya, Victoria batısı', en: 'South Australia, western Victoria' } },
        { epsg: '7855', name: 'GDA2020 / MGA zone 55', note: { tr: 'Melbourne, Brisbane, Tazmanya', en: 'Melbourne, Brisbane, Tasmania' } },
        { epsg: '7856', name: 'GDA2020 / MGA zone 56', note: { tr: 'Sydney, Yeni Güney Galler kıyısı', en: 'Sydney, New South Wales coast' } },
        { epsg: '2193', name: 'NZGD2000 / New Zealand Transverse Mercator', note: { tr: 'Yeni Zelanda ulusal projeksiyonu', en: 'New Zealand national projection' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'AHD — Australian Height Datum (EPSG:5711)',
          detail: 'AUSGeoid2020 modeli elipsoit yüksekliğini AHD\'ye çevirir. Yeni Zelanda\'da NZVD2016 kullanılır.',
          terra: 'Terra\'da "Vertical Coordinate System Database" içinde AHD height (5711) arat. GDA94\'ten GDA2020\'ye geçiş yaklaşık 1,8 m yatay kayma demektir — eski projelerle karıştırma.',
        },
        en: {
          datum: 'AHD — Australian Height Datum (EPSG:5711)',
          detail: 'AUSGeoid2020 converts ellipsoidal height to AHD. New Zealand uses NZVD2016.',
          terra: 'Search AHD height (5711) in Terra\'s Vertical Coordinate System Database. Moving from GDA94 to GDA2020 is roughly a 1.8 m horizontal shift — do not mix them with legacy projects.',
        },
      },
    },
    tips: [
      { tr: 'Baz istasyonunu AUSPOS ile çözdüysen rapor GDA2020 verir; Terra\'daki baz koordinatını da mutlaka GDA2020\'de gir.', en: 'If you solved your base with AUSPOS the report is in GDA2020; enter the base coordinate in Terra in GDA2020 as well.' },
    ],
  },

  eafrica: {
    icon: 'ph-sun-horizon',
    i18n: {
      tr: { name: 'Doğu Afrika', sub: 'Arc 1960 / WGS84 UTM' },
      en: { name: 'East Africa', sub: 'Arc 1960 / WGS84 UTM' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'Arc 1960 (eski, Clarke 1880) veya WGS84', pick: 'Kadastro paftaları çoğunlukla Arc 1960 tabanlıdır; yeni GNSS işleri WGS84 UTM ile yürür. İkisini aynı projede karıştırma.' },
        en: { datum: 'Arc 1960 (legacy, Clarke 1880) or WGS84', pick: 'Cadastral sheets are mostly Arc 1960 based; new GNSS work runs in WGS84 UTM. Never mix the two in one project.' },
      },
      systems: [
        { epsg: '21036', name: 'Arc 1960 / UTM zone 36S', note: { tr: '30°–36° D, güney yarımküre — Tanzanya batısı', en: '30°–36°E, southern hemisphere — western Tanzania' } },
        { epsg: '21037', name: 'Arc 1960 / UTM zone 37S', note: { tr: '36°–42° D, güney yarımküre — Dar es Salaam, Zanzibar', en: '36°–42°E, southern hemisphere — Dar es Salaam, Zanzibar' } },
        { epsg: '32737', name: 'WGS84 / UTM zone 37S', note: { tr: 'Aynı bölgenin modern WGS84 karşılığı', en: 'The modern WGS84 equivalent for the same area' } },
        { epsg: '21096', name: 'Arc 1960 / UTM zone 36N', note: { tr: '30°–36° D, kuzey yarımküre — Kenya kuzeyi, Uganda', en: '30°–36°E, northern hemisphere — northern Kenya, Uganda' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'Yerel deniz seviyesi datumu veya EGM2008',
          detail: 'Bölgede yaygın, iyi tanımlanmış tek bir düşey datum yoktur. Çoğu proje EGM2008 küresel jeoit modelini ortometrik yükseklik referansı olarak kullanır.',
          terra: 'Terra\'da EGM2008 veya EGM96\'yı seç. Yerel bir röper noktasına bağlanman gerekiyorsa, o noktayı yer kontrol noktası olarak Terra\'ya vererek modeli düşeyde oturt.',
        },
        en: {
          datum: 'Local mean sea level datum or EGM2008',
          detail: 'There is no single well-defined regional vertical datum. Most projects use the EGM2008 global geoid as the orthometric reference.',
          terra: 'Select EGM2008 or EGM96 in Terra. If you must tie to a local benchmark, feed that point in as a ground control point to seat the model vertically.',
        },
      },
    },
    tips: [
      { tr: 'Arc 1960 ile WGS84 arasındaki fark 150–300 m mertebesindedir. Yanlış datum seçmek haritayı bir mahalle öteye taşır — bu, bu bölgede en sık yapılan hatadır.', en: 'Arc 1960 and WGS84 differ by 150–300 m. Choosing the wrong datum moves your map a neighbourhood away — the most common mistake in this region.' },
      { tr: 'Ekvatorun güneyindeki dilimlerde (37S gibi) yukarı değeri 10.000.000 m\'den başlar. Yazılım "S" harfini düşürüp kuzey dilimini seçerse koordinatlar 10 milyon metre kayar.', en: 'Southern-hemisphere zones (such as 37S) start northings at 10,000,000 m. If software drops the "S" and picks the northern zone, coordinates shift by 10 million metres.' },
    ],
  },

  global: {
    icon: 'ph-globe-stand',
    i18n: {
      tr: { name: 'Diğer / Küresel', sub: 'WGS84 UTM' },
      en: { name: 'Other / Global', sub: 'WGS84 UTM' },
    },
    horizontal: {
      i18n: {
        tr: { datum: 'WGS84 — GNSS\'in doğal datumu', pick: 'UTM dilim numarası = (boylam + 180) / 6, yukarı yuvarlanır. Kuzey yarımkürede EPSG 32600 + dilim, güneyde 32700 + dilim.' },
        en: { datum: 'WGS84 — the native GNSS datum', pick: 'UTM zone = (longitude + 180) / 6, rounded up. Northern hemisphere EPSG is 32600 + zone, southern is 32700 + zone.' },
      },
      systems: [
        { epsg: '4326', name: 'WGS84 (coğrafi, derece)', note: { tr: 'Terra fotoğraf konumlarını tanımlanmadığında buna varsayar', en: 'Terra assumes this for photo positions when nothing is defined' } },
        { epsg: '326xx', name: 'WGS84 / UTM zone xxN', note: { tr: 'Kuzey yarımküre — örn. dilim 35 için 32635', en: 'Northern hemisphere — e.g. 32635 for zone 35' } },
        { epsg: '327xx', name: 'WGS84 / UTM zone xxS', note: { tr: 'Güney yarımküre — örn. dilim 37 için 32737', en: 'Southern hemisphere — e.g. 32737 for zone 37' } },
      ],
    },
    vertical: {
      i18n: {
        tr: {
          datum: 'EGM96 / EGM2008 küresel jeoit',
          detail: 'Ulusal bir düşey datum yoksa küresel jeoit modeli kullanılır. EGM2008, EGM96\'ya göre belirgin biçimde daha iyi çözünürlüklüdür.',
          terra: 'Hiçbir jeoit seçmezsen Terra elipsoit yüksekliği üretir. Bu bir hata değildir ama "deniz seviyesinden yükseklik" değildir; fark dünya genelinde -100 ile +85 m arasında değişir.',
        },
        en: {
          datum: 'EGM96 / EGM2008 global geoid',
          detail: 'With no national vertical datum, use a global geoid model. EGM2008 is markedly higher resolution than EGM96.',
          terra: 'Select no geoid and Terra outputs ellipsoidal height. That is not an error, but it is not height above sea level either; the separation ranges from −100 to +85 m worldwide.',
        },
      },
    },
    tips: [
      { tr: 'Projen iki UTM diliminin sınırına denk geliyorsa tek dilim seç ve tamamını orada üret. Dilim sınırında bölmek, birleştirme aşamasında metrelerce kayma yaratır.', en: 'If your site straddles two UTM zones, pick one and produce everything in it. Splitting at the boundary creates metre-level mismatches when merging.' },
    ],
  },
};

/* =====================================================================
   4. TERİM SÖZLÜĞÜ
   ---------------------------------------------------------------------
   Metin içinde [[anahtar]] yazarak terimi bağlarsın.
   def    → orta/ileri seviyede gösterilen teknik tanım
   simple → başlangıç seviyesinde gösterilen sade tanım
   Başlangıç seviyesinde bu terimler ayrıca adım altında
   "Bu adımdaki terimler" şeridinde açık açık listelenir.
   ===================================================================== */

const GLOSSARY = {
  aerotriangulation: {
    tr: {
      term: 'aerotriangülasyon',
      def: 'Örtüşen görüntülerdeki ortak noktalardan yararlanarak her fotoğrafın çekim anındaki konumunu ve dönüklüğünü, aynı anda kamera iç parametrelerini dengeleme ile çözen işlem. Kısaca AT.',
      simple: 'Uçuşta çektiğin yüzlerce fotoğrafın birbiriyle nerede çakıştığını bulup, her fotoğrafın havada tam olarak hangi noktadan ve hangi açıyla çekildiğini hesaplayan adım. Bütün modelin temeli budur.',
    },
    en: {
      term: 'aerotriangulation',
      def: 'The bundle adjustment that solves each image\'s exterior orientation, and camera interior parameters alongside it, from tie points across overlapping images. Abbreviated AT.',
      simple: 'The step that finds where your hundreds of photos overlap and works out exactly where in the air each one was taken and at what angle. Everything else is built on this.',
    },
  },
  gsd: {
    tr: {
      term: 'GSD',
      def: 'Zemin Örnekleme Aralığı. Görüntüdeki bir pikselin arazide karşıladığı gerçek mesafe; uçuş yüksekliği, odak uzaklığı ve piksel boyutunun fonksiyonudur. Doğruluk bütçesinin çarpanı olarak kullanılır.',
      simple: 'Fotoğraftaki bir noktacığın (pikselin) arazide kaç santimetreye denk geldiği. 2 cm GSD demek, en küçük ayırt edebileceğin detayın 2 cm olması demek. Ne kadar alçaktan uçarsan o kadar küçülür.',
    },
    en: {
      term: 'GSD',
      def: 'Ground Sampling Distance. The real-world size of one image pixel on the ground, a function of flight height, focal length and pixel pitch. It is the multiplier in every accuracy budget.',
      simple: 'How many centimetres on the ground one dot (pixel) in your photo covers. A 2 cm GSD means the smallest detail you can tell apart is 2 cm. Flying lower makes it smaller.',
    },
  },
  point_cloud: {
    tr: {
      term: 'nokta bulutu',
      def: 'Her biri konum ve genellikle yansıma şiddeti, renk, dönüş numarası taşıyan, üç boyutlu ölçülmüş nokta kümesi. LAS/LAZ formatlarında saklanır.',
      simple: 'Arazinin yüzeyini milyonlarca küçük noktayla temsil eden veri. Her nokta gerçekten ölçülmüş bir yeri gösterir; hepsi bir arada bakınca arazi görünür.',
    },
    en: {
      term: 'point cloud',
      def: 'A set of measured 3D points, each carrying position and usually intensity, colour and return number. Stored in LAS/LAZ.',
      simple: 'Data that represents the ground surface as millions of tiny dots. Each dot is a place that was really measured; together they look like the terrain.',
    },
  },
  orthomosaic: {
    tr: {
      term: 'ortomozaik',
      def: 'Perspektif ve yükseklik kaynaklı yer değiştirmeleri giderilmiş, ölçeği her noktada aynı olan, kenar birleştirmesi yapılmış hava görüntüsü. Terra çıktısında DOM olarak adlandırılır.',
      simple: 'Bütün fotoğrafların birleştirilip, eğrilikleri düzeltilerek tek parça harita haline getirilmiş hali. Üstünde cetvelle ölçüm yapabilirsin, çünkü her yeri aynı ölçekte.',
    },
    en: {
      term: 'orthomosaic',
      def: 'An aerial image with perspective and relief displacement removed and a uniform scale throughout, seam-blended into one sheet. Terra calls this output DOM.',
      simple: 'All your photos stitched into one flat map with the distortions taken out. You can measure on it with a ruler because every part is at the same scale.',
    },
  },
  dsm: {
    tr: {
      term: 'DSM',
      def: 'Sayısal Yüzey Modeli. Bina, ağaç ve diğer nesnelerin üst yüzeyi dâhil, algılayıcının gördüğü ilk yüzeyi temsil eden yükseklik rasteri.',
      simple: 'Arazinin yükseklik haritası — ama ağaçların ve binaların üstünü de içerir. Yani kuş bakışı baktığında neyin üstünü görüyorsan onun yüksekliği.',
    },
    en: {
      term: 'DSM',
      def: 'Digital Surface Model. An elevation raster of the first surface the sensor sees, including the tops of buildings, trees and other objects.',
      simple: 'An elevation map of the site — but including the tops of trees and buildings. Whatever you see looking straight down, that is what it measures.',
    },
  },
  dem: {
    tr: {
      term: 'DEM / DTM',
      def: 'Sayısal Arazi Modeli. Bitki örtüsü ve yapılar ayıklandıktan sonra kalan çıplak zemin yüzeyini temsil eden yükseklik rasteri. Hacim ve kesit hesaplarının altlığıdır.',
      simple: 'Ağaçlar ve binalar silindikten sonra kalan çıplak toprağın yükseklik haritası. Kazı-dolgu hesabı, kesit çıkarma gibi işler bunun üstünden yapılır.',
    },
    en: {
      term: 'DEM / DTM',
      def: 'Digital Terrain Model. The bare-earth elevation raster left after vegetation and structures are removed. The basis of volume and cross-section computation.',
      simple: 'The elevation map of bare soil after trees and buildings are deleted. Cut-and-fill volumes and cross-sections are computed on this.',
    },
  },
  classification: {
    tr: {
      term: 'sınıflandırma',
      def: 'Nokta bulutundaki her noktanın zemin, bitki örtüsü, bina gibi kategorilere ayrılması. Zemin sınıfı DEM üretiminin ön koşuludur.',
      simple: 'Nokta bulutundaki her noktayı "bu toprak", "bu ağaç", "bu bina" diye etiketleme işi. Sadece toprak noktalarını ayırınca çıplak arazi modeli elde edersin.',
    },
    en: {
      term: 'classification',
      def: 'Assigning every point in the cloud to a category — ground, vegetation, building. The ground class is the prerequisite for DEM generation.',
      simple: 'Labelling each dot in the point cloud as "this is soil", "this is a tree", "this is a building". Keeping only the soil dots gives you bare terrain.',
    },
  },
  rtk: {
    tr: {
      term: 'RTK',
      def: 'Gerçek Zamanlı Kinematik konumlama. Sabit bir baz istasyonu veya ağdan gelen faz düzeltmesiyle santimetre mertebesinde anlık konum çözümü. FIX durumu tam çözümü, FLOAT kısmi çözümü ifade eder.',
      simple: 'Drone\'un havadayken kendi yerini santimetre hassasiyetinde bilmesini sağlayan sistem. Yerdeki bir referans istasyonundan sürekli düzeltme alır. "FIX" yazıyorsa iş yolunda demektir.',
    },
    en: {
      term: 'RTK',
      def: 'Real-Time Kinematic positioning. Centimetre-level instantaneous fixes from carrier-phase corrections sent by a base station or network. FIX means a full solution, FLOAT a partial one.',
      simple: 'The system that lets the drone know its own position to the centimetre while flying, using constant corrections from a ground reference station. If it says "FIX", you are good.',
    },
  },
  ppk: {
    tr: {
      term: 'PPK',
      def: 'Son İşlemli Kinematik. Uçuş sırasında düzeltme yayını olmaksızın kaydedilen ham gözlem dosyalarının, uçuş sonrasında baz istasyonu verisiyle birlikte çözülmesi.',
      simple: 'RTK\'nın uçuştan sonra yapılan hali. Uçarken canlı düzeltme almazsın, ham kayıtları alırsın; eve döndükten sonra yer istasyonunun kaydıyla birleştirip aynı hassasiyeti elde edersin.',
    },
    en: {
      term: 'PPK',
      def: 'Post-Processed Kinematic. Raw observation files logged without a live correction link, solved after the flight against base station data.',
      simple: 'RTK done afterwards. You do not get live corrections while flying; you record raw logs and combine them with the ground station recording back at the office for the same accuracy.',
    },
  },
  gcp: {
    tr: {
      term: 'yer kontrol noktası',
      def: 'Arazide koordinatı bağımsız yöntemle ölçülmüş, görüntülerde açıkça seçilebilen işaretli nokta. Dengelemeye katıldığında modeli mutlak konuma zorlar. Kısaca YKN veya GCP.',
      simple: 'Araziye koyduğun, koordinatını GNSS aleti ile tek tek ölçtüğün işaretler. Fotoğrafta bunları gösterince yazılım modelin gerçekte nereye oturması gerektiğini öğrenir.',
    },
    en: {
      term: 'ground control point',
      def: 'A marked point whose coordinates were measured independently on site and which is clearly identifiable in the imagery. Included in the adjustment, it forces the model into absolute position. Abbreviated GCP.',
      simple: 'Targets you place on the ground and measure one by one with a GNSS receiver. Pointing them out in the photos teaches the software where the model really belongs.',
    },
  },
  checkpoint: {
    tr: {
      term: 'kontrol (check) noktası',
      def: 'Dengelemeye katılmayan, yalnızca sonucu bağımsız olarak sınamak için ayrılan ölçülü nokta. Gerçek doğruluk ancak bu noktalardan okunur.',
      simple: 'Yer kontrol noktası gibi ölçersin ama yazılıma "bunu kullan" demezsin. Sonunda modelin bu noktalarda ne kadar şaştığına bakarsın — asıl doğruluk testi budur.',
    },
    en: {
      term: 'check point',
      def: 'A measured point deliberately withheld from the adjustment and used only to test the result independently. True accuracy is read from these points alone.',
      simple: 'Measured like a control point, but you do not let the software use it. At the end you see how far the model missed it — that is the real accuracy test.',
    },
  },
  reprojection_error: {
    tr: {
      term: 'yeniden izdüşüm hatası',
      def: 'Dengeleme sonrası bir nesne noktasının görüntü düzlemine yeniden izdüşürülmesiyle elde edilen konum ile ölçülen görüntü konumu arasındaki piksel cinsinden fark. AT kalitesinin birincil göstergesidir.',
      simple: 'Yazılımın hesapladığı nokta ile fotoğraftaki gerçek nokta arasındaki kaçıklık, piksel cinsinden. Küçük olması hesabın tutarlı olduğunu gösterir.',
    },
    en: {
      term: 'reprojection error',
      def: 'The pixel-space difference between an object point reprojected onto the image plane after adjustment and its measured image position. The primary indicator of AT quality.',
      simple: 'How far off, in pixels, the software\'s computed point lands from the actual point in the photo. Small means the maths is consistent.',
    },
  },
  ellipsoidal_height: {
    tr: {
      term: 'elipsoit yüksekliği',
      def: 'Referans elipsoit yüzeyinden ölçülen geometrik yükseklik (h). GNSS\'in doğrudan ürettiği yükseklik türüdür ve fiziksel anlamı yoktur.',
      simple: 'GNSS\'in doğrudan verdiği yükseklik. Dünyanın matematiksel pürüzsüz modeline göre ölçülür — "deniz seviyesinden yükseklik" DEĞİLDİR, aradaki fark 50 metreyi bulabilir.',
    },
    en: {
      term: 'ellipsoidal height',
      def: 'Geometric height above the reference ellipsoid (h). What GNSS produces directly; it carries no physical meaning.',
      simple: 'The height GNSS gives you directly, measured against a smooth mathematical model of the Earth. It is NOT height above sea level — the difference can reach 50 metres.',
    },
  },
  orthometric_height: {
    tr: {
      term: 'ortometrik yükseklik',
      def: 'Jeoit yüzeyinden ölçülen fiziksel yükseklik (H). h = H + N bağıntısıyla elipsoit yüksekliğine bağlanır; N jeoit ondülasyonudur.',
      simple: 'Halk arasında "deniz seviyesinden yükseklik" denen şey. Suyun akış yönünü doğru veren yükseklik budur; harita ve projelerde istenen de budur.',
    },
    en: {
      term: 'orthometric height',
      def: 'Physical height above the geoid (H), related to ellipsoidal height by h = H + N, where N is geoid undulation.',
      simple: 'What people mean by "height above sea level". This is the height that tells you which way water flows, and the one maps and projects ask for.',
    },
  },
  geoid: {
    tr: {
      term: 'jeoit',
      def: 'Yeryuvarının ortalama deniz seviyesiyle çakışan eşpotansiyelli yüzeyi. Elipsoit ile arasındaki ayrım jeoit ondülasyonu (N) olarak modellenir.',
      simple: 'Dünyanın gerçek çekim alanına göre şekillenen, denizlerin doğal durduğu yüzey. Pürüzsüz değildir, yer yer şişkin yer yer çukurdur.',
    },
    en: {
      term: 'geoid',
      def: 'The equipotential surface of the Earth\'s gravity field coinciding with mean sea level. Its separation from the ellipsoid is modelled as geoid undulation (N).',
      simple: 'The surface the oceans naturally settle into, shaped by the Earth\'s real gravity. It is not smooth — bulging in places, dipping in others.',
    },
  },
  overlap: {
    tr: {
      term: 'örtü oranı',
      def: 'Ardışık görüntülerin ortak kapsama yüzdesi. İleri örtü uçuş doğrultusunda, yan örtü hatlar arasındadır. Yükseklik farkı arttıkça artırılması gerekir.',
      simple: 'Her fotoğrafın bir öncekiyle ne kadar üst üste bindiği. Bindirme az olursa yazılım fotoğrafları birbirine bağlayamaz ve model delik deşik çıkar.',
    },
    en: {
      term: 'overlap',
      def: 'The shared coverage between consecutive images. Forward overlap runs along the flight line, side overlap across lines. It must increase with terrain relief.',
      simple: 'How much each photo covers the same area as the one before it. Too little and the software cannot link them, leaving holes in your model.',
    },
  },
  mesh: {
    tr: {
      term: 'mesh',
      def: 'Nokta bulutundan üretilen, üçgen yüzeylerden oluşan ve üzerine görüntü dokusu giydirilen sürekli yüzey modeli.',
      simple: 'Noktaların birbirine üçgenlerle bağlanıp yüzey haline getirilmesi, sonra üstüne gerçek fotoğrafın kaplanması. Sonuç gerçekçi bir 3B model olur.',
    },
    en: {
      term: 'mesh',
      def: 'A continuous surface of triangles generated from the point cloud and draped with image texture.',
      simple: 'Connecting the dots with triangles to make a surface, then wrapping the real photo over it. The result looks like a realistic 3D model.',
    },
  },
  lod: {
    tr: {
      term: 'LOD',
      def: 'Detay Seviyesi. Modelin farklı çözünürlüklerde kademeli olarak saklanması; görüntüleyici kamera mesafesine göre uygun kademeyi yükler.',
      simple: 'Modelin hem kaba hem ince çözünürlükte kaydedilmesi. Uzaktan bakınca kaba, yaklaşınca ince hali yüklenir; böylece büyük modeller takılmadan açılır.',
    },
    en: {
      term: 'LOD',
      def: 'Level of Detail. The model stored at multiple resolutions so the viewer loads the tier appropriate to camera distance.',
      simple: 'Saving the model at both coarse and fine resolution. Zoomed out you get the coarse one, zoomed in the fine one — so huge models open without stalling.',
    },
  },
  effective_distance: {
    tr: {
      term: 'etkin mesafe',
      def: 'LiDAR algılayıcısından itibaren geçerli sayılacak ölçüm aralığı. Bu aralığın dışındaki dönüşler gürültü kabul edilerek işleme dahil edilmez.',
      simple: 'Lazerin ne kadar uzağına kadar olan ölçümlere güveneceğini söylediğin ayar. Bunun ötesindeki noktalar (uzaktaki dağ, gökyüzü yansıması) çöp sayılıp atılır.',
    },
    en: {
      term: 'effective distance',
      def: 'The measurement range from the LiDAR sensor that counts as valid. Returns outside it are treated as noise and excluded from processing.',
      simple: 'The setting that tells the software how far out to trust the laser. Points beyond it — a distant hill, a stray reflection — get thrown away as junk.',
    },
  },
  imu: {
    tr: {
      term: 'IMU',
      def: 'Ataletsel Ölçüm Birimi. İvmeölçer ve dönüölçerlerle platformun yönelimini üreten birim; LiDAR\'da her lazer dönüşünün doğru yönlendirilmesi buna bağlıdır.',
      simple: 'Drone\'un hangi yöne eğik olduğunu ölçen iç denge sistemi. Lazer ölçümlerinin doğru yöne yazılabilmesi için bunun düzgün çalışması şart.',
    },
    en: {
      term: 'IMU',
      def: 'Inertial Measurement Unit. Accelerometers and gyroscopes producing platform attitude; every LiDAR return is oriented using it.',
      simple: 'The internal balance system that measures which way the drone is tilted. Laser measurements can only be pointed correctly if this works properly.',
    },
  },
  exif: {
    tr: {
      term: 'EXIF',
      def: 'Görüntü dosyasına gömülü çekim üstverisi. Konum, irtifa, gimbal açıları, odak uzaklığı ve pozlama bilgisini taşır; Terra dengelemeye buradan başlar.',
      simple: 'Her fotoğrafın içine gizlice yazılan bilgi fişi: nerede, ne zaman, hangi açıyla çekildiği. Terra bu bilgiyi okuyarak işe başlar.',
    },
    en: {
      term: 'EXIF',
      def: 'Capture metadata embedded in the image file — position, altitude, gimbal angles, focal length, exposure. Terra seeds the adjustment from it.',
      simple: 'The hidden info slip written inside every photo: where, when and at what angle it was taken. Terra reads this to get started.',
    },
  },
  seven_param: {
    tr: {
      term: 'yedi parametreli dönüşüm',
      def: 'İki datum arasında üç öteleme, üç dönüklük ve bir ölçek katsayısıyla tanımlanan benzerlik dönüşümü (Helmert). Yerel datuma geçişte kullanılır.',
      simple: 'Bir koordinat sistemini diğerine çevirmek için gereken yedi sayı: üç kaydırma, üç döndürme, bir büyütme. Yerel sisteme geçmenin klasik yolu.',
    },
    en: {
      term: 'seven-parameter transformation',
      def: 'A Helmert similarity transformation between datums defined by three translations, three rotations and a scale factor. Used to move into a local datum.',
      simple: 'The seven numbers needed to convert one coordinate system into another: three shifts, three rotations, one stretch. The classic route into a local system.',
    },
  },
  elevation_optimization: {
    tr: {
      term: 'yükseklik optimizasyonu',
      def: 'Terra\'nın DJI cihazlarıyla toplanmış, kontrol noktası bulunmayan 2B veri setlerinde düşey sistematik hatayı bastırmak için uyguladığı düzeltme.',
      simple: 'Kontrol noktası kullanmadığında Terra\'nın yükseklikleri düzeltmek için devreye soktuğu yardımcı ayar. Kapalı bırakırsan rakımlar ciddi biçimde şaşabilir.',
    },
    en: {
      term: 'elevation optimization',
      def: 'A correction Terra applies to suppress systematic vertical error on 2D datasets captured with DJI hardware without ground control.',
      simple: 'A helper setting Terra uses to fix elevations when you have no control points. Leave it off and your heights can be badly wrong.',
    },
  },
};

/* =====================================================================
   5. GÖRSELLER
   ---------------------------------------------------------------------
   Gerçek ekran görüntüsü koymak istersen buradaki SVG string'i
   `<img src="img/adim.png" alt="...">` ile değiştirmen yeterli.
   ===================================================================== */

const VISUALS = {
  welcome: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="200" cy="120" r="92" stroke="var(--line)" stroke-dasharray="2 7"/>
    <circle cx="200" cy="120" r="62" stroke="var(--line)" stroke-dasharray="2 7"/>
    <path d="M36 172 Q120 58 200 120 T366 66" stroke="var(--amber)" stroke-width="1.4" stroke-dasharray="4 6"/>
    <g transform="translate(200,120)" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round">
      <path d="M-27 0 L-9 0 M9 0 L27 0 M0 -27 L0 -9 M0 9 L0 27"/>
      <circle cx="-27" cy="0" r="7.5" stroke-width="2"/><circle cx="27" cy="0" r="7.5" stroke-width="2"/>
      <circle cx="0" cy="-27" r="7.5" stroke-width="2"/><circle cx="0" cy="27" r="7.5" stroke-width="2"/>
      <circle cx="0" cy="0" r="5" fill="var(--amber)" stroke="none"/>
    </g>
  </svg>`,

  level: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--line)" stroke-width="1.2">
      <rect x="60" y="150" width="64" height="48" rx="4"/>
      <rect x="168" y="112" width="64" height="86" rx="4"/>
      <rect x="276" y="66" width="64" height="132" rx="4"/>
    </g>
    <rect x="60" y="150" width="64" height="48" rx="4" fill="var(--teal)" opacity="0.22"/>
    <rect x="168" y="112" width="64" height="86" rx="4" fill="var(--amber)" opacity="0.22"/>
    <rect x="276" y="66" width="64" height="132" rx="4" fill="var(--violet)" opacity="0.22"/>
    <path d="M92 138 L92 120 M200 100 L200 82 M308 54 L308 36" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="3 4"/>
  </svg>`,

  region: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--line)" stroke-width="0.8">
      <path d="M60 40 V200 M110 40 V200 M160 40 V200 M210 40 V200 M260 40 V200 M310 40 V200"/>
      <path d="M40 70 H360 M40 110 H360 M40 150 H360 M40 190 H360"/>
    </g>
    <ellipse cx="200" cy="120" rx="150" ry="82" stroke="var(--ink-faint)" stroke-width="1.2" stroke-dasharray="3 5"/>
    <g transform="translate(210,104)">
      <path d="M0 0 C-14 -18 -22 -26 -22 -38 A22 22 0 0 1 22 -38 C22 -26 14 -18 0 0 Z" fill="var(--amber)"/>
      <circle cx="0" cy="-38" r="8" fill="var(--bg)"/>
    </g>
  </svg>`,

  crs: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 178 Q110 150 200 162 T360 138" stroke="var(--teal)" stroke-width="1.8"/>
    <path d="M40 132 Q200 108 360 118" stroke="var(--amber)" stroke-width="1.8" stroke-dasharray="6 5"/>
    <g stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="2 4">
      <path d="M110 118 V156 M200 110 V162 M290 112 V150"/>
    </g>
    <g fill="var(--ink-dim)" font-family="var(--font-mono)" font-size="10">
      <text x="46" y="126">elipsoit</text><text x="46" y="196">jeoit</text>
    </g>
    <g fill="var(--ink)"><circle cx="200" cy="110" r="3"/><circle cx="200" cy="162" r="3"/></g>
    <text x="208" y="140" fill="var(--amber)" font-family="var(--font-mono)" font-size="11">N</text>
  </svg>`,

  prep: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="92" y="62" width="216" height="126" rx="8" stroke="var(--line)" stroke-width="1.4"/>
    <rect x="92" y="62" width="216" height="22" rx="8" fill="var(--surface-2)"/>
    <g fill="var(--ink-faint)"><circle cx="106" cy="73" r="3"/><circle cx="118" cy="73" r="3"/><circle cx="130" cy="73" r="3"/></g>
    <g stroke="var(--teal)" stroke-width="1.4">
      <rect x="110" y="100" width="80" height="10" rx="3"/>
      <rect x="110" y="122" width="120" height="10" rx="3" stroke="var(--line)"/>
      <rect x="110" y="144" width="60" height="10" rx="3" stroke="var(--line)"/>
    </g>
    <g stroke="var(--amber)" stroke-width="1.6"><path d="M244 118 h44 M266 96 v44"/></g>
    <rect x="140" y="196" width="120" height="8" rx="4" fill="var(--surface-2)"/>
  </svg>`,

  import: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="52" y="120" width="112" height="80" rx="6" stroke="var(--line)" stroke-width="1.4"/>
    <rect x="66" y="106" width="112" height="80" rx="6" stroke="var(--line)" stroke-width="1.4"/>
    <rect x="80" y="92" width="112" height="80" rx="6" stroke="var(--ink)" stroke-width="1.4"/>
    <circle cx="136" cy="132" r="14" stroke="var(--amber)" stroke-width="1.4"/>
    <path d="M114 154 L132 134 L150 150 L170 114" stroke="var(--amber)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M296 174 V86 M296 86 L276 106 M296 86 L316 106" stroke="var(--teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="250" y="182" width="92" height="18" rx="4" stroke="var(--line)" stroke-width="1.4"/>
  </svg>`,

  control: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="40" y1="196" x2="360" y2="196" stroke="var(--line)" stroke-width="1.4"/>
    <g stroke="var(--amber)" stroke-width="1.6">
      <path d="M100 196 v-14 M100 182 h-9 v-9 h9 v9 h9 v9 h-9" fill="none"/>
      <path d="M200 196 v-14 M200 182 h-9 v-9 h9 v9 h9 v9 h-9" fill="none"/>
      <path d="M300 196 v-14 M300 182 h-9 v-9 h9 v9 h9 v9 h-9" fill="none"/>
    </g>
    <g transform="translate(200,72)">
      <path d="M-22 0 h44 M0 -12 v24" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
      <circle r="6" fill="var(--teal)"/>
    </g>
    <g stroke="var(--teal)" stroke-width="1" stroke-dasharray="3 5">
      <path d="M200 78 L100 176 M200 78 L200 176 M200 78 L300 176"/>
    </g>
  </svg>`,

  decision: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="120" r="5" fill="var(--ink)"/>
    <path d="M75 120 C150 120, 150 62, 250 62" stroke="var(--amber)" stroke-width="1.4" stroke-dasharray="4 6"/>
    <path d="M75 120 C150 120, 150 178, 250 178" stroke="var(--teal)" stroke-width="1.4" stroke-dasharray="4 6"/>
    <g transform="translate(282,62)"><rect x="-26" y="-19" width="52" height="38" rx="4" stroke="var(--amber)" stroke-width="1.4"/><path d="M-26 7 L-9 -7 L4 4 L26 -15" stroke="var(--amber)" stroke-width="1.4"/></g>
    <g transform="translate(282,178)" fill="var(--teal)">
      <circle r="4"/><circle cx="15" cy="-9" r="3" opacity=".8"/><circle cx="-17" cy="6" r="3" opacity=".6"/>
      <circle cx="11" cy="15" r="2.4" opacity=".5"/><circle cx="-9" cy="-17" r="2.4" opacity=".7"/><circle cx="23" cy="10" r="2" opacity=".4"/>
    </g>
  </svg>`,

  at: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--line)" stroke-width="1">
      <path d="M90 70 L200 130 M150 62 L200 130 M210 58 L200 130 M270 68 L200 130 M320 78 L200 130"/>
      <path d="M90 70 L150 62 L210 58 L270 68 L320 78"/>
    </g>
    <g fill="var(--amber)"><circle cx="90" cy="70" r="4"/><circle cx="150" cy="62" r="4"/><circle cx="210" cy="58" r="4"/><circle cx="270" cy="68" r="4"/><circle cx="320" cy="78" r="4"/></g>
    <circle cx="200" cy="130" r="6" fill="var(--teal)"/>
    <g stroke="var(--teal)" stroke-width="1" stroke-dasharray="2 4"><path d="M200 136 V186"/></g>
    <line x1="60" y1="186" x2="340" y2="186" stroke="var(--line)" stroke-width="1.4"/>
  </svg>`,

  photo_output: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="48" y="88" width="118" height="78" rx="4" stroke="var(--line)" stroke-width="1.4"/>
    <rect x="78" y="66" width="118" height="78" rx="4" stroke="var(--amber)" stroke-width="1.6"/>
    <text x="104" y="184" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">DOM / DSM</text>
    <g transform="translate(298,104)" stroke="var(--teal)" stroke-width="1.6">
      <path d="M-34 -18 L0 -36 L34 -18 L34 22 L0 40 L-34 22 Z"/>
      <path d="M-34 -18 L0 0 L34 -18 M0 0 V40"/>
    </g>
    <text x="272" y="184" font-family="var(--font-mono)" font-size="11" fill="var(--ink-dim)">MESH / LOD</text>
  </svg>`,

  scene: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="30" y1="186" x2="370" y2="186" stroke="var(--line)" stroke-width="1.4"/>
    <path d="M40 186 q30 -8 60 0 t60 0" stroke="var(--teal)" stroke-width="1.6" fill="none"/>
    <g stroke="var(--amber)" stroke-width="1.5" fill="none">
      <rect x="180" y="120" width="34" height="66"/><rect x="222" y="96" width="30" height="90"/><rect x="260" y="136" width="26" height="50"/>
    </g>
    <g stroke="var(--violet)" stroke-width="1.5" fill="none">
      <circle cx="312" cy="150" r="16"/><path d="M312 166 v20"/>
      <circle cx="352" cy="142" r="14"/><path d="M352 156 v30"/>
    </g>
    <g font-family="var(--font-mono)" font-size="9" fill="var(--ink-faint)">
      <text x="52" y="208">FIELD</text><text x="196" y="208">URBAN</text><text x="304" y="208">FRUIT TREE</text>
    </g>
  </svg>`,

  resolution: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--line)" stroke-width="0.5" fill="none">
      <g transform="translate(40,80)"><rect width="88" height="88" stroke="var(--amber)" stroke-width="1.4"/>
        <path d="M11 0V88M22 0V88M33 0V88M44 0V88M55 0V88M66 0V88M77 0V88M0 11H88M0 22H88M0 33H88M0 44H88M0 55H88M0 66H88M0 77H88"/></g>
      <g transform="translate(156,80)"><rect width="88" height="88" stroke="var(--ink-faint)" stroke-width="1.4"/>
        <path d="M22 0V88M44 0V88M66 0V88M0 22H88M0 44H88M0 66H88"/></g>
      <g transform="translate(272,80)"><rect width="88" height="88" stroke="var(--ink-faint)" stroke-width="1.4"/>
        <path d="M44 0V88M0 44H88"/></g>
    </g>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--ink-dim)">
      <text x="52" y="190">HIGH 1/1</text><text x="166" y="190">MED 1/2</text><text x="284" y="190">LOW 1/4</text>
    </g>
  </svg>`,

  photo_3d: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--teal)" stroke-width="1.1">
      <path d="M120 60 L202 40 L280 70 L242 132 L160 142 Z"/>
      <path d="M120 60 L160 142 M202 40 L160 142 M202 40 L242 132 M280 70 L242 132"/>
      <path d="M160 142 L128 192 L212 202 L242 132 M160 142 L212 202"/>
    </g>
    <g fill="var(--ink)"><circle cx="120" cy="60" r="2.6"/><circle cx="202" cy="40" r="2.6"/><circle cx="280" cy="70" r="2.6"/><circle cx="242" cy="132" r="2.6"/><circle cx="160" cy="142" r="2.6"/><circle cx="128" cy="192" r="2.6"/><circle cx="212" cy="202" r="2.6"/></g>
  </svg>`,

  lidar_import: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(200,54)">
      <path d="M-30 0 h60 v18 h-60 z" stroke="var(--ink)" stroke-width="1.6" fill="none"/>
      <path d="M-40 -6 h-16 M40 -6 h16" stroke="var(--ink-faint)" stroke-width="1.4"/>
    </g>
    <g stroke="var(--teal)" stroke-width="0.9" opacity="0.8">
      <path d="M200 74 L96 186 M200 74 L134 186 M200 74 L166 186 M200 74 L200 186 M200 74 L234 186 M200 74 L266 186 M200 74 L304 186"/>
    </g>
    <line x1="60" y1="186" x2="340" y2="186" stroke="var(--line)" stroke-width="1.4"/>
    <g fill="var(--teal)"><circle cx="96" cy="186" r="2.5"/><circle cx="134" cy="186" r="2.5"/><circle cx="166" cy="186" r="2.5"/><circle cx="200" cy="186" r="2.5"/><circle cx="234" cy="186" r="2.5"/><circle cx="266" cy="186" r="2.5"/><circle cx="304" cy="186" r="2.5"/></g>
  </svg>`,

  lidar_density: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="var(--teal)">
      <circle cx="52" cy="66" r="2"/><circle cx="96" cy="98" r="2"/><circle cx="44" cy="146" r="2"/><circle cx="104" cy="168" r="2"/><circle cx="70" cy="198" r="2"/>
      <g opacity="0.85"><circle cx="180" cy="52" r="2"/><circle cx="202" cy="80" r="2"/><circle cx="168" cy="102" r="2"/><circle cx="212" cy="122" r="2"/><circle cx="184" cy="150" r="2"/><circle cx="222" cy="170" r="2"/><circle cx="196" cy="196" r="2"/><circle cx="160" cy="176" r="2"/></g>
      <g><circle cx="300" cy="46" r="2"/><circle cx="320" cy="58" r="2"/><circle cx="336" cy="44" r="2"/><circle cx="292" cy="72" r="2"/><circle cx="312" cy="82" r="2"/><circle cx="332" cy="76" r="2"/>
      <circle cx="300" cy="98" r="2"/><circle cx="318" cy="106" r="2"/><circle cx="338" cy="100" r="2"/><circle cx="288" cy="120" r="2"/><circle cx="308" cy="130" r="2"/><circle cx="328" cy="124" r="2"/>
      <circle cx="300" cy="150" r="2"/><circle cx="320" cy="160" r="2"/><circle cx="338" cy="152" r="2"/><circle cx="292" cy="176" r="2"/><circle cx="312" cy="186" r="2"/><circle cx="332" cy="180" r="2"/><circle cx="304" cy="204" r="2"/><circle cx="324" cy="198" r="2"/></g>
    </g>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--ink-faint)"><text x="46" y="228">6.25%</text><text x="176" y="228">25%</text><text x="300" y="228">100%</text></g>
  </svg>`,

  lidar_optim: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="var(--ink-faint)" opacity="0.55">
      <rect x="60" y="96" width="120" height="3" rx="1.5"/><rect x="60" y="112" width="120" height="3" rx="1.5"/>
      <rect x="60" y="140" width="120" height="3" rx="1.5"/><rect x="60" y="156" width="120" height="3" rx="1.5"/>
    </g>
    <g fill="var(--teal)">
      <rect x="228" y="104" width="120" height="3" rx="1.5"/><rect x="228" y="107" width="120" height="3" rx="1.5"/>
      <rect x="228" y="146" width="120" height="3" rx="1.5"/><rect x="228" y="149" width="120" height="3" rx="1.5"/>
    </g>
    <path d="M196 126 h16 M206 120 l8 6 -8 6" stroke="var(--amber)" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--ink-faint)"><text x="66" y="192">katmanlı</text><text x="238" y="192">çakışık</text></g>
  </svg>`,

  lidar_class: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="var(--ink-faint)" opacity="0.4">
      <rect x="86" y="118" width="14" height="52"/><rect x="116" y="98" width="14" height="72"/><rect x="146" y="128" width="14" height="42"/>
      <rect x="246" y="86" width="42" height="84"/><rect x="298" y="108" width="26" height="62"/>
    </g>
    <rect x="58" y="170" width="284" height="16" fill="var(--amber)" opacity="0.85"/>
    <path d="M58 170 q60 -12 120 4 t164 -8" stroke="var(--amber)" stroke-width="1.4" fill="none"/>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--ink-faint)"><text x="60" y="212">ZEMİN SINIFI → DEM</text></g>
  </svg>`,

  quality: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="80" y="46" width="240" height="150" rx="6" stroke="var(--line)" stroke-width="1.4"/>
    <g stroke="var(--line)" stroke-width="1"><path d="M80 76 H320"/></g>
    <g fill="var(--ink-faint)"><rect x="98" y="58" width="70" height="7" rx="3.5"/></g>
    <g fill="var(--ink-dim)">
      <rect x="98" y="94" width="52" height="6" rx="3"/><rect x="98" y="116" width="52" height="6" rx="3"/><rect x="98" y="138" width="52" height="6" rx="3"/><rect x="98" y="160" width="52" height="6" rx="3"/>
    </g>
    <g><rect x="180" y="92" width="110" height="10" rx="5" fill="var(--surface-2)"/><rect x="180" y="92" width="94" height="10" rx="5" fill="var(--teal)"/></g>
    <g><rect x="180" y="114" width="110" height="10" rx="5" fill="var(--surface-2)"/><rect x="180" y="114" width="72" height="10" rx="5" fill="var(--teal)"/></g>
    <g><rect x="180" y="136" width="110" height="10" rx="5" fill="var(--surface-2)"/><rect x="180" y="136" width="102" height="10" rx="5" fill="var(--amber)"/></g>
    <g><rect x="180" y="158" width="110" height="10" rx="5" fill="var(--surface-2)"/><rect x="180" y="158" width="40" height="10" rx="5" fill="var(--amber)"/></g>
  </svg>`,

  export: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--line)" stroke-width="1.4">
      <rect x="46" y="86" width="86" height="68" rx="5"/><rect x="157" y="86" width="86" height="68" rx="5"/><rect x="268" y="86" width="86" height="68" rx="5"/>
    </g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--amber)">
      <text x="66" y="126">.TIF</text><text x="176" y="126">.LAS</text><text x="288" y="126">.OBJ</text>
    </g>
    <g stroke="var(--teal)" stroke-width="1.4" stroke-linecap="round">
      <path d="M89 166 v22 M89 188 l-7 -7 M89 188 l7 -7"/>
      <path d="M200 166 v22 M200 188 l-7 -7 M200 188 l7 -7"/>
      <path d="M311 166 v22 M311 188 l-7 -7 M311 188 l7 -7"/>
    </g>
  </svg>`,

  complete: `<svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="200" cy="120" r="72" stroke="var(--line)" stroke-dasharray="2 7"/>
    <circle cx="200" cy="120" r="47" stroke="var(--amber)" stroke-width="1.6"/>
    <path d="M179 120 L196 137 L226 103" stroke="var(--amber)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

/* =====================================================================
   6. ADIM GRAFİĞİ
   ---------------------------------------------------------------------
   ALAN SÖZLÜĞÜ
     type      'welcome' | 'choice' | 'content' | 'crs' | 'process' | 'complete'
     phase     0..4  → üstteki aşama göstergesini besler
     visual    VISUALS içindeki anahtar
     next      bir sonraki adım id'si (choice adımlarında seçenek üzerinde)
     showIf    (vars) => boolean — koşullu adım; sağlamazsa atlanır
     accent    'amber' | 'teal' | 'violet' — adımın vurgu rengi
     i18n[dil] = {
       eyebrow, title,
       body    : { b, i, a }   ← seviyeye göre metin
       pro     : ileri seviyede gösterilen ek teknik kutu (opsiyonel)
       checklist: [..]         ← ekranda yapılacaklar (opsiyonel)
       cta     : buton yazısı
     }
     choices[] = { id, icon, next, set:{...}, accent,
                   i18n[dil] = { title, desc, impact:[..], warn } }
   ===================================================================== */

const STEPS = {

  /* ---------------------------------------------------------------
     AŞAMA 0 — HAZIRLIK
     --------------------------------------------------------------- */

  welcome: {
    type: "welcome", phase: 0, visual: "welcome", next: "level", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "DJI TERRA · İNTERAKTİF EĞİTİM REHBERİ",
        title: "Ham veriden teslime, adım adım",
        body: {
          b: "Bu rehber, DJI Terra yazılımını hayatında ilk kez açan biri için yazıldı. Her ekranda ne göreceğini, hangi düğmeye basacağını ve seçtiğin şeyin sonucu nasıl değiştireceğini tek tek anlatır. Hiçbir ön bilgi gerekmiyor — sadece elindeki uçuş verisi ve biraz sabır yeter.",
          i: "DJI Terra ile fotogrametri ve LiDAR verisi işlemenin uçtan uca akışı. Her karar noktasında seçeneklerin sonuçlarını, doğruluk bütçesine etkisini ve tipik hataları göreceksin. Rehber senin seçimlerine göre dallanır; gereksiz adımları göstermez.",
          a: "Terra iş akışının karar ağacı: konumlama stratejisi, dengeleme kısıtları, yeniden yapılandırma parametreleri ve çıktı referans sistemi. Her seçenek doğruluk bütçesi ve işlem maliyeti üzerinden değerlendirilir; sayısal beklentiler DJI teknik dokümantasyonuna dayanır.",
        },
        meta: "12–18 dakika · Bilgi seviyene ve bölgene göre uyarlanır",
        cta: "Rehbere başla",
      },
      en: {
        eyebrow: "DJI TERRA · INTERACTIVE TRAINING GUIDE",
        title: "From raw data to delivery, step by step",
        body: {
          b: "This guide was written for someone opening DJI Terra for the very first time. It tells you what you will see on each screen, which button to press, and how your choice changes the result. No prior knowledge needed — just your flight data and a little patience.",
          i: "The end-to-end flow for processing photogrammetry and LiDAR data in DJI Terra. At every decision point you see what each option does, how it affects the accuracy budget, and the mistakes people typically make. The guide branches on your choices and hides steps you do not need.",
          a: "The decision tree of the Terra workflow: positioning strategy, adjustment constraints, reconstruction parameters and output reference frame. Each option is weighed against accuracy budget and processing cost; numerical expectations follow DJI technical documentation.",
        },
        meta: "12–18 minutes · Adapts to your level and region",
        cta: "Start the guide",
      },
    },
  },

  level: {
    type: "choice", phase: 0, visual: "level", accent: "violet",
    i18n: {
      tr: {
        eyebrow: "HAZIRLIK · 1 / 4",
        title: "Konuya ne kadar hâkimsin?",
        body: {
          b: "Bu seçim rehberin dilini belirler. İstersen sonradan üstteki düğmeden değiştirebilirsin — hiçbir ilerlemeni kaybetmezsin.",
          i: "Bu seçim rehberin dilini belirler. İstersen sonradan üstteki düğmeden değiştirebilirsin — hiçbir ilerlemeni kaybetmezsin.",
          a: "Bu seçim rehberin dilini belirler. İstersen sonradan üstteki düğmeden değiştirebilirsin — hiçbir ilerlemeni kaybetmezsin.",
        },
      },
      en: {
        eyebrow: "SETUP · 1 / 4",
        title: "How familiar are you with this?",
        body: {
          b: "This sets the language of the guide. You can change it later from the control at the top — you will not lose any progress.",
          i: "This sets the language of the guide. You can change it later from the control at the top — you will not lose any progress.",
          a: "This sets the language of the guide. You can change it later from the control at the top — you will not lose any progress.",
        },
      },
    },
    choices: [
      {
        id: "b", icon: "ph-leaf", next: "region", accent: "teal", set: { level: "b" },
        i18n: {
          tr: {
            title: "İlk kez duyuyorum",
            desc: "Drone verisi işleme konusunda deneyimim yok, Terra'yı hiç açmadım.",
            impact: [
              "Her teknik terim günlük dille, benzetmelerle açıklanır",
              "Her adımda ekranda tam olarak nereye tıklayacağın yazar",
              "Adımın altında o adımdaki terimlerin sözlüğü açık durur",
            ],
          },
          en: {
            title: "Completely new",
            desc: "No experience with drone data processing, never opened Terra.",
            impact: [
              "Every technical term is explained in plain language with analogies",
              "Each step tells you exactly where to click on screen",
              "A glossary of that step's terms stays open below the text",
            ],
          },
        },
      },
      {
        id: "i", icon: "ph-compass-tool", next: "region", accent: "amber", set: { level: "i" },
        i18n: {
          tr: {
            title: "Temel bilgim var",
            desc: "Harita/ölçme altyapım var, fotogrametriyi biliyorum ama Terra'ya yabancıyım.",
            impact: [
              "Standart mesleki dil kullanılır, temel kavramlar tekrar anlatılmaz",
              "Vurgu neden-sonuç ilişkisinde ve ayarların çıktıya etkisinde olur",
              "Terimler tooltip olarak elinin altında kalır, metni şişirmez",
            ],
          },
          en: {
            title: "I know the basics",
            desc: "I have a surveying background and understand photogrammetry, but Terra is new to me.",
            impact: [
              "Standard professional language, no re-teaching of fundamentals",
              "Emphasis falls on cause and effect, and how settings shape the output",
              "Terms stay one hover away as tooltips instead of padding the text",
            ],
          },
        },
      },
      {
        id: "a", icon: "ph-function", next: "region", accent: "violet", set: { level: "a" },
        i18n: {
          tr: {
            title: "Deneyimliyim",
            desc: "Fotogrametri/LiDAR üretimi yapıyorum, doğruluk bütçesiyle çalışıyorum.",
            impact: [
              "Yoğun teknik anlatım: dengeleme kısıtları, sayısal toleranslar, EPSG kodları",
              "Her adımda ek bir teknik not kutusu açılır",
              "Sade açıklamalar ve tıklama talimatları gizlenir",
            ],
          },
          en: {
            title: "Experienced",
            desc: "I produce photogrammetry/LiDAR deliverables and work to an accuracy budget.",
            impact: [
              "Dense technical treatment: adjustment constraints, numeric tolerances, EPSG codes",
              "An extra technical note box opens on every step",
              "Plain-language explanations and click-by-click instructions are hidden",
            ],
          },
        },
      },
    ],
  },

  region: {
    type: "choice", phase: 0, visual: "region", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "HAZIRLIK · 2 / 4",
        title: "Çalışma alanın nerede?",
        body: {
          b: "Her ülkenin kendi harita koordinat sistemi vardır. Yanlış olanı seçersen haritan doğru görünür ama gerçek yerinden metrelerce kayık olur. Bölgeni seç, sana oraya uygun sistemleri kod kod göstereyim.",
          i: "Çıktının teslim edileceği referans sistemi bölgeye göre değişir. Seçimine göre o bölgede kullanılan yatay ve düşey datumları, EPSG kodlarıyla ve Terra'ya özgü uyarılarla birlikte listeleyeceğim.",
          a: "Çıktı referans çerçevesi seçimi bölgeye bağlıdır. Seçime göre yatay datum aileleri, dilim tanımları, düşey datum ve jeoit modeli ile Terra'nın veritabanı kısıtları listelenir.",
        },
      },
      en: {
        eyebrow: "SETUP · 2 / 4",
        title: "Where is your site?",
        body: {
          b: "Every country has its own map coordinate system. Pick the wrong one and your map looks fine but sits metres away from reality. Choose your region and I will show you the right systems, code by code.",
          i: "The reference system your deliverable must land in depends on the region. Based on your choice I will list the horizontal and vertical datums used there, with EPSG codes and Terra-specific caveats.",
          a: "Output reference frame selection is region-bound. Your choice drives the listing of horizontal datum families, zone definitions, vertical datum and geoid model, plus Terra's database limitations.",
        },
      },
    },
    choices: [
      { id: "turkiye", icon: "ph-map-pin-line", next: "crs_brief", accent: "amber", set: { region: "turkiye" },
        i18n: { tr: { title: "Türkiye", desc: "TUREF dilimleri, TUDKA99 düşey datumu", impact: ["TM27–TM45 dilimleri EPSG kodlarıyla listelenir", "TUREF ile 3 derece Gauss-Krüger arasındaki sağa değeri tuzağı anlatılır", "Terra'nın Türkiye jeoidini içermemesi için çözüm önerilir"] },
               en: { title: "Türkiye", desc: "TUREF zones, TUDKA99 vertical datum", impact: ["TM27–TM45 zones listed with EPSG codes", "The easting trap between TUREF and 3-degree Gauss-Krüger explained", "A workaround for Terra not shipping the Turkish geoid"] } } },
      { id: "europe", icon: "ph-globe-hemisphere-west", next: "crs_brief", accent: "teal", set: { region: "europe" },
        i18n: { tr: { title: "Avrupa", desc: "ETRS89 / UTM, EVRF ve ülke datumları", impact: ["ETRS89 UTM dilimleri listelenir", "ETRS89 ile WGS84 arasındaki yıllık kayma açıklanır", "Ülke bazlı düşey datum seçenekleri gösterilir"] },
               en: { title: "Europe", desc: "ETRS89 / UTM, EVRF and national datums", impact: ["ETRS89 UTM zones listed", "The annual drift between ETRS89 and WGS84 explained", "National vertical datum options shown"] } } },
      { id: "uk", icon: "ph-map-trifold", next: "crs_brief", accent: "violet", set: { region: "uk" },
        i18n: { tr: { title: "Birleşik Krallık", desc: "British National Grid, ODN", impact: ["OSGB36 ulusal ızgara ve OSTN15 dönüşümü", "ODN düşey datumu ve OSGM15 jeoidi", "Jeoit dosyası yüklenmezse oluşan ~50 m hata uyarısı"] },
               en: { title: "United Kingdom", desc: "British National Grid, ODN", impact: ["OSGB36 national grid and the OSTN15 shift", "ODN vertical datum and the OSGM15 geoid", "Warning about the ~50 m error if the geoid file is missing"] } } },
      { id: "namerica", icon: "ph-flag", next: "crs_brief", accent: "amber", set: { region: "namerica" },
        i18n: { tr: { title: "Kuzey Amerika", desc: "NAD83, State Plane, NAVD88", impact: ["NAD83(2011) ve State Plane mantığı", "NAVD88 ve GEOID18 kurulumu", "Ayak/metre karışıklığının 3,28 katlık sonucu"] },
               en: { title: "North America", desc: "NAD83, State Plane, NAVD88", impact: ["NAD83(2011) and how State Plane works", "Setting up NAVD88 with GEOID18", "The 3.28× consequence of the feet/metre mix-up"] } } },
      { id: "oceania", icon: "ph-compass-rose", next: "crs_brief", accent: "teal", set: { region: "oceania" },
        i18n: { tr: { title: "Avustralya / Y. Zelanda", desc: "GDA2020 MGA, AHD", impact: ["MGA2020 dilimleri ve EPSG mantığı", "AHD düşey datumu ve AUSGeoid2020", "GDA94 → GDA2020 geçişindeki 1,8 m kayma"] },
               en: { title: "Australia / New Zealand", desc: "GDA2020 MGA, AHD", impact: ["MGA2020 zones and the EPSG pattern", "AHD vertical datum and AUSGeoid2020", "The 1.8 m shift from GDA94 to GDA2020"] } } },
      { id: "eafrica", icon: "ph-sun-horizon", next: "crs_brief", accent: "violet", set: { region: "eafrica" },
        i18n: { tr: { title: "Doğu Afrika", desc: "Arc 1960 / WGS84 UTM", impact: ["Arc 1960 ve WGS84 UTM dilimleri", "İki datum arasındaki 150–300 m fark uyarısı", "Güney yarımküre dilimlerinde 10.000.000 m yukarı değeri"] },
               en: { title: "East Africa", desc: "Arc 1960 / WGS84 UTM", impact: ["Arc 1960 and WGS84 UTM zones", "Warning about the 150–300 m gap between the two datums", "The 10,000,000 m northing offset in southern zones"] } } },
      { id: "global", icon: "ph-globe-stand", next: "crs_brief", accent: "amber", set: { region: "global" },
        i18n: { tr: { title: "Diğer / Küresel", desc: "WGS84 UTM, EGM96 / EGM2008", impact: ["UTM dilim numarasının hesaplanması", "EPSG kodu üretme kuralı (326xx / 327xx)", "Küresel jeoit modelleriyle çalışma"] },
               en: { title: "Other / Global", desc: "WGS84 UTM, EGM96 / EGM2008", impact: ["How to compute your UTM zone number", "The EPSG code rule (326xx / 327xx)", "Working with global geoid models"] } } },
    ],
  },

  crs_brief: {
    type: "crs", mode: "brief", phase: 0, next: "prep", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "HAZIRLIK · 3 / 4",
        title: "Bölgenin referans sistemleri",
        body: {
          b: "Aşağıda senin bölgende kullanılan koordinat sistemleri var. Şimdilik sadece göz at — bu listeye rehberin sonunda, Terra'da çıktı ayarını yaparken geri döneceğiz. O anda hangi kodu yazacağını buradan bulacaksın.",
          i: "Bölgen için geçerli yatay ve düşey referans sistemleri aşağıda. Terra'nın Advanced → Output Coordinate System penceresinde bu kodları doğrudan arama kutusuna yazabilirsin. Rehberin sonunda bu ekrana geri döneceğiz.",
          a: "Bölge için yatay datum aileleri, dilim tanımları ve düşey datum aşağıda. Terra'nın koordinat sistemi veritabanı EPSG kodu ile sorgulanır; PRJ içe aktarımı da desteklenir. Çıktı adımında bu tabloya dönülecek.",
        },
        pro: "Terra'nın yatay ve düşey datum ayarları birbirinden bağımsızdır. Yatayı doğru seçip düşeyi varsayılan bırakmak, plan doğruluğu santimetre iken rakımların onlarca metre kayık olduğu bir çıktı üretir — ve bu hata rapor sayfasında görünmez.",
      },
      en: {
        eyebrow: "SETUP · 3 / 4",
        title: "Reference systems for your region",
        body: {
          b: "Below are the coordinate systems used in your region. Just glance at them for now — we will come back to this list at the end of the guide when you set the output in Terra. That is when you will need these codes.",
          i: "The horizontal and vertical reference systems valid for your region are below. You can type these codes straight into the search box in Terra's Advanced → Output Coordinate System panel. We will return to this screen near the end.",
          a: "Horizontal datum families, zone definitions and vertical datum for the region are below. Terra's coordinate system database is queried by EPSG code; PRJ import is also supported. The output step returns to this table.",
        },
        pro: "Terra's horizontal and vertical datum settings are independent. Getting the horizontal right while leaving the vertical at default produces a deliverable with centimetre plan accuracy and elevations off by tens of metres — and the quality report will not flag it.",
      },
    },
    cta: { tr: "Anladım, devam", en: "Got it, continue" },
  },

  prep: {
    type: "content", phase: 0, visual: "prep", next: "datatype", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "HAZIRLIK · 4 / 4",
        title: "Bilgisayarını ve verini hazırla",
        body: {
          b: "Terra ağır bir yazılımdır; bilgisayarın gücü doğrudan işin süresini belirler. Ayrıca sadece Windows'ta çalışır — Mac'te çalışmaz. Verini de düzgün yerleştirmen gerekir, yoksa Terra dosyaları bulamaz.",
          i: "Terra yalnızca Windows 10 ve üzeri 64-bit sistemlerde çalışır; macOS desteklenmez. Asgari donanım 32 GB RAM ve 4 GB bellekli NVIDIA ekran kartıdır (Shader Model 6.1 ve üzeri). Önerilen yapılandırma 64 GB RAM ve RTX 2070 sınıfı bir karttır. Bellek doğrudan işlenebilecek fotoğraf sayısını sınırlar.",
          a: "Windows 10+ x64 zorunludur; macOS ve Kylin desteklenmez. Asgari: 32 GB RAM, 4 GB VRAM, Shader Model 6.1+ NVIDIA GPU. Önerilen: 64 GB+ RAM, RTX 2070 sınıfı veya üzeri. Terra CPU, RAM ve VRAM'in tamamını kullanır. Çoklu GPU desteklenir ancak hızlanma doğrusal değildir.",
        },
        pro: "Kaba kapasite hesabı: dengeleme aşamasında yaklaşık 300–400 görüntü / GB RAM işlenir. Yapılandırma karşılandıktan sonra her 10 GB ilave boş bellek kabaca 4000 fotoğraf daha demektir. LiDAR tarafında oran farklıdır: her 4 GB boş bellek yaklaşık 1 GB ham LiDAR dosyasını taşır — 64 GB'lık bir makinede pratik tavan 16 GB ham veridir. Bu sınırı aşan setleri parçalara böl ya da nokta bulutu doğruluk optimizasyonunu kapat.",
        checklist: [
          "Ham veriyi harici diskten dahili SSD'ye kopyala — Terra ağ sürücüsünde ve USB'de yavaşlar",
          "Klasör yolunda Türkçe karakter ve boşluk bulundurma (C:\\Terra\\Proje01 gibi sade bir yol kur)",
          "Windows güç planını Yüksek Performans yap, uyku modunu kapat",
          "Antivirüs yazılımına proje klasörü için istisna tanımla — gerçek zamanlı tarama işlemi yavaşlatır",
          "Ekran kartı sürücüsünü güncelle; sürüm eskiyse Terra dengeleme aşamasında hata verir",
          "Lisansını kontrol et: 3B model üretimi, çıktı koordinat sistemi ayarı ve YKN yönetimi Pro sürümü ister",
        ],
        cta: "Bilgisayarım hazır",
      },
      en: {
        eyebrow: "SETUP · 4 / 4",
        title: "Prepare your computer and data",
        body: {
          b: "Terra is heavy software; your computer's power directly sets how long the job takes. It also only runs on Windows — not on a Mac. Your data needs to sit in the right place too, or Terra will not find it.",
          i: "Terra runs only on 64-bit Windows 10 and above; macOS is not supported. The minimum is 32 GB RAM and an NVIDIA card with 4 GB memory (Shader Model 6.1 or higher). Recommended is 64 GB RAM and an RTX 2070 class card. Memory directly caps how many photos you can process.",
          a: "Windows 10+ x64 is mandatory; macOS and Kylin are unsupported. Minimum: 32 GB RAM, 4 GB VRAM, Shader Model 6.1+ NVIDIA GPU. Recommended: 64 GB+ RAM, RTX 2070 class or better. Terra consumes all available CPU, RAM and VRAM. Multi-GPU is supported but scaling is not linear.",
        },
        pro: "Rough capacity maths: adjustment processes roughly 300–400 images per GB of RAM. Once the base configuration is met, every additional 10 GB of free memory buys roughly 4000 more photos. LiDAR scales differently: every 4 GB of free memory carries about 1 GB of raw LiDAR — a practical ceiling of 16 GB of raw data on a 64 GB machine. Split larger sets or disable point cloud accuracy optimization.",
        checklist: [
          "Copy raw data from external drives to the internal SSD — Terra crawls on network drives and USB",
          "Keep the folder path free of spaces and non-ASCII characters (something plain like C:\\Terra\\Project01)",
          "Set the Windows power plan to High Performance and disable sleep",
          "Add an antivirus exclusion for the project folder — real-time scanning slows processing badly",
          "Update the GPU driver; an outdated one makes Terra fail during adjustment",
          "Check your licence: 3D model reconstruction, output coordinate system settings and GCP management need the Pro version",
        ],
        cta: "My machine is ready",
      },
    },
  },

  /* ---------------------------------------------------------------
     AŞAMA 1 — VERİ
     --------------------------------------------------------------- */

  datatype: {
    type: "choice", phase: 1, visual: "decision", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "VERİ · KARAR NOKTASI",
        title: "Elinde hangi veri var?",
        body: {
          b: "Drone'unla ne topladığına göre iki tamamen farklı yol var. Fotoğraf çektiysen fotogrametri, lazer tarayıcı taktıysan LiDAR. Kart okuyucudaki dosyalara bak: JPG dosyaları görüyorsan fotogrametri, .LDR veya .CLI gibi dosyalar görüyorsan LiDAR.",
          i: "İşleme motoru veri türüne göre tamamen ayrışır. Fotogrametri, örtüşen görüntülerden [[aerotriangulation]] yoluyla geometri üretir. LiDAR ise doğrudan ölçülmüş mesafelerden [[point_cloud]] oluşturur; görüntü yalnızca renklendirme için kullanılır.",
          a: "İki ayrı işleme hattı: pasif çok görüntülü stereo (görüntü tabanlı dengeleme + yoğun eşleme) ve aktif lazer telemetri (yörünge çözümü + nokta bulutu üretimi). Doğruluk karakteristikleri, hata kaynakları ve kontrol stratejileri farklıdır.",
        },
      },
      en: {
        eyebrow: "DATA · DECISION POINT",
        title: "What data do you have?",
        body: {
          b: "There are two completely different paths depending on what your drone collected. Photos mean photogrammetry; a laser scanner means LiDAR. Look at the files on your card reader: JPGs mean photogrammetry, files like .LDR or .CLI mean LiDAR.",
          i: "The processing engine forks entirely on data type. Photogrammetry derives geometry from overlapping imagery via [[aerotriangulation]]. LiDAR builds a [[point_cloud]] from directly measured ranges; imagery is used only for colourisation.",
          a: "Two separate pipelines: passive multi-view stereo (image-based adjustment plus dense matching) and active laser ranging (trajectory solution plus point cloud generation). Accuracy characteristics, error sources and control strategies all differ.",
        },
      },
    },
    choices: [
      {
        id: "photogrammetry", icon: "ph-image-square", next: "p_import", accent: "amber", set: { track: "photo" },
        i18n: {
          tr: {
            title: "Fotogrametri",
            desc: "Elimde çakışmalı fotoğraflar var (P1, P4 RTK, Mavic 3E, M4E gibi).",
            impact: [
              "Ortomozaik (DOM), yüzey modeli (DSM) ve dokulu 3B model üretebilirsin",
              "Doğruluk büyük ölçüde GSD'ye bağlıdır: alçak uçarsan hassaslaşır, yavaşlar",
              "Bitki örtüsü altını göremezsin — ağaç varsa zemin ölçülemez",
            ],
          },
          en: {
            title: "Photogrammetry",
            desc: "I have overlapping photos (from a P1, P4 RTK, Mavic 3E, M4E and so on).",
            impact: [
              "You can produce an orthomosaic (DOM), surface model (DSM) and textured 3D model",
              "Accuracy is largely GSD-driven: flying lower is more precise but slower",
              "You cannot see under vegetation — where there are trees, the ground is not measured",
            ],
          },
        },
      },
      {
        id: "lidar", icon: "ph-scan", next: "l_import", accent: "teal", set: { track: "lidar" },
        i18n: {
          tr: {
            title: "LiDAR",
            desc: "Zenmuse L1 / L2 gibi bir lazer tarayıcıyla ham tarama verisi topladım.",
            impact: [
              "Bitki örtüsünün altındaki zemini ölçebilir, gerçek arazi modeli (DEM) üretebilirsin",
              "Doğruluk uçuş yüksekliğinden çok yörünge ve IMU çözümüne bağlıdır",
              "Ham dosyalar çok büyüktür; bellek planlaması kritik hale gelir",
            ],
          },
          en: {
            title: "LiDAR",
            desc: "I collected raw scan data with a laser scanner such as the Zenmuse L1 / L2.",
            impact: [
              "You can measure ground under vegetation and produce a true terrain model (DEM)",
              "Accuracy depends far more on trajectory and IMU solution than on flight height",
              "Raw files are very large; memory planning becomes critical",
            ],
          },
        },
      },
    ],
  },

  /* ---------------------------------------------------------------
     FOTOGRAMETRİ DALI
     --------------------------------------------------------------- */

  p_import: {
    type: "content", phase: 1, visual: "import", next: "p_control", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "FOTOGRAMETRİ · İÇE AKTARMA",
        title: "Görevi oluştur ve fotoğrafları yükle",
        body: {
          b: "Terra'yı açtığında karşına görev listesi gelir. Yeni bir görev oluşturup türünü Görünür Işık Yeniden Yapılandırma seçeceksin. Sonra fotoğrafların olduğu klasörü göstereceksin. Terra fotoğrafların içine gömülü konum bilgisini ([[exif]]) kendisi okur, senin ayrıca girmene gerek yoktur.",
          i: "Yeni görev → Görünür Işık Yeniden Yapılandırma. Fotoğrafları klasör olarak içe aktar. Terra her görüntünün [[exif]] üstverisinden konum, irtifa ve gimbal açılarını okuyarak dengelemeye başlangıç değeri üretir. Görüntülerin hangi koordinat sisteminde olduğunu tanımlamazsan Terra hepsini WGS84 (EPSG:4326) ve elipsoit yüksekliği varsayar.",
          a: "Görünür ışık görevi oluştur ve görüntü kümesini içe aktar. Terra [[exif]] üstverisinden yaklaşık dış yöneltme başlangıç değerlerini türetir. Kritik nokta: görüntü koordinat sistemi tanımlanmazsa Terra varsayılan olarak yatayda EPSG:4326, düşeyde elipsoit yüksekliği kabul eder — RTK düzeltmesi başka bir datumdan geliyorsa bu sessiz bir sistematik hata kaynağıdır.",
        },
        pro: "Pilot 2 uygulamasındaki gömülü distorsiyon düzeltmesini ölçme amaçlı işlerde kapalı tut. Son işlem yazılımının kamera dewarp parametreleriyle yaptığı düzeltme, uçuş sırasında yapılan gömülü düzeltmeden belirgin biçimde daha doğrudur. Ayrıca haritalama kamerası olmayan bir kamerayla toplanan veride iç yöneltme parametreleri güvenilir çözülemez; bu durumda mutlak doğruluk taahhüt etme.",
        checklist: [
          "Terra'yı aç, sol üstten yeni görev oluştur ve türü Görünür Işık Yeniden Yapılandırma seç",
          "Fotoğraf Ekle düğmesiyle uçuş klasörünü tamamen içe aktar",
          "Yüklenen fotoğraf sayısının kartındaki sayıyla aynı olduğunu doğrula",
          "Haritada uçuş izinin beklediğin şekle oturduğuna bak — dağınık noktalar EXIF sorununa işarettir",
          "Görüntü koordinat sistemi RTK kaynağınla aynı değilse şimdi tanımla, sonra değil",
        ],
        cta: "Fotoğraflar yüklendi",
      },
      en: {
        eyebrow: "PHOTOGRAMMETRY · IMPORT",
        title: "Create the mission and load your photos",
        body: {
          b: "Opening Terra brings up the mission list. Create a new mission and set its type to Visible Light Reconstruction. Then point it at the folder holding your photos. Terra reads the position data buried inside each photo ([[exif]]) by itself — you do not have to type anything in.",
          i: "New mission → Visible Light Reconstruction. Import the photos as a folder. Terra reads position, altitude and gimbal angles from each image's [[exif]] metadata to seed the adjustment. If you do not define which coordinate system the images are in, Terra assumes WGS84 (EPSG:4326) with ellipsoidal height for all of them.",
          a: "Create a visible light mission and import the image set. Terra derives approximate exterior orientation seeds from [[exif]] metadata. Critical: with no image coordinate system defined, Terra defaults to EPSG:4326 horizontally and ellipsoidal height vertically — a silent systematic error source when your RTK correction comes from a different datum.",
        },
        pro: "Leave the in-app distortion correction in Pilot 2 disabled for survey work. Correction applied in post using the camera dewarp parameters is markedly more accurate than the built-in in-flight version. Also, interior orientation cannot be solved reliably from a non-mapping camera; do not commit to absolute accuracy on such data.",
        checklist: [
          "Open Terra, create a new mission from the top left and set the type to Visible Light Reconstruction",
          "Use Add Photo to import the entire flight folder",
          "Confirm the loaded photo count matches the count on your card",
          "Check the flight track on the map matches the shape you expect — scattered points signal an EXIF problem",
          "If the image coordinate system differs from your RTK source, define it now rather than later",
        ],
        cta: "Photos are loaded",
      },
    },
  },

  p_control: {
    type: "choice", phase: 1, visual: "control", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "FOTOGRAMETRİ · KARAR NOKTASI",
        title: "Konumlamayı neye dayandıracaksın?",
        body: {
          b: "Bu, rehberdeki en önemli karar. Modelin gerçek dünyada doğru yere oturması için yazılığa bir referans vermen gerekir. Üç yolun var ve aralarındaki fark metrelerle ölçülür.",
          i: "Mutlak konum doğruluğu bu seçime bağlıdır. [[rtk]] düzeltmesi kamera konumlarını doğrudan hassaslaştırır; [[gcp]] ise modeli araziden ölçülmüş noktalara zorlar. İkisinin birlikte kullanımı hem doğruluk hem denetlenebilirlik sağlar.",
          a: "Dış yöneltmenin datum bağı bu seçimle kurulur. RTK, kamera projeksiyon merkezlerine yüksek ağırlıklı gözlem verir; YKN nesne uzayında kısıt tanımlar. Kalan sistematik eğilim ancak dengelemeye katılmayan [[checkpoint]] üzerinden nicelenebilir.",
        },
      },
      en: {
        eyebrow: "PHOTOGRAMMETRY · DECISION POINT",
        title: "What will you anchor positioning on?",
        body: {
          b: "This is the most important decision in the guide. To make your model land in the right place in the real world, you have to give the software a reference. You have three options and the difference between them is measured in metres.",
          i: "Absolute positional accuracy hinges on this choice. [[rtk]] corrections sharpen camera positions directly; [[gcp]] forces the model onto points measured on the ground. Using both gives you accuracy and auditability at once.",
          a: "This establishes the datum tie of the exterior orientation. RTK supplies highly weighted observations on camera perspective centres; GCPs impose constraints in object space. Residual systematic tilt can only be quantified through [[checkpoint]] withheld from the adjustment.",
        },
      },
    },
    choices: [
      {
        id: "rtk", icon: "ph-broadcast", next: "p_at", accent: "teal", set: { control: "rtk" },
        i18n: {
          tr: {
            title: "Sadece RTK / PPK",
            desc: "Uçuş boyunca RTK FIX vardı ya da PPK ile ham veriyi çözdüm. Araziye hedef koymadım.",
            impact: [
              "DJI'nin bildirdiği doğruluk: yatayda 1 cm + 1–2 × GSD, düşeyde 2 cm + 1,5–3 × GSD (eğik görüntülerde)",
              "Arazide ek süre harcamazsın; en hızlı yol budur",
              "Bağımsız bir denetim noktan olmadığı için doğruluğu belgeleyemezsin",
            ],
            warn: "Bu rakamlar RTK'nın FIX durumunda kaldığı uçuşlar içindir. Uçuş kaydında FLOAT dönemleri varsa o bölgelerde doğruluk çok daha kötüdür.",
          },
          en: {
            title: "RTK / PPK only",
            desc: "I had RTK FIX throughout the flight, or solved the raw data with PPK. No targets on the ground.",
            impact: [
              "DJI-published accuracy: horizontal 1 cm + 1–2 × GSD, vertical 2 cm + 1.5–3 × GSD (oblique imagery)",
              "No extra field time; this is the fastest route",
              "With no independent check point you cannot document the accuracy you achieved",
            ],
            warn: "These figures assume RTK held FIX throughout. Any FLOAT periods in the flight log mean much worse accuracy over those areas.",
          },
        },
      },
      {
        id: "gcp", icon: "ph-crosshair", next: "p_gcp", accent: "amber", set: { control: "gcp" },
        i18n: {
          tr: {
            title: "Yer kontrol noktalarıyla",
            desc: "Araziye hedefler koydum ve koordinatlarını GNSS ile ölçtüm.",
            impact: [
              "Model mutlak konuma zorlanır; RTK'daki sistematik kayma ve düşey eğilim giderilir",
              "Bir kısmını denetim noktası olarak ayırıp gerçek doğruluğu sayısal olarak belgeleyebilirsin",
              "Çıktıyı doğrudan yerel datumda üretebilirsin — ölçtüğün koordinatlar hangi sistemdeyse o",
              "Bedeli arazide geçen ek süre ve işaretleme aşamasındaki emektir",
            ],
          },
          en: {
            title: "With ground control points",
            desc: "I placed targets on site and measured their coordinates with GNSS.",
            impact: [
              "The model is forced into absolute position, removing systematic shift and vertical tilt from RTK",
              "Withhold some as check points and you can document real accuracy numerically",
              "You can output directly in the local datum — whichever system you measured in",
              "The cost is extra field time and the effort of marking points",
            ],
          },
        },
      },
      {
        id: "none", icon: "ph-warning-circle", next: "p_at", accent: "violet", set: { control: "none" },
        i18n: {
          tr: {
            title: "Ne RTK ne kontrol noktası",
            desc: "Standart GPS'li bir drone kullandım, araziye hiçbir şey koymadım.",
            impact: [
              "Model kendi içinde tutarlı olur; göreli ölçümler (uzunluk, alan) makul çıkar",
              "Mutlak konum metre mertebesinde kayar — kadastro veya imar işine uygun değildir",
              "Yükseklik optimizasyonu ayarını açmazsan düşeyde çok daha büyük hatalar oluşur",
            ],
            warn: "Bu seçenekle üretilen çıktıyı ölçüm belgesi olarak teslim etme. Görselleştirme, keşif ve hacim ön tahmini için uygundur; resmi işler için değildir.",
          },
          en: {
            title: "Neither RTK nor control points",
            desc: "I used a drone with standard GPS and put nothing on the ground.",
            impact: [
              "The model is internally consistent; relative measurements (lengths, areas) come out reasonable",
              "Absolute position drifts by metres — unsuitable for cadastral or planning work",
              "Without elevation optimization enabled, vertical errors grow much larger still",
            ],
            warn: "Do not deliver output from this route as a survey document. It suits visualisation, reconnaissance and rough volume estimates, not official work.",
          },
        },
      },
    ],
  },

  p_gcp: {
    type: "content", phase: 1, visual: "control", next: "p_at", accent: "amber",
    showIf: (v) => v.control === "gcp",
    i18n: {
      tr: {
        eyebrow: "FOTOGRAMETRİ · KONTROL NOKTALARI",
        title: "Kontrol noktalarını içe aktar ve işaretle",
        body: {
          b: "Ölçtüğün noktaların listesini bir metin dosyasına yazıp Terra'ya vereceksin. Sonra her noktayı bir fotoğrafta fareyle göstereceksin — Terra geri kalan fotoğraflarda o noktayı kendisi bulur. Bu işaretleme işi biraz sabır ister ama modelin doğruluğu buna bağlı.",
          i: "[[gcp]] dosyası TXT veya CSV formatında olur ve şu sütunları taşır: nokta adı, X/E, Y/N, Z/U, isteğe bağlı olarak yatay ve düşey doğruluk. Sütunlar boşluk veya sekme ile ayrılır. Projeksiyonlu sistemde X doğu (genellikle 6–8 haneli, dilim numarası dâhil), Y kuzey (genellikle 7 haneli) değerdir; bu ikisini karıştırmak en sık yapılan hatadır.",
          a: "GCP dosyası: ad, X/E, Y/N, Z/U, opsiyonel σ_yatay, σ_düşey. Projeksiyonlu sistemde sağa değeri dilim ön ekli olabilir. Terra'nın otomatik işaretleme özelliği, tek bir görüntüde elle bağlanan noktayı diğer görüntülerde eşleştirir. İşaretlemeyi dengeleme öncesi yaparsan kontrol noktaları dengelemeye kısıt olarak girer; dengeleme sonrası eklersen ayrı bir optimizasyon adımı olarak çalışır.",
        },
        pro: "Dengeleme öncesi ve sonrası işaretlemenin sonucu farklıdır. Önce işaretlersen YKN'ler dengelemenin içinde kısıt olarak çözülür; sonra eklersen mevcut dengeleme üzerinde optimizasyon uygulanır. Denetim noktalarının artıkları, üçgenlenmiş yüzeyde denetim noktasına en yakın algoritmik noktadan okunur — bu nedenle çok engebeli yüzeylerde artık değeri gerçek hatayı bir miktar abartabilir.",
        checklist: [
          "Nokta listeni TXT veya CSV olarak hazırla; sütunları boşluk veya sekme ile ayır",
          "Advanced → GCP Management → Import Ground Control Point yolunu izle",
          "Açılan pencerede hangi sütunun ad, X, Y, Z olduğunu eşleştir",
          "Noktaların hangi koordinat sisteminde ölçüldüğünü seç — bu, çıktı sisteminden bağımsızdır",
          "Bir noktayı bir fotoğrafta olabildiğince yakınlaştırarak işaretle, sonra Auto Identify Mark ile diğerlerini otomatik buldur",
          "Noktaların en az üçte birini denetim noktası olarak ayır; dengelemeye katma",
          "Her nokta için yeniden izdüşüm hatasını kontrol et; belirgin biçimde sapan noktayı yeniden işaretle",
        ],
        cta: "Kontrol noktaları hazır",
      },
      en: {
        eyebrow: "PHOTOGRAMMETRY · CONTROL POINTS",
        title: "Import and mark your control points",
        body: {
          b: "You will write your measured points into a text file and hand it to Terra. Then you point at each one in a photo with the mouse — Terra finds that same point in the remaining photos by itself. The marking takes patience, but your model's accuracy depends on it.",
          i: "The [[gcp]] file is TXT or CSV and carries: point name, X/E, Y/N, Z/U, and optionally horizontal and vertical accuracy. Columns are separated by a space or tab. In a projected system X is easting (usually 6–8 digits, zone prefix included) and Y is northing (usually 7 digits); swapping these two is the most common mistake made here.",
          a: "GCP file: name, X/E, Y/N, Z/U, optional σ_horizontal, σ_vertical. Eastings may carry a zone prefix in projected systems. Terra's automatic marking propagates a point tied manually in one image across the remaining images. Marking before adjustment enters the control points as constraints within it; adding them afterwards runs a separate optimisation pass.",
        },
        pro: "Marking before versus after adjustment gives different results. Marked first, GCPs are solved as constraints inside the adjustment; added later, an optimisation is applied over the existing solution. Check point residuals are read from the algorithmic point nearest the check point on the triangulated surface — so on very broken terrain the residual can somewhat overstate true error.",
        checklist: [
          "Prepare your point list as TXT or CSV with space or tab separated columns",
          "Follow Advanced → GCP Management → Import Ground Control Point",
          "In the dialog, map which column is name, X, Y and Z",
          "Select the coordinate system the points were measured in — independent of your output system",
          "Mark one point in one photo zoomed in as far as possible, then use Auto Identify Mark to propagate it",
          "Withhold at least a third of your points as check points; keep them out of the adjustment",
          "Review the reprojection error per point and re-mark any point that clearly deviates",
        ],
        cta: "Control points are ready",
      },
    },
  },

  p_at: {
    type: "content", phase: 2, visual: "at", next: "p_output", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "FOTOGRAMETRİ · DENGELEME",
        title: "Aerotriangülasyonu çalıştır",
        body: {
          b: "Şimdi Terra bütün fotoğrafları birbiriyle karşılaştırıp ortak noktaları bulacak ve her fotoğrafın havada tam olarak nerede olduğunu hesaplayacak. Buna [[aerotriangulation]] deniyor ve modelin geri kalanı tamamen bunun üstüne kuruluyor. Bittiğinde bir kalite raporu çıkacak; ona mutlaka bak.",
          i: "[[aerotriangulation]] adımı, ortak noktalardan her görüntünün dış yöneltmesini ve kamera iç parametrelerini çözer. Bu adım hatalıysa sonraki hiçbir ayarın anlamı kalmaz. Bittiğinde kalite raporunu aç ve bağlanan görüntü sayısı ile [[reprojection_error]] değerine bak.",
          a: "Demet dengelemesi: bağ noktalarından dış yöneltme ve iç yöneltme parametreleri eşzamanlı çözülür. Kalite raporunda bağlanan görüntü oranı, ortalama [[reprojection_error]] ve bağ noktası dağılımı değerlendirilir. Çıktı formatı varsayılan olarak Terra'nın kendi formatıdır; ContextCapture Blocks Exchange XML olarak da alınabilir ve harici yazılımlara aktarılabilir.",
        },
        pro: "Dengeleme başarısız olduğunda veya çok sayıda görüntü düştüğünde üç ana neden vardır. Birincisi bellek yetersizliği: içe aktarılan görüntü sayısını 300'e böl, sonuç mevcut boş RAM'i (GB) aşıyorsa bellek darboğazındasın. İkincisi düşük örtü oranı; engebeli arazide örtü artırılmalıdır. Üçüncüsü iç parametre bozukluğu — kalite raporunda cx veya cy değeri görüntü yarı boyutunun %5'ini aşıyorsa kamera kalibrasyonu şüphelidir ve 2B çıktıda geniş siyah alanlar oluşur.",
        checklist: [
          "Aerotriangülasyon düğmesine bas ve işlemin bitmesini bekle",
          "Bittiğinde kalite raporunu aç",
          "Bağlanan görüntü sayısını içe aktardığın sayıyla karşılaştır — kayıp varsa örtü veya bellek sorunu vardır",
          "Ortalama yeniden izdüşüm hatasına bak; piksel mertebesinin çok üstündeyse veriyi gözden geçir",
          "Kontrol noktası kullandıysan her noktanın artık değerini incele",
          "Haritada kamera konumlarının uçuş planına oturduğunu gözle doğrula",
        ],
        cta: "Dengeleme tamam",
      },
      en: {
        eyebrow: "PHOTOGRAMMETRY · ADJUSTMENT",
        title: "Run aerotriangulation",
        body: {
          b: "Terra will now compare every photo against the others, find shared points, and work out exactly where each photo was taken in the air. This is called [[aerotriangulation]] and everything else is built on top of it. When it finishes you get a quality report — read it.",
          i: "[[aerotriangulation]] solves the exterior orientation of every image and the camera interior parameters from tie points. If this step is wrong, no later setting can rescue the result. When it completes, open the quality report and look at the number of connected images and the [[reprojection_error]].",
          a: "Bundle adjustment: exterior and interior orientation parameters are solved simultaneously from tie points. Assess connected image ratio, mean [[reprojection_error]] and tie point distribution in the quality report. Output defaults to Terra's native format; ContextCapture Blocks Exchange XML is also available for handing off to external software.",
        },
        pro: "When adjustment fails or drops many images there are three usual causes. First, insufficient memory: divide the imported image count by 300 and if the result exceeds your free RAM in GB, you are memory bound. Second, low overlap; broken terrain needs more of it. Third, corrupted interior parameters — if cx or cy in the quality report exceeds 5% of half the image dimension, camera calibration is suspect and large black areas will appear in 2D output.",
        checklist: [
          "Press the aerotriangulation button and wait for it to finish",
          "Open the quality report when it completes",
          "Compare connected image count against what you imported — losses mean an overlap or memory problem",
          "Check mean reprojection error; well above pixel level means the data needs review",
          "If you used control points, inspect the residual at each one",
          "Visually confirm the camera positions on the map follow your flight plan",
        ],
        cta: "Adjustment complete",
      },
    },
  },

  p_output: {
    type: "choice", phase: 2, visual: "photo_output", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "FOTOGRAMETRİ · KARAR NOKTASI",
        title: "Hangi ürünü üreteceksin?",
        body: {
          b: "İki tür çıktı var: düz bir harita ya da üç boyutlu model. Ne işe yarayacağına göre seç. İkisi aynı anda da üretilebilir ama işlem süresi katlanır.",
          i: "2B hattı [[orthomosaic]] ve [[dsm]] üretir; 2,5 boyutlu bir gösterimdir ve haritacılık teslimatlarının çoğu bunu ister. 3B hattı [[mesh]] ve [[point_cloud]] üretir; cephe, hacim ve görselleştirme işlerinde gerekir.",
          a: "2B hattı ortorektifiye raster (DOM) ve yükseklik rasteri (DSM) üretir. 3B hattı yoğun eşleme sonrası üçgenlenmiş yüzey, doku ve [[lod]] hiyerarşisi üretir. İkisi aynı görevde eşzamanlı seçilebilir; işlem maliyeti toplanır.",
        },
      },
      en: {
        eyebrow: "PHOTOGRAMMETRY · DECISION POINT",
        title: "Which product will you build?",
        body: {
          b: "Two kinds of output: a flat map, or a three-dimensional model. Choose based on what it will be used for. You can produce both at once, but processing time multiplies.",
          i: "The 2D path yields an [[orthomosaic]] and [[dsm]] — a 2.5D representation, and what most surveying deliverables ask for. The 3D path yields a [[mesh]] and [[point_cloud]], needed for facades, volumes and visualisation.",
          a: "The 2D path produces an orthorectified raster (DOM) and elevation raster (DSM). The 3D path produces a triangulated surface after dense matching, plus texture and an [[lod]] hierarchy. Both can be selected in one mission; processing cost adds up.",
        },
      },
    },
    choices: [
      {
        id: "2d", icon: "ph-square", next: "p2d_scene", accent: "amber", set: { product: "2d" },
        i18n: {
          tr: {
            title: "2B harita (DOM + DSM)",
            desc: "Ortomozaik ve yüzey modeli. Kadastro, imar, alan hesabı, tarım analizi.",
            impact: [
              "GeoTIFF formatında ortomozaik (result.tif) ve yüzey modeli (dsm.tif) üretilir",
              "İşlem süresi 3B'ye göre belirgin biçimde kısadır",
              "Cephe göremezsin — dik bakış olduğu için bina yan yüzeyleri temsil edilmez",
            ],
          },
          en: {
            title: "2D map (DOM + DSM)",
            desc: "Orthomosaic and surface model. Cadastre, planning, area computation, agricultural analysis.",
            impact: [
              "Produces an orthomosaic (result.tif) and surface model (dsm.tif) as GeoTIFF",
              "Processing time is markedly shorter than 3D",
              "No facades — the nadir view means building side walls are not represented",
            ],
          },
        },
      },
      {
        id: "3d", icon: "ph-cube", next: "p3d_quality", accent: "teal", set: { product: "3d" },
        i18n: {
          tr: {
            title: "3B model (mesh + nokta bulutu)",
            desc: "Dokulu gerçek görünüm modeli. Hacim, cephe, sunum, dijital ikiz.",
            impact: [
              "Dokulu mesh, LOD kademeleri ve nokta bulutu birlikte üretilir",
              "Hacim ve cephe ölçümleri yapılabilir hale gelir",
              "İşlem süresi ve disk kullanımı 2B'ye göre kat kat artar",
            ],
            warn: "Yalnızca dik açılı fotoğrafla uçtuysan 3B model cephelerde bozuk çıkar. Eğik (oblik) görüntü olmadan dikey yüzeyler doğru modellenemez.",
          },
          en: {
            title: "3D model (mesh + point cloud)",
            desc: "Textured real-scene model. Volumes, facades, presentation, digital twin.",
            impact: [
              "Produces a textured mesh, LOD tiers and a point cloud together",
              "Volume and facade measurement become possible",
              "Processing time and disk usage multiply relative to 2D",
            ],
            warn: "If you flew nadir-only imagery the 3D model will break down on facades. Vertical surfaces cannot be modelled correctly without oblique imagery.",
          },
        },
      },
    ],
  },
};

/* --- Fotogrametri: 2B alt dalı ------------------------------------- */

Object.assign(STEPS, {

  p2d_scene: {
    type: "choice", phase: 2, visual: "scene", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "2B HARİTA · SAHNE SEÇİMİ",
        title: "Arazi tipini seç",
        body: {
          b: "Terra'nın algoritması arazi tipine göre değişiyor. Uçtuğun yer düz bir tarla mı, binalarla dolu bir mahalle mi, yoksa ağaçlı bir bahçe mi? Yanlış seçim modelin bozuk çıkmasına yol açar.",
          i: "Sahne seçimi yeniden yapılandırma algoritmasını arazi karakterine göre ayarlar. Belirleyici etken yükseklik farkıdır: düz araziyle çok katlı yapı yığını aynı yaklaşımla işlenemez.",
          a: "Sahne parametresi yoğun eşleme ve yüzey üretim stratejisini belirler. Ayrım ölçütü nesne yükseklik dağılımıdır; şehir sahnesi ayrıca farklı bir DSM örnekleme davranışı tetikler.",
        },
      },
      en: {
        eyebrow: "2D MAP · SCENE SELECTION",
        title: "Choose your terrain type",
        body: {
          b: "Terra's algorithm changes with terrain type. Did you fly a flat field, a neighbourhood full of buildings, or an orchard? The wrong choice leaves your model broken.",
          i: "Scene selection tunes the reconstruction algorithm to terrain character. The deciding factor is height variation: flat ground and a cluster of multi-storey buildings cannot be processed the same way.",
          a: "The scene parameter drives dense matching and surface generation strategy. The discriminator is object height distribution; the urban scene additionally triggers different DSM sampling behaviour.",
        },
      },
    },
    choices: [
      {
        id: "field", icon: "ph-plant", next: "p2d_res", accent: "teal", set: { scene: "field" },
        i18n: {
          tr: {
            title: "Field (Tarla)",
            desc: "Açık arazi, düşük yükseklik farkı: tarla, mera, boş parsel, maden sahası.",
            impact: [
              "Düz yüzeylerde en temiz ortomozaiği bu seçenek verir",
              "DSM tam çözünürlükte üretilir, örnekleme düşürülmez",
              "Yüksek bina veya sık ağaç varsa kenarlar erir ve model bozulur",
            ],
          },
          en: {
            title: "Field",
            desc: "Open ground with little height variation: farmland, pasture, empty parcels, quarry sites.",
            impact: [
              "Gives the cleanest orthomosaic over flat surfaces",
              "The DSM is produced at full resolution with no downsampling",
              "Tall buildings or dense trees make edges melt and the model degrade",
            ],
          },
        },
      },
      {
        id: "urban", icon: "ph-buildings", next: "p2d_res", accent: "amber", set: { scene: "urban" },
        i18n: {
          tr: {
            title: "Urban (Şehir)",
            desc: "Farklı yükseklikte binaların bulunduğu yerleşim alanları.",
            impact: [
              "Bina kenarları ve çatı hatları belirgin biçimde daha düzgün çıkar",
              "Ortomozaikte yüksek yapılardan kaynaklanan çarpılma daha iyi bastırılır",
              "Bu seçenek örnekleme düşürülmüş bir DSM üretir: piksel boyutu 5 m",
            ],
            warn: "Şehir sahnesindeki DSM 5 m/piksel çözünürlüğe indirgenir. Bu DSM arazi takipli uçuş planlamak için tasarlanmıştır; hassas yükseklik analizi veya hacim hesabı için kullanma. Detaylı yükseklik verisi gerekiyorsa 3B hattına geç veya Field sahnesini değerlendir.",
          },
          en: {
            title: "Urban",
            desc: "Built-up areas with buildings of varying height.",
            impact: [
              "Building edges and roof lines come out markedly cleaner",
              "Distortion from tall structures in the orthomosaic is better suppressed",
              "This option produces a downsampled DSM at 5 m per pixel",
            ],
            warn: "The urban scene DSM is reduced to 5 m/pixel. It is designed for planning terrain-following flights, not for precise elevation analysis or volume computation. If you need detailed height data, move to the 3D path or reconsider the Field scene.",
          },
        },
      },
      {
        id: "fruit", icon: "ph-tree", next: "p2d_res", accent: "violet", set: { scene: "fruit" },
        i18n: {
          tr: {
            title: "Fruit Tree (Meyve Ağacı)",
            desc: "Büyük yükseklik farkı olan bitkisel örtü: meyve bahçesi, fidanlık, bağ.",
            impact: [
              "Ağaç taçları ayrı ayrı ayırt edilebilir hale gelir",
              "Tarım analizlerinde taç sayımı ve taç alanı çıkarımı kolaylaşır",
              "Zemin görünmediği ölçüde arazi yüksekliği güvenilmez kalır",
            ],
          },
          en: {
            title: "Fruit Tree",
            desc: "Vegetation with large height variation: orchards, nurseries, vineyards.",
            impact: [
              "Individual tree crowns become distinguishable",
              "Crown counting and canopy area extraction get easier for agricultural analysis",
              "Wherever the ground is hidden, terrain height stays unreliable",
            ],
          },
        },
      },
    ],
  },

  p2d_res: {
    type: "choice", phase: 2, visual: "resolution", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "2B HARİTA · ÇÖZÜNÜRLÜK",
        title: "Yeniden yapılandırma çözünürlüğünü seç",
        body: {
          b: "Bu ayar, üretilecek haritanın ne kadar detaylı olacağını belirler. Yüksek seçersen fotoğraflarının tam netliğini kullanır ama işlem çok uzun sürer. Düşük seçersen hızlı biter ama harita bulanıklaşır.",
          i: "Çözünürlük ayarı, orijinal görüntü boyutuna göre bir ölçekleme uygular. High orijinal boyutu, Medium her iki kenarda yarısını, Low dörtte birini kullanır. Örnek: 6000×6000 piksellik bir görüntü Medium'da 3000×3000, Low'da 1500×1500 olarak işlenir.",
          a: "Çözünürlük çarpanı yoğun eşleme girdisinin örnekleme oranını belirler. High = 1/1, Medium = 1/2 (her iki eksende), Low = 1/4. Etkin [[gsd]] bu çarpanla doğrusal olarak büyür; doğruluk bütçesini buna göre yeniden hesapla.",
        },
        pro: "Çözünürlüğü düşürmek etkin GSD'yi büyütür ve dolayısıyla doğruluk bütçesindeki GSD çarpanlı terimleri doğrudan şişirir. RTK ile 2 cm GSD hedefleyip Medium seçmek, pratikte 4 cm GSD ile çalışmakla eşdeğerdir; beklenen yatay doğruluk 1 cm + 1–2 × 2 cm yerine 1 cm + 1–2 × 4 cm olur.",
      },
      en: {
        eyebrow: "2D MAP · RESOLUTION",
        title: "Choose the reconstruction resolution",
        body: {
          b: "This sets how detailed the map will be. High uses the full sharpness of your photos but takes a very long time. Low finishes quickly but the map goes blurry.",
          i: "The resolution setting scales relative to the original image size. High uses the original, Medium halves both dimensions, Low quarters them. Example: a 6000×6000 pixel image is processed at 3000×3000 on Medium and 1500×1500 on Low.",
          a: "The resolution factor sets the sampling rate of the dense matching input. High = 1/1, Medium = 1/2 (both axes), Low = 1/4. Effective [[gsd]] scales linearly with this factor; recompute your accuracy budget accordingly.",
        },
        pro: "Lowering resolution enlarges effective GSD and therefore inflates every GSD-multiplied term in the accuracy budget. Targeting 2 cm GSD with RTK and then selecting Medium is equivalent to working at 4 cm GSD; expected horizontal accuracy becomes 1 cm + 1–2 × 4 cm rather than 1 cm + 1–2 × 2 cm.",
      },
    },
    choices: [
      {
        id: "high", icon: "ph-target", next: "p2d_opts", accent: "amber", set: { res: "high" },
        i18n: {
          tr: { title: "High — orijinal çözünürlük", desc: "Görüntüler tam boyutuyla işlenir.",
            impact: ["Doğruluk bütçesinde GSD terimi olduğu gibi kalır", "Kadastro, imar ve mühendislik teslimatları için doğru tercih", "İşlem süresi ve disk kullanımı en yüksek seviyede"] },
          en: { title: "High — original resolution", desc: "Images processed at full size.",
            impact: ["The GSD term in your accuracy budget stays as-is", "The right pick for cadastral, planning and engineering deliverables", "Processing time and disk usage at their maximum"] } },
      },
      {
        id: "medium", icon: "ph-gauge", next: "p2d_opts", accent: "teal", set: { res: "medium" },
        i18n: {
          tr: { title: "Medium — yarı çözünürlük", desc: "Her iki kenar yarıya iner (6000×6000 → 3000×3000).",
            impact: ["Etkin GSD iki katına çıkar, doğruluk buna göre düşer", "İşlem süresi belirgin biçimde kısalır", "Genel amaçlı haritalama ve ön inceleme için yeterli"] },
          en: { title: "Medium — half resolution", desc: "Both dimensions halved (6000×6000 → 3000×3000).",
            impact: ["Effective GSD doubles and accuracy drops accordingly", "Processing time shortens markedly", "Adequate for general mapping and preliminary review"] } },
      },
      {
        id: "low", icon: "ph-lightning", next: "p2d_opts", accent: "violet", set: { res: "low" },
        i18n: {
          tr: { title: "Low — çeyrek çözünürlük", desc: "Her iki kenar dörtte bire iner (6000×6000 → 1500×1500).",
            impact: ["Etkin GSD dört katına çıkar", "En hızlı sonuç; büyük veri setinde ön kontrol için idealdir", "Ölçüm amaçlı teslimat için uygun değildir"] },
          en: { title: "Low — quarter resolution", desc: "Both dimensions quartered (6000×6000 → 1500×1500).",
            impact: ["Effective GSD quadruples", "The fastest result; ideal for a sanity check on a large dataset", "Not suitable for measurement deliverables"] } },
      },
    ],
  },

  p2d_opts: {
    type: "content", phase: 2, visual: "resolution", next: "crs_output", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "2B HARİTA · EK AYARLAR",
        title: "İşlemi başlatmadan önce şu dört anahtarı gözden geçir",
        body: {
          b: "Terra'da işlemi başlatmadan önce açılıp kapatılan birkaç yardımcı ayar var. Bunları sonradan değiştirmek genelde her şeyi baştan yaptırır, o yüzden şimdi karar ver.",
          i: "Yeniden yapılandırmayı başlatmadan önce yardımcı ayarları kesinleştir. Bu ayarların işlem sırasında değiştirilmesi, tamamlanmış hesapların geçersiz kılınmasına ve görevin baştan başlamasına yol açar.",
          a: "Yardımcı parametreler işlem öncesinde sabitlenmelidir. Değişiklik davranışı parametreye göre farklıdır ve tamamlanmış dengeleme sonucunun korunup korunmayacağını belirler.",
        },
        pro: "Değişiklik davranışını bilerek planla: harita ızgarası (map grid) ayarını sonradan değiştirirsen yeniden yapılandırma sonucu geçersiz olur ama dengeleme sonucu korunur. Buna karşılık ışık dengeleme (light uniformity) veya sis giderme (haze reduction) ayarını değiştirirsen hem yeniden yapılandırma hem de dengeleme sonucu geçersiz olur ve süreç sıfırdan başlar. Ayrıca v3.5.0 öncesi sürümlerde Field ve Fruit Tree sahnelerinde 2B çıktı için koordinat sistemi seçilemiyordu; eski bir sürüm kullanıyorsan bunu doğrula.",
        checklist: [
          "Yükseklik optimizasyonunu (Elevation Optimization) aç — kontrol noktası kullanmadıysan bu ayar zorunludur, kapalı bırakmak düşeyde ciddi hata bırakır",
          "Işık dengelemeyi (Light Uniformity) uçuş boyunca bulut geçişi veya güneş açısı değişimi olduysa aç",
          "Sis gidermeyi (Haze Reduction) yalnızca puslu havada uçtuysan aç; berrak veride kontrastı bozar",
          "Harita ızgarasını (Map Grid) büyük alanlarda aç; DOM ve DSM çıktısı yönetilebilir paftalara bölünür",
          "Geniş su yüzeyi varsa Advanced altındaki su yüzeyi düzeltmesini (Refine Water Surface) aç",
          "Bu ayarların hepsini işlemi başlatmadan önce kesinleştir",
        ],
        cta: "Ayarlar kesinleşti",
      },
      en: {
        eyebrow: "2D MAP · EXTRA SETTINGS",
        title: "Review these four switches before you start",
        body: {
          b: "There are a few helper settings you turn on or off before starting. Changing them afterwards usually makes Terra redo everything, so decide now.",
          i: "Finalise the helper settings before starting reconstruction. Changing them mid-process invalidates completed computation and restarts the mission.",
          a: "Auxiliary parameters must be fixed before processing. Change behaviour differs per parameter and determines whether a completed adjustment survives.",
        },
        pro: "Plan around the change behaviour: modifying the map grid setting invalidates the reconstruction result but preserves the aerotriangulation. Modifying light uniformity or haze reduction invalidates both, and the process restarts from scratch. Note also that before v3.5.0 the output coordinate system could not be selected for 2D output in the Field and Fruit Tree scenes; verify this if you are on an older build.",
        checklist: [
          "Enable Elevation Optimization — mandatory if you used no control points; leaving it off leaves serious vertical error",
          "Enable Light Uniformity if cloud cover or sun angle shifted during the flight",
          "Enable Haze Reduction only if you flew in haze; on clear data it flattens contrast",
          "Enable Map Grid on large sites; DOM and DSM output is split into manageable tiles",
          "Enable Refine Water Surface under Advanced if the site contains large water bodies",
          "Lock all of these in before pressing start",
        ],
        cta: "Settings are locked in",
      },
    },
  },

  /* --- Fotogrametri: 3B alt dalı ----------------------------------- */

  p3d_quality: {
    type: "choice", phase: 2, visual: "photo_3d", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "3B MODEL · KALİTE",
        title: "Model çözünürlüğünü seç",
        body: {
          b: "Modelin ne kadar ince detaylı olacağını burada belirliyorsun. Yüksek kalite gerçekten güzel görünür ama işlem gece boyu sürebilir ve dosya devasa olur.",
          i: "Kalite ayarı yoğun eşleme girdisinin çözünürlüğünü belirler; 2B tarafındaki mantığın aynısı geçerlidir. High orijinal, Medium yarı, Low çeyrek boyutta çalışır. [[mesh]] yoğunluğu ve doku çözünürlüğü buna bağlı ölçeklenir.",
          a: "Kalite çarpanı yoğun eşleme örnekleme oranını ve dolayısıyla üçgen yoğunluğunu belirler. Yüzey detayı ile bellek tüketimi arasındaki takas doğrusal değildir; High seçimde üçgen sayısı ve doku atlası boyutu hızla büyür.",
        },
      },
      en: {
        eyebrow: "3D MODEL · QUALITY",
        title: "Choose the model resolution",
        body: {
          b: "This is where you decide how finely detailed the model will be. High quality genuinely looks great, but processing can run overnight and the file becomes enormous.",
          i: "The quality setting drives the resolution of the dense matching input, following the same logic as the 2D side. High works at original size, Medium half, Low quarter. [[mesh]] density and texture resolution scale with it.",
          a: "The quality factor sets dense matching sampling rate and therefore triangle density. The trade between surface detail and memory consumption is non-linear; triangle count and texture atlas size grow fast on High.",
        },
      },
    },
    choices: [
      { id: "high", icon: "ph-cube-focus", next: "p3d_format", accent: "amber", set: { quality3d: "high" },
        i18n: { tr: { title: "High", desc: "Orijinal çözünürlük. İnce yapısal detay korunur.",
                      impact: ["Cephe detayı, korkuluk, boru gibi ince yapılar temsil edilir", "Mühendislik incelemesi ve dijital ikiz için uygun", "İşlem süresi ve dosya boyutu en yüksek seviyede"] },
                en: { title: "High", desc: "Original resolution. Fine structural detail preserved.",
                      impact: ["Facade detail and thin structures such as railings and pipes are represented", "Suited to engineering review and digital twin work", "Processing time and file size at their maximum"] } } },
      { id: "medium", icon: "ph-cube", next: "p3d_format", accent: "teal", set: { quality3d: "medium" },
        i18n: { tr: { title: "Medium", desc: "Yarı çözünürlük. Dengeli tercih.",
                      impact: ["Genel görselleştirme ve hacim hesabı için yeterli detay", "Dosya boyutu paylaşılabilir seviyede kalır", "İnce yapısal detaylar yuvarlanır"] },
                en: { title: "Medium", desc: "Half resolution. The balanced pick.",
                      impact: ["Enough detail for general visualisation and volume computation", "File size stays shareable", "Fine structural detail gets rounded off"] } } },
      { id: "low", icon: "ph-cube-transparent", next: "p3d_format", accent: "violet", set: { quality3d: "low" },
        i18n: { tr: { title: "Low", desc: "Çeyrek çözünürlük. Hızlı önizleme.",
                      impact: ["Veriyi ve kapsamı doğrulamak için hızlı bir kontrol imkânı", "Sunum veya teslimat için yeterli değil", "Büyük alanlarda önce bunu çalıştırmak zaman kazandırır"] },
                en: { title: "Low", desc: "Quarter resolution. Fast preview.",
                      impact: ["A quick way to verify data and coverage", "Not adequate for presentation or delivery", "Running this first on large sites saves time"] } } },
    ],
  },

  p3d_format: {
    type: "choice", phase: 2, visual: "export", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "3B MODEL · ÇIKTI FORMATI",
        title: "Modeli nerede kullanacaksın?",
        body: {
          b: "Model dosyasının biçimi, onu hangi programda açacağına göre değişir. Yanlış biçim seçersen dosya açılmaz ya da bomboş görünür. Nerede kullanacağını seç, uygun biçimleri işaretleyeyim.",
          i: "Terra aynı görevde birden çok formatı eşzamanlı üretebilir. Hedef yazılım formatı belirler: [[lod]] hiyerarşili formatlar görüntüleyici içindir, tekil mesh formatları CAD ve modelleme yazılımları içindir.",
          a: "Çıktı formatı hedef tüketiciye göre seçilir. LOD hiyerarşisi taşıyan formatlar akış tabanlı görüntüleme içindir; tekil mesh formatları düzenleme hattına, nokta bulutu formatları analiz hattına gider. Formatlar yanına koordinat sistemi tanım dosyası olarak metadata.xml yazılır.",
        },
      },
      en: {
        eyebrow: "3D MODEL · OUTPUT FORMAT",
        title: "Where will the model be used?",
        body: {
          b: "The file format depends on which program you will open it in. Pick the wrong one and the file will not open, or will look empty. Tell me where it is going and I will mark the right formats.",
          i: "Terra can produce several formats simultaneously in one mission. The target software dictates the choice: [[lod]] hierarchical formats are for viewers, single mesh formats for CAD and modelling software.",
          a: "Output format follows the downstream consumer. LOD-bearing formats serve streaming viewers; single mesh formats feed editing pipelines; point cloud formats feed analysis. A metadata.xml coordinate system definition is written alongside the outputs.",
        },
      },
    },
    choices: [
      { id: "gis", icon: "ph-stack", next: "crs_output", accent: "amber", set: { format3d: "gis" },
        i18n: { tr: { title: "CAD / CBS yazılımına", desc: "NetCAD, AutoCAD, QGIS, ArcGIS, Global Mapper.",
                      impact: ["OBJ veya PLY mesh ile LAS/LAZ nokta bulutunu birlikte üret", "LAS koordinat sistemi bilgisini taşır, projeye doğrudan oturur", "Çok büyük modellerde tek parça OBJ açılmayabilir; paftalı üretimi tercih et"] },
                en: { title: "To CAD / GIS software", desc: "AutoCAD, QGIS, ArcGIS, Global Mapper, Civil 3D.",
                      impact: ["Produce an OBJ or PLY mesh together with a LAS/LAZ point cloud", "LAS carries coordinate system information and drops straight into the project", "A single monolithic OBJ may not open on very large models; prefer tiled output"] } } },
      { id: "viewer", icon: "ph-globe-simple", next: "crs_output", accent: "teal", set: { format3d: "viewer" },
        i18n: { tr: { title: "Görüntüleyici / web'e", desc: "Cesium, DJI Terra görüntüleyici, web tabanlı sunum.",
                      impact: ["OSGB veya B3DM formatı LOD kademeleriyle üretilir", "Büyük modeller tarayıcıda takılmadan açılır", "Bu formatlar düzenleme için uygun değildir, sadece görüntülemeye yöneliktir"] },
                en: { title: "To a viewer / the web", desc: "Cesium, the DJI Terra viewer, web-based presentation.",
                      impact: ["OSGB or B3DM produced with LOD tiers", "Large models open in a browser without stalling", "These formats are for viewing, not editing"] } } },
      { id: "both", icon: "ph-selection-all", next: "crs_output", accent: "violet", set: { format3d: "both" },
        i18n: { tr: { title: "Hepsini üret", desc: "Hangisinin gerekeceğinden emin değilim.",
                      impact: ["Tüm formatlar aynı görevde eşzamanlı üretilir", "Sonradan yeniden işlemekten kurtulursun", "Disk kullanımı belirgin biçimde artar; büyük projelerde yer planla"] },
                en: { title: "Produce everything", desc: "I am not sure yet which one I will need.",
                      impact: ["All formats produced simultaneously in one mission", "Saves you from reprocessing later", "Disk usage rises markedly; plan space on large projects"] } } },
    ],
  },
});

/* --- LiDAR dalı ----------------------------------------------------- */

Object.assign(STEPS, {

  l_import: {
    type: "content", phase: 1, visual: "lidar_import", next: "l_base", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · İÇE AKTARMA",
        title: "Ham tarama klasörünü yükle",
        body: {
          b: "LiDAR'da tek tek fotoğraf değil, bütün bir klasör yüklenir. Kartındaki klasör DJI ile başlayıp tarih ve saat içeren uzun bir isim taşır. O klasörü olduğu gibi göstereceksin — içindeki dosyaları ayıklamaya çalışma, hepsi gerekli. Yanında JPG fotoğraflar da varsa onları da yükle; nokta bulutuna gerçek renk vermek için kullanılırlar.",
          i: "Yeni görev → LiDAR Nokta Bulutu İşleme. Ham veri klasörü DJI_yıl ay gün saat dakika_sıra_ad biçiminde adlandırılmıştır; klasörün tamamını içe aktar. Nokta bulutunu gerçek renkle üretmek istiyorsan aynı uçuşta çekilen JPEG görüntüleri de ekle. [[imu]] kalibrasyon verisi bu klasörün içindedir ve yörünge çözümü için zorunludur.",
          a: "LiDAR nokta bulutu görevi oluştur ve ham veri dizinini bütün olarak içe aktar. Dizin yörünge gözlemleri, IMU kayıtları ve lazer dönüş verisini birlikte taşır; ayrıştırılmış içe aktarma yörünge çözümünü bozar. Renklendirme için eşzamanlı JPEG kümesi eklenir. Yörünge çözümü sbet.out olarak proje sonuç klasörüne yazılır.",
        },
        pro: "Bellek planlaması burada fotogrametriden daha sıkıdır: yaklaşık her 4 GB boş bellek 1 GB ham LiDAR dosyasını taşır. 64 GB'lık bir makinede pratik tavan 16 GB ham veridir. Bu sınırı aşan setlerde ya görevi coğrafi olarak parçalara böl ya da nokta bulutu doğruluk optimizasyonunu kapat. Uçuş sırasında IMU kalibrasyon manevraları yapılmadıysa yörünge çözümü zayıf kalır ve bunu sonradan telafi etmenin yolu yoktur.",
        checklist: [
          "Yeni görev oluştur ve türü LiDAR Nokta Bulutu İşleme seç",
          "Klasör simgesine basıp ham veri klasörünü bütün olarak seç",
          "Gerçek renkli nokta bulutu istiyorsan uçuştaki JPEG klasörünü de ekle",
          "Ham veri boyutunu kontrol et ve boş belleğinin dörtte birini aşıyorsa görevi böl",
          "Zenmuse L2 kullanıyorsan ve daha önce katmanlı nokta bulutu sorunu yaşadıysan önce kalibrasyon görevi çalıştır",
        ],
        cta: "Ham veri yüklendi",
      },
      en: {
        eyebrow: "LIDAR · IMPORT",
        title: "Load the raw scan folder",
        body: {
          b: "With LiDAR you load a whole folder, not individual photos. The folder on your card starts with DJI and carries a long name with the date and time. Point at that folder as-is — do not try to pick files out of it, they are all needed. If JPGs sit alongside, load those too; they give the point cloud real colour.",
          i: "New mission → LiDAR Point Cloud Processing. The raw folder is named DJI_year month day hour minute_sequence_name; import the whole thing. To produce a true-colour point cloud, add the JPEG images captured on the same flight. The [[imu]] calibration data lives inside this folder and is mandatory for the trajectory solution.",
          a: "Create a LiDAR point cloud mission and import the raw directory whole. It carries trajectory observations, IMU logs and laser return data together; a fragmented import breaks the trajectory solution. Add the synchronous JPEG set for colourisation. The trajectory solution is written as sbet.out into the project result folder.",
        },
        pro: "Memory planning is tighter here than in photogrammetry: roughly every 4 GB of free memory carries 1 GB of raw LiDAR. A 64 GB machine tops out around 16 GB of raw data. Beyond that, split the mission geographically or disable point cloud accuracy optimization. If IMU calibration manoeuvres were skipped in flight the trajectory solution stays weak, and there is no way to recover that afterwards.",
        checklist: [
          "Create a new mission and set the type to LiDAR Point Cloud Processing",
          "Click the folder icon and select the raw data folder as a whole",
          "Add the flight's JPEG folder too if you want a true-colour point cloud",
          "Check the raw data size and split the mission if it exceeds a quarter of your free memory",
          "On a Zenmuse L2 with a history of layered point clouds, run a calibration mission first",
        ],
        cta: "Raw data loaded",
      },
    },
  },

  l_base: {
    type: "choice", phase: 1, visual: "control", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · KARAR NOKTASI",
        title: "Konum düzeltmesi nereden geldi?",
        body: {
          b: "LiDAR'da nokta bulutunun doğru yere oturması, drone'un uçarken kendi yerini ne kadar iyi bildiğine bağlı. Bu bilgi ya canlı olarak bir düzeltme servisinden gelir ya da uçuştan sonra hesaplanır. Hangisini kullandıysan onu seç.",
          i: "Nokta bulutunun mutlak konumu yörünge çözümüne dayanır; yörünge de düzeltme kaynağına. [[rtk]] ağ düzeltmesi, kendi baz istasyonun veya [[ppk]] son işlem — üçünde de Terra'ya doğru referansı vermen gerekir.",
          a: "Mutlak konum doğruluğu yörünge çözümüne, o da düzeltme kaynağının datum tanımına bağlıdır. Baz istasyonu merkez nokta ayarı hatalı girilirse tüm nokta bulutu o hata kadar sistematik olarak ötelenir ve bu kayma nokta bulutu içinde hiçbir belirtiye yol açmaz.",
        },
      },
      en: {
        eyebrow: "LIDAR · DECISION POINT",
        title: "Where did the position correction come from?",
        body: {
          b: "In LiDAR, whether the point cloud lands in the right place depends on how well the drone knew its own position while flying. That comes either live from a correction service or is computed after the flight. Pick whichever you used.",
          i: "Absolute position of the point cloud rests on the trajectory solution, which rests on the correction source. Network [[rtk]], your own base station, or [[ppk]] post-processing — all three need the right reference given to Terra.",
          a: "Absolute accuracy depends on the trajectory solution, which depends on the datum definition of the correction source. An incorrectly entered base station centre point offsets the entire cloud systematically, and that shift produces no visible symptom within the cloud itself.",
        },
      },
    },
    choices: [
      { id: "network", icon: "ph-broadcast", next: "l_check", accent: "teal", set: { lcontrol: "network" },
        i18n: { tr: { title: "Ağ RTK (CORS / NTRIP)", desc: "TUSAGA-Aktif gibi bir ağ servisinden canlı düzeltme aldım.",
                      impact: ["Yörünge doğrudan ağın datumunda çözülür; ek baz ayarı gerekmez", "Çıktı koordinat sistemini ağın datumuyla uyumlu seçmelisin", "Uçuş sırasında bağlantı koptuysa o bölümde doğruluk düşer"],
                      warn: "Ağın hangi datumda yayın yaptığını bil. Türkiye'de TUSAGA-Aktif TUREF yayınlar; çıktıyı WGS84 UTM'de almak yaklaşık 1 m sistematik kayma bırakır." },
                en: { title: "Network RTK (CORS / NTRIP)", desc: "I took live corrections from a network service.",
                      impact: ["The trajectory solves directly in the network's datum; no base setup needed", "Your output coordinate system must match the network's datum", "Any dropout in flight degrades accuracy over that stretch"],
                      warn: "Know which datum your network broadcasts. Exporting to a mismatched datum leaves a systematic shift of a metre or more." } } },
      { id: "base", icon: "ph-cell-tower", next: "l_check", accent: "amber", set: { lcontrol: "base" },
        i18n: { tr: { title: "Kendi baz istasyonum", desc: "D-RTK 2 veya benzeri bir baz kurdum, koordinatı biliyorum.",
                      impact: ["Baz istasyonu merkez nokta ayarını Terra'da elle girmen gerekir", "Anten yüksekliğini de ekle: jalon boyu artı anten ofseti", "Bu değeri yanlış girersen tüm nokta bulutu aynı miktarda kayar"],
                      warn: "Anten yüksekliğini eklemeyi unutmak, tüm nokta bulutunu jalon boyu kadar düşeyde kaydıran en yaygın hatadır." },
                en: { title: "My own base station", desc: "I set up a D-RTK 2 or similar and know its coordinate.",
                      impact: ["You must enter the Base Station Center Point Settings manually in Terra", "Include antenna height: pole length plus antenna offset", "Get this wrong and the entire cloud shifts by the same amount"],
                      warn: "Forgetting to add antenna height is the most common mistake, shifting the whole cloud vertically by the pole length." } } },
      { id: "ppk", icon: "ph-clock-counter-clockwise", next: "l_check", accent: "violet", set: { lcontrol: "ppk" },
        i18n: { tr: { title: "PPK ile son işlem", desc: "Uçarken canlı düzeltme yoktu; ham kayıtları sonradan çözeceğim.",
                      impact: ["Baz istasyonu gözlem dosyasını ham veri klasörüne eklemen gerekir", "RINEX, RTCM, OEM ve UBX biçimleri desteklenir", "Baz koordinatı hangi sistemde çözüldüyse Terra'ya da o sistemde girilir"],
                      warn: "Baz istasyonu koordinatını bir servisle (OPUS, AUSPOS, CSRS-PPP gibi) çözdüysen sonuç o servisin datumundadır. Terra'ya girerken aynı datumu seç." },
                en: { title: "PPK post-processing", desc: "No live correction in flight; I will solve the raw logs afterwards.",
                      impact: ["Add the base station observation file into the raw data folder", "RINEX, RTCM, OEM and UBX formats are supported", "Enter the base coordinate in Terra in whichever system it was solved"],
                      warn: "If you solved the base with a service (OPUS, AUSPOS, CSRS-PPP) the result is in that service's datum. Select the same datum when entering it in Terra." } } },
    ],
  },

  l_density: {
    type: "choice", phase: 2, visual: "lidar_density", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · NOKTA YOĞUNLUĞU",
        title: "Nokta bulutu yoğunluğunu belirle",
        body: {
          b: "Lazer uçuş boyunca inanılmaz sayıda nokta topladı — muhtemelen yüz milyonlarca. Hepsini kullanmak zorunda değilsin. Bu ayar, kaçta kaçını kullanacağını söylüyor. Az kullanmak dosyayı küçültür ve işlemi hızlandırır; çoğu iş için hepsine gerek yoktur.",
          i: "Yoğunluk iki yoldan tanımlanabilir: yüzde olarak örnekleme oranı, ya da mesafe olarak düzgün seyreltme. Varsayılan, 10 cm örnekleme mesafesidir ve topografik ölçme projelerinin çoğu için yeterlidir.",
          a: "Örnekleme iki kipte tanımlanır. Yüzde kipinde High orijinal örnekleme oranını (%100), Medium %25'ini, Low %6,25'ini kullanır. Mesafe kipinde 5–50 cm aralığında bir değerle düzgün seyreltme uygulanır; varsayılan 10 cm'dir.",
        },
        pro: "Yoğunluk gerçek doğruluğu artırmaz, örnekleme sıklığını artırır. %100 yoğunluk çoğu topografik projede dosya boyutunu katlarken nihai ürünün gerçek çözünürlüğüne anlamlı katkı yapmaz. %100'ün gerçekten gerekli olduğu yerler ince yapısal detay ölçümleridir: enerji iletim hatları, ray geometrisi, çelik konstrüksiyon. Karar ölçütün estetik değil, ölçmek istediğin en küçük nesnenin boyutu olmalı.",
      },
      en: {
        eyebrow: "LIDAR · POINT DENSITY",
        title: "Set the point cloud density",
        body: {
          b: "The laser collected an enormous number of points during the flight — likely hundreds of millions. You do not have to use them all. This setting says what fraction to keep. Using fewer shrinks the file and speeds things up; most jobs do not need all of them.",
          i: "Density can be defined two ways: as a percentage sampling rate, or as a distance for uniform downsampling. The default is a 10 cm sample distance, sufficient for most topographic surveying projects.",
          a: "Sampling is defined in two modes. By percentage, High uses the original sampling rate (100%), Medium 25%, Low 6.25%. By distance, a value between 5 and 50 cm applies uniform downsampling; the default is 10 cm.",
        },
        pro: "Density raises sampling frequency, not true accuracy. On most topographic projects 100% multiplies file size without meaningfully improving the real resolution of the final product. Where 100% genuinely earns its cost is fine structural measurement: transmission lines, rail geometry, steel structures. Your criterion should be the size of the smallest object you need to measure, not aesthetics.",
      },
    },
    choices: [
      { id: "d10", icon: "ph-ruler", next: "l_effdist", accent: "teal", set: { density: "10cm" },
        i18n: { tr: { title: "Mesafeye göre — 10 cm", desc: "Varsayılan ayar. Noktalar 10 cm aralıkla düzgün seyreltilir.",
                      impact: ["Topografik ölçme, hacim hesabı ve arazi modeli için genellikle yeterlidir", "Dosya boyutu yönetilebilir kalır, sonraki yazılımlar rahat açar", "Nokta dağılımı homojen olur; uçuş hattı yoğunlaşmaları düzelir"] },
                en: { title: "By distance — 10 cm", desc: "The default. Points uniformly thinned to a 10 cm spacing.",
                      impact: ["Generally sufficient for topographic survey, volumes and terrain models", "File size stays manageable and downstream software opens it comfortably", "Point distribution becomes homogeneous, evening out flight-line concentrations"] } } },
      { id: "high", icon: "ph-atom", next: "l_effdist", accent: "amber", set: { density: "100" },
        i18n: { tr: { title: "Yüzde — High (%100)", desc: "Orijinal örnekleme oranı. Hiçbir nokta atılmaz.",
                      impact: ["İnce yapısal detay için gereklidir: enerji hattı, ray, çelik konstrüksiyon", "En yüksek çıktı kalitesi ve en uzun işlem süresi", "Dosya boyutu ve bellek talebi en üst seviyede"],
                      warn: "Topografik bir projede %100 seçmek çoğunlukla gereksiz maliyettir; dosya katlanır ama teslim edeceğin ürünün gerçek çözünürlüğü değişmez." },
                en: { title: "By percentage — High (100%)", desc: "Original sampling rate. Nothing discarded.",
                      impact: ["Required for fine structural detail: power lines, rails, steel structures", "Highest output quality and longest processing time", "File size and memory demand at their peak"],
                      warn: "Choosing 100% on a topographic project is usually wasted cost; the file multiplies while the real resolution of your deliverable does not change." } } },
      { id: "medium", icon: "ph-dots-nine", next: "l_effdist", accent: "violet", set: { density: "25" },
        i18n: { tr: { title: "Yüzde — Medium (%25)", desc: "Noktaların dörtte biri kullanılır.",
                      impact: ["Kalite ve süre arasında dengeli bir orta yol", "Geniş alanlı projelerde işlem süresini belirgin biçimde kısaltır", "İnce detaylar seyrelir; küçük nesneler kaybolabilir"] },
                en: { title: "By percentage — Medium (25%)", desc: "A quarter of the points used.",
                      impact: ["A balanced middle ground between quality and time", "Cuts processing time noticeably on large-area projects", "Fine detail thins out; small objects can disappear"] } } },
      { id: "low", icon: "ph-dot-outline", next: "l_effdist", accent: "violet", set: { density: "6" },
        i18n: { tr: { title: "Yüzde — Low (%6,25)", desc: "Noktaların on altıda biri kullanılır.",
                      impact: ["En hızlı sonuç; kapsam ve yörünge kontrolü için idealdir", "Seyrek nokta bulutu üretir", "Nihai teslimat için uygun değildir"] },
                en: { title: "By percentage — Low (6.25%)", desc: "One sixteenth of the points used.",
                      impact: ["The fastest result; ideal for checking coverage and trajectory", "Produces a sparse cloud", "Not suitable as a final deliverable"] } } },
    ],
  },

  l_effdist: {
    type: "content", phase: 2, visual: "lidar_import", next: "l_optim", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · ETKİN MESAFE",
        title: "Geçerli ölçüm aralığını sınırla",
        body: {
          b: "Lazer her yöne ateş eder ve bazen çok uzaktaki şeylerden de sinyal döner — karşı yamaçtaki tepe, uzaktaki bir bina. Bu uzak noktalar işine yaramaz ama dosyayı şişirir ve modeli bozar. Bu ayarla lazere şunu dersin: bu mesafeden ötesini saymayacaksın.",
          i: "[[effective_distance]] ayarı, algılayıcıdan itibaren geçerli sayılacak aralığı tanımlar. Bu aralığın dışındaki dönüşler gürültü kabul edilerek işleme dahil edilmez. Değeri belirlemek için algılayıcı ile hedef alan arasındaki en büyük doğrusal mesafeyi tahmin et.",
          a: "Etkin mesafe aralığı, menzil kapısı olarak çalışır ve aralık dışı dönüşleri gürültü olarak eler. Değer, algılayıcı ile hedef yüzey arasındaki azami eğik mesafeden türetilir. Yakın hedef taranırken arka planın kaçınılmaz olarak kapsandığı durumlarda seçici üretim sağlar.",
        },
        pro: "Tipik bir uygulama aralığı 3–300 m'dir ve çoğu şerit veya alan uçuşunu kapsar. Alt sınırı sıfıra yakın bırakmak platformun kendi gövdesinden ve pervanelerinden gelen dönüşleri veriye sokar. Üst sınırı gereğinden geniş bırakmak, uzak arka plan yüzeylerini nokta bulutuna dahil ederek hem dosyayı büyütür hem de zemin sınıflandırma algoritmasını yanıltır.",
        checklist: [
          "Uçuş yüksekliğine bak: 100 m'den uçtuysan eğik mesafe kenarlarda 150 m'yi bulabilir",
          "Etkin mesafe üst sınırını bu değerin biraz üstünde tut, çok üstünde değil",
          "Alt sınırı 2–3 m civarında bırak; platformdan gelen yansımalar elenir",
          "Vadi veya yamaç gibi arka planı olan alanlarda bu ayar kritik hale gelir",
        ],
        cta: "Mesafe aralığı belirlendi",
      },
      en: {
        eyebrow: "LIDAR · EFFECTIVE DISTANCE",
        title: "Bound the valid measurement range",
        body: {
          b: "The laser fires in all directions and sometimes gets returns from very far away — a hill on the opposite slope, a distant building. Those far points are useless to you but bloat the file and corrupt the model. This setting tells the laser: do not count anything past this range.",
          i: "The [[effective_distance]] setting defines the range from the sensor that counts as valid. Returns outside it are treated as noise and excluded. To pick a value, estimate the maximum straight-line distance between the sensor and your target area.",
          a: "The effective distance range acts as a range gate, rejecting out-of-band returns as noise. Derive the value from the maximum slant range between sensor and target surface. It enables selective reconstruction when scanning a near target inevitably captures distant background.",
        },
        pro: "A typical working range is 3–300 m, covering most corridor and area flights. Leaving the lower bound near zero admits returns from the airframe and propellers. Leaving the upper bound wider than needed pulls distant background surfaces into the cloud, inflating the file and misleading the ground classification algorithm.",
        checklist: [
          "Look at your flight height: from 100 m, slant range at the edges can reach 150 m",
          "Set the upper bound a little above that figure, not far above it",
          "Leave the lower bound around 2–3 m to reject returns off the platform",
          "This setting matters most over valleys and slopes where there is background to catch",
        ],
        cta: "Range is set",
      },
    },
  },

  l_optim: {
    type: "choice", phase: 2, visual: "lidar_optim", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · KARAR NOKTASI",
        title: "Doğruluk optimizasyonu ve yumuşatma",
        body: {
          b: "Drone aynı yerin üstünden birkaç kez geçtiyse, her geçişte ölçtüğü noktalar tam üst üste oturmayabilir — çatı iki katlı görünür. Bu ayar o katmanları birbirine oturtur. Bir de yumuşatma var; yüzeydeki pürüzü azaltır ama gerçek detayı da siler.",
          i: "Doğruluk optimizasyonu, farklı zamanlarda toplanan nokta bulutu verisini birbiriyle uyumlandırarak genel tutarlılığı artırır. Sonuçta belirgin katman kaçıklığı görüyorsan bu ayar çözümdür. Yumuşatma ise yüzey gürültüsünü azaltır, ancak ince geometriyi de bastırır.",
          a: "Doğruluk optimizasyonu, farklı zaman dilimlerinde toplanan şeritler arasındaki sistematik uyumsuzluğu bastırır ve katmanlaşmayı giderir. Bellek maliyeti yüksektir. Yumuşatma, yüzey normalleri üzerinde bir filtre uygular; gürültüyü düşürürken kırıklık ve ince kenar bilgisini de düşürür.",
        },
      },
      en: {
        eyebrow: "LIDAR · DECISION POINT",
        title: "Accuracy optimization and smoothing",
        body: {
          b: "If the drone passed over the same spot several times, the points from each pass may not sit exactly on top of each other — a roof looks doubled. This setting pulls those layers together. There is also smoothing, which reduces surface roughness but erases real detail along with it.",
          i: "Accuracy optimization reconciles point cloud data collected at different times to raise overall consistency. If your result shows obvious layer misalignment, this is the fix. Smoothing reduces surface noise but also suppresses fine geometry.",
          a: "Accuracy optimization suppresses systematic misalignment between strips collected at different epochs, resolving layering. Its memory cost is high. Smoothing filters surface normals, lowering noise while also lowering break-line and fine edge information.",
        },
      },
    },
    choices: [
      { id: "optim_on", icon: "ph-stack-simple", next: "l_class", accent: "amber", set: { loptim: "on" },
        i18n: { tr: { title: "Optimizasyon açık, yumuşatma kapalı", desc: "Çok geçişli uçuş ya da katmanlı görünen nokta bulutu için.",
                      impact: ["Farklı geçişlerdeki katman kaçıklığı giderilir, tutarlılık artar", "Gerçek yüzey geometrisi korunur; kırıklık ve kenar bilgisi kaybolmaz", "Bellek tüketimi ve işlem süresi belirgin biçimde artar"],
                      warn: "Ham veri boyutu boş belleğinin dörtte birini aşıyorsa bu ayar işlemi düşürebilir. Bu durumda görevi böl veya optimizasyonu kapat." },
                en: { title: "Optimization on, smoothing off", desc: "For multi-pass flights or clouds that look layered.",
                      impact: ["Layer misalignment between passes is resolved and consistency improves", "True surface geometry survives; break lines and edges are preserved", "Memory use and processing time rise markedly"],
                      warn: "If raw data size exceeds a quarter of your free memory this setting can crash the job. Split the mission or turn optimization off." } } },
      { id: "both_on", icon: "ph-waves", next: "l_class", accent: "teal", set: { loptim: "both" },
        i18n: { tr: { title: "İkisi de açık", desc: "Görselleştirme ve sunum ağırlıklı, gürültüsüz bir yüzey istiyorum.",
                      impact: ["Yüzey belirgin biçimde temiz ve göze hoş görünür", "Gürültülü veride görsel kalite en yüksek seviyeye çıkar", "İnce detay ve keskin kenarlar bastırılır; ölçüm hassasiyeti düşer"],
                      warn: "Kadastro, hacim veya mühendislik ölçümü yapacaksan yumuşatmayı açma. Kenar yuvarlanması ölçüm sonucunu doğrudan etkiler." },
                en: { title: "Both on", desc: "I want a clean, noise-free surface for visualisation and presentation.",
                      impact: ["The surface looks markedly cleaner and more presentable", "Visual quality peaks on noisy data", "Fine detail and sharp edges are suppressed; measurement precision drops"],
                      warn: "Do not enable smoothing if you will do cadastral, volumetric or engineering measurement. Edge rounding directly affects the numbers." } } },
      { id: "both_off", icon: "ph-x-circle", next: "l_class", accent: "violet", set: { loptim: "off" },
        i18n: { tr: { title: "İkisi de kapalı", desc: "Ham veriyi olduğu gibi alıp başka bir yazılımda işleyeceğim.",
                      impact: ["En hızlı işlem, en düşük bellek kullanımı", "LP360, TerraScan gibi yazılımlara aktaracaksan doğru tercih budur", "Katmanlı veri varsa düzelmez; sorunu sonraki yazılımda çözmen gerekir"] },
                en: { title: "Both off", desc: "I will take the raw result and process it in other software.",
                      impact: ["Fastest processing, lowest memory use", "The right pick when handing off to LP360, TerraScan and similar", "Layered data stays layered; you must fix it downstream"] } } },
    ],
  },

  l_class: {
    type: "choice", phase: 2, visual: "lidar_class", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · SINIFLANDIRMA",
        title: "Zemin noktalarını ayıklayacak mısın?",
        body: {
          b: "Nokta bulutunda her şey karışık: toprak, ağaç, bina, direk. Eğer arazinin çıplak halini görmek istiyorsan — mesela kazı hesabı yapacaksan — Terra ağaçları ve binaları otomatik ayıklayabilir. Bu, LiDAR'ın fotogrametriye karşı en büyük üstünlüğü.",
          i: "[[classification]] açıldığında Terra zemin noktalarını bitki örtüsü ve yapılardan ayırır; bu ayrım [[dem]] üretiminin ön koşuludur. Aynı adımda eşyükselti eğrisi de üretilebilir. Bu, LiDAR'ın bitki örtüsü altını ölçebilme avantajının pratikte kullanıldığı yerdir.",
          a: "Zemin sınıflandırması, çok dönüşlü veriden çıplak zemin yüzeyini ayrıştırır ve DEM ile eşyükselti eğrisi üretiminin girdisini oluşturur. Sınıflandırma kalitesi bitki örtüsü yoğunluğuna ve son dönüş yüzdesine bağlıdır; kapalı taçlı ormanda zemin dönüşü oranı düşerse model enterpolasyona yaslanır.",
        },
      },
      en: {
        eyebrow: "LIDAR · CLASSIFICATION",
        title: "Will you extract ground points?",
        body: {
          b: "Everything is mixed together in the point cloud: soil, trees, buildings, poles. If you want to see the bare terrain — for a cut-and-fill calculation, say — Terra can strip the trees and buildings automatically. This is LiDAR's single biggest advantage over photogrammetry.",
          i: "With [[classification]] enabled, Terra separates ground points from vegetation and structures, which is the prerequisite for [[dem]] generation. Contours can be produced in the same pass. This is where LiDAR's ability to measure under vegetation actually gets used.",
          a: "Ground classification separates bare earth from multi-return data and feeds DEM and contour generation. Classification quality depends on canopy density and last-return percentage; under closed canopy, a low ground return rate pushes the model onto interpolation.",
        },
      },
    },
    choices: [
      { id: "class_full", icon: "ph-mountains", next: "crs_output", accent: "amber", set: { lclass: "full" },
        i18n: { tr: { title: "Sınıflandır, DEM ve eğri üret", desc: "Çıplak arazi modeli ve eşyükselti eğrisi istiyorum.",
                      impact: ["Zemin noktaları ayrılır ve arazi modeli (DEM) üretilir", "Eşyükselti eğrileri doğrudan çıktı klasörüne yazılır", "Hacim hesabı, kesit çıkarma ve drenaj analizi mümkün hale gelir", "İşlem süresi sınıflandırma nedeniyle uzar"],
                      warn: "Sık ve kapalı bitki örtüsünde zemine ulaşan dönüş sayısı azalır; o bölgelerde DEM ölçümden değil enterpolasyondan üretilir. Sonucu bu gözle değerlendir." },
                en: { title: "Classify, build DEM and contours", desc: "I want a bare-earth model and contour lines.",
                      impact: ["Ground points are separated and a terrain model (DEM) is produced", "Contours are written directly into the output folder", "Volume computation, cross-sections and drainage analysis become possible", "Processing time extends because of classification"],
                      warn: "Under dense closed canopy fewer returns reach the ground; there the DEM comes from interpolation rather than measurement. Judge the result accordingly." } } },
      { id: "class_only", icon: "ph-funnel", next: "crs_output", accent: "teal", set: { lclass: "class" },
        i18n: { tr: { title: "Sadece sınıflandır", desc: "Zemin etiketlensin ama DEM üretimini kendim yapacağım.",
                      impact: ["Nokta bulutu sınıf etiketleriyle birlikte teslim edilir", "DEM üretimini istediğin parametrelerle kendi yazılımında yaparsın", "Terra'nın DEM enterpolasyon tercihlerine bağlı kalmazsın"] },
                en: { title: "Classify only", desc: "Label the ground but I will build the DEM myself.",
                      impact: ["The point cloud is delivered with classification labels", "You generate the DEM with your own parameters downstream", "You are not bound to Terra's DEM interpolation choices"] } } },
      { id: "raw", icon: "ph-cube-transparent", next: "crs_output", accent: "violet", set: { lclass: "raw" },
        i18n: { tr: { title: "Ham nokta bulutu", desc: "Hiçbir sınıflandırma yapma, tüm noktalar kalsın.",
                      impact: ["En hızlı çıktı; tüm noktalar sınıflandırılmamış olarak korunur", "Cephe, yapı ve bitki örtüsü analizi için tam veri elinde kalır", "Arazi modeli üretemezsin; hacim hesabı için ek işlem gerekir"] },
                en: { title: "Raw point cloud", desc: "No classification, keep every point.",
                      impact: ["Fastest output; all points preserved unclassified", "Full data retained for facade, structure and vegetation analysis", "No terrain model; volume computation needs further processing"] } } },
    ],
  },

  l_check: {
    type: "content", phase: 2, visual: "control", next: "l_density", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "LİDAR · DOĞRULUK DENETİMİ",
        title: "Kontrol ve denetim noktalarını tanımla",
        body: {
          b: "Araziden birkaç noktanın koordinatını GNSS aletiyle ölçtüysen, onları Terra'ya verebilirsin. Terra nokta bulutunun o noktalarda ne kadar şaştığını sana rapor eder — ya da istersen bulutu o yüksekliklere oturtur. Bu, işini belgelemenin tek yoludur.",
          i: "Advanced altındaki doğruluk denetimi bölümü TXT ve CSV biçiminde nokta dosyası kabul eder. Fotogrametriden farklı olarak burada elle işaretleme gerekmez: Terra noktaları düzlemsel konumlarına göre otomatik eşleştirir. Bu işlev esas olarak düşey denetime hizmet eder.",
          a: "Doğruluk kontrol ve denetim modülü, kontrol ve denetim noktalarını düzlemsel konum üzerinden otomatik eşleştirir; görüntü uzayında işaretleme gerekmediği için fotogrametrideki manuel adım burada yoktur. Kontrol noktası olarak içe aktarılan noktalar bulutu düşeyde o kotlara çeker; denetim noktası olarak içe aktarılanlar yalnızca artık üretir.",
        },
        pro: "Nokta dosyasının koordinat sistemi ile denetim yapılacak sistemin tutarlı olması zorunludur; ayrıca noktaların düz ve açık alanlara yerleştirilmiş olması gerekir. Eğimli veya bitki örtüsü yakınındaki noktalarda artık değeri gerçek düşey hatayı değil, yerel eğim ve enterpolasyon etkisini de içerir. Kontrol noktası ile denetim noktası ayrımını koru: aynı noktaları hem çekmek hem denetlemek için kullanırsan elde ettiğin sayı doğruluk değil, kendini doğrulayan bir tekrardır.",
        checklist: [
          "Nokta listeni TXT veya CSV olarak hazırla",
          "Advanced → Accuracy Control and Check bölümünü aç",
          "Dosyayı içe aktar ve sütunları eşleştir",
          "Noktaların ölçüldüğü yatay ve düşey sistemi seç — çıktı sistemiyle tutarlı olmalı",
          "Bulutu kotlara oturtmak istiyorsan kontrol noktası, sadece ölçmek istiyorsan denetim noktası olarak işaretle",
          "En az birkaç noktayı denetim için ayır; hepsini kontrol olarak kullanma",
        ],
        cta: "Doğruluk denetimi ayarlandı",
      },
      en: {
        eyebrow: "LIDAR · ACCURACY CHECK",
        title: "Define control and check points",
        body: {
          b: "If you measured a few points on site with a GNSS receiver, you can hand them to Terra. It will report how far the cloud misses at those points — or, if you prefer, pull the cloud onto those elevations. This is the only way to document your work.",
          i: "The accuracy check section under Advanced accepts point files in TXT and CSV. Unlike photogrammetry, no manual marking is needed here: Terra matches points automatically by planar position. The function primarily serves vertical control.",
          a: "The accuracy control and check module matches control and check points automatically by planar position; no image-space marking is required, so the manual step from photogrammetry does not exist here. Points imported as control pull the cloud vertically onto those elevations; points imported as check only produce residuals.",
        },
        pro: "The point file's coordinate system must be consistent with the system being checked, and points must sit on flat, open ground. On slopes or near vegetation the residual carries local slope and interpolation effects alongside true vertical error. Preserve the control/check distinction: using the same points to both pull and verify yields not accuracy but a self-fulfilling repetition.",
        checklist: [
          "Prepare your point list as TXT or CSV",
          "Open Advanced → Accuracy Control and Check",
          "Import the file and map the columns",
          "Select the horizontal and vertical system the points were measured in — consistent with your output",
          "Mark them as control points to pull the cloud onto those elevations, or as check points to only measure",
          "Reserve at least a few points for checking; do not use them all as control",
        ],
        cta: "Accuracy check configured",
      },
    },
  },
});

/* --- Ortak kapanış -------------------------------------------------- */

Object.assign(STEPS, {

  crs_output: {
    type: "crs", mode: "output", phase: 3, next: "processing", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "ÇIKTI · KOORDİNAT SİSTEMİ",
        title: "Çıktının oturacağı sistemi seç",
        body: {
          b: "İşte hazırlıkta gördüğün listeye geri döndük. Terra'da Advanced bölümünü açıp iki şey seçeceksin: haritanın yatayda hangi sisteme oturacağı, ve yüksekliklerin neye göre ölçüleceği. Aşağıdaki kodlardan projene uyanı arama kutusuna yaz.",
          i: "Advanced → Output Coordinate System bölümünde iki ayrı ayar var. Horizontal Datum Settings yatay sistemi, Geoid Settings düşey datumu belirler. İkisi birbirinden bağımsızdır ve ikisini de bilinçli seçmen gerekir. Arama kutusuna EPSG kodunu ya da sistem adını yazabilirsin.",
          a: "Çıktı referans çerçevesi iki bileşenden oluşur ve bağımsız tanımlanır. Bilinen koordinat sistemi kipinde PRJ dosyası içe aktarılabilir; keyfi koordinat sistemi kipinde [[seven_param]] tanımlanabilir. Fotoğraflarda konum bilgisi yoksa Terra çıktı sistemini zorunlu olarak keyfi kipe alır.",
        },
        pro: "Keyfi koordinat sistemi seçildiğinde Terra, WGS84 tabanlı yerel bir ENU çerçevesi kurar; başlangıç noktası veri kapsamına göre otomatik belirlenir, genellikle modelin merkezine düşer ve elle değiştirilemez. Yeniden yapılandırmayı başlattığında çıktı koordinat sistemi hatası alıyorsan neden çoğunlukla üç durumdan biridir: görüntülerde GPS bilgisi yok, kontrol noktalarının sistemi ile hedef sistem uyuşmuyor, ya da hedef sisteme dönüşüm tanımsız. Ayrıca Terra bazı yedi parametreli tanımları doğrudan çıktı olarak veremez; bu durumda kontrol noktası olmadan çıktı ötelenmiş kalır.",
        checklist: [
          "Advanced bölümünü aç ve Output Coordinate System başlığına gel",
          "Known Coordinate System kipini seç (elinde PRJ dosyası varsa doğrudan içe aktarabilirsin)",
          "Horizontal Datum Settings altında yatay sistemi EPSG koduyla arat ve seç",
          "Geoid Settings altında düşey datumu seç; gerekiyorsa jeoit dosyasını indirip içe aktar",
          "Seçtiğin sistemin RTK kaynağının datumuyla tutarlı olduğunu doğrula",
          "Ölçü biriminin metre olduğunu kontrol et (bazı sistemlerde ayak sürümü de vardır)",
        ],
        cta: "Sistem seçildi, işlemi başlat",
      },
      en: {
        eyebrow: "OUTPUT · COORDINATE SYSTEM",
        title: "Choose the system your output lands in",
        body: {
          b: "Here we are back at the list you saw during setup. Open the Advanced section in Terra and pick two things: which system the map sits in horizontally, and what the heights are measured against. Type whichever code below fits your project into the search box.",
          i: "There are two separate settings under Advanced → Output Coordinate System. Horizontal Datum Settings sets the horizontal system, Geoid Settings the vertical datum. They are independent and both need a deliberate choice. You can type an EPSG code or the system name into the search box.",
          a: "The output reference frame has two components, defined independently. Known coordinate system mode supports PRJ import; arbitrary mode supports a [[seven_param]]. With no position information in the photos, Terra forces the output system into arbitrary mode.",
        },
        pro: "In arbitrary mode Terra builds a WGS84-based local ENU frame; the origin is set automatically from data extent, usually falls at the model centre, and cannot be edited. If reconstruction throws an output coordinate system error, the cause is usually one of three: no GPS in the images, a mismatch between the control point system and the target, or an undefined transformation to the target. Terra also cannot directly output certain seven-parameter definitions; without control points the output stays offset in those cases.",
        checklist: [
          "Open the Advanced section and find Output Coordinate System",
          "Select Known Coordinate System mode (import a PRJ directly if you have one)",
          "Search and select the horizontal system by EPSG code under Horizontal Datum Settings",
          "Select the vertical datum under Geoid Settings; download and import the geoid file if prompted",
          "Verify your selection is consistent with the datum of your RTK source",
          "Check the unit is metres (some systems also exist in feet)",
        ],
        cta: "System selected, start processing",
      },
    },
  },

  processing: {
    type: "process", phase: 3, visual: "processing", next: "quality", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "İŞLEME",
        title: "Terra çalışıyor",
        body: {
          b: "Şimdi bekleme vakti. Terra bilgisayarının bütün gücünü kullanacağı için makine yavaşlayacak, hatta bazen donmuş gibi görünecek — bu normal. Kapatma, uyku moduna geçmesine izin verme.",
          i: "Terra işlem sırasında CPU, RAM ve VRAM kaynaklarının tamamını kullanır; makine belirgin biçimde yavaşlar. Süre; fotoğraf sayısına, seçtiğin çözünürlüğe ve donanıma bağlı olarak dakikalardan saatlere uzayabilir.",
          a: "Yeniden yapılandırma tüm kullanılabilir hesaplama kaynaklarını tüketir. Süre, girdi hacmi ile çözünürlük çarpanının bileşimidir ve doğrusal ölçeklenmez. Çoklu GPU kurulumlarında hızlanma vardır ancak kart sayısıyla doğru orantılı değildir.",
          },
        working: "İşleniyor",
        done: "İşlem tamamlandı",
        cta: "Sonuçları incele",
      },
      en: {
        eyebrow: "PROCESSING",
        title: "Terra is working",
        body: {
          b: "Now you wait. Terra will use all of your computer's power, so the machine will slow down and may even look frozen — that is normal. Do not close it, and do not let it go to sleep.",
          i: "Terra consumes all CPU, RAM and VRAM during processing; the machine slows noticeably. Duration stretches from minutes to hours depending on photo count, chosen resolution and hardware.",
          a: "Reconstruction consumes all available compute. Duration is a function of input volume and resolution factor and does not scale linearly. Multi-GPU setups speed things up, but not in proportion to card count.",
        },
        working: "Processing",
        done: "Processing complete",
        cta: "Review the results",
      },
    },
  },

  quality: {
    type: "content", phase: 4, visual: "quality", next: "export", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "SONUÇ · KALİTE DEĞERLENDİRME",
        title: "Kalite raporunu oku ve sonucu sına",
        body: {
          b: "İşlem bitti ama iş bitmedi. Çıktının güzel görünmesi doğru olduğu anlamına gelmez. Terra bir kalite raporu üretti; ona bakıp modelin gerçekten güvenilir olup olmadığını anlayacaksın. Bu adımı atlarsan yanlış bir haritayı doğru sanarak teslim edebilirsin.",
          i: "Görsel kabul yeterli değildir. Kalite raporundaki bağlanan görüntü oranı, [[reprojection_error]] ve kontrol noktası artıkları birlikte değerlendirilmelidir. Gerçek doğruluk yalnızca dengelemeye katılmamış [[checkpoint]] üzerinden okunur; dengelemeye giren noktaların artığı doğruluk göstergesi değildir.",
          a: "Değerlendirme üç katmanlıdır: iç tutarlılık (yeniden izdüşüm artıkları, bağ noktası dağılımı, bağlanan görüntü oranı), mutlak doğruluk (denetim noktası artıkları, düzlemde ve düşeyde ayrı ayrı) ve ürün bütünlüğü (kapsam boşlukları, kenar bozulmaları, doku kaymaları). Dengelemeye giren gözlemlerin artıkları yalnızca model uyumunu ölçer; mutlak doğruluğun bağımsız kestirimi değildir.",
        },
        pro: "Beklenti çerçevesi: RTK FIX durumunda ve kontrol noktası olmadan DJI'nin bildirdiği fotogrametrik doğruluk yatayda 1 cm + 1–2 × GSD, düşeyde 2 cm + 1,5–3 × GSD mertebesindedir; bu değerler Phantom 4 RTK ve Zenmuse P1 verisinden türetilmiştir. Phantom 4 RTK ile 2B harita mutlak doğruluğu GSD'nin 1–2 katı civarındadır. Gerçekleşen doğruluk RTK çözüm kalitesine, aydınlatma koşullarına, optik kaliteye ve uçuş planına göre bu aralığın dışına çıkabilir. Denetim noktası artıklarında sistematik bir eğilim (hepsi aynı yönde) görüyorsan bu rastgele hata değil datum uyuşmazlığıdır; çıktı koordinat sistemi ayarını gözden geçir.",
        checklist: [
          "Kalite raporunu aç ve bağlanan görüntü sayısını içe aktardığın sayıyla karşılaştır",
          "Denetim noktalarındaki artıkları yatay ve düşey olarak ayrı ayrı incele",
          "Artıkların hepsi aynı yöne bakıyorsa datum veya jeoit ayarını yeniden kontrol et",
          "Ortomozaikte kenar bölgelerini gez; kapsama boşluğu ve bulanıklık genelde kenarlarda başlar",
          "Yükseklik değerlerini bildiğin bir noktayla karşılaştır — 40–50 m'lik bir fark jeoit ayarının atlandığını gösterir",
          "Nokta bulutunda çatı ve düz yüzeylere kesit al; çift katman görüyorsan optimizasyonu açıp yeniden çalıştır",
        ],
        cta: "Sonuç değerlendirildi",
      },
      en: {
        eyebrow: "RESULT · QUALITY ASSESSMENT",
        title: "Read the quality report and test the result",
        body: {
          b: "Processing is done but the job is not. Output looking good does not mean it is correct. Terra produced a quality report; reading it is how you learn whether the model is actually trustworthy. Skip this step and you can deliver a wrong map believing it is right.",
          i: "Visual acceptance is not enough. Connected image ratio, [[reprojection_error]] and control point residuals must be read together. True accuracy comes only from [[checkpoint]] withheld from the adjustment; residuals at points that entered the adjustment are not an accuracy indicator.",
          a: "Assessment has three layers: internal consistency (reprojection residuals, tie point distribution, connected image ratio), absolute accuracy (check point residuals, separately in plan and height), and product integrity (coverage gaps, edge degradation, texture slippage). Residuals of observations that entered the adjustment measure model fit only, not an independent estimate of absolute accuracy.",
        },
        pro: "Expectation frame: in RTK FIX without ground control, DJI publishes photogrammetric accuracy of roughly 1 cm + 1–2 × GSD horizontally and 2 cm + 1.5–3 × GSD vertically, derived from Phantom 4 RTK and Zenmuse P1 data. Absolute 2D map accuracy with a Phantom 4 RTK runs around 1–2 × GSD. Realised accuracy can fall outside these bands depending on RTK solution quality, lighting, optics and route planning. A systematic trend in check point residuals — all leaning the same way — is not random error but a datum mismatch; revisit the output coordinate system setting.",
        checklist: [
          "Open the quality report and compare connected image count with what you imported",
          "Inspect check point residuals separately in plan and in height",
          "If all residuals point the same way, re-examine the datum or geoid setting",
          "Walk the edges of the orthomosaic; coverage gaps and blur usually begin there",
          "Compare elevations against a point you know — a 40–50 m gap means the geoid setting was skipped",
          "Cut a section through roofs and flat surfaces in the cloud; doubled layers mean rerunning with optimization on",
        ],
        cta: "Result assessed",
      },
    },
  },

  export: {
    type: "content", phase: 4, visual: "export", next: "complete", accent: "teal",
    i18n: {
      tr: {
        eyebrow: "SONUÇ · TESLİMAT",
        title: "Çıktıları bul ve teslim et",
        body: {
          b: "Terra ürettiği dosyaları proje klasörünün içine yazdı. Hangi dosyanın ne olduğunu bilmen gerekiyor, çünkü klasörde çok sayıda dosya var ve çoğu ara ürün.",
          i: "Çıktılar proje klasörü altında türlerine göre ayrılmış alt klasörlerde durur. 2B çıktıları GeoTIFF, 3B çıktıları mesh ve nokta bulutu formatlarında yazılır. Her çıktı setinin yanında koordinat sistemi tanımını taşıyan bir üstveri dosyası bulunur.",
          a: "Çıktı dizini: dengeleme sonucu XML, 2B için dsm.tif ve result.tif, 3B için mesh ve nokta bulutu formatları. Koordinat sistemi tanımı metadata.xml içinde taşınır; keyfi kipte ENU çerçevesi ve ekleme noktası koordinatları, bilinen kipte EPSG kodu yazılır. TIF çıktıları v3.0.0 sonrası DEFLATE kayıpsız sıkıştırma kullanır.",
        },
        pro: "Teslimat paketinin bütünlüğü için üstveri dosyasını dışarıda bırakma. Nokta bulutu ve mesh dosyaları yanlarındaki metadata.xml olmadan koordinat sistemi bilgisinden yoksun kalır; alıcı yazılım dosyayı açar ama yanlış yere oturtur veya hiç konumlandıramaz. Keyfi koordinat sisteminde üretilmiş bir 3B veri setinde bu dosya, ENU çerçevesinin ekleme noktası koordinatlarını taşır ve onsuz veri yeniden konumlandırılamaz.",
        checklist: [
          "Proje klasörünü aç ve çıktı alt klasörlerini gözden geçir",
          "2B çıktısında result.tif ortomozaik, dsm.tif yüzey modelidir",
          "3B çıktısında mesh dosyalarının yanındaki metadata.xml dosyasını da teslim et",
          "Nokta bulutunu LAS olarak paylaşacaksan koordinat sistemi bilgisinin yazıldığını doğrula",
          "Dosyaları bir CBS yazılımında açıp beklediğin yere oturduğunu gözle kontrol et",
          "Kalite raporunu teslimat paketine ekle — doğruluğun belgesi odur",
        ],
        cta: "Teslimat hazır",
      },
      en: {
        eyebrow: "RESULT · DELIVERY",
        title: "Find your outputs and hand them over",
        body: {
          b: "Terra wrote the files it produced inside the project folder. You need to know which file is which, because there are many and most of them are intermediates.",
          i: "Outputs sit in subfolders organised by type under the project folder. 2D outputs are written as GeoTIFF, 3D outputs as mesh and point cloud formats. Each output set is accompanied by a metadata file carrying the coordinate system definition.",
          a: "Output directory: adjustment result XML, dsm.tif and result.tif for 2D, mesh and point cloud formats for 3D. The coordinate system definition travels in metadata.xml — the ENU frame and insertion point coordinates in arbitrary mode, the EPSG code in known mode. TIF outputs use DEFLATE lossless compression since v3.0.0.",
        },
        pro: "Do not leave the metadata file out of the delivery package. Point cloud and mesh files without their metadata.xml carry no coordinate system information; the receiving software opens them but places them wrongly or not at all. On a 3D dataset produced in an arbitrary coordinate system that file carries the ENU insertion point coordinates, and without it the data cannot be repositioned.",
        checklist: [
          "Open the project folder and review the output subfolders",
          "In 2D output, result.tif is the orthomosaic and dsm.tif the surface model",
          "In 3D output, deliver the metadata.xml alongside the mesh files",
          "If sharing the point cloud as LAS, verify the coordinate system information was written",
          "Open the files in GIS software and visually confirm they land where you expect",
          "Include the quality report in the delivery package — it is the evidence of your accuracy",
        ],
        cta: "Delivery ready",
      },
    },
  },

  complete: {
    type: "complete", phase: 4, visual: "complete", accent: "amber",
    i18n: {
      tr: {
        eyebrow: "TAMAMLANDI",
        title: "İşleme reçeten hazır",
        body: {
          b: "Baştan sona bir DJI Terra iş akışını tamamladın. Aşağıda verdiğin bütün kararlar ve her birinin ne anlama geldiği duruyor. Bunu yazdırıp yanında bulundurabilir, ya da farklı seçimlerle rehberi tekrar çalıştırıp diğer senaryoları görebilirsin.",
          i: "İş akışını tamamladın. Aşağıdaki reçete, verdiğin her kararı ve doğrudan sonucunu içeriyor. Bunu proje dosyasına eklemek, aynı işi altı ay sonra tekrarlaman gerektiğinde hangi ayarları neden seçtiğini hatırlatır.",
          a: "İş akışı tamamlandı. Aşağıdaki karar kaydı, parametre seçimlerini ve gerekçelerini bir arada tutar; işlem parametrelerinin izlenebilirliği, teslimat dosyasında doğruluk raporunun yanında yer alması gereken bir bileşendir.",
        },
        restart: "Farklı seçimlerle tekrar dene",
      },
      en: {
        eyebrow: "COMPLETE",
        title: "Your processing recipe is ready",
        body: {
          b: "You have walked a full DJI Terra workflow end to end. Below are all the decisions you made and what each one means. Print it and keep it beside you, or run the guide again with different choices to see the other scenarios.",
          i: "Workflow complete. The recipe below holds every decision you made and its direct consequence. Filing it with the project reminds you six months later why you chose the settings you did.",
          a: "Workflow complete. The decision log below keeps parameter selections and their rationale together; traceability of processing parameters belongs in the delivery package alongside the accuracy report.",
        },
        restart: "Try again with different choices",
      },
    },
  },
});
