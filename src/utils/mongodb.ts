import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in environment variables");

  if (clientPromise) {
    return clientPromise;
  }

  const c = new MongoClient(uri);
  clientPromise = c.connect().then((connected) => {
    client = connected;
    return connected;
  });

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const cli = await getClient();
  const dbName = process.env.MONGODB_DB || "chart-swipe";
  return cli.db(dbName);
}

export type UserDoc = {
  _id: string; // Clerk userId
  email?: string;
  watchlist: string[]; // array of coin symbols, order = position
};

export async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>("users");
}
