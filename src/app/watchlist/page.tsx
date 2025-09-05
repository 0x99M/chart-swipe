"use client";

import { useState } from "react";
import { useWatchlist, useAddCoin } from "@/hooks/watchlist";
import { Button } from "@/components/ui/button";
import { TickerSelect } from "./TickerSelect";
import { Loader2Icon, Watch } from "lucide-react";
import { useFilteredBybitTickers } from "@/hooks/bybit";
import { WatchlistItem } from "./WatchlistItem";

type Sorted = "position" | "gainers" | "losers";

export default function WatchlistPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [sorted, setSorted] = useState<Sorted>("position");

  const { data: watchlist } = useWatchlist();
  const { data: tickers } = useFilteredBybitTickers();
  const { mutate: addCoin, isPending: adding } = useAddCoin();

  const handleAdd = () => {
    if (!selected) return;
    addCoin({ coin: selected });
    setSelected("");
  };

  const bybitTicker = (coin: string) => {
    return tickers?.find((t) => t.symbol === coin);
  };

  const sortedItems = (sorted: Sorted) => {
    if (sorted === "gainers") {
      return watchlist?.slice().sort((a, b) => {
        const pctA = parseFloat(bybitTicker(a.coin)?.price24hPcnt || '0');
        const pctB = parseFloat(bybitTicker(b.coin)?.price24hPcnt || '0');
        return pctB - pctA;
      });
    }
    if (sorted === "losers") {
      return watchlist?.slice().sort((a, b) => {
        const pctA = parseFloat(bybitTicker(a.coin)?.price24hPcnt || '0');
        const pctB = parseFloat(bybitTicker(b.coin)?.price24hPcnt || '0');
        return pctA - pctB;
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
        <ul className="w-full space-y-4">
          <li className="w-full flex justify-between items-center" >
            <Button variant="outline" onClick={() => setSorted("position")}>Position</Button>
            <Button variant="outline" onClick={() => setSorted("gainers")}>Gainers</Button>
            <Button variant="outline" onClick={() => setSorted("losers")}>Losers</Button>
          </li>
          {sortedItems(sorted)?.map((item) =>
            <WatchlistItem key={item.coin} ticker={bybitTicker(item.coin)} />
          )}
        </ul>
      </div>
    </div>
  );
}