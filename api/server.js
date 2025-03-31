// See https://github.com/typicode/json-server#module
const jsonServer = require("json-server");
require("dotenv").config();
const server = jsonServer.create();

// Uncomment to allow write operations
// const fs = require('fs')
// const path = require('path')
// const filePath = path.join('db.json')
// const data = fs.readFileSync(filePath, "utf-8");
// const db = JSON.parse(data);
// const router = jsonServer.router(db)

// Comment out to allow write operations
const router = jsonServer.router("db.json");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

server.use("/public", jsonServer.defaults({ static: "public" }));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Middleware para formatar a resposta
server.use((req, res, next) => {
  const send = res.send;
  res.send = (body) => {
    let data = JSON.parse(body);

    if (Array.isArray(data)) {
      data = data.map(formatImageUrl);
    } else {
      data = formatImageUrl(data);
    }

    send.call(res, JSON.stringify(data));
  };
  next();
});

function formatImageUrl(item) {
  if (item.imageUrl && !item.imageUrl.startsWith("http")) {
    item.imageUrl = `${BASE_URL}/pulbic/images/${item.imageUrl}`;
  }  
  return item;
}

// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1",
    "/blog/:resource/:id/show": "/:resource/:id",
  })
);
server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});

// Export the Server API
module.exports = server;
