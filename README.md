# Lokální backend pro Chatka Booking (pro FE vývoj)

Tahle složka spustí **backend + Postgres** v Dockerech, aby mohl frontend běžet proti lokálnímu API.

## Co potřebuju
- Docker Desktop
- Node 18+ (doporučeně 20+)

## Jak spustit backend
```bash
cd setup-fe
docker compose up -d --build

cd ..
npm install
npm run dev

Otevřeš http://localhost:5173.

