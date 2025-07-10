import { Database } from "bun:sqlite";

const db = new Database("haithe.db", { create: true });
db.exec("PRAGMA journal_mode = WAL;");