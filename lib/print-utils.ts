/**
 * Print Utilities
 */

/**
 * Print table as a formatted document
 */
export function printTable(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #1e3a8a;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #1e3a8a;
          color: white;
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          text-align: right;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Yazdırma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
      <table>
        <thead>
          <tr>
            ${headers.map((h) => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) =>
                `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="footer">
        İrma Global Forwarding - Lojistik CRM
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Print current page
 */
export function printCurrentPage(): void {
  window.print();
}

export interface CustomerLedgerPrintData {
  customerName: string;
  taxId?: string;
  contactPerson?: string;
  movements: {
    date: string;
    docNo: string;
    type: string;
    description: string;
    borc: number;
    alacak: number;
    currency: string;
    status?: string;
  }[];
  currencySummaries: {
    currency: string;
    totalBorc: number;
    totalAlacak: number;
    balance: number;
  }[];
}

/**
 * Print customer ledger (cari) — modern A4 print-first design
 */
export function printCustomerLedger(data: CustomerLedgerPrintData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const fmt = (n: number) =>
    n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const printDate = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const docNo = `CE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  // ── Movement rows ──────────────────────────────────────────────────────────
  const movementRows = data.movements
    .map(
      (m, i) => `
      <tr class="${i % 2 === 0 ? "row-even" : "row-odd"}">
        <td class="col-date">${m.date}</td>
        <td class="col-docno mono">${m.docNo || "—"}</td>
        <td class="col-desc">${m.description}</td>
        <td class="col-status"><span class="status-pill">${m.status || "—"}</span></td>
        <td class="col-cur text-center"><span class="cur-tag cur-${m.currency}">${m.currency}</span></td>
        <td class="col-amount text-right ${m.borc > 0 ? "c-debit" : "c-muted"}">${m.borc > 0 ? fmt(m.borc) : "—"}</td>
        <td class="col-amount text-right ${m.alacak > 0 ? "c-credit" : "c-muted"}">${m.alacak > 0 ? fmt(m.alacak) : "—"}</td>
      </tr>`
    )
    .join("");

  // ── Currency summary cards ─────────────────────────────────────────────────
  const summaryCards = data.currencySummaries
    .map(
      (s) => `
      <div class="summary-card ${s.balance > 0 ? "card-debit" : s.balance < 0 ? "card-credit" : "card-zero"}">
        <div class="card-currency">${s.currency}</div>
        <div class="card-row">
          <span class="card-label">Borç</span>
          <span class="card-value c-debit">${fmt(s.totalBorc)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Alacak</span>
          <span class="card-value c-credit">${fmt(s.totalAlacak)}</span>
        </div>
        <div class="card-divider"></div>
        <div class="card-row">
          <span class="card-label card-label-bold">Bakiye</span>
          <span class="card-value card-balance ${s.balance > 0 ? "c-debit" : s.balance < 0 ? "c-credit" : ""}">
            ${fmt(Math.abs(s.balance))}
          </span>
        </div>
        <div class="card-status-text ${s.balance > 0 ? "c-debit" : s.balance < 0 ? "c-credit" : "c-muted"}">
          ${s.balance > 0 ? "Müşteri Borçlu" : s.balance < 0 ? "Alacaklıyız" : "Bakiye Sıfır"}
        </div>
      </div>`
    )
    .join("");

  // ── HTML ───────────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cari Hesap Ekstresi — ${data.customerName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ── Reset & Base ──────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @media print {
      @page { size: A4; margin: 1.4cm 1.6cm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break-before { page-break-before: always; }
    }

    :root {
      --brand:       #C41E3A;
      --brand-light: #FFF1F2;
      --dark:        #111827;
      --mid:         #374151;
      --soft:        #6B7280;
      --border:      #E5E7EB;
      --row-alt:     #F8FAFC;
      --debit:       #DC2626;
      --credit:      #059669;
      --font:        'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    body {
      font-family: var(--font);
      color: var(--dark);
      background: #fff;
      font-size: 11pt;
      line-height: 1.5;
    }

    /* ── Page wrapper ──────────────────────────────────────── */
    .page { max-width: 210mm; margin: 0 auto; padding: 0; }

    /* ── Header ────────────────────────────────────────────── */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 2.5px solid var(--brand);
      margin-bottom: 22px;
    }

    .brand-block { display: flex; align-items: center; gap: 14px; }

    .brand-logo {
      width: 44px; height: 44px; flex-shrink: 0;
      background: var(--brand); border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .brand-logo svg { width: 26px; height: 26px; fill: white; }

    .brand-name {
      font-size: 17pt; font-weight: 700; color: var(--brand);
      letter-spacing: -0.3px; line-height: 1.15;
    }
    .brand-sub {
      font-size: 8pt; color: var(--soft); margin-top: 2px; font-weight: 400;
    }
    .brand-web {
      font-size: 8pt; color: var(--brand); font-weight: 500; margin-top: 1px;
      text-decoration: none;
    }

    .doc-meta { text-align: right; }
    .doc-title {
      font-size: 14pt; font-weight: 700; color: var(--dark);
      letter-spacing: -0.3px;
    }
    .doc-subtitle { font-size: 9pt; color: var(--soft); margin-top: 3px; }
    .doc-number {
      display: inline-block; margin-top: 6px;
      font-size: 9pt; font-family: 'Courier New', monospace;
      background: var(--row-alt); border: 1px solid var(--border);
      border-radius: 5px; padding: 3px 10px; color: var(--mid);
    }

    /* ── Customer + Document Info ──────────────────────────── */
    .info-row {
      display: flex; gap: 16px; margin-bottom: 20px;
    }
    .info-box {
      flex: 1; background: var(--row-alt);
      border: 1px solid var(--border); border-radius: 8px;
      padding: 14px 16px;
    }
    .info-box-label {
      font-size: 7.5pt; font-weight: 600; color: var(--soft);
      text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;
    }
    .info-box-name {
      font-size: 13pt; font-weight: 700; color: var(--dark);
      margin-bottom: 4px; line-height: 1.2;
    }
    .info-detail {
      font-size: 9pt; color: var(--mid); line-height: 1.7;
    }
    .info-detail strong { font-weight: 600; color: var(--dark); }

    .doc-info-box {
      min-width: 200px; background: var(--brand-light);
      border: 1px solid #FECDD3; border-radius: 8px;
      padding: 14px 16px;
    }
    .doc-info-row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 5px; }
    .doc-info-row:last-child { margin-bottom: 0; }
    .doc-info-key { font-size: 8.5pt; color: var(--soft); }
    .doc-info-val { font-size: 8.5pt; font-weight: 600; color: var(--dark); text-align: right; }

    /* ── Section title ─────────────────────────────────────── */
    .section-head {
      display: flex; align-items: center; gap: 8px;
      margin: 22px 0 10px 0;
    }
    .section-head-bar {
      width: 4px; height: 18px; background: var(--brand); border-radius: 2px; flex-shrink: 0;
    }
    .section-head-text {
      font-size: 10pt; font-weight: 700; color: var(--dark);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .section-head-note {
      margin-left: auto; font-size: 8pt; color: var(--soft); font-style: italic;
    }

    /* ── Movements Table ───────────────────────────────────── */
    .ledger-table {
      width: 100%; border-collapse: collapse;
      font-size: 9pt; margin-bottom: 4px;
    }

    .ledger-table thead tr {
      background: var(--dark);
    }
    .ledger-table thead th {
      padding: 9px 10px; color: #fff;
      font-size: 8pt; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.4px;
      border: none;
    }
    .ledger-table thead th:first-child { border-radius: 6px 0 0 0; }
    .ledger-table thead th:last-child  { border-radius: 0 6px 0 0; }

    .ledger-table tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .row-even td { background: #fff; }
    .row-odd  td { background: var(--row-alt); }

    .ledger-table tbody tr:last-child td { border-bottom: 2px solid var(--dark); }

    .col-date  { width: 72px; white-space: nowrap; color: var(--mid); font-size: 8.5pt; }
    .col-docno { width: 90px; font-size: 8pt; white-space: nowrap; color: var(--mid); }
    .col-desc  { color: var(--dark); font-weight: 500; }
    .col-status{ width: 90px; }
    .col-cur   { width: 46px; }
    .col-amount{ width: 88px; white-space: nowrap; font-variant-numeric: tabular-nums; }

    .mono { font-family: 'Courier New', monospace; }
    .text-right  { text-align: right; }
    .text-center { text-align: center; }

    .status-pill {
      display: inline-block; font-size: 7.5pt; font-weight: 500;
      padding: 2px 7px; border-radius: 20px;
      background: #F3F4F6; color: var(--mid); white-space: nowrap;
      border: 1px solid var(--border);
    }

    .cur-tag {
      display: inline-block; font-size: 8pt; font-weight: 700;
      padding: 2px 6px; border-radius: 4px; letter-spacing: 0.3px;
    }
    .cur-USD { background: #EFF6FF; color: #1D4ED8; }
    .cur-EUR { background: #F0FDF4; color: #15803D; }
    .cur-TRY { background: #FFF7ED; color: #C2410C; }
    .cur-RUB { background: #FFF1F2; color: #BE123C; }

    .c-debit  { color: var(--debit);  }
    .c-credit { color: var(--credit); }
    .c-muted  { color: #9CA3AF; }

    .empty-row td {
      text-align: center; padding: 32px; color: var(--soft);
      font-style: italic; background: var(--row-alt);
    }

    /* ── Currency Summary ──────────────────────────────────── */
    .summary-grid {
      display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;
    }

    .summary-card {
      flex: 1; min-width: 140px; max-width: 200px;
      border-radius: 10px; padding: 14px 16px;
      border: 1.5px solid var(--border);
    }
    .card-debit  { border-color: #FECACA; background: #FFF5F5; }
    .card-credit { border-color: #A7F3D0; background: #F0FDF9; }
    .card-zero   { background: var(--row-alt); }

    .card-currency {
      font-size: 15pt; font-weight: 800; color: var(--dark);
      margin-bottom: 10px; letter-spacing: -0.5px;
    }
    .card-row {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 4px;
    }
    .card-label { font-size: 8pt; color: var(--soft); }
    .card-label-bold { font-weight: 700; color: var(--dark); }
    .card-value { font-size: 9pt; font-weight: 600; font-variant-numeric: tabular-nums; }
    .card-balance { font-size: 11pt; font-weight: 800; }
    .card-divider { height: 1px; background: var(--border); margin: 8px 0; }
    .card-status-text { font-size: 8pt; font-weight: 600; margin-top: 4px; text-align: right; }

    /* ── Footer ────────────────────────────────────────────── */
    .doc-footer {
      margin-top: 32px; padding-top: 12px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-size: 8pt; color: var(--soft); }
    .footer-brand strong { color: var(--brand); font-weight: 700; }
    .footer-note  { font-size: 7.5pt; color: var(--soft); text-align: right; }

    /* ── Disclaimer note ───────────────────────────────────── */
    .disclaimer {
      margin-top: 10px; font-size: 7.5pt; color: var(--soft);
      font-style: italic; text-align: center;
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ══ HEADER ══════════════════════════════════════════════════════ -->
  <div class="doc-header">
    <div class="brand-block">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">Irma Dış Ticaret</div>
        <div class="brand-sub">Uluslararası Taşımacılık &amp; Lojistik Hizmetleri</div>
        <a class="brand-web" href="https://irmadisticaret.com.tr">irmadisticaret.com.tr</a>
      </div>
    </div>

    <div class="doc-meta">
      <div class="doc-title">Cari Hesap Ekstresi</div>
      <div class="doc-subtitle">Müşteri Cari Hesap Dökümü</div>
      <div class="doc-number">${docNo}</div>
    </div>
  </div>

  <!-- ══ INFO ROW ═════════════════════════════════════════════════════ -->
  <div class="info-row">
    <div class="info-box">
      <div class="info-box-label">Müşteri Bilgileri</div>
      <div class="info-box-name">${data.customerName}</div>
      <div class="info-detail">
        ${data.taxId ? `<span><strong>Vergi No:</strong> ${data.taxId}</span><br>` : ""}
        ${data.contactPerson ? `<span><strong>Yetkili:</strong> ${data.contactPerson}</span>` : ""}
      </div>
    </div>
    <div class="doc-info-box">
      <div class="doc-info-row">
        <span class="doc-info-key">Belge No</span>
        <span class="doc-info-val mono">${docNo}</span>
      </div>
      <div class="doc-info-row">
        <span class="doc-info-key">Düzenleme Tarihi</span>
        <span class="doc-info-val">${printDate}</span>
      </div>
      <div class="doc-info-row">
        <span class="doc-info-key">Toplam Hareket</span>
        <span class="doc-info-val">${data.movements.length} adet</span>
      </div>
      <div class="doc-info-row">
        <span class="doc-info-key">Döviz Sayısı</span>
        <span class="doc-info-val">${data.currencySummaries.length} döviz</span>
      </div>
    </div>
  </div>

  <!-- ══ MOVEMENTS TABLE ══════════════════════════════════════════════ -->
  <div class="section-head">
    <div class="section-head-bar"></div>
    <div class="section-head-text">Cari Hesap Hareketleri</div>
    <div class="section-head-note">Her hareket kendi döviz cinsinde gösterilir · Otomatik çevrim yapılmamıştır</div>
  </div>

  <table class="ledger-table">
    <thead>
      <tr>
        <th>Tarih</th>
        <th>Belge No</th>
        <th>İşlem / Açıklama</th>
        <th>Durum</th>
        <th class="text-center">Döviz</th>
        <th class="text-right">Borç</th>
        <th class="text-right">Alacak</th>
      </tr>
    </thead>
    <tbody>
      ${movementRows || `<tr class="empty-row"><td colspan="7">Henüz cari hareket kaydı bulunmuyor.</td></tr>`}
    </tbody>
  </table>

  <!-- ══ CURRENCY SUMMARY ═════════════════════════════════════════════ -->
  <div class="section-head" style="margin-top:28px;">
    <div class="section-head-bar"></div>
    <div class="section-head-text">Döviz Bazlı Özet</div>
  </div>

  <div class="summary-grid">
    ${summaryCards || `<p style="color:#9CA3AF;font-size:9pt;font-style:italic;">Özet bilgisi bulunamadı.</p>`}
  </div>

  <!-- ══ FOOTER ════════════════════════════════════════════════════════ -->
  <div class="doc-footer">
    <div class="footer-brand">
      <strong>Irma Dış Ticaret</strong> · Uluslararası Taşımacılık &amp; Lojistik<br>
      <a href="https://irmadisticaret.com.tr" style="color:#C41E3A;">irmadisticaret.com.tr</a>
    </div>
    <div class="footer-note">
      Yazdırma Tarihi: ${new Date().toLocaleString("tr-TR")}<br>
      Bu belge bilgi amaçlıdır ve resmi fatura niteliği taşımaz.
    </div>
  </div>

  <div class="disclaimer">
    Bu ekstrede gösterilen tutarlar kayıt anındaki orijinal döviz cinsleriyle sunulmaktadır.
    Herhangi bir kur dönüşümü yapılmamıştır.
  </div>

</div>
<script>
  window.onload = function () {
    setTimeout(function () { window.print(); }, 400);
  };
</script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

