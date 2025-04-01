"use client";
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { UpdateWines } from "../wailsjs/go/main/App.js";
import { Input } from "./components/ui/input.js";
import { services } from "wailsjs/go/models.js";
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

import { Button } from "./components/ui/button.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover.js";
import { Calendar } from "./components/ui/calendar.js";
import { cn } from "./lib/utils.js";
import ColumnVisibilityDropDown from "./components/ColumnVisibilityDropDown.js";
import FileImporter from "./components/FileImporter.js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select.js";
import { useWineData } from "./hooks/useWineData.js";
import WineTable from "./components/WineTable/WineTable.js";
import { useWineTable } from "./hooks/useWineTable.js";
import { NewWine, useWineActions } from "./hooks/useWineAction.js";

function App() {
  const [updatedWines, setUpdatedWines] = useState<services.Wine[]>([]);
  const [filterResetCounter, setFilterResetCounter] = useState(0);
  const [_initalLoad, setIsInitialLoad] = useState(true);
  const [date, setDate] = useState<string>("");
  const [selectedWines, setSelectedWines] = useState<services.Wine[]>([]);
  const [currentEditIndex, setCurrentEditIndex] = useState(0);
  const [_isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const { wines, setWines, wineryList } = useWineData();
  //updateWine, batchUpdateWines
  const { addWine, deleteWines } = useWineActions(setWines);

  const { table, rowSelection } = useWineTable(wines);

  const addForm = useForm<NewWine>({
    defaultValues: {
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
    },
  });

  const editForm = useForm<services.Wine>({
    defaultValues: {
      WineryID: undefined,
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

  useEffect(() => {
    if (selectedWines.length > 0) {
      // Get the current wine being edited
      const currentWine = selectedWines[currentEditIndex];

      // Reset the form with current wine's values
      editForm.reset({
        ...currentWine,
        // Convert date string to Date object if needed
        DrinkBy: currentWine.DrinkBy ? new Date(currentWine.DrinkBy) : null,
      });

      // Update the date state for the calendar
      setDate(currentWine.DrinkBy || "");
    }
  }, [currentEditIndex, selectedWines, editForm]);

  useEffect(() => {
    if (updatedWines.length > 0) {
      const currentWine = updatedWines[currentEditIndex];
      editForm.reset(currentWine);
      setDate(currentWine.DrinkBy || "");
    }
  }, [currentEditIndex, updatedWines, editForm]);

  //work here
  const handleEditSubmit = async (formData: services.Wine) => {
    const originalWine = selectedWines[currentEditIndex];

    const updatedWine: services.Wine = {
      ...originalWine,
      ...formData,
      DrinkBy: date === "" ? null : date,
      ID: originalWine.ID,
      convertValues: originalWine.convertValues,
    };

    // Create a new array with all previous updates plus this one
    const newUpdatedWines = [...updatedWines];
    newUpdatedWines[currentEditIndex] = updatedWine;
    setUpdatedWines(newUpdatedWines);

    // Immediately save this wine's changes
    try {
      await UpdateWines([updatedWine]); // Update just this one wine

      // Update local state
      setWines((prev) =>
        prev.map((w) => (w.ID === updatedWine.ID ? updatedWine : w))
      );

      if (currentEditIndex < selectedWines.length - 1) {
        setCurrentEditIndex((prev) => prev + 1);
      } else {
        setIsEditDialogOpen(false);
      }
    } catch (error) {}
  };

  const resetFilters = () => {
    table.resetColumnFilters();
    // table.resetGlobalFilter();
    table.getAllColumns().forEach((column) => {
      if (column.columnDef.meta?.filterVariant === "select") {
        column.setFilterValue("");
      }
      if (column.columnDef.meta?.filterVariant === "select-winery") {
        column.setFilterValue("");
      }
    });

    setFilterResetCounter((prev) => prev + 1);
  };

  //here here here
  // const table = useWineTable();

  return (
    <>
      <div className="w-full flex justify-center mt-4 fixed top-0 left-0 right-0">
        <div className="max-w-2xl w-full px-4">
          <Input
            value={table.getState().globalFilter ?? ""}
            onChange={(e) => {
              // setGlobalFilter(e.target.value);
              table.setGlobalFilter(e.target.value);
            }}
            placeholder="Search any column..."
            className="w-full"
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
          {/* <div></div> */}

          <div className="flex min-w-[300px] [-webkit-app-region:no-drag]">
            <ColumnVisibilityDropDown table={table} />
            <Button
              variant="outline"
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            >
              View:
              {showSelectedOnly ? " Selected" : " All"}
            </Button>

            {Object.keys(rowSelection).length > 0 && (
              <Button variant="outline">Locate Selected</Button>
            )}
          </div>
          {/* file importer */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <FileImporter
              setWines={setWines}
              setIsInitialLoad={setIsInitialLoad}
            />
          </div>

          <div className="min-w-[100px] text-right">
            {Object.keys(rowSelection).length > 0 && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-accent h-9 px-4 py-1 -mb-[1px] hover:bg-white hover:scale-110 hover:border-b-0 hover:border-r-0"
                      onClick={() => {
                        const ids = Object.keys(rowSelection);
                        const selected = wines.filter((wine) =>
                          ids.includes(String(wine.ID))
                        );
                        setSelectedWines(selected);
                        setUpdatedWines([...selected]); // Clone selected wines
                        setCurrentEditIndex(0);
                      }}
                    >
                      Edit Wine(s)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Editing{" "}
                        {selectedWines[currentEditIndex]?.Description ||
                          "Selected Wine"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Form {...editForm}>
                        <form
                          onSubmit={editForm.handleSubmit(handleEditSubmit)}
                          className="space-y-4"
                        >
                          <div className="flex flex-row items-center justify-between">
                            {formConfig
                              .filter((field) => field.type === "checkbox")
                              .map((field) => (
                                <FormField
                                  key={field.name}
                                  control={editForm.control}
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
                            .map((field) => {
                              return (
                                <FormField
                                  key={field.name}
                                  control={editForm.control}
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
                                                    !date &&
                                                      "text-muted-foreground"
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
                                                      setDate(
                                                        date.toISOString()
                                                      );
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
                                                  editForm.setValue(
                                                    field.name,
                                                    ""
                                                  );
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
                                      ) : field.label === "Winery Name" ? (
                                        <>
                                          <FormLabel>Winery</FormLabel>
                                          <FormControl>
                                            <Select
                                              value={
                                                formField.value
                                                  ? String(formField.value)
                                                  : ""
                                              }
                                              onValueChange={(value) => {
                                                formField.onChange(
                                                  Number(value)
                                                );
                                              }}
                                            >
                                              <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select a winery">
                                                  {wineryList.find(
                                                    (w) =>
                                                      w.ID === formField.value
                                                  )?.Name || "Select a winery"}
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectGroup>
                                                  <SelectLabel>
                                                    Winery
                                                  </SelectLabel>
                                                  {wineryList.map((winery) => (
                                                    <SelectItem
                                                      key={winery.ID}
                                                      value={String(winery.ID)}
                                                    >
                                                      {winery.Name}
                                                    </SelectItem>
                                                  ))}
                                                </SelectGroup>
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                        </>
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
                                                  formField.onChange(
                                                    e.target.value
                                                  );
                                                }
                                              }}
                                            />
                                          </FormControl>
                                        </>
                                      )}
                                    </FormItem>
                                  )}
                                />
                              );
                            })}
                          <DialogFooter className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={currentEditIndex === 0}
                                onClick={() =>
                                  setCurrentEditIndex((prev) => prev - 1)
                                }
                              >
                                Previous
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={
                                  currentEditIndex === selectedWines.length - 1
                                }
                                onClick={() =>
                                  setCurrentEditIndex((prev) => prev + 1)
                                }
                              >
                                Next
                              </Button>
                            </div>
                            <div>
                              {currentEditIndex + 1} of {selectedWines.length}
                            </div>
                            <div>
                              <Button type="submit">Update Current Wine</Button>
                            </div>
                          </DialogFooter>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className=" bg-accent h-9 px-4 py-1 -mb-[1px] hover:bg-white hover:scale-110 hover:border-b-0"
                  onClick={() => deleteWines(rowSelection, wines)}
                >
                  Delete Wine(s)
                </Button>
              </>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className=" bg-accent h-9 px-4 py-1 -mb-[1px] hover:bg-white hover:scale-110 hover:border-b-0 hover:border-l-0"
                  onClick={() => {
                    addForm.reset();
                  }}
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
                  <Form {...addForm}>
                    <form
                      onSubmit={() =>
                        addForm.handleSubmit((formData) =>
                          addWine(formData, date)
                        )
                      }
                      className="space-y-4"
                    >
                      <div className="flex flex-row items-center justify-between">
                        {formConfig
                          .filter((field) => field.type === "checkbox")
                          .map((field) => (
                            <FormField
                              key={field.name}
                              control={addForm.control}
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
                            control={addForm.control}
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
                                            addForm.setValue(field.name, "");
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
          <WineTable
            table={table}
            showSelectedOnly={showSelectedOnly}
            filterResetCounter={filterResetCounter}
          />
        </div>
        <div className="sticky bottom-0 bg-white border-t p-2">
          <div className="text-sm text-muted-foreground leading-tight text-center">
            {table.getRowModel().rows.length > 0 ? (
              <>
                {Object.keys(rowSelection).length} of{" "}
                {showSelectedOnly
                  ? Object.keys(rowSelection).length
                  : table.getFilteredRowModel().rows.length}{" "}
                row(s) selected.
                {table.getState().columnFilters.length > 0 && (
                  <span className="ml-2">
                    (Filtered from {table.getPreFilteredRowModel().rows.length}{" "}
                    total)
                  </span>
                )}
              </>
            ) : (
              "No results found"
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
