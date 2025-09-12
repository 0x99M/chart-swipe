"use client";

import { useRef } from "react";
import { useWatchlist } from "@/watchlist/watchlist.hooks";
import TradingViewChart from "./TradingViewChart";
import { useBybitCandles, useBybitTickersMap } from "@/bybit/bybit.hooks";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useWatchlistStore } from "@/watchlist/watchlist.store";

export default function Chart() {
  const { data: watchlist } = useWatchlist();
  const { data: tickersMap } = useBybitTickersMap();

  const {
    getSortedWatchlist: getSortedSymbols,
    closeChart,
    chartIndex: index,
    nextChart,
    prevChart,
  } = useWatchlistStore();

  const sortedSymbols = getSortedSymbols(tickersMap || {}, watchlist || []);
  const symbol = sortedSymbols[index]?.coin ?? "BTC";

  const { data: candles } = useBybitCandles({
    symbol: symbol,
    limit: 500,
    interval: "240",
  });

  const touchStartY = useRef<number | null>(null);

  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - touchStartY.current;

    if (deltaY > SWIPE_THRESHOLD) {
      prevChart(watchlist?.length || 0);
    } else if (deltaY < -SWIPE_THRESHOLD) {
      nextChart(watchlist?.length || 0);
    }

    touchStartY.current = null;
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-start items-center gap-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Button onClick={closeChart} variant="ghost" className="m-0 p-0" >
        <X className="h-4 w-4" />
      </Button>
      <TradingViewChart candles={candles || []} />
    </div>
  );
}