"use client";

import { useState } from "react";
import { useWatchlist, useAddCoin } from "@/hooks/watchlist";
import { Button } from "@/components/ui/button";
import { TickerSelect } from "./TickerSelect";
import { Loader2Icon } from "lucide-react";
import { useFilteredBybitTickers } from "@/hooks/bybit";

export default function WatchlistPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const { data: watchlist } = useWatchlist();
  const { data: tickers } = useFilteredBybitTickers();
  const { mutate: addCoin, isPending: adding } = useAddCoin();

  const handleAdd = () => {
    if (!selected) return;
    addCoin({ coin: selected });
    setSelected("");
  };

  const ticker24Change = (symbol: string) => {
    return tickers?.find((t) => t.symbol === symbol)?.price24hPcnt;
  };

  return (
    <div className="w-full flex flex-col items-center p-8">
      <div className="w-full flex flex-col items-center justify-between gap-4">
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
          {watchlist?.map((item) => {
            const change = parseFloat(ticker24Change(item.coin) || "0") * 100;
            const color = change > 0 ? "text-green-400" : "text-red-500";
            return (
              <li
                key={item.id}
                className="flex items-center justify-between"
              >
                <p>{item.coin}</p>
                <p className={`${color}`}>{change.toFixed(2)}%</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}