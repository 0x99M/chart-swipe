"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TickerSelect } from "./TickerSelect";
import { ChevronsUpDown, Loader2Icon } from "lucide-react";
import { WatchlistItem } from "./WatchlistItem";
import { useBybitTickersMap } from "@/bybit/bybit.hooks";
import { useWatchlistStore } from "@/watchlist/watchlist.store";
import { useWatchlist, useAddCoin, useMoveCoin, useDeleteCoin } from "@/watchlist/watchlist.hooks";

export default function Watchlist() {
  const [selected, setSelected] = useState("");
  const [isSeletionMenuOpen, setIsSeletionMenuOpen] = useState(false);

  const { data: watchlist, isLoading: isLoadingWatchlist } = useWatchlist();
  const { data: tickersMap, isLoading: isLoadingBybitTickers } = useBybitTickersMap();

  const { getSortedWatchlist: getSortedSymbols, sort, setSort, openChart } = useWatchlistStore();

  const sortedSymbols = getSortedSymbols(tickersMap || {}, watchlist || []);

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
    <div className="w-full flex flex-col items-center p-4">
      <div className="w-full flex flex-col items-center justify-between gap-8">
        <div className="w-full flex justify-center items-center gap-2">
          <TickerSelect
            tickers={Object.values(tickersMap ?? {})}
            value={selected}
            onChange={setSelected}
            open={isSeletionMenuOpen}
            onOpenChange={setIsSeletionMenuOpen}
          />
          <Button onClick={handleAdd} disabled={!selected || adding}>
            {adding ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "+"}
          </Button>
        </div>
        {isLoadingBybitTickers || isLoadingWatchlist || moving || deleting ? (
          <div className="w-full h-16 flex flex-col justify-center items-center gap-4">
            <Loader2Icon className="h-8 w-8 animate-spin" />
            {isLoadingWatchlist ?
              "Loading watchlist…" :
              moving ?
                "Moving…" : "Deleting…"
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
            {sortedSymbols.map((item, i) =>
              <li key={item.coin} onClick={() => openChart(i)} >
                <WatchlistItem
                  onRemove={() => deleteCoin(item.id)}
                  onMoveToTop={() => moveCoin({ id: item.id, position: 1 })}
                  ticker={tickersMap && tickersMap[item.coin] ? tickersMap[item.coin] : undefined}
                />
              </li>
            )}
            <li className="h-8 opacity-0" ></li>
          </ul>
        )}
      </div>
    </div>
  );
}