import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import express from "express";
import { createRequestHandler } from "@react-router/express";
import * as build from "./build/server/index.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(currentDir, "build/client");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(compression());
app.use(
  "/assets",
  express.static(path.join(clientDir, "assets"), {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(express.static(clientDir, { maxAge: "1h" }));
app.all("*", createRequestHandler({ build, mode: "production" }));

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST;

app.listen(port, host, () => {
  console.log(`[mssn-server] listening on ${host || "0.0.0.0"}:${port}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.once(signal, () => process.exit(0));
}
