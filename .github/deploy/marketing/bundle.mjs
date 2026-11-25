import { build } from "esbuild";

await build({
  entryPoints: [".deploy-server-entry.mjs"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: "deploy/server.mjs",
  logLevel: "warning",
  banner: {
    js: [
      'import { createRequire as __createRequire } from "node:module";',
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
});
