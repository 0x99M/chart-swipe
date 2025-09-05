import { bybitService } from "@/services/bybit";
import { BybitTicker } from "@/types/bybit";
import { useQuery } from "@tanstack/react-query";

const bybitKeys = {
  tickers: ["tickers"] as const,
  filteredTickers: ["filtered-tickers"] as const,
};

export function useBybitTickers() {
  return useQuery<BybitTicker[], Error>({
    queryKey: bybitKeys.tickers,
    queryFn: bybitService.getTickers,
    staleTime: 1000 * 60 * 60,
  });
}

export function useFilteredBybitTickers() {
  return useQuery<BybitTicker[], Error>({
    queryKey: bybitKeys.filteredTickers,
    queryFn: async () => {
      const tickers = await bybitService.getTickers();
      return tickers.filter((t) => t.symbol.endsWith("USDT"))
        .map((t) => ({
          ...t,
          symbol: t.symbol.replace(/USDT$/, ""),
        }));;
    },
    staleTime: 1000 * 60 * 60,
  });
}