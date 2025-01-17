import { useEffect, useState } from "react";
// import {
//   generateLocationMatrix,
//   WineStorage,
// } from "./shared/types/WineStorage";
import { GetWines } from "../wailsjs/go/main/App.js";
import { Wine } from "./shared/types/Wine.js";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table.js";

function App() {
  const [wines, setWines] = useState<Wine[]>([]);
  useEffect(() => {
    GetWines().then((data) => {
      setWines(data);
    });
  }, []);

  const columnHelper = createColumnHelper<Wine>();
  const columns = [
    columnHelper.accessor("Varietal", {
      cell: (info) => info.getValue(),
      header: "Varietal",
    }),
    columnHelper.accessor((row) => row.Winery, {
      id: "Winery",
      cell: (info) => info.getValue(),
      header: () => <span>Winery</span>,
    }),
    columnHelper.accessor((row) => row.Description, {
      id: "Description",
      cell: (info) => info.getValue(),
      header: () => <span>Description</span>,
    }),
    columnHelper.accessor((row) => row.Type, {
      id: "Type",
      cell: (info) => info.getValue(),
      header: () => <span>Type</span>,
    }),
    columnHelper.accessor((row) => row.Year, {
      id: "Year",
      cell: (info) => info.getValue(),
      header: () => <span>Year</span>,
    }),
    columnHelper.accessor((row) => row.Aging, {
      id: "Aging",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      header: () => <span>Aging</span>,
    }),
    columnHelper.accessor((row) => row.DrinkBy, {
      id: "Drink By",
      cell: (info) => info.getValue(),
      header: () => <span>Drink By</span>,
    }),
    columnHelper.accessor((row) => row.Price, {
      id: "Price",
      cell: (info) => info.getValue(),
      header: () => <span>Price</span>,
    }),
    columnHelper.accessor((row) => row.Premium, {
      id: "Premium",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      header: () => <span>Premium</span>,
    }),
    columnHelper.accessor((row) => row.SpecialOccasion, {
      id: "Special Occasion",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      header: () => <span>Special Occasion</span>,
    }),
    columnHelper.accessor((row) => row.Notes, {
      id: "Special Occasion",
      cell: (info) => info.getValue(),
      header: () => <span>Notes</span>,
    }),
    columnHelper.accessor((row) => row.Location, {
      id: "Location",
      cell: (info) =>
        info.getValue() == null ? "No Location Specified" : info.getValue(),
      header: () => <span>Notes</span>,
    }),
  ];
  const table = useReactTable({
    data: wines,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </TableBody>
        {/* <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot> */}
      </Table>
    </div>
  );
}

export default App;
