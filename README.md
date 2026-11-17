# Can Elektrik Çilingir Anahtar — web sitesi

Canlı adres: https://cananahtarcilingir.com

Ümraniye Tatlısu'daki Can Elektrik Çilingir Anahtar dükkânının tek sayfalık sitesi. Cloudflare Workers üzerinde çalışır.

## Klasörler

| Yol | İçerik |
| --- | --- |
| `public/` | Sitenin kendisi: `index.html`, galeri listesi (`galeri.js`), güvenlik başlıkları (`_headers`), fotoğraf ve videolar |
| `src/index.js` | "Sitemiz bugün X kez ziyaret edildi" sayacı. Gün başına tek bir sayı tutar, kişisel bilgi saklamaz |
| `wrangler.jsonc` | Cloudflare ayarları (alan adları, sayaç) |

Müşterilerin yüklediği fotoğraflar (`musteri-fotograflari/`, `yukleyeni-belirsiz/`) bilerek depoya konmadı.

## Bilgisayarda çalıştırma

```bash
npm install
npm run dev
```

Site http://localhost:8787 adresinde açılır. Buradaki sayaç canlı sitedekinden ayrıdır.

## Canlıya yükleme

```bash
npx wrangler login
npm run deploy
```

`login` bir kez yapılır; Cloudflare hesabına tarayıcıdan izin verilir.

## Sık değişen yerler

- Telefon / WhatsApp numarası: `public/index.html` içinde `905323810212` geçen yerler
- Google puanı ve yorum sayısı: `public/index.html` içinde `STATS` listesi, puan kartı ve üstteki rozet
- Galeri: `public/galeri.js`
