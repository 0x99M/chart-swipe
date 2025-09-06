import { NextRequest } from "next/server";
import { watchlistController } from "@/controllers/watchlist";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return watchlistController.PUT(req, { params: await params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return watchlistController.DELETE({ params: await params });
}