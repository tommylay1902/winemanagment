"use client";
import { useEffect, useRef, useState } from "react";
import { CalendarIcon, File } from "lucide-react";

import {
  AddWine,
  GetWines,
  ImportFileFromJstoGo,
} from "../wailsjs/go/main/App.js";

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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
import { stringToUSDate } from "./shared/util/Date.js";
import { Filter } from "./components/ColumnFilter.js";

import { Button } from "./components/ui/button.js";
import { Wine } from "./shared/types/Wine.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover.js";
import { Calendar } from "./components/ui/calendar.js";
import { cn } from "./lib/utils.js";

function App() {
  const [wines, setWines] = useState<main.Wine[]>([]);
  const [newId, setNewId] = useState<number>(0);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<any>([]);
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    GetWines().then((data) => {
      setWines(data);
      if (data.length > 0) setNewId(data[data.length - 1].Id);
      setIsInitialLoad(false);
    });
  }, []);

  useEffect(() => {
    if (wines.length > 0) {
      setNewId(wines[wines.length - 1].Id);
    }
  }, [wines]);

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
    console.log(wine);
    wine.Id = newId + 1;
    setNewId(newId + 1);
    wine.DrinkBy = date;
    if (date === null || date === "") wine.DrinkBy = null;

    // if (wine.DrinkBy) {
    //   wine.DrinkBy = stringToTimeStamp(wine.DrinkBy);
    // }
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
      Notes: "",
      DrinkBy: "",
      // Add other default values
    },
  });

  const columns = generateHeaders(sorting);

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
    getRowId: (row) => row.Id + "",
    autoResetPageIndex: false, // Add this line
    globalFilterFn: "includesString",
  });

  // const [dateInputStates, setDateInputStates] = useState<
  //   Record<string, boolean>
  // >({});
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  return (
    <>
      <div className="w-full flex justify-center mt-4 fixed top-0 left-0 right-0">
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
      <div className="flex justify-center mt-[8vh]">
        <Button onClick={resetFilters} variant="outline">
          Reset <strong>All</strong> filters
        </Button>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center w-full rounded-md max-h-[33vh] min-h-[3vh]">
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
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-[240px] justify-start text-left font-normal",
                                              !date && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon />
                                            {date ? (
                                              stringToUSDate(date)
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-auto p-0"
                                          align="start"
                                        >
                                          <Calendar
                                            mode="single"
                                            selected={new Date(date)}
                                            onSelect={(date) => {
                                              if (date) {
                                                setDate(date.toISOString());
                                              }
                                            }}
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                      {(formField.value || date) && (
                                        <Button
                                          type="button"
                                          className="ml-3 mb-3"
                                          onClick={() => {
                                            form.setValue(field.name, "");
                                            setDate("");
                                          }}
                                          aria-label="Clear date"
                                          tabIndex={-1}
                                        >
                                          Clear Date
                                        </Button>
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

        <div className="rounded-md border max-h-[calc(100vh-33vh)] overflow-auto">
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
        <div className="sticky bottom-0 bg-white border-t  p-2">
          <div className="text-sm text-muted-foreground leading-tight text-center">
            {isInitialLoad ? (
              "Loading..."
            ) : (
              <>
                {table.getSelectedRowModel().rows.length} of{" "}
                {table.getRowModel().rows.length} row(s) selected.
                {table.getState().columnFilters.length > 0 && (
                  <span className="ml-2">
                    (From {table.getPreFilteredRowModel().rows.length} total)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
