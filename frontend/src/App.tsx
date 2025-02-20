"use client";
import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { File } from "lucide-react";

import {
  AddWine,
  GetWines,
  ImportFileFromJstoGo,
} from "../wailsjs/go/main/App.js";

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
import { Button } from "./components/ui/button.js";
import { useToast } from "./hooks/use-toast.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu.js";
import { ChevronDown } from "lucide-react";
import { main } from "wailsjs/go/models.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog.js";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "./components/ui/form.js";
import { formConfig } from "./shared/form/wineForm.js";
import { Checkbox } from "./components/ui/checkbox.js";
import { getInputValue } from "./shared/util/formUtils.js";
import { stringToTimeStamp } from "./shared/util/Date.js";

// import { Button } from "./components/ui/button.js";
declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}
function App() {
  const [wines, setWines] = useState<main.Wine[]>([]);
  const [newId, setNewId] = useState<number>(-1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

  useEffect(() => {
    GetWines().then((data) => {
      setWines(data);
      setNewId(data[data.length - 1].Id);
      setIsInitialLoad(false);
    });
  }, []);

  const { toast } = useToast();

  const resetFilters = () => {
    table.getAllColumns().forEach((column) => {
      if (column.columnDef.meta?.filterVariant === "select") {
        column.setFilterValue("");
      }
    });
    table.resetColumnFilters();
    table.resetGlobalFilter();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      try {
        const file = event.target.files[0];

        // Immediately process the file
        const ab = await file.arrayBuffer();
        const u = new Uint8Array(ab);
        const base64 = btoa(String.fromCharCode(...u));

        await ImportFileFromJstoGo(base64);

        // Refresh data
        const data = await GetWines();
        setWines(data);
        setIsInitialLoad(false);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";

        toast({
          title: "Success!",
          description: `Imported ${data.length} wines successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import file",
          variant: "destructive",
        });
      }
    }
  };

  const addWine = async (wine: main.Wine) => {
    wine.Id = newId + 1;
    setNewId(newId + 1);
    if (wine.DrinkBy) {
      wine.DrinkBy = stringToTimeStamp(wine.DrinkBy);
    }
    await AddWine(JSON.stringify(wine));
    setWines((prev) => [...prev, wine]);
    toast({
      title: "Success!",
      description: `Successfully added ${wine.Varietal}`,
    });
  };

  const form = useForm<main.Wine>({
    defaultValues: {
      Winery: "",
      Varietal: "",
      Description: "",
      Type: "Red",
      Year: new Date().getFullYear(),
      Aging: false,
      Price: 0,
      Premium: false,
      SpecialOccasion: false,
      Notes: "Default notes",
      // Add other default values
    },
  });

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
      globalFilter,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getRowId: (row) => row.Id + "",
    autoResetPageIndex: false, // Add this line
    globalFilterFn: "includesString",
  });

  const [dateInputStates, setDateInputStates] = useState<
    Record<string, boolean>
  >({});
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  return (
    <>
      <div className="w-full flex justify-center mt-4">
        <div className="max-w-2xl w-full px-4">
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              table.setGlobalFilter(e.target.value);
            }}
            placeholder="Search any column..."
            className="w-full" // Make input take full width of container
          />
        </div>
      </div>
      <div className="flex justify-center mt-2">
        <Button onClick={resetFilters} variant="outline">
          Reset <strong>All</strong> filters
        </Button>
      </div>
      <div className="mt-10 ">
        <div className="flex justify-between items-center w-full rounded-md ">
          <div className="flex min-w-[300px] [-webkit-app-region:no-drag]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      column.getCanHide() && column.id !== "select-col"
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
            <Button
              variant="outline"
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            >
              View:
              {showSelectedOnly ? " Selected" : " All"}
            </Button>
            {/* future implementation */}
            {Object.keys(rowSelection).length > 0 && (
              <Button variant="outline">Locate Selected</Button>
            )}
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={onFileChange}
              />
              <div className="flex items-center p-2 border rounded hover:bg-gray-50 gap-2">
                <File className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Import File</span>
              </div>
            </label>
          </div>

          <div className="min-w-[100px] text-right">
            {Object.keys(rowSelection).length > 0 && (
              <>
                <Button
                  variant="ghost"
                  className="rounded-none border-b-2 border-r-2 border-primary bg-accent h-9 px-4 py-1 -mb-[1px] hover:bg-white hover:scale-110 hover:border-b-0 hover:border-r-0"
                >
                  Edit Wine(s)
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-none border-b-2 border-primary bg-accent h-9 px-4 py-1 -mb-[1px] hover:bg-white hover:scale-110 hover:border-b-0"
                >
                  Delete Wine(s)
                </Button>
              </>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-none border-b-2 border-l-2 border-primary bg-accent h-9 px-4 py-1 -mb-[1px] hover:bg-white hover:scale-110 hover:border-b-0 hover:border-l-0"
                >
                  Add Wine+
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Wine</DialogTitle>
                  <DialogDescription>Add Your Wine Here</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(addWine)}
                      className="space-y-4"
                    >
                      <div className="flex flex-row items-center justify-between">
                        {formConfig
                          .filter((field) => field.type === "checkbox")
                          .map((field) => (
                            <FormField
                              key={field.name}
                              control={form.control}
                              name={field.name}
                              render={({ field: formField }) => (
                                <FormItem>
                                  <FormControl className="pb-[.25vh]">
                                    <Checkbox
                                      checked={!!formField.value}
                                      onCheckedChange={(checked) => {
                                        const value =
                                          checked === "indeterminate"
                                            ? false
                                            : checked;
                                        formField.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="!m-0">
                                    {field.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                      </div>
                      {formConfig
                        .filter((field) => field.type !== "checkbox")
                        .map((field) => (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                              <FormItem>
                                {field.type === "date" ? (
                                  <div className="flex flex-col space-y-2">
                                    <FormLabel>{field.label}</FormLabel>
                                    <div className="relative">
                                      <Input
                                        {...formField}
                                        type="date"
                                        value={
                                          (formField.value as string) ?? ""
                                        }
                                        onFocus={() =>
                                          setDateInputStates((prev) => ({
                                            ...prev,
                                            [field.name]: true,
                                          }))
                                        }
                                        onBlur={() =>
                                          setDateInputStates((prev) => ({
                                            ...prev,
                                            [field.name]: false,
                                          }))
                                        }
                                      />
                                      {(formField.value ||
                                        dateInputStates[field.name]) && (
                                        <button
                                          type="button"
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                          onClick={() =>
                                            form.setValue(field.name, null)
                                          }
                                          aria-label="Clear date"
                                          tabIndex={-1}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <FormLabel>{field.label}</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...formField}
                                        placeholder={field.placeholder}
                                        type={field.type}
                                        value={getInputValue(
                                          formField.value,
                                          field.type
                                        )}
                                        onChange={(e) => {
                                          if (field.type === "number") {
                                            const value = Number(
                                              e.target.value
                                            );
                                            formField.onChange(
                                              isNaN(value) ? 0 : value
                                            );
                                          } else {
                                            formField.onChange(e.target.value);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                  </>
                                )}
                              </FormItem>
                            )}
                          />
                        ))}
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="submit">Add Wine</Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-md border max-h-[calc(100vh-155px)] overflow-auto">
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
                          <Filter column={header.column} />
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="sticky bottom-0 bg-white border-t shadow-sm p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {isInitialLoad ? (
              "Loading..."
            ) : (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, isBoolean } = column.columnDef.meta ?? {};

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
      onChange={(e) => {
        const value = e.target.value;
        if (isBoolean) {
          column.setFilterValue(value === "" ? undefined : value === "true");
        } else {
          column.setFilterValue(value === "" ? undefined : value);
        }
      }}
      value={
        isBoolean
          ? columnFilterValue === undefined
            ? ""
            : columnFilterValue
            ? "true"
            : "false"
          : columnFilterValue?.toString() ?? ""
      }
    >
      {/* See faceted column filters example for dynamic select options */}
      <option value="">All</option>
      {isBoolean ? (
        <>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </>
      ) : (
        <>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </>
      )}
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
