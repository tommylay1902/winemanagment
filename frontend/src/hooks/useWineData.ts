import { useEffect, useState } from "react";
import { GetAllWineries, GetWines } from "../../wailsjs/go/main/App";
import { services } from "wailsjs/go/models";

export function useWineData() {
  const [wines, setWines] = useState<services.Wine[]>([]);
  const [wineryList, setWineryList] = useState<services.Winery[]>([]);

  useEffect(() => {
    GetWines().then(setWines);
    GetAllWineries().then(setWineryList);
  }, []);

  return { wines, setWines, wineryList };
}
