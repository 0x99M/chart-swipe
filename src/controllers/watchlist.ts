import { createClient } from "@/utils/supabase/server";
import { WatchlistInsert, WatchlistRow, WatchlistUpdate } from "@/types/watchlist";

async function getAll() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .order("position", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data as WatchlistRow[]);
}

async function create(req: Request) {
  const supabase = await createClient();
  const body: WatchlistInsert = await req.json();

  const { data: maxData, error: maxError } = await supabase
    .from("watchlist")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  if (maxError && maxError.code !== "PGRST116") {
    return Response.json({ error: maxError.message }, { status: 500 });
  }

  const nextPosition = maxData?.position ? maxData.position + 1 : 1;

  const { data, error } = await supabase
    .from("watchlist")
    .insert({ ...body, position: nextPosition })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data as WatchlistRow, { status: 201 });
}

async function update(req: Request, { params }: { params: { id: number } }) {
  const supabase = await createClient();
  const body: WatchlistUpdate = await req.json();
  const { id } = params;
  const { position } = body;

  if (!id || position === undefined)
    return Response.json(
      { error: "Missing required fields: id (from URL) and position" },
      { status: 400 }
    );

  const { error: rpcErr } = await supabase.rpc("reorder_watchlist", {
    p_id: id,
    p_position: position,
  });

  if (rpcErr) return Response.json({ error: rpcErr.message }, { status: 500 });

  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .order("position", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data as WatchlistRow[]);
}

export const watchlistController = {
  GET: getAll,
  POST: create,
  PUT: update,
} as const;