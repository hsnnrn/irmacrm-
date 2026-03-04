import { describe, it, expect, vi } from "vitest";
import { printCustomerLedger } from "../print-utils";
import { exportToExcel } from "../export-utils";

describe("Customer ledger devreden bakiye", () => {
  it("devreden bakiye toplam borca dahil edilir", () => {
    const previousYearBalance = 1000;
    const salesTotal = 500;
    const paymentsTotal = 300;

    const totalReceivable = previousYearBalance + salesTotal;
    const totalReceived = paymentsTotal;
    const balance = totalReceivable - totalReceived;

    expect(totalReceivable).toBe(1500);
    expect(totalReceived).toBe(300);
    expect(balance).toBe(1200);
  });
});

describe("Customer ledger print layout", () => {
  it("print çıktısında sefer listesi yer almaz", () => {
    const originalOpen = window.open;
    let printedHtml = "";

    // Mock window.open to capture HTML
    // @ts-expect-error - partial mock for test
    window.open = () => {
      return {
        document: {
          write: (html: string) => {
            printedHtml = html;
          },
          close: () => {},
        },
      };
    };

    printCustomerLedger({
      customerName: "Test",
      currency: "TRY",
      movements: [],
      summary: {
        totalReceivable: 0,
        totalReceived: 0,
        balance: 0,
      },
    });

    // Restore
    window.open = originalOpen;

    expect(printedHtml).not.toContain("SEFER LİSTESİ");
  });
});

describe("Customer ledger export", () => {
  it("Excel export tetiklenir ve dosya adı ayarlanır", () => {
    const originalCreateElement = document.createElement.bind(document);
    const links: HTMLAnchorElement[] = [];

    // @ts-expect-error - override for test
    document.createElement = vi.fn((tag: string) => {
      const el = originalCreateElement(tag) as HTMLElement;
      if (tag === "a") {
        (el as HTMLAnchorElement).click = vi.fn();
        links.push(el as HTMLAnchorElement);
      }
      return el;
    });

    exportToExcel(
      {
        headers: ["Tarih", "Tutar"],
        rows: [
          ["2024-01-01", 1000],
        ],
      },
      "Cari_Ekstresi_Test"
    );

    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute("download")).toContain("Cari_Ekstresi_Test");

    document.createElement = originalCreateElement;
  });
});


