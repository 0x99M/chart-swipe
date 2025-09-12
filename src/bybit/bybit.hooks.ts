import { bybitService } from "@/bybit/bybit.service";
import { BybitCandle, BybitGetCandlesRequest, BybitTicker } from "@/bybit/bybit.types";
import { useQuery } from "@tanstack/react-query";

const bybitKeys = {
  tickers: ["tickers"] as const,
  filteredTickers: ["filtered-tickers"] as const,
  candles: ["candles"] as const,
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

export function useBybitCandles(request: BybitGetCandlesRequest) {
  return useQuery<BybitCandle[], Error>({
    queryKey: [...bybitKeys.candles, request.symbol],
    queryFn: async () => {
      const response = await bybitService.getCandles(request);
      return response.result.list.map((candle) => ({
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        time: parseInt(candle[0]) / 1000,
      })).reverse();
    },
    staleTime: 1000 * 60 * 60,
  });
}