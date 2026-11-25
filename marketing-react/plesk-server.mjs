// * Plesk "Startup file" for the marketing site.
// * Plesk starts this with `node plesk-server.mjs` and supplies PORT/HOST.
import { fileURLToPath } from "node:url";

process.env.NODE_ENV ??= "production";

const serveBin = new URL("./node_modules/@react-router/serve/bin.js", import.meta.url);
const serverBuild = new URL("./build/server/index.js", import.meta.url);

// * @react-router/serve expects the server build path as its first argument.
process.argv[2] = fileURLToPath(serverBuild);

await import(serveBin.href);
