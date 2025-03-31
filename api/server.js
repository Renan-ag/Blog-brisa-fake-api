const jsonServer = require('json-server');
const express = require('express');
const server = jsonServer.create();
const path = require('path');

// Carrega o db.json em memória (somente leitura)
const db = require('./db.json'); 
const router = jsonServer.router(db); 

// Middlewares
server.use(jsonServer.defaults());

// Serve arquivos estáticos (imagens)
server.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware para corrigir URLs de imagens
server.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    if (typeof body === 'string') {
      try {
        let data = JSON.parse(body);
        if (Array.isArray(data)) {
          data = data.map(item => ({
            ...item,
            imageUrl: item.imageUrl?.startsWith('http') 
              ? item.imageUrl 
              : `${process.env.BASE_URL || 'http://localhost:3000'}/public/images/${item.imageUrl}`
          }));
        }
        body = JSON.stringify(data);
      } catch (e) {}
    }
    originalSend.call(res, body);
  };
  next();
});

server.use(router);
module.exports = server;