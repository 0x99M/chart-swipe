import { create } from "zustand";
import { Sort, WatchlistRow } from "./watchlist.types";
import { BybitTicker } from "@/bybit/bybit.types";

type WatchlistState = {
  sort: Sort;
  setSort: (sort: Sort) => void;
  isChartOpen: boolean;
  chartIndex: number;
  openChart: (index: number) => void;
  closeChart: () => void;
  getSortedWatchlist: (
    records: Record<string, BybitTicker>,
    watchlist: WatchlistRow[]
  ) => WatchlistRow[];
  nextChart: (listLength: number) => void;
  prevChart: (listLength: number) => void;
};

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  sort: "position",
  setSort: (sort) => set({ sort }),
  isChartOpen: false,
  chartIndex: -1,
  openChart: (index) => set({ isChartOpen: true, chartIndex: index }),
  closeChart: () => set({ isChartOpen: false, chartIndex: -1 }),

  getSortedWatchlist: (records, watchlist) => {
    const { sort } = get();
    if (sort === "gainers" || sort === "losers") {
      return watchlist.slice().sort((a, b) => {
        const pctA = parseFloat(records[a.coin]?.price24hPcnt ?? "0");
        const pctB = parseFloat(records[b.coin]?.price24hPcnt ?? "0");
        return sort === "gainers" ? pctB - pctA : pctA - pctB;
      });
    }
    return watchlist;
  },

  nextChart: (listLength) =>
    set((state) => {
      if (listLength <= 0) return state;
      const nextIndex = (state.chartIndex + 1) % listLength;
      return { chartIndex: nextIndex };
    }),

  prevChart: (listLength) =>
    set((state) => {
      if (listLength <= 0) return state;
      const prevIndex = (state.chartIndex - 1 + listLength) % listLength;
      return { chartIndex: prevIndex };
    }),
}));