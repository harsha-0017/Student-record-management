"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.join(__dirname, "web");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};
const port = Number(process.env.PORT || 8000);

http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch (error) {
    response.writeHead(400);
    response.end("Invalid request path.");
    return;
  }

  const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden.");
    return;
  }

  fs.readFile(file, (error, content) => {
    if (error) {
      const status = error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 500;
      response.writeHead(status);
      response.end(status === 404 ? "Not found." : "Could not read the requested file.");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    if (request.method === "HEAD") {
      response.end();
    } else {
      response.end(content);
    }
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Student Records is available at http://localhost:${port}`);
});
