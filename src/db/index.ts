import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for some environments (like pgpool or connection pooling), but fine to leave default if not needed.
// For local Postgres it works fine.
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
