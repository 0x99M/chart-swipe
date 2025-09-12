"use client";

import { useWatchlist } from "@/watchlist/watchlist.hooks";
import TradingViewChart from "./TradingViewChart";
import { useBybitCandles, useBybitTickersMap } from "@/bybit/bybit.hooks";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useWatchlistStore } from "@/watchlist/watchlist.store";

export default function Chart() {
  const { data: watchlist } = useWatchlist();
  const { data: tickersMap } = useBybitTickersMap();

  const { getSortedWatchlist: getSortedSymbols, closeChart, chartIndex: index } = useWatchlistStore();
  const sortedSymbols = getSortedSymbols(tickersMap || {}, watchlist || []);
  const symbol = sortedSymbols[index]?.coin ?? "BTC";

  const { data: candles } = useBybitCandles({
    symbol: symbol,
    limit: 500,
    interval: "240",
  });

  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <Button onClick={closeChart} variant="ghost" className="m-0 p-0" >
        <X className="h-4 w-4" />
      </Button>
      <TradingViewChart candles={candles} />
    </div>
  );
}