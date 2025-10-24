# Alternatif Bank Demo

Bu proje Alternatif Bank deneyimini yerel ortamda taklit eden bir demo uygulamasıdır. Next.js 14 (React + TypeScript) ile hazırlanmış bir frontend ve FastAPI tabanlı bir backend içerir. PostgreSQL üzerinde çalışan `bank` şeması ve `send_money` fonksiyonu ile çalışır.

## Proje Yapısı

```
.
├── backend/           # FastAPI uygulaması ve veritabanı betikleri
├── frontend/          # Next.js 14 (App Router) arayüzü
└── README.md
```

## Gereksinimler

- Node.js 18+
- pnpm veya npm
- Python 3.11+
- PostgreSQL (Azure PostgreSQL Flexible Server gibi SSL zorunlu ortam)

## Kurulum

### 1. Veritabanı

Azure PostgreSQL sunucunuzda `bankdb` veritabanını ve `bank` şemasını oluşturduktan sonra `backend/sql/schema.sql` dosyasındaki nesneleri çalıştırabilirsiniz. Dosya yalnızca tablo ve fonksiyon tanımlarını içerir; herhangi bir başlangıç verisi **yer almaz**.

```bash
psql "host=bank-server.postgres.database.azure.com port=5432 dbname=bankdb user=bankuser@bank-server sslmode=require" -f backend/sql/schema.sql
```

### 2. Backend

1. Gerekli paketleri yükleyin:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. `.env` dosyasını oluşturun:

   ```env
   DATABASE_URL=postgresql+asyncpg://bankuser%40bank-server:pass.word12@bank-server.postgres.database.azure.com:5432/bankdb?sslmode=require
   DB_POOL_SIZE=10
   DB_MAX_OVERFLOW=10
   API_RATE_LIMIT_PER_MIN=60
   ```

3. Geliştirme sunucusunu başlatın:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 3. Frontend

1. Bağımlılıkları kurun ve geliştirme sunucusunu çalıştırın:

   ```bash
   cd frontend
   pnpm install  # veya npm install
   cp .env.local.example .env.local
   pnpm dev      # veya npm run dev
   ```

   Frontend varsayılan olarak `http://localhost:3000` adresinden backend'in `http://localhost:8000` üzerindeki API'lerine istek atar.

## API Sözleşmesi

| Yöntem | Uç Nokta | Açıklama |
| ------ | -------- | -------- |
| GET    | `/api/health` | Veritabanı bağlantısı için sağlık kontrolü |
| GET    | `/api/accounts` | Hesap listesini döndürür |
| GET    | `/api/accounts/{iban}` | Belirtilen hesabı ve son 20 transferini döndürür |
| GET    | `/api/transfers?limit=&offset=` | Transferleri sayfalı şekilde döndürür |
| POST   | `/api/transfers` | `send_money` fonksiyonu üzerinden transfer başlatır |

### Transfer Oluşturma

```json
POST /api/transfers
{
  "fromIban": "TR120006200000000123456789",
  "toIban": "TR560006200000000987654321",
  "amount": "100.00"
}
```

Başarılı istekler `{ "id": <BIGINT> }` döndürür. Hatalar `{ "error": "..." }` biçimindedir ve PL/pgSQL mesajı aynen iletilir.

## Frontend Özellikleri

- Hesap listesi, arama ve hızlı aksiyonlar (/)
- Hesap detay sayfası ve son 20 transfer (/accounts/[iban])
- Doğrulamalı para transfer formu (/transfer)
- Sayfalı transfer akışı (/transfers)
- Tailwind CSS ile marka renkleri (#ad2460) ve duyarlı tasarım
- IBAN regex kontrolleri, tutar doğrulamaları ve inline geri bildirimler

## Güvenlik Notu

Para hareketleri yalnızca PostgreSQL üzerindeki `bank.send_money(p_from_iban, p_to_iban, p_amount)` fonksiyonu üzerinden yapılır. Doğrudan tabloya `INSERT`/`UPDATE` yapılmaz.

## Veri Durumları

Demo uygulama başlangıçta boş veri kümeleriyle uyumludur. Hesaplar veya transferler bulunmadığında arayüz anlamlı boş durum mesajları gösterir; ayrı bir seed adımı gerektirmez.

## Bilinen Limitler

- Arka plan görevleri veya gerçek bildirim sistemleri bu sürümde yoktur; dışarıdan genişletilebilir.

## Test Senaryoları

Uygulama aşağıdaki durumları UI seviyesinde ele alır:

1. Regex dışı IBAN -> Form doğrulaması ile gönderim engellenir.
2. Aynı IBAN'a transfer -> "Gönderen ve alıcı IBAN aynı olamaz." mesajı gösterilir.
3. Yetersiz bakiye -> `send_money` fonksiyonundaki hata mesajı aynen kullanıcıya iletilir.
4. Başarılı transfer -> Bakiyeler backend tarafında güncellenir ve yeni transfer akışta üstte görünür.

## Çalıştırma

- Backend: `uvicorn app.main:app --reload --port 8000`
- Frontend: `pnpm dev` (veya `npm run dev`)

Her iki servis de çalıştığında uygulamaya `http://localhost:3000` üzerinden erişebilirsiniz.
