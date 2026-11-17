// Can Elektrik Çilingir Anahtar — site + "bugün görüntüleyen" sayacı.
// public/ klasöründeki dosyalar olduğu gibi sunulur; sadece /api/ziyaret bu kodla çalışır.
// Sayaç her sayfa açılışında 1 artar; hiçbir kişisel bilgi (IP, çerez) saklamaz, sadece "gün → sayı" tutar.
import { DurableObject } from "cloudflare:workers";

// Sayaç sadece bu adreslerden açılan sayfalardan artırılabilir (localhost: bilgisayarda deneme için).
const IZINLI_ALANLAR = ["cananahtarcilingir.com", "www.cananahtarcilingir.com", "localhost", "127.0.0.1"];

// Türkiye saatine göre bugünün tarihi (YYYY-AA-GG)
function bugun() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export class Sayac extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS gunluk (tarih TEXT PRIMARY KEY, sayi INTEGER NOT NULL)"
    );
  }

  artir(tarih) {
    this.ctx.storage.sql.exec(
      "INSERT INTO gunluk (tarih, sayi) VALUES (?, 1) ON CONFLICT(tarih) DO UPDATE SET sayi = sayi + 1",
      tarih
    );
    return this.oku(tarih);
  }

  oku(tarih) {
    const satirlar = this.ctx.storage.sql
      .exec("SELECT sayi FROM gunluk WHERE tarih = ?", tarih)
      .toArray();
    return satirlar.length ? satirlar[0].sayi : 0;
  }
}

function json(veri, durum = 200) {
  return new Response(JSON.stringify(veri), {
    status: durum,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export default {
  async fetch(istek, env) {
    const url = new URL(istek.url);

    if (url.pathname === "/api/ziyaret") {
      const sayac = env.SAYAC.get(env.SAYAC.idFromName("site"));
      const tarih = bugun();

      if (istek.method === "GET") {
        return json({ tarih, sayi: await sayac.oku(tarih) });
      }

      if (istek.method === "POST") {
        // Başka sitelerden sayaç şişirilmesin diye sadece kendi adresimizden gelen istekleri say.
        let alan = "";
        try { alan = new URL(istek.headers.get("origin") || "").hostname; } catch {}
        if (!IZINLI_ALANLAR.includes(alan)) {
          return json({ hata: "izin yok" }, 403);
        }
        return json({ tarih, sayi: await sayac.artir(tarih) });
      }

      return json({ hata: "desteklenmiyor" }, 405);
    }

    return env.ASSETS.fetch(istek);
  },
};
