"use client";

import { useRef, useState, useEffect } from "react";
import { useWatchlist } from "@/watchlist/watchlist.hooks";
import CandlesView from "./CandlesView";
import { useBybitCandles, useBybitTickersMap } from "@/bybit/bybit.hooks";
import { useWatchlistStore } from "@/watchlist/watchlist.store";
import { formatCompact } from "@/shared/numbers.utils";
import { Move } from "lucide-react";

type Interval = "5" | "15" | "60" | "240" | "D" | "W";

export default function Chart() {
  const intervals: { value: Interval; label: string }[] = [
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
  const change24h = parseFloat(symbolData?.price24hPcnt || "0") * 100;
  const changeColor = change24h > 0 ? "text-custom-green" : "text-custom-red";
  const volume = parseFloat(symbolData?.volume24h || "0") * parseFloat(symbolData?.lastPrice || "0");

  const { data: candles } = useBybitCandles({
    symbol: symbol,
    limit: 500,
    interval: selectedInterval,
  });

  const touchStartY = useRef<number | null>(null);
  const swipeActive = useRef<boolean>(false);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!(e.target as HTMLElement).closest("#swipe-area")) {
      swipeActive.current = false;
      return;
    }
    swipeActive.current = true;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeActive.current || touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - touchStartY.current;
    if (deltaY > SWIPE_THRESHOLD) {
      prevChart(watchlist?.length || 0);
    } else if (deltaY < -SWIPE_THRESHOLD) {
      nextChart(watchlist?.length || 0);
    }
    touchStartY.current = null;
    swipeActive.current = false;
  };

  useEffect(() => {
    history.pushState(null, "", location.href);
    const handlePopState = () => {
      closeChart();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [closeChart]);

  return (
    <div
      className="w-full flex flex-col justify-start items-center gap-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div />
      <div className="w-full p-4 flex justify-between items-center">
        <div className="flex flex-col justify-center items-start">
          <span className="font-bold text-lg">{symbol}/USDT</span>
          <span className={`${changeColor}`}>{change24h.toFixed(2)}%</span>
        </div>
        <div className="flex flex-col justify-center items-end">
          <span className={`font-bold text-lg ${changeColor}`}>
            {symbolData && symbolData.lastPrice}
          </span>
          <span className="text-white/30 text-sm">
            {symbolData && formatCompact(volume)} USDT
          </span>
        </div>
      </div>
      <CandlesView candles={candles || []} />
      <div className="flex gap-4 justify-center items-center text-xs">
        {intervals.map((interval) => (
          <div
            key={interval.value}
            onClick={() => setSelectedInterval(interval.value)}
            className={`cursor-pointer px-2 py-1 rounded-md transition-colors ${selectedInterval === interval.value
              ? "text-white"
              : "text-white/25 hover:text-white"
              }`}
          >
            {interval.label}
          </div>
        ))}
      </div>
      <div className="h-4" ></div>
      <div
        id="swipe-area"
        className="w-16 h-16 bg-background rounded-md flex justify-center items-center"
      >
        <Move className="text-white opacity-25 w-6 h-6" />
      </div>
    </div>
  );
}
