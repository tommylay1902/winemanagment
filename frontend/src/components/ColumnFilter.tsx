import { Column } from "@tanstack/react-table";
import { InputHTMLAttributes, useEffect, useState } from "react";

export function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant, isBoolean, isNumeric } = column.columnDef.meta ?? {};

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
