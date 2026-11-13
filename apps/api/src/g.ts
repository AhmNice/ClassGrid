import crypto from "crypto";

const generateSecret = (bytes = 64) =>
  crypto.randomBytes(bytes).toString("hex");

console.log(`ACCESS_TOKEN_SECRET=${generateSecret(32)}`);
console.log(`REFRESH_TOKEN_SECRET=${generateSecret(32)}`);
