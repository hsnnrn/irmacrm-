import jsPDF from "jspdf";
import { convertCurrency } from "@/lib/exchange-rates";
import type { ExchangeRates } from "@/lib/exchange-rates";

export interface FreightProposalData {
  proposalNo: string;
  date: string;
  customerName: string;
  customerAddress?: string;
  loadingPoint: string;
  unloadingPoint: string;
  cargoDescription: string;
  price: number;
  currency: string;
  validityDays: number;
}

export function generateFreightProposal(data: FreightProposalData): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138); // logistics blue
  doc.text("İRMA GLOBAL FORWARDING", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Lojistik Hizmetleri", 20, 27);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("NAVLUN TEKLİFİ", 20, 45);

  // Proposal Info
  doc.setFontSize(10);
  doc.text(`Teklif No: ${data.proposalNo}`, 20, 55);
  doc.text(`Tarih: ${data.date}`, 20, 62);

  // Customer Info
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text("MÜŞTERİ BİLGİLERİ", 20, 75);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Firma: ${data.customerName}`, 20, 85);
  if (data.customerAddress) {
    doc.text(`Adres: ${data.customerAddress}`, 20, 92);
  }

  // Transport Details
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text("TAŞIMA DETAYLARI", 20, 108);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Yükleme Noktası: ${data.loadingPoint}`, 20, 118);
  doc.text(`Boşaltma Noktası: ${data.unloadingPoint}`, 20, 125);
  doc.text(`Yük Tanımı: ${data.cargoDescription}`, 20, 132);

  // Price
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text("FİYAT BİLGİSİ", 20, 148);

  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94); // green
  doc.text(
    `${data.price.toLocaleString("tr-TR")} ${data.currency}`,
    20,
    158
  );

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`(KDV Hariç)`, 20, 165);

  // Validity
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Geçerlilik Süresi: ${data.validityDays} gün`,
    20,
    175
  );

  // Terms
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text("ŞARTLAR VE KOŞULLAR", 20, 190);

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const terms = [
    "• Fiyat yükleme ve boşaltma dahil olarak hesaplanmıştır.",
    "• Gümrük işlemleri ve vergiler fiyata dahil değildir.",
    "• Ödeme şartları: Teslimat sonrası 30 gün içinde.",
    "• Teklif belirtilen süre içinde geçerlidir.",
    "• Sigorta müşteri tarafından karşılanacaktır.",
  ];

  let yPos = 200;
  terms.forEach((term) => {
    doc.text(term, 20, yPos);
    yPos += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("İrma Global Forwarding - www.irmaglobal.com", 20, 280);
  doc.text("İletişim: info@irmaglobal.com | Tel: +90 xxx xxx xx xx", 20, 285);

  // Save PDF
  doc.save(`Navlun_Teklifi_${data.proposalNo}.pdf`);
}

export function generatePositionReport(positionData: any): void {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text("POZİSYON RAPORU", 20, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Pozisyon No: #${positionData.position_no}`, 20, 35);
  doc.text(`Durum: ${positionData.status}`, 20, 42);

  // Route
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("ROTA", 20, 55);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`${positionData.loading_point} → ${positionData.unloading_point}`, 20, 65);

  // Financial Summary
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("FİNANSAL ÖZET", 20, 80);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Satış: ${positionData.sales_price} ${positionData.sales_currency}`, 20, 90);
  doc.text(`Maliyet: ${positionData.cost_price} ${positionData.cost_currency}`, 20, 97);
  doc.text(`Kar: ${positionData.estimated_profit} ${positionData.sales_currency}`, 20, 104);

  doc.save(`Pozisyon_Raporu_${positionData.position_no}.pdf`);
}

export function generateMonthlyReport(
  positions: any[],
  invoices: any[],
  exchangeRates?: ExchangeRates | null
): void {
  const doc = new jsPDF();
  const now = new Date();
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text("İRMA GLOBAL FORWARDING", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Aylık Performans Raporu", 20, 27);

  // Report Period
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`${monthNames[now.getMonth()]} ${now.getFullYear()}`, 20, 40);

  // Statistics
  const completedPositions = positions.filter((p: any) => p.status === "COMPLETED");
  const activePositions = positions.filter((p: any) =>
    p.status === "IN_TRANSIT" || p.status === "READY_TO_DEPART"
  );

  // Toplam kar: ödenen faturalardan, TRY'ye çevirerek (finance ile uyumlu)
  const totalProfit = invoices
    .filter((inv: any) => inv.is_paid)
    .reduce((sum: number, inv: any) => {
      const amt = exchangeRates && !exchangeRates.error
        ? convertCurrency(inv.amount, inv.currency, "TRY", exchangeRates)
        : inv.amount;
      if (inv.invoice_type === "SALES") return sum + amt;
      if (inv.invoice_type === "PURCHASE") return sum - amt;
      return sum;
    }, 0);

  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text("ÖZET İSTATİSTİKLER", 20, 55);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Toplam Pozisyon: ${positions.length}`, 20, 65);
  doc.text(`Tamamlanan: ${completedPositions.length}`, 20, 72);
  doc.text(`Aktif: ${activePositions.length}`, 20, 79);
  doc.text(`Toplam Kar: ${totalProfit.toLocaleString("tr-TR")} TRY`, 20, 86);

  // Position Summary
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text("POZİSYON DETAYLARI", 20, 100);

  let yPos = 110;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  completedPositions.slice(0, 15).forEach((pos: any, index: number) => {
    const line = `${index + 1}. #${pos.position_no} - ${pos.loading_point} → ${pos.unloading_point}`;
    doc.text(line, 20, yPos);
    yPos += 7;

    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Rapor Tarihi: ${now.toLocaleDateString("tr-TR")}`, 20, 280);
  doc.text("İrma Global Forwarding - www.irmaglobal.com", 20, 285);

  // Save PDF
  doc.save(`Aylik_Rapor_${monthNames[now.getMonth()]}_${now.getFullYear()}.pdf`);
}

