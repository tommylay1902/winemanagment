import { createColumnHelper, SortingState } from "@tanstack/react-table";
import { Wine } from "../types/Wine";
import { Checkbox } from "@/components/ui/checkbox";
import { stringToJSDate, stringToUSDate } from "./Date";

const columnHelper = createColumnHelper<Wine>();

export const generateHeaders = (sorting: SortingState) => {
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
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Varietal
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Winery, {
      id: "Winery",
      cell: (info) => info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Winery
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Description, {
      id: "Description",
      cell: (info) => info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Description
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Type, {
      id: "Type",
      cell: (info) => info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Type
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Year, {
      id: "Year",
      cell: (info) => info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Year
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Aging, {
      id: "Aging",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Aging
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.DrinkBy, {
      id: "Drink By",
      cell: (info) => stringToUSDate(info.getValue() ? info.getValue() : ""),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Drink By
        </span>
      ),
      sortingFn: (a, b, columnId) => {
        const notValidCompareA = !a.original.DrinkBy;
        const notValidCompareB = !b.original.DrinkBy;
        const currSort = sorting.find(
          (sort: { id: string }) => sort.id === columnId
        );
        if (currSort == undefined) return 0;
        if (notValidCompareA && notValidCompareB) {
          return 0;
        } else if (notValidCompareA) {
          return currSort.desc ? -1 : 1;
        } else if (notValidCompareB) {
          return currSort.desc ? 1 : -1;
        } else {
          return (
            stringToJSDate(a.original.DrinkBy!).getTime() -
            stringToJSDate(b.original.DrinkBy!).getTime()
          );
        }
      },
    }),
    columnHelper.accessor((row) => row.Price, {
      id: "Price",
      cell: (info) => info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Price
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Premium, {
      id: "Premium",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Premium
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.SpecialOccasion, {
      id: "Special Occasion",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Special Occasion
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Notes, {
      id: "Notes",
      cell: (info) => info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Notes
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Location?.Name, {
      id: "Name",
      cell: (info) =>
        info.getValue() == null ? "No Location Specified" : info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Storage
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Location?.Row, {
      id: "Row",
      cell: (info) =>
        info.getValue() == null || info.getValue() === ""
          ? "No Row Specified"
          : info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Row
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Location?.Bin, {
      id: "Bin",
      cell: (info) =>
        info.getValue() == null || info.getValue() === ""
          ? "No Bin Specified"
          : info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Bin
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.Location?.Code, {
      id: "Code",
      cell: (info) =>
        info.getValue() == null || info.getValue() === ""
          ? "No Code Specified"
          : info.getValue(),
      header: ({ header }) => (
        <span
          onClick={(e) => {
            const handler = header.column.getToggleSortingHandler();
            if (handler) handler(e);
          }}
        >
          Code
        </span>
      ),
    }),
  ];
  return columns;
};
