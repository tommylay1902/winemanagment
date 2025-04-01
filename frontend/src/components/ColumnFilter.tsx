"use client";

import { Column } from "@tanstack/react-table";
import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { AddWinery, GetAllWineries } from "../../wailsjs/go/main/App";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import {
  wineryFormSchema,
  WineryFormValues,
} from "@/shared/form/zod/winerySchema";
import { Winery } from "@/shared/types/Winery";

export function Filter({
  column,
  resetKey,
}: {
  column: Column<any, unknown>;
  resetKey: number;
}) {
  const [wineries, setWineries] = useState<Winery[]>([]);
  // const [_, setLoading] = useState(true);
  const [selectedWineryNames, setSelectedWineryNames] = useState<string[]>([]);
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, isBoolean, isNumeric } = column.columnDef.meta ?? {};

  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter wineries based on search query
  const filteredWineries = wineries.filter((winery) =>
    winery.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addWineryForm = useForm<WineryFormValues>({
    resolver: zodResolver(wineryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const addNewWinery = async (values: WineryFormValues) => {
    const id = await AddWinery(JSON.stringify(values));
    const newWinery: Winery = { ID: id, Name: values.name };
    setWineries((prev) => [...prev, newWinery]);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchQuery]);

  // Winery-specific effects
  useEffect(() => {
    if (filterVariant === "select-winery") {
      const fetchWineries = async () => {
        try {
          const data = await GetAllWineries();
          setWineries(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchWineries();
    }
  }, [filterVariant]);

  useEffect(() => {
    if (filterVariant === "select-winery") {
      const filterValue = column.getFilterValue();
      if (Array.isArray(filterValue)) {
        setSelectedWineryNames(
          filterValue.filter((v) => typeof v === "string")
        );
      }
    }
  }, [column, filterVariant]);

  useEffect(() => {
    if (filterVariant === "select-winery") {
      column.setFilterValue(
        selectedWineryNames.length > 0 ? selectedWineryNames : undefined
      );
    }
  }, [selectedWineryNames, column, filterVariant]);

  const handleSelectWinery = (
    winery: string
    // column: ColumnFiltersColumn<any>
  ) => {
    setSelectedWineryNames((prev) =>
      prev.includes(winery)
        ? prev.filter((name) => name !== winery)
        : [...prev, winery]
    );
    // column.setFilterValue(selectedWineryNames);
  };

  useEffect(() => {
    if (filterVariant === "select-winery") {
      setSelectedWineryNames([]);
    }
  }, [resetKey, filterVariant]);

  const handleSelectAll = (wineriesToSelect: Winery[]) => {
    setSelectedWineryNames((prev) => [
      ...new Set([...prev, ...wineriesToSelect.map((w) => w.Name)]),
    ]);
  };

  const handleDeselectAll = (wineriesToDeselect: Winery[]) => {
    setSelectedWineryNames((prev) =>
      prev.filter((name) => !wineriesToDeselect.some((w) => w.Name === name))
    );
  };

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) => {
            const current = (columnFilterValue || []) as [number, number];
            column.setFilterValue([
              value ? Number(value) : undefined,
              current[1],
            ]);
          }}
          placeholder={`Min ${isNumeric ? "(USD)" : ""}`}
          className="w-24 border shadow rounded"
          step={isNumeric ? "0.01" : "1"}
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) => {
            const current = (columnFilterValue || []) as [number, number];
            column.setFilterValue([
              current[0],
              value ? Number(value) : undefined,
            ]);
          }}
          placeholder={`Max ${isNumeric ? "(USD)" : ""}`}
          className="w-24 border shadow rounded"
          step={isNumeric ? "0.01" : "1"}
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
  ) : filterVariant === "range-date" ? (
    <>
      <DebouncedInput
        type="date"
        value={(columnFilterValue as [string, string])?.[0] ?? ""}
        onChange={(value) => {
          const current = (columnFilterValue || []) as [Date, Date];
          column.setFilterValue([
            value ? Number(value) : undefined,
            current[1],
          ]);
        }}
        placeholder={`Min ${isNumeric ? "(USD)" : ""}`}
        className="w-24 border shadow rounded"
        step={isNumeric ? "0.01" : "1"}
      />
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(value) => {
          const current = (columnFilterValue || []) as [number, number];
          column.setFilterValue([
            current[0],
            value ? Number(value) : undefined,
          ]);
        }}
        placeholder={`Max ${isNumeric ? "(USD)" : ""}`}
        className="w-24 border shadow rounded"
        step={isNumeric ? "0.01" : "1"}
      />
    </>
  ) : filterVariant === "select-winery" ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          {selectedWineryNames.length > 0 ? (
            <>
              <span>{selectedWineryNames.length}</span>
              <span>Selected</span>
            </>
          ) : (
            "All Wineries"
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 max-h-[50vh] overflow-y-auto p-0"
      >
        <div className="sticky top-0 bg-background z-10 p-2 border-b">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search wineries..."
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
        </div>

        <ScrollArea className="pb-0 [&>div]:!p-0 overflow-y-auto">
          <div className="flex flex-col">
            {filteredWineries.map((w) => (
              <DropdownMenuCheckboxItem
                key={w.Name}
                checked={selectedWineryNames.includes(w.Name)}
                onCheckedChange={() => handleSelectWinery(w.Name)}
                onSelect={(e) => e.preventDefault()}
                className="text-sm"
                onKeyDown={(e) => {
                  // Prevent default dropdown keyboard navigation when typing in search
                  if (e.target instanceof HTMLInputElement) {
                    e.stopPropagation();
                  }
                }}
              >
                {w.Name}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </ScrollArea>

        {/* <DropdownMenuSeparator /> */}
        <div className="sticky bottom-0 m-0 p-0 bg-background border-t shadow-[0_-4px_6px_-4px_rgba(0,0,0,0.1)] z-10 ">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 justify-start hover:bg-accent/50"
              >
                Add Winery
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Winery</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Form {...addWineryForm}>
                  <form
                    onSubmit={addWineryForm.handleSubmit(addNewWinery)}
                    className="space-y-8"
                  >
                    <FormField
                      control={addWineryForm.control}
                      name="name"
                      render={({ field: formField }) => {
                        return (
                          <FormItem>
                            <FormLabel>{formField.name}</FormLabel>
                            <FormControl>
                              <Input placeholder="Justin" {...formField} />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                    <DialogClose asChild>
                      <Button type="submit">Add New Winery</Button>
                    </DialogClose>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-start hover:bg-accent/50"
            onClick={() => handleSelectAll(filteredWineries)}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-start hover:bg-accent/50"
            onClick={() => handleDeselectAll(filteredWineries)}
          >
            Deselect All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
  );
}

// A typical debounced input react component
// DebouncedInput.tsx
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
  const [inputValue, setInputValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sync with external value changes
  useEffect(() => {
    // Only update if there's no active typing session
    if (!timeoutRef.current) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // Handle input changes with debounce
  const handleChange = (value: string | number) => {
    setInputValue(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onChange(value);
      timeoutRef.current = undefined;
    }, debounce);
  };

  return (
    <input
      {...props}
      value={inputValue}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
