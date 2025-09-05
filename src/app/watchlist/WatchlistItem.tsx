import { BybitTicker } from "@/types/bybit";
import { formatCompact } from "@/utils/numbers";

type Props = {
  ticker: BybitTicker | undefined;
};

export function WatchlistItem({ ticker }: Props) {

  if (!ticker) return null;

  const change = parseFloat(ticker.price24hPcnt || "0") * 100;
  const color = change > 0 ? "text-green-400" : "text-red-500";
  const volume = parseFloat(ticker.volume24h || "0") * parseFloat(ticker.lastPrice || "0");

  return (
    <li className="flex items-center justify-between">
      <div className="flex flex-col gap-1" >
        <p>{ticker.symbol}<span className="text-white/30 text-sm" > / USDT</span></p>
        <p className="text-white/30 text-sm" >{formatCompact(volume)} USDT</p>
      </div>
      <p className={`${color} font-bold tracking-wide`}>{change.toFixed(2)}%</p>
    </li>
  );
}