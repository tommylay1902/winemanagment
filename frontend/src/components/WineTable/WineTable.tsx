import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Filter } from "../ColumnFilter";
import { services } from "wailsjs/go/models";

interface WineTableProps {
  table: TanstackTable<services.Wine>;
  showSelectedOnly: boolean;
  filterResetCounter: number;
}

const WineTable = ({
  table,
  showSelectedOnly,
  filterResetCounter,
}: WineTableProps) => {
  return (
    <Table className="">
      <TableHeader className="bg-slate-200 sticky top-0 z-100 border-t shadow-sm p-4 ">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="p-4 sticky top-0 text-black font-bold"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                {header.column.getCanFilter() ? (
                  <div>
                    <Filter
                      column={header.column}
                      resetKey={filterResetCounter}
                    />
                  </div>
                ) : null}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="relative">
        {(showSelectedOnly
          ? table.getSelectedRowModel().rows
          : table.getRowModel().rows
        ).map((row) => (
          <TableRow
            key={row.id}
            className={row.getIsSelected() ? "bg-slate-400" : ""}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WineTable;
