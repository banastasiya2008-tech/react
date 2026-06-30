import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DB } from '../types/db.type.js';

const DB_PATH = join(process.cwd(), "db", "db.json");

// Simple file-based DB operations
export async function readDB(): Promise<DB> {
	const data = await readFile(DB_PATH, 'utf-8');
	return JSON.parse(data) as DB;
}

export async function writeDB(db: DB): Promise<void> {
	await writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}