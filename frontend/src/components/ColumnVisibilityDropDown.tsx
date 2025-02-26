import React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { services } from "wailsjs/go/models";
import { Table } from "@tanstack/react-table";

interface ColumnVisibilityProps {
  table: Table<services.Wine>;
}

const ColumnVisibilityDropDown: React.FC<ColumnVisibilityProps> = ({
  table,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Columns <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide() && column.id !== "select-col")
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => {
                if (!value) column.setFilterValue("");
                column.toggleVisibility(!!value);
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}

        {/* Add divider and action buttons */}
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table
                .getAllColumns()
                .filter((col) => col.getCanHide() && col.id !== "select-col")
                .forEach((col) => col.toggleVisibility(true));
            }}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table
                .getAllColumns()
                .filter((col) => col.getCanHide() && col.id !== "select-col")
                .forEach((col) => col.toggleVisibility(false));
            }}
          >
            Deselect All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnVisibilityDropDown;
