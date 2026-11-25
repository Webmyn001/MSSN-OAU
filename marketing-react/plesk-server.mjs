// Plesk "Startup file" for the marketing site.
// Plesk starts this with `node plesk-server.mjs` and supplies PORT/HOST.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.env.NODE_ENV ??= "production";

const serveBin = new URL("./node_modules/@react-router/serve/bin.js", import.meta.url);
const serverBuild = new URL("./build/server/index.js", import.meta.url);
const clientBuild = new URL("./build/client/", import.meta.url);

for (const [label, url] of [
  ["@react-router/serve", serveBin],
  ["server build", serverBuild],
  ["client build", clientBuild],
]) {
  if (!existsSync(url)) {
    throw new Error(`[plesk-server] Missing ${label}: ${fileURLToPath(url)}`);
  }
}

const port = Number(process.env.PORT);
if (process.env.PORT && !Number.isInteger(port)) {
  console.warn(`[plesk-server] PORT is not a number: ${process.env.PORT}`);
}

console.log(
  `[plesk-server] starting ${fileURLToPath(serverBuild)} on port ${
    process.env.PORT || "(auto)"
  } with Node ${process.version}`,
);

// @react-router/serve expects the server build path as its first argument.
process.argv[2] = fileURLToPath(serverBuild);

try {
  await import(serveBin.href);
} catch (error) {
  console.error("[plesk-server] failed to start:", error);
  process.exit(1);
}
