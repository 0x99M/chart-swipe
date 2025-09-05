import { Database } from "./supabase";

export type WatchlistRow = Database["public"]["Tables"]["watchlist"]["Row"];

export type WatchlistInsert = Pick<
  Database["public"]["Tables"]["watchlist"]["Insert"],
  "coin"
>;

export type WatchlistUpdate = Pick<
  Database["public"]["Tables"]["watchlist"]["Update"],
  "position"
>;