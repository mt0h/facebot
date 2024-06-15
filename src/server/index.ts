import * as dotenv from "dotenv";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { startQueue } from "./queue";

const port = parseInt(process.env.PORT || "3000");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl).catch(console.error);
  }).listen(port);

  if (!dev) {
    void startQueue();
  }

  console.info(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});
