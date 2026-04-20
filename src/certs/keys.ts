import { readFileSync } from "node:fs";

export const PUBLIC_KEY = readFileSync(process.env.PUBLIC_KEY_PATH!, "utf-8");
export const PRIVATE_KEY = readFileSync(process.env.PRIVATE_KEY_PATH!, "utf-8");
