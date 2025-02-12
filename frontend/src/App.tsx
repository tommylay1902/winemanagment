import { InputHTMLAttributes, useEffect, useRef, useState } from "react";

import { GetWines, ImportFileFromJstoGo } from "../wailsjs/go/main/App.js";
import { Wine } from "./shared/types/Wine.js";
import {
  Column,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowData,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table.js";
import { generateHeaders } from "./shared/util/GenerateWineTableHeaders.js";
import { Input } from "./components/ui/input.js";
import { Label } from "./components/ui/label.js";
import { Button } from "./components/ui/button.js";
import { useToast } from "./hooks/use-toast.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.js";
import { ChevronDown } from "lucide-react";

// import { Button } from "./components/ui/button.js";
declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}
function App() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState<ColumnFiltersState>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    Type: false,
    Year: false,
    Aging: false,
    Description: false,
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

  useEffect(() => {
    GetWines().then((data) => {
      setWines(data);
    });
  }, []);

  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state
    if (event.target.files != null) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onFileUpload = async () => {
    if (selectedFile == null) {
      console.log("exit");
      return;
    }

    // Create an object of formData

    const ab: ArrayBuffer = await selectedFile.arrayBuffer();
    const u = new Uint8Array(ab);
    const base64 = btoa(String.fromCharCode(...u)); // Convert to base64

    // Send the base64 string to the Go backend
    await ImportFileFromJstoGo(base64);

    //refresh data
    const data = await GetWines();
    setWines(data);
    setSelectedFile(null);
    if (fileInputRef.current != null) fileInputRef.current.value = "";

    toast({
      title: "Success!",
      description: `Successfully imported data with ${data.length} rows`,
    });
  };

  const columns = generateHeaders(sorting);

  const table = useReactTable({
    data: wines,
    columns,
    filterFns: {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setFiltering,
    state: {
      columnFilters: filtering,
      sorting,
      rowSelection,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getRowId: (row) => row.Id,
  });

  return (
    <div className=" mt-10">
      <div className="flex justify-center items-center">
        <div className="flex flex-row gap-2 pl-3 items-center">
          <div className="flex flex-col items-center">
            <Label htmlFor="import" className="whitespace-nowrap max-w-xs">
              Import Excel
            </Label>
            <Input
              id="import"
              type="file"
              ref={fileInputRef}
              className="border rounded max-w-sm"
              onChange={onFileChange}
            />
          </div>
          <div>
            <Button
              className={`h-[40px] flex items-center justify-center max-w-xs mt-3 ${
                selectedFile == null ? "hidden" : ""
              }`}
              onClick={onFileUpload}
            >
              Upload
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-start w-full pl-4">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide() && column.id !== "select-col"
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => {
                      //reset the filter value
                      if (!value) {
                        column.setFilterValue("");
                      }
                      column.toggleVisibility(!!value);
                    }}
                    onSelect={(e) => e.preventDefault()} // Prevent menu close on select
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className=" hover:cursor-pointer hover:font-bold  p-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanFilter() ? (
                    <div>
                      <Filter column={header.column} />
                    </div>
                  ) : null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={row.getIsSelected() ? " bg-slate-400" : ""}
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
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      <option value="complicated">complicated</option>
      <option value="relationship">relationship</option>
      <option value="single">single</option>
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
    // See faceted column filters example for datalist search suggestions
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default App;
