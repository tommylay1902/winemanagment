import { services } from "wailsjs/go/models";
import { useToast } from "../hooks/use-toast";

import { RowSelectionState } from "@tanstack/react-table";
import { AddWine, DeleteWines, UpdateWines } from "../../wailsjs/go/main/App";

export type NewWine = Omit<services.Wine, "ID"> & {
  ID?: never; // Explicitly exclude ID
};

export function useWineActions(
  setWines: React.Dispatch<React.SetStateAction<services.Wine[]>>
) {
  const { toast } = useToast();

  const addWine = async (
    wineData: NewWine,
    date: string
  ): Promise<services.Wine> => {
    // Prepare the wine object to send to backend
    const wineToAdd = {
      ...wineData,
      DrinkBy: date || null,
      ID: 0, // Temporary value, will be replaced by backend
    };

    try {
      const id = await AddWine(JSON.stringify(wineToAdd));
      const newWine: services.Wine = {
        ...wineToAdd,
        ID: id, // Now with real ID from backend
      };

      // Update state
      setWines((prev) => [...prev, newWine]);

      toast({
        title: "Success!",
        description: `Successfully added ${newWine.Varietal}`,
      });

      return newWine;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add wine",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteWines = async (
    rowSelection: RowSelectionState,
    wines: services.Wine[]
  ) => {
    try {
      const ids = Object.keys(rowSelection);
      await DeleteWines(ids);

      const numericIds = ids.map((id) => parseInt(id));
      setWines((prev) => prev.filter((w) => !numericIds.includes(w.ID)));

      toast({
        title: "Success!",
        description: `Successfully deleted ${ids.length} wine(s)`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete wines",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateWine = async (wine: services.Wine) => {
    try {
      await UpdateWines([wine]);
      setWines((prev) => prev.map((w) => (w.ID === wine.ID ? wine : w)));
      toast({
        title: "Success!",
        description: `${wine.Description} updated`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wine",
        variant: "destructive",
      });
      return false;
    }
  };

  const batchUpdateWines = async (wines: services.Wine[]) => {
    try {
      await UpdateWines(wines);
      setWines((prev) =>
        prev.map((w) => {
          const updated = wines.find((u) => u.ID === w.ID);
          return updated || w;
        })
      );
      toast({
        title: "Success!",
        description: `${wines.length} wines updated`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wines",
        variant: "destructive",
      });
      return false;
    }
  };

  return { addWine, deleteWines, updateWine, batchUpdateWines };
}
