import { NextRequest } from "next/server";
import { watchlistController } from "@/controllers/watchlist";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  return watchlistController.PUT(req, { params: await params });
}