import { BybitTicker } from "@/types/bybit";
import { Sort, WatchlistRow } from "@/types/watchlist";

export const sortedWatchlist =
  (watchlist: WatchlistRow[], infoMap: Map<string, BybitTicker>, sorted: Sort) => {
    if (sorted === "gainers" || sorted === "losers") {
      return watchlist?.slice().sort((a, b) => {
        const pctA = parseFloat(infoMap.get(a.coin)?.price24hPcnt || "0");
        const pctB = parseFloat(infoMap.get(b.coin)?.price24hPcnt || "0");
        return sorted === "gainers" ? pctB - pctA : pctA - pctB;
      });
    }
    return watchlist;
  };