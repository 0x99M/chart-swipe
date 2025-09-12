"use client";

import { useState } from "react";
import { useWatchlist, useAddCoin, useMoveCoin, useDeleteCoin } from "@/watchlist/watchlist.hooks";
import { Button } from "@/components/ui/button";
import { TickerSelect } from "./TickerSelect";
import { ChevronsUpDown, Loader2Icon } from "lucide-react";
import { WatchlistItem } from "./WatchlistItem";
import { BybitTicker } from "@/bybit/bybit.types";
import { Sort } from "@/watchlist/watchlist.types";
import { sortedWatchlist } from "@/watchlist/watchlist.utils";

type Props = {
  bybitTickersMap: Map<string, BybitTicker>;
  openChart: (index: number, so: Sort) => void;
};

export default function Watchlist({ bybitTickersMap, openChart }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [sort, setSort] = useState<Sort>("position");

  const { data: watchlist, isLoading: isLoadingWatchlist } = useWatchlist();

  const { mutate: addCoin, isPending: adding } = useAddCoin();
  const { mutate: moveCoin, isPending: moving } = useMoveCoin();
  const { mutate: deleteCoin, isPending: deleting } = useDeleteCoin();

  const handleAdd = () => {
    if (!selected) return;
    addCoin({ coin: selected });
    setSelected("");
  };

  const changeSorting = () => {
    if (sort === "position") {
      setSort("gainers");
    } else if (sort === "gainers") {
      setSort("losers");
    } else {
      setSort("position");
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-8">
      <div className="w-full flex flex-col items-center justify-between gap-8">
        <div className="w-full flex justify-center items-center gap-2">
          <TickerSelect
            tickers={[...bybitTickersMap.values()]}
            value={selected}
            onChange={setSelected}
            open={open}
            onOpenChange={setOpen}
          />
          <Button onClick={handleAdd} disabled={!selected || adding}>
            {adding ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "+"}
          </Button>
        </div>
        {isLoadingWatchlist || moving || deleting ? (
          <div className="w-full h-16 flex flex-col justify-center items-center gap-4">
            <Loader2Icon className="h-8 w-8 animate-spin" />
            {isLoadingWatchlist ?
              "Loading watchlist…" :
              moving ?
                "Moving…" : "deleting…"
            }
          </div>
        ) : (
          <ul className="w-full space-y-4">
            <li className="w-full flex justify-between items-center text-sm" >
              <p className="text-white/50" >Coin</p>
              <div
                className="p-0 m-0 flex justify-between items-center text-white/50"
                onClick={() => changeSorting()}
              >
                <p>Change</p><ChevronsUpDown className="h-4 w-4" />
              </div>
            </li>
            {sortedWatchlist(watchlist || [], bybitTickersMap, sort)?.map((item, i) =>
              <li key={item.coin} onClick={() => openChart(i, sort)} >
                <WatchlistItem
                  onRemove={() => deleteCoin(item.id)}
                  onMoveToTop={() => moveCoin({ id: item.id, position: 1 })}
                  ticker={bybitTickersMap.get(item.coin)}
                />
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}