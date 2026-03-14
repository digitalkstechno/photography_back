import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pgPkg from "pg";

const { PrismaClient } = prismaPkg;
const { Pool } = pgPkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter
});

export default prisma;