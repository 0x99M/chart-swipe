import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";

type WatchlistItemInsert = Omit<
  Database["public"]["Tables"]["watchlist_items"]["Insert"],
  "id" | "position"
>;

type WatchlistItemUpdate = Pick<
  Database["public"]["Tables"]["watchlist_items"]["Update"],
  "position"
>;

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("watchlist_items")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: Request) {
  const body: WatchlistItemInsert = await req.json();
  const supabase = await createClient();

  const { data: maxData, error: maxError } = await supabase
    .from("watchlist_items")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  if (maxError && maxError.code !== "PGRST116") {
    return new Response(JSON.stringify({ error: maxError.message }), {
      status: 500,
    });
  }

  const nextPosition = maxData?.position ? maxData.position + 1 : 1;

  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({
      ...body,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 201 });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  try {
    const body: WatchlistItemUpdate = await req.json();

    const { id } = params;
    const { position } = body;

    if (!id || position === undefined) {
      return Response.json(
        { error: "Missing required fields: id (from URL) and position" }, 
        { status: 400 }
      );
    }

    const { error: rpcErr } = await supabase.rpc("reorder_watchlist", {
      id: id,
      position: position,
    });

    if (rpcErr) {
      return Response.json({ error: rpcErr.message }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("watchlist_items")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (parseError) {
    return Response.json(
      { error: "Invalid JSON in request body" }, 
      { status: 400 }
    );
  }
}