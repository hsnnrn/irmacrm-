import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "right" | "center";
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
  align = "left",
}: SortableHeaderProps) {
  const isSorted = currentSort?.key === sortKey;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1 cursor-pointer hover:text-gray-900 group select-none", 
        align === "right" && "justify-end",
        align === "center" && "justify-center",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      {isSorted ? (
        currentSort.direction === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
      )}
    </div>
  );
}

