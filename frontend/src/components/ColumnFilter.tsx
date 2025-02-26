import { Column } from "@tanstack/react-table";
import { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { GetAllWineries } from "../../wailsjs/go/main/App";
import { services } from "wailsjs/go/models";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

export function Filter({ column }: { column: Column<any, unknown> }) {
  const [wineries, setWineries] = useState<services.Winery[]>([]);
  // const [_, setLoading] = useState(true);
  const [selectedWineryNames, setSelectedWineryNames] = useState<string[]>([]);
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, isBoolean, isNumeric } = column.columnDef.meta ?? {};

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

  const handleSelectAll = () => {
    setSelectedWineryNames(wineries.map((w) => w.Name));
  };

  const handleDeselectAll = () => {
    setSelectedWineryNames([]);
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
        className="w-48 max-h-64 overflow-y-auto"
      >
        {wineries.map((w) => (
          <DropdownMenuCheckboxItem
            key={w.Name}
            checked={selectedWineryNames.includes(w.Name)}
            onCheckedChange={() => handleSelectWinery(w.Name)}
            onSelect={(e) => e.preventDefault()}
          >
            {w.Name}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-1 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-start"
            onClick={handleSelectAll}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-start"
            onClick={handleDeselectAll}
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
