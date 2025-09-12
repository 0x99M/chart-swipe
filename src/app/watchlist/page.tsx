"use client";

import { useMemo, useState } from "react";
import Watchlist from "./Watchlist";
import Chart from "./Chart";
import { Sort } from "@/watchlist/watchlist.types";
import { useFilteredBybitTickers } from "@/bybit/bybit.hooks";
import { BybitTicker } from "@/bybit/bybit.types";

export default function WatchlistPage() {
  const [sort, setSort] = useState<Sort>("position");
  const [index, setIndex] = useState<number | undefined>();

  const openChart = (index: number, so: Sort) => {
    setSort(so);
    setIndex(index);
  };

  const closeChart = () => {
    setIndex(undefined);
  };

  const { data: tickers, isLoading: isLoadingBybitTickers } = useFilteredBybitTickers();

  const bybitTickersMap = useMemo(() => {
    if (!tickers) return new Map<string, BybitTicker>();
    return new Map<string, BybitTicker>(tickers.map((t: BybitTicker) => [t.symbol, t]));
  }, [tickers]);

  if (isLoadingBybitTickers) {
    return <div>Loading...</div>;
  }

  return index ?
    <Chart index={index || 0} sort={sort} bybitTickersMap={bybitTickersMap} closeChart={closeChart} /> :
    <Watchlist bybitTickersMap={bybitTickersMap} openChart={openChart} />;
}