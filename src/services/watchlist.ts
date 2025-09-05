import { WatchlistInsert, WatchlistRow } from "@/types/watchlist";

const WATCHLIST_API = "/api/watchlist";

export const watchlistService = {
  getAll: async (): Promise<WatchlistRow[]> => {
    const response = await fetch(`${WATCHLIST_API}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tickres - ${response.statusText}`);
    }

    return response.json();
  },

  create: async (coin: WatchlistInsert): Promise<WatchlistRow> => {
    const response = await fetch(`${WATCHLIST_API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coin),
    });

    if (!response.ok) {
      throw new Error(`Failed to add coin - ${response.statusText}`);
    }

    return response.json();
  },
}