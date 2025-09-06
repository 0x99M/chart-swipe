"use client";

import { useMemo, useState } from "react";
import { useWatchlist, useAddCoin, useMoveCoin, useDeleteCoin } from "@/hooks/watchlist";
import { Button } from "@/components/ui/button";
import { TickerSelect } from "./TickerSelect";
import { ChevronsUpDown, Loader2Icon } from "lucide-react";
import { useFilteredBybitTickers } from "@/hooks/bybit";
import { WatchlistItem } from "./WatchlistItem";
import { BybitTicker } from "@/types/bybit";

type Sorted = "position" | "gainers" | "losers";

export default function WatchlistPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [sorted, setSorted] = useState<Sorted>("position");

  const { data: watchlist, isLoading: isLoadingWatchlist } = useWatchlist();
  const { data: tickers, isLoading: isLoadingBybitTickers } = useFilteredBybitTickers();

  const { mutate: addCoin, isPending: adding } = useAddCoin();
  const { mutate: moveCoin, isPending: moving } = useMoveCoin();
  const { mutate: deleteCoin, isPending: deleting } = useDeleteCoin();

  const tickerMap = useMemo(() => {
    if (!tickers) return new Map<string, BybitTicker>();
    return new Map<string, BybitTicker>(tickers.map((t) => [t.symbol, t]));
  }, [tickers]);

  const handleAdd = () => {
    if (!selected) return;
    addCoin({ coin: selected });
    setSelected("");
  };

  const changeSorting = () => {
    if (sorted === "position") {
      setSorted("gainers");
    } else if (sorted === "gainers") {
      setSorted("losers");
    } else {
      setSorted("position");
    }
  };

  const sortedItems = (sorted: Sorted) => {
    if (sorted === "gainers" || sorted === "losers") {
      return watchlist?.slice().sort((a, b) => {
        const pctA = parseFloat(tickerMap.get(a.coin)?.price24hPcnt || '0');
        const pctB = parseFloat(tickerMap.get(b.coin)?.price24hPcnt || '0');
        return sorted === "gainers" ? pctB - pctA : pctA - pctB;
      });
    }
    return watchlist;
  };

  return (
    <div className="w-full flex flex-col items-center p-8">
      <div className="w-full flex flex-col items-center justify-between gap-8">
        <div className="w-full flex justify-center items-center gap-2">
          <TickerSelect
            tickers={tickers || []}
            value={selected}
            onChange={setSelected}
            open={open}
            onOpenChange={setOpen}
          />
          <Button onClick={handleAdd} disabled={!selected || adding}>
            {adding ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "+"}
          </Button>
        </div>
        {isLoadingWatchlist || isLoadingBybitTickers || moving || deleting ? (
          <div className="w-full h-16 flex flex-col justify-center items-center gap-4">
            <Loader2Icon className="h-8 w-8 animate-spin" />
            {isLoadingWatchlist ?
              "Loading watchlist…" :
              isLoadingBybitTickers ?
                "Loading tickers…" :
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
            {sortedItems(sorted)?.map((item) =>
              <WatchlistItem
                key={item.coin}
                onRemove={() => deleteCoin(item.id)}
                onMoveToTop={() => moveCoin({ id: item.id, position: 1 })}
                ticker={tickerMap.get(item.coin)}
              />
            )}
          </ul>
        )}
      </div>
    </div>
  );
}