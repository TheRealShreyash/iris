// import { readFileSync } from "node:fs";
// import { dirname, join } from "node:path";
// import { fileURLToPath } from "node:url";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// export const PUBLIC_KEY = readFileSync(join(__dirname, "private.pem"), "utf-8");
// export const PRIVATE_KEY = readFileSync(join(__dirname, "public.pem"), "utf-8");

const formatPEM = (key: string, type: string) => {
  if (!key) return "";

  // 1. Remove any existing headers/footers and whitespace
  const cleanKey = key
    .replace(/-----BEGIN (.*)-----/, "")
    .replace(/-----END (.*)-----/, "")
    .replace(/\s/g, "");

  // 2. Re-wrap the key at 64 characters (Standard PEM requirement)

  const wrappedKey = (cleanKey.match(/.{1,64}/g) ?? []).join("\n");

  // 3. Add the correct headers back
  return `-----BEGIN ${type}-----\n${wrappedKey}\n-----END ${type}-----`;
};

export const PUBLIC_KEY = formatPEM(process.env.PUBLIC_KEY!, "PUBLIC KEY");
export const PRIVATE_KEY = formatPEM(process.env.PRIVATE_KEY!, "PRIVATE KEY");
