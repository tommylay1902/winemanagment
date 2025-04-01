import { Wine } from "@/shared/types/Wine";
import { generateHeaders } from "@/shared/util/GenerateWineTableHeaders";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { services } from "wailsjs/go/models";

export function useWineTable(wines: services.Wine[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    Winery: false,
    Type: false,
    Year: false,
    Aging: false,
    Description: true,
    Notes: false,
    Name: false,
    Price: false,
    Premium: false,
    "Special Occasion": false,
    "Drink By": false,
    Row: false,
    Bin: false,
    Code: false,
  });
  const [globalFilter, setGlobalFilter] = useState<any>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = useMemo(() => generateHeaders(sorting), [sorting]);

  const table = useReactTable({
    data: wines,
    columns,
    filterFns: {
      numericRange: (row, columnId, filterValue) => {
        const value = row.getValue(columnId) as number;
        const [min, max] = filterValue || [null, null];

        if (min !== null && max !== null) return value >= min && value <= max;
        if (min !== null) return value >= min;
        if (max !== null) return value <= max;
        return true;
      },
    },
    getCoreRowModel: getCoreRowModel<Wine>(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setFiltering,
    enableRowSelection: true,
    state: {
      columnFilters: filtering,
      sorting,
      rowSelection,
      columnVisibility,
      globalFilter,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getRowId: (row) => row.ID + "",
    autoResetPageIndex: false, // Add this line
    globalFilterFn: "includesString",
  });

  return { table, rowSelection, globalFilter };
}
