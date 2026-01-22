import { useState, useMemo } from "react";

type SortConfig<T> = {
  key: keyof T | string;
  direction: "asc" | "desc";
} | null;

export function useTableFeatures<T>(
  data: T[],
  initialItemsPerPage = 10,
  initialSort: SortConfig<T> = null
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);

  // Sorting Logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a: any, b: any) => {
      // Helper to access nested properties like "customers.company_name"
      const getValue = (obj: any, path: string) => {
        return path.split(".").reduce((o, i) => (o ? o[i] : null), obj);
      };

      const aValue = getValue(a, sortConfig.key as string);
      const bValue = getValue(b, sortConfig.key as string);

      // Handle nulls/undefined
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // String comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Number/Date comparison
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    // Reset to page 1 if data length changes and current page is out of bounds
    // This effect is handled by the component using this hook usually, 
    // but here we just ensure slice is safe.
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Auto-fix current page if it exceeds total pages after filtering
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const requestSort = (key: keyof T | string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return {
    data: paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    totalItems: sortedData.length,
  };
}

