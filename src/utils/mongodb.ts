import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in environment variables");

  if (client && (client as any).topology && (client as any).topology.isConnected()) return client;

  if (!clientPromise) {
    const c = new MongoClient(uri);
    clientPromise = c.connect().then((connected) => {
      client = connected;
      return connected;
    });
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const cli = await getClient();
  const dbName = process.env.MONGODB_DB || "chart-swipe";
  return cli.db(dbName);
}

export type WatchlistItem = {
  id: number;
  coin: string;
  position: number;
  created_at: string;
};

export type UserDoc = {
  _id: string; // Clerk userId
  email?: string;
  watchlist: WatchlistItem[];
  nextId?: number; // used to generate incremental ids per user
};

export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}
