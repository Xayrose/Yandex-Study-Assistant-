import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve("fixtures");
const server = http.createServer(async (req, res) => {
  const p = req.url === "/" ? "/index.html" : req.url;
  try {
    const file = await fs.readFile(path.join(root, p));
    res.writeHead(200, { "content-type": p.endsWith(".html") ? "text/html; charset=utf-8" : "text/plain" });
    res.end(file);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
});
server.listen(4173, "127.0.0.1", () => console.log("Synthetic lab: http://127.0.0.1:4173"));
