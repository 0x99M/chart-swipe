import { getUsersCollection, UserDoc, WatchlistItem } from "@/utils/mongodb";
import { auth } from "@clerk/nextjs/server";
import { WatchlistInsert, WatchlistRow, WatchlistUpdate } from "./watchlist.types";

async function ensureUser(userId: string): Promise<UserDoc> {
  const users = await getUsersCollection();
  const existing = await users.findOne({ _id: userId });
  if (existing) return existing;
  const doc: UserDoc = { _id: userId, watchlist: [], nextId: 1 } as UserDoc;
  await users.insertOne(doc);
  return doc;
}

async function getAll(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const users = await getUsersCollection();
  const user = await ensureUser(userId);
  const sorted = (user.watchlist || []).slice().sort((a, b) => a.position - b.position);
  return Response.json(sorted as WatchlistRow[]);
}

async function create(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: WatchlistInsert = await req.json();
  if (!body?.coin) return Response.json({ error: "Missing coin" }, { status: 400 });

  const users = await getUsersCollection();
  const _id = userId;
  const user = await ensureUser(userId);

  const current = user.watchlist || [];
  const nextPosition = current.length > 0 ? Math.max(...current.map(i => i.position)) + 1 : 1;
  const nextId = (user.nextId ?? (current.length > 0 ? Math.max(...current.map(i => i.id)) + 1 : 1));

  const newItem: WatchlistItem = {
    id: nextId,
    coin: body.coin,
    position: nextPosition,
    created_at: new Date().toISOString(),
  };

  const updated: UserDoc = {
    ...user,
    watchlist: [...current, newItem],
    nextId: nextId + 1,
  } as UserDoc;

  await users.replaceOne({ _id }, updated, { upsert: true });
  return Response.json(newItem as WatchlistRow, { status: 201 });
}

async function update(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: WatchlistUpdate = await req.json();
  const { id } = params;
  const { position } = body;

  if (!id || position === undefined)
    return Response.json(
      { error: "Missing required fields: id (from URL) and position" },
      { status: 400 }
    );

  const users = await getUsersCollection();
  const _id = userId;
  const user = await ensureUser(userId);
  const current = user.watchlist || [];

  const targetId = parseInt(id);
  const idx = current.findIndex((i) => i.id === targetId);
  if (idx === -1) return Response.json({ error: "Item not found" }, { status: 404 });

  // Remove item and re-insert at new index (position is 1-based)
  const item = current.splice(idx, 1)[0];
  const newIndex = Math.max(0, Math.min(current.length, (position - 1)));
  current.splice(newIndex, 0, item);

  // Re-number positions starting from 1
  const reindexed = current.map((it, i) => ({ ...it, position: i + 1 }));

  await users.updateOne({ _id }, { $set: { watchlist: reindexed } });

  return Response.json(reindexed as WatchlistRow[]);
}

export async function deleteItem({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  if (!id) {
    return Response.json(
      { error: "Missing required field: id (from URL)" },
      { status: 400 }
    );
  }

  const users = await getUsersCollection();
  const _id = userId;
  const user = await ensureUser(userId);
  const current = user.watchlist || [];

  const targetId = parseInt(id);
  const filtered = current.filter((i) => i.id !== targetId);
  const reindexed = filtered.map((it, i) => ({ ...it, position: i + 1 }));

  await users.updateOne({ _id }, { $set: { watchlist: reindexed } });

  return Response.json(reindexed as WatchlistRow[]);
}

export const watchlistController = {
  GET: getAll,
  POST: create,
  PUT: update,
  DELETE: deleteItem,
} as const;
