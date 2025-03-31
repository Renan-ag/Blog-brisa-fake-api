const jsonServer = require("json-server");
const express = require("express");
require("dotenv").config();
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Middlewares devem vir antes das rotas estáticas
const middlewares = jsonServer.defaults();
server.use(middlewares);

// Servir arquivos estáticos da pasta 'public'
console.log(jsonServer)
server.use('/public', express.static('public'));

// Middleware para formatar a resposta
server.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    try {
      let data = typeof body === 'string' ? JSON.parse(body) : body;
      
      if (Array.isArray(data)) {
        data = data.map(formatImageUrl);
      } else if (data) {
        data = formatImageUrl(data);
      }
      
      originalSend.call(res, JSON.stringify(data));
    } catch (e) {
      originalSend.call(res, body);
    }
  };
  next();
});

function formatImageUrl(item) {
  if (item && item.imageUrl && !item.imageUrl.startsWith("http")) {
    item.imageUrl = `${BASE_URL}/public/images/${item.imageUrl}`;
  }  
  return item;
}

// Rewrites e router
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

module.exports = server;