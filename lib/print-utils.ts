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
 * Print customer ledger (cari) with İrma Global branding — multi-currency
 */
export function printCustomerLedger(data: CustomerLedgerPrintData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formatMoney = (n: number) =>
    n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const movementsRows = data.movements
    .map(
      (m) =>
        `<tr>
          <td>${m.date}</td>
          <td>${m.docNo || "-"}</td>
          <td>${m.description}</td>
          <td>${m.status || "-"}</td>
          <td class="text-center"><span class="cur-badge">${m.currency}</span></td>
          <td class="text-right borc">${m.borc > 0 ? formatMoney(m.borc) : "-"}</td>
          <td class="text-right alacak">${m.alacak > 0 ? formatMoney(m.alacak) : "-"}</td>
        </tr>`
    )
    .join("");

  const summaryRows = data.currencySummaries
    .map(
      (s) =>
        `<tr>
          <td><span class="cur-badge">${s.currency}</span></td>
          <td class="text-right borc">${formatMoney(s.totalBorc)} ${s.currency}</td>
          <td class="text-right alacak">${formatMoney(s.totalAlacak)} ${s.currency}</td>
          <td class="text-right ${s.balance > 0 ? "borc" : s.balance < 0 ? "alacak" : ""} font-bold">
            ${formatMoney(s.balance)} ${s.currency}
            ${s.balance > 0 ? " (Borçlu)" : s.balance < 0 ? " (Alacaklı)" : ""}
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cari Hesap Özeti - ${data.customerName}</title>
      <meta charset="utf-8">
      <style>
        @media print {
          @page { margin: 1.5cm; }
          body { margin: 0; padding: 0; }
        }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; position: relative; }
        body::before {
          content: "";
          position: fixed; top: 50%; left: 50%;
          width: 400px; height: 400px;
          transform: translate(-50%, -50%);
          background-image: url('/irma-logo-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: contain;
          opacity: 0.06; z-index: -1; pointer-events: none;
        }
        .header { border-bottom: 3px solid #c41e3a; padding-bottom: 16px; margin-bottom: 24px; }
        .logo-title { font-size: 22px; font-weight: bold; color: #c41e3a; }
        .logo-sub { font-size: 11px; color: #6b7280; }
        .customer-box {
          background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
          padding: 16px; margin-bottom: 24px;
        }
        .customer-name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
        .section-title {
          font-size: 14px; font-weight: bold; color: #1e3a8a;
          margin: 20px 0 10px 0; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px;
        }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #1e3a8a; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
        td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 12px; }
        tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .borc { color: #dc2626; }
        .alacak { color: #059669; }
        .cur-badge {
          display: inline-block; background: #e5e7eb; color: #374151;
          border-radius: 4px; padding: 1px 6px; font-size: 11px; font-weight: bold;
        }
        .summary-note {
          font-size: 11px; color: #6b7280; margin-bottom: 8px; font-style: italic;
        }
        .footer {
          margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb;
          text-align: center; font-size: 11px; color: #6b7280;
        }
        .footer strong { color: #c41e3a; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-title">İRMA GLOBAL LOJİSTİK</div>
        <div class="logo-sub">Uluslararası Taşımacılık ve Lojistik Hizmetleri</div>
      </div>

      <div class="customer-box">
        <div class="customer-name">${data.customerName}</div>
        ${data.taxId ? `<div>Vergi No: ${data.taxId}</div>` : ""}
        ${data.contactPerson ? `<div>Yetkili: ${data.contactPerson}</div>` : ""}
      </div>

      <div class="section-title">CARİ HESAP HAREKETLERİ</div>
      <p class="summary-note">Her hareket kendi döviz cinsinde gösterilmektedir. Otomatik döviz çevirimi yapılmamıştır.</p>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Belge No</th>
            <th>İşlem / Açıklama</th>
            <th>Sefer Durumu</th>
            <th class="text-center">Döviz</th>
            <th class="text-right">Borç</th>
            <th class="text-right">Alacak</th>
          </tr>
        </thead>
        <tbody>${movementsRows || "<tr><td colspan='7'>Hareket bulunamadı.</td></tr>"}</tbody>
      </table>

      <div class="section-title">DÖVİZ BAZLI ÖZET</div>
      <table>
        <thead>
          <tr>
            <th>Döviz</th>
            <th class="text-right">Toplam Borç</th>
            <th class="text-right">Toplam Alacak</th>
            <th class="text-right">Bakiye</th>
          </tr>
        </thead>
        <tbody>${summaryRows || "<tr><td colspan='4'>Hareket bulunamadı.</td></tr>"}</tbody>
      </table>

      <div class="footer">
        Yazdırma Tarihi: ${new Date().toLocaleString("tr-TR")} |
        <strong>İrma Global Lojistik</strong> | www.irmaglobal.com
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

