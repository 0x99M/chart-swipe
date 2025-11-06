import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Global connection instance for Next.js serverless environment
// This ensures connection reuse across function invocations
declare global {
  var postgresClient: postgres.Sql | undefined;
}

// Create connection with optimized settings for Next.js
const client =
  globalThis.postgresClient ??
  postgres(connectionString, {
    prepare: false, // Disable prepared statements for serverless compatibility
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds
    max_lifetime: 60 * 30, // Maximum connection lifetime (30 minutes)
  });

// Store client in global for connection reuse across serverless function invocations
// This prevents creating multiple connections in Next.js serverless environments
if (!globalThis.postgresClient) {
  globalThis.postgresClient = client;
}

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in other files
export { schema };

// Export types for convenience
export type { User, NewUser } from "./schema";
