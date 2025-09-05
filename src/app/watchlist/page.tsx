"use client";

import { useWatchlist } from "@/hooks/watchlist";

export default function WatchlistPage() {
  const { data: coins, isLoading, error } = useWatchlist();

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="w-full p-8 flex flex-col justify-center items-center" >
      <div className="w-full max-w-sm flex flex-col justify-center items-center gap-8" >
        <ul>
          {coins?.map((coin) => (
            <li key={coin.id}>{coin.coin}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}