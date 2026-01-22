/**
 * Excel/CSV Export Utilities
 */

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData, filename: string): void {
  const csvContent = [
    data.headers.join(","),
    ...data.rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          // Escape commas and quotes
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel format (XLSX-like CSV)
 */
export function exportToExcel(data: ExportData, filename: string): void {
  // For now, we'll use CSV with .xlsx extension (Excel can open it)
  // For full Excel support, you'd need a library like xlsx
  exportToCSV(data, filename);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(
  amount: number,
  currency: string = "TRY"
): string {
  return `${amount.toFixed(2)} ${currency}`;
}

