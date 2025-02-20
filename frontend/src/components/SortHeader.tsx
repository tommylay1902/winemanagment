import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { Header } from "@tanstack/react-table";

interface SortHeaderProps<TData> {
  header: Header<TData, unknown>;
  title: string;
}

export const SortHeader = <TData,>({
  header,
  title,
}: SortHeaderProps<TData>) => (
  <div
    className="flex items-center gap-2 hover:cursor-pointer group pb-1"
    onClick={header.column.getToggleSortingHandler()}
  >
    <div className="relative h-4 w-4 flex items-center justify-center">
      {/* Always show chevrons with hover effect */}
      <ChevronsUpDown
        className={`absolute transition-all duration-400 
          opacity-50 group-hover:opacity-100
          ${
            !header.column.getIsSorted()
              ? "scale-100 group-hover:scale-110"
              : "scale-0"
          }`}
      />

      {/* Ascending arrow */}
      <ArrowUp
        className={`absolute transition-all duration-400
          ${
            header.column.getIsSorted() === "asc"
              ? "opacity-50 group-hover:opacity-100 group-hover:scale-110"
              : "opacity-0 scale-0"
          }`}
      />

      {/* Descending arrow */}
      <ArrowDown
        className={`absolute transition-all duration-400 
          ${
            header.column.getIsSorted() === "desc"
              ? "opacity-50 group-hover:opacity-100 group-hover:scale-110"
              : "opacity-0 scale-0"
          }`}
      />
    </div>
    <span className="transition-opacity duration-400 opacity-80 group-hover:opacity-100 group-hover:scale-110">
      {title}
    </span>
  </div>
);
