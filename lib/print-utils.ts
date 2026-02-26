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
  currency: string;
  positions: {
    positionNo: number;
    loadingPoint: string;
    unloadingPoint: string;
    salesPrice: number;
    salesCurrency: string;
    status: string;
    departureDate?: string;
    deliveryDate?: string;
  }[];
  movements: {
    date: string;
    docNo: string;
    type: string;
    description: string;
    borc: number;
    alacak: number;
    balance: number;
    status?: string;
  }[];
  summary: {
    totalReceivable: number;
    totalReceived: number;
    balance: number;
  };
}

/**
 * Print customer ledger (cari) with İrma Global branding
 */
export function printCustomerLedger(data: CustomerLedgerPrintData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formatMoney = (n: number) =>
    n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cur = data.currency;

  const movementsRows = data.movements
    .map(
      (m) =>
        `<tr>
          <td>${m.date}</td>
          <td>${m.docNo || "-"}</td>
          <td>${m.description}</td>
          <td>${m.status || "-"}</td>
          <td class="text-right">${m.borc > 0 ? formatMoney(m.borc) : "-"}</td>
          <td class="text-right">${m.alacak > 0 ? formatMoney(m.alacak) : "-"}</td>
          <td class="text-right font-semibold">${formatMoney(m.balance)}</td>
        </tr>`
    )
    .join("");

  const positionsRows = data.positions
    .map(
      (p) =>
        `<tr>
          <td>#${p.positionNo}</td>
          <td>${p.loadingPoint} → ${p.unloadingPoint}</td>
          <td class="text-right">${formatMoney(p.salesPrice)} ${p.salesCurrency}</td>
          <td>${p.status}</td>
          <td>${p.departureDate || "-"}</td>
          <td>${p.deliveryDate || "-"}</td>
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
          position: fixed;
          top: 50%;
          left: 50%;
          width: 400px;
          height: 400px;
          transform: translate(-50%, -50%);
          background-image: url('/irma-logo-watermark.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.06;
          z-index: -1;
          pointer-events: none;
        }
        .header {
          border-bottom: 3px solid #c41e3a;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo-title { font-size: 22px; font-weight: bold; color: #c41e3a; }
        .logo-sub { font-size: 11px; color: #6b7280; }
        .customer-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .customer-name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
        .section-title {
          font-size: 14px; font-weight: bold; color: #1e3a8a;
          margin: 20px 0 10px 0;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 4px;
        }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th {
          background: #1e3a8a;
          color: white;
          padding: 10px 12px;
          text-align: left;
          font-size: 12px;
        }
        td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 12px; }
        tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .summary-box {
          display: flex;
          gap: 24px;
          margin-top: 20px;
          padding: 16px;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
        }
        .summary-item { flex: 1; }
        .summary-label { font-size: 11px; color: #6b7280; }
        .summary-value { font-size: 16px; font-weight: bold; color: #1e3a8a; }
        .footer {
          margin-top: 32px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
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
        <div style="margin-top:8px;"><strong>Cari Döviz:</strong> ${data.currency}</div>
      </div>

      <div class="section-title">SEFER LİSTESİ</div>
      <table>
        <thead>
          <tr>
            <th>Poz. No</th>
            <th>Rota</th>
            <th class="text-right">Satış Tutarı</th>
            <th>Durum</th>
            <th>Yükleme</th>
            <th>Teslimat</th>
          </tr>
        </thead>
        <tbody>${positionsRows || "<tr><td colspan='6'>Kayıt bulunamadı.</td></tr>"}</tbody>
      </table>

      <div class="section-title">CARİ HESAP HAREKETLERİ</div>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Belge No</th>
            <th>İşlem / Açıklama</th>
            <th>Sefer Durumu</th>
            <th class="text-right">Borç</th>
            <th class="text-right">Alacak</th>
            <th class="text-right">Bakiye</th>
          </tr>
        </thead>
        <tbody>${movementsRows || "<tr><td colspan='7'>Hareket bulunamadı.</td></tr>"}</tbody>
      </table>

      <div class="summary-box">
        <div class="summary-item">
          <div class="summary-label">Toplam Borç</div>
          <div class="summary-value">${formatMoney(data.summary.totalReceivable)} ${cur}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Toplam Alacak (Tahsilat)</div>
          <div class="summary-value">${formatMoney(data.summary.totalReceived)} ${cur}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Kalan Bakiye</div>
          <div class="summary-value">${formatMoney(data.summary.balance)} ${cur}</div>
        </div>
      </div>

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

