import fs from "fs";
import path from "path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Menulis NDJSON debug ke workspace saat `pnpm dev` (browser tidak bisa akses ingest Cursor). */
function agentDebugLogPlugin(sessionLogFilename: string): Plugin {
  const logPath = path.resolve(__dirname, ".cursor", sessionLogFilename);
  return {
    name: "agent-debug-log",
    configureServer(server) {
      server.middlewares.use("/__agent-debug", (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }
        void (async () => {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.from(chunk));
            }
            fs.mkdirSync(path.dirname(logPath), { recursive: true });
            const line = Buffer.concat(chunks).toString("utf8").trim();
            if (line) fs.appendFileSync(logPath, `${line}\n`);
          } catch {
            /* ignore */
          }
          res.statusCode = 204;
          res.end();
        })();
      });
    },
  };
}

export default defineConfig({
  plugins: [agentDebugLogPlugin("debug-22a7bd.log"), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
