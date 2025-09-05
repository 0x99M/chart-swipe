import { watchlistController } from "@/controllers/watchlist";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  return watchlistController.PUT(req, { params });
}