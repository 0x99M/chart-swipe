"use client";

import { useWatchlist } from "@/watchlist/watchlist.hooks";
import TradingViewChart from "./TradingViewChart";
import { useBybitCandles } from "@/bybit/bybit.hooks";
import { Sort } from "@/watchlist/watchlist.types";
import { sortedWatchlist } from "@/watchlist/watchlist.utils";
import { BybitTicker } from "@/bybit/bybit.types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  index: number;
  sort: Sort;
  bybitTickersMap: Map<string, BybitTicker>;
  closeChart: () => void;
};

export default function Chart({ index, sort, bybitTickersMap, closeChart }: Props) {
  const { data } = useWatchlist();

  const watchlist = sortedWatchlist(data || [], bybitTickersMap, sort);
  const symbol = watchlist?.[index]?.coin ?? "BTC";

  const { data: candles } = useBybitCandles({
    symbol: symbol,
    limit: 500,
    interval: "240",
  });

  return (
    <div className="flex flex-col justify-start items-center gap-4">
      <Button onClick={closeChart} variant="ghost" className="m-0 p-0" >
        <X className="h-4 w-4" />
      </Button>
      <TradingViewChart candles={candles} />
    </div>
  );
}