# Finansal Veri Tutarlılığı

Tüm finansal göstergeler (kar, alacak, borç, nakit akışı) tek kaynaktan türetilir ve aynı para birimi/hesaplama kurallarına göre gösterilir.

## Tek Kaynak: Faturalar (invoices)

- **Satış (SALES)**: Müşteriden alınacak
- **Alış (PURCHASE)**: Tedarikçiye ödenecek
- **Kar** = Toplam Satış − Toplam Alış (filtrelere göre: tarih, is_paid, position_id)

Pozisyondaki `estimated_profit` yalnızca **tahmini/taslak** amaçlıdır. Özet kartlar ve raporlar **faturalardan** hesaplanır.

## Merkezi Modül: `lib/finance.ts`

- `computeProfitFromInvoices(invoices, toCurrency, exchangeRates, filterFn?)` – Kar
- `computeMonthlyProfitFromInvoices(invoices, exchangeRates, toCurrency, lastNMonths)` – Aylık kar serisi
- `computeCashFlowFromInvoices(...)` – Aylık gelir / gider / kar (nakit akışı)
- `computeReceivablesPayables(invoices, exchangeRates, toCurrency)` – Alacak, borç, vadesi geçmiş alacak
- `computeNetProfitPaid(invoices, toCurrency, exchangeRates)` – Sadece ödenen faturalardan net kar
- `computeProfitForPositions(invoices, positionIds, toCurrency, exchangeRates)` – Belirli pozisyonlar için kar

Döviz dönüşümü: `lib/exchange-rates` → `convertCurrency` (TCMB kurları).

## Sayfa Bazlı Kullanım

| Sayfa | Gösterge | Kaynak | Para birimi |
|-------|----------|--------|-------------|
| **Dashboard** | Bu Ay Kar | `computeProfitFromInvoices` (invoice_date = bu ay) | TRY |
| **Dashboard** | Aylık Karlılık (grafik) | `computeMonthlyProfitFromInvoices` | TRY |
| **Pozisyonlar** | Toplam Kar (Tamamlanan) | `computeProfitForPositions` (status=COMPLETED) | TRY |
| **Finans** | Alacak / Borç / Vadesi geçmiş / Net kar | `computeReceivablesPayables`, `computeNetProfitPaid` | Kullanıcı seçimi (varsayılan TRY) |
| **Finans** | Nakit Akışı Özeti | `computeCashFlowFromInvoices` | Kullanıcı seçimi |
| **Raporlar** | Aylık PDF – Toplam Kar | `generateMonthlyReport(..., exchangeRates)` → faturalardan, TRY | TRY |

## Para Birimi Varsayılanı

- **Varsayılan raporlama para birimi**: TRY (`lib/stores/currency-store` varsayılanı TRY yapıldı).
- Finans sayfasında kullanıcı TRY, USD, EUR, RUB seçebilir; tüm kartlar ve nakit akışı seçilen paraya göre dönüştürülür.

## Pozisyon Detayı – TRY Kuru

- `sales_exchange_rate` / `cost_exchange_rate` varsa bunlar kullanılır.
- Yoksa `exchange_rates_snapshot` içindeki `sales_rate` / `cost_rate` veya `USD_TRY`, `EUR_TRY`, `RUB_TRY` kullanılır.
- Bu mantık `lib/position-utils.ts` → `getPositionExchangeRate(position, 'sales'|'cost')` ile merkezileştirildi.

## Veri Tohumlama: `INSERT_DASHBOARD_DATA.sql`

- `sales_exchange_rate` / `cost_exchange_rate` kaldırıldı (şemada yoksa hata vermemesi için).
- `exchange_rates_snapshot` (JSONB) kullanılıyor; `sales_rate` ve `cost_rate` burada set ediliyor.

## Bağlantı Özeti

1. **Pozisyon → Fatura**: Her fatura `position_id` ile bir pozisyona bağlı. COMPLETED pozisyonların karı, o `position_id`’lere ait faturalardan hesaplanır.
2. **Dashboard – Finans – Pozisyonlar**: Hepsi aynı `lib/finance` ve `convertCurrency` ile aynı toplamları üretir; sadece filtre (tarih, is_paid, position) ve para birimi farklıdır.
3. **Rapor PDF**: Aylık rapordaki “Toplam Kar” artık faturalardan ve TRY’ye çevrilerek hesaplanıyor; `generateMonthlyReport`’a `exchangeRates` parametresi eklendi.
