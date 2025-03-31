require("dotenv").config();

const jsonServer = require("json-server");
const express = require("express");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const path = require('path');

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

server.use('/public', express.static(path.join(__dirname, 'public')));
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
    item.imageUrl = `${BASE_URL}/public/images/${item.imageUrl}`;
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
