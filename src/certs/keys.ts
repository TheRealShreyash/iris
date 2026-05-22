import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PUBLIC_KEY = readFileSync(join(__dirname, "private.pem"), "utf-8");
export const PRIVATE_KEY = readFileSync(join(__dirname, "public.pem"), "utf-8");
