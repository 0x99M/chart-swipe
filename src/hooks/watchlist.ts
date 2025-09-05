import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WatchlistInsert, WatchlistRow } from "@/types/watchlist";
import { watchlistService } from "@/services/watchlist";

const watchlistKeys = {
  all: ["watchlist"] as const,
};

export function useWatchlist() {
  return useQuery<WatchlistRow[], Error>({
    queryKey: watchlistKeys.all,
    queryFn: watchlistService.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddCoin() {
  const queryClient = useQueryClient();

  return useMutation<WatchlistRow, Error, WatchlistInsert>({
    mutationFn: watchlistService.create,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}