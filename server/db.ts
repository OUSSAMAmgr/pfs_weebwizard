// import dotenv from "dotenv";
// dotenv.config();

// console.log("DATABASE_URL:", process.env.DATABASE_URL);

// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";

// neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });
import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

import { Pool } from "pg"; // ✅ Utiliser pg au lieu de neon
import { drizzle } from "drizzle-orm/node-postgres"; // ✅ Adapté à pg
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema }); // ✅ client devient pool
