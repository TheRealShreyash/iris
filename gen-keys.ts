import { generateKeyPairSync } from "node:crypto";
import { writeFileSync } from "node:fs";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

writeFileSync("private.pem", privateKey);
writeFileSync("public.pem", publicKey);

console.log("Keys generated");
