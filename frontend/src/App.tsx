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
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table.js";
import { Checkbox } from "./components/ui/checkbox.js";

function App() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  useEffect(() => {
    GetWines().then((data) => {
      setWines(data);
    });
  }, []);

  useEffect(() => {
    console.log(rowSelection);
    console.log(Object.keys(rowSelection).length);
  }, [rowSelection]);

  const columnHelper = createColumnHelper<Wine>();
  const columns = [
    columnHelper.display({
      id: "select-col",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onClick={table.getToggleAllRowsSelectedHandler()}
          onChange={table.getToggleAllRowsSelectedHandler()} //or getToggleAllPageRowsSelectedHandler
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onClick={row.getToggleSelectedHandler()}
          onChange={(e) => {
            const target = e.target as HTMLInputElement; // Type assertion
            row.getToggleSelectedHandler()(target.checked); // Pass the checked value
          }}
        />
      ),
    }),

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
      id: "Notes",
      cell: (info) => info.getValue(),
      header: () => <span>Notes</span>,
    }),
    columnHelper.accessor((row) => row.Location?.Name, {
      id: "Name",
      cell: (info) =>
        info.getValue() == null ? "No Location Specified" : info.getValue(),
      header: () => <span>Row</span>,
    }),
    columnHelper.accessor((row) => row.Location?.Row, {
      id: "Row",
      cell: (info) =>
        info.getValue() == null || info.getValue() === ""
          ? "No Row Specified"
          : info.getValue(),
      header: () => <span>Row</span>,
    }),
    columnHelper.accessor((row) => row.Location?.Bin, {
      id: "Bin",
      cell: (info) =>
        info.getValue() == null || info.getValue() === ""
          ? "No Bin Specified"
          : info.getValue(),
      header: () => <span>Bin</span>,
    }),
    columnHelper.accessor((row) => row.Location?.Code, {
      id: "Code",
      cell: (info) =>
        info.getValue() == null || info.getValue() === ""
          ? "No Code Specified"
          : info.getValue(),
      header: () => <span>Code</span>,
    }),
  ];
  const table = useReactTable({
    data: wines,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection, //hoist up the row selection state to your own scope
    state: {
      rowSelection, //pass the row selection state back to the table instance
    },
    getRowId: (row) => row.Id,
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
            <tr key={row.id} className={"p-11"}>
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
