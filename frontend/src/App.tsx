import { useEffect, useState } from "react";

import { GetWines } from "../wailsjs/go/main/App.js";
import { Wine } from "./shared/types/Wine.js";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table.js";
import { generateHeaders } from "./shared/util/GenerateWineTableHeaders.js";

function App() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  useEffect(() => {
    GetWines().then((data) => {
      setWines(data);
    });
  }, []);

  useEffect(() => {
    console.log(rowSelection);
    console.log(Object.keys(rowSelection).length);
  }, [rowSelection]);

  const columns = generateHeaders(sorting);

  const table = useReactTable({
    data: wines,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection, //hoist up the row selection state to your own scope
    state: {
      sorting,
      rowSelection, //pass the row selection state back to the table instance
    },
    onSortingChange: setSorting,
    getRowId: (row) => row.Id,
  });

  return (
    <div className="p-2 mt-10">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={(e) => {
                    const handler = header.column.getToggleSortingHandler();
                    if (handler) handler(e);
                  }}
                  className=" hover:cursor-pointer hover:font-bold"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={"p-11"}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default App;
