"use client";

import Watchlist from "./Watchlist";
import Chart from "./Chart";
import { useWatchlistStore } from "@/watchlist/watchlist.store";

export default function WatchlistPage() {
  const { isChartOpen } = useWatchlistStore();

  return isChartOpen ? <Chart /> : <Watchlist />;
}