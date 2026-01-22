"use client";

import { useEffect } from "react";

export type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
};

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Common keyboard shortcuts for the CRM
 */
export const COMMON_SHORTCUTS = {
  NEW_CUSTOMER: { key: "n", ctrlKey: true, description: "Yeni müşteri ekle" },
  NEW_SUPPLIER: { key: "s", ctrlKey: true, description: "Yeni tedarikçi ekle" },
  NEW_POSITION: { key: "p", ctrlKey: true, description: "Yeni pozisyon ekle" },
  SEARCH: { key: "k", ctrlKey: true, description: "Ara" },
  EXPORT: { key: "e", ctrlKey: true, shiftKey: true, description: "Excel'e aktar" },
};

