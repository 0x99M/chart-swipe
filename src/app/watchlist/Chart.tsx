"use client";

import { useRef, useState } from "react";
import { useWatchlist } from "@/watchlist/watchlist.hooks";
import CandlesView from "./CandlesView";
import { useBybitCandles, useBybitTickersMap } from "@/bybit/bybit.hooks";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useWatchlistStore } from "@/watchlist/watchlist.store";
import { formatCompact } from "@/shared/numbers.utils";

type Interval = "5" | "15" | "60" | "240" | "D" | "W";

export default function Chart() {
  const intervals: { value: Interval, label: string }[] = [
    { value: "5", label: "5m" },
    { value: "15", label: "15m" },
    { value: "60", label: "1h" },
    { value: "240", label: "4h" },
    { value: "D", label: "1D" },
    { value: "W", label: "1W" },
  ];

  const [selectedInterval, setSelectedInterval] = useState<Interval>("240");

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
  const symbolData = tickersMap ? tickersMap[symbol] : null;

  const { data: candles } = useBybitCandles({
    symbol: symbol,
    limit: 500,
    interval: selectedInterval,
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
      <div className="w-full p-4 flex justify-between items-center" >
        <div className="flex flex-col justify-center items-start" >
          <span className="font-bold text-lg" >{symbol}/USDT</span>
          <span >
            {symbolData && (parseFloat(symbolData.price24hPcnt) * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex flex-col justify-center items-end" >
          <span className="font-bold text-lg" >{symbolData && symbolData.lastPrice}</span>
          <span className="text-white/30 text-sm" >
            {symbolData && formatCompact(parseFloat(symbolData.volume24h))} USDT
          </span>
        </div>
      </div>
      <div className="flex gap-4 justify-center items-center text-xs" >
        {intervals.map((interval) => (
          <div
            key={interval.value}
            onClick={() => setSelectedInterval(interval.value)}
            className={
              `cursor-pointer px-2 py-1 rounded-md transition-colors ${selectedInterval === interval.value
                ? "text-white"
                : "text-white/25 hover:text-white"
              }`}
          >
            {interval.label}
          </div>
        ))}
      </div>
      <CandlesView candles={candles || []} />
    </div>
  );
}