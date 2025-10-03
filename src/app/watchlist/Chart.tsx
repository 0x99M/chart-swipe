"use client";

import { useRef, useState, useEffect } from "react";
import { useWatchlist } from "@/watchlist/watchlist.hooks";
import CandlesView from "./CandlesView";
import { useBybitCandles, useBybitTickersMap } from "@/bybit/bybit.hooks";
import { useWatchlistStore } from "@/watchlist/watchlist.store";
import { formatCompact } from "@/shared/numbers.utils";
import { ChevronUp, ChevronDown } from "lucide-react";

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
  const volume =
    parseFloat(symbolData?.volume24h || "0") *
    parseFloat(symbolData?.lastPrice || "0");

  const { data: candles } = useBybitCandles({
    symbol: symbol,
    limit: 500,
    interval: selectedInterval,
  });

  const handlePreviousChart = () => {
    prevChart(watchlist?.length || 0);
  };

  const handleNextChart = () => {
    nextChart(watchlist?.length || 0);
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
    <div className="w-full flex flex-col justify-start items-center gap-4">
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
            className={`cursor-pointer px-2 py-1 rounded-md transition-colors ${
              selectedInterval === interval.value
                ? "text-white"
                : "text-white/25 hover:text-white"
            }`}
          >
            {interval.label}
          </div>
        ))}
      </div>
      <div />
      <div className="flex flex-col items-center">
        <button
          onClick={handlePreviousChart}
          className="w-12 h-12 bg-background rounded-md flex justify-center items-center hover:bg-background/80 transition-colors"
          aria-label="Previous chart"
        >
          <ChevronUp className="text-white w-6 h-6" />
        </button>
        <button
          onClick={handleNextChart}
          className="w-12 h-12 bg-background rounded-md flex justify-center items-center hover:bg-background/80 transition-colors"
          aria-label="Next chart"
        >
          <ChevronDown className="text-white w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
