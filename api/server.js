// See https://github.com/typicode/json-server#module
const jsonServer = require('json-server')

const server = jsonServer.create()

// Uncomment to allow write operations
// const fs = require('fs')
// const path = require('path')
// const filePath = path.join('db.json')
// const data = fs.readFileSync(filePath, "utf-8");
// const db = JSON.parse(data);
// const router = jsonServer.router(db)

// Comment out to allow write operations
const router = jsonServer.router('db.json')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

server.use(jsonServer.defaults({ static: './public' }))
const middlewares = jsonServer.defaults()

// Middleware para transformar imageUrl
server.use((req, res, next) => {
  const originalSend = res.json
  res.json = function (data) {    
    if (req.path.includes('/posts')) {
      data = Array.isArray(data) 
        ? data.map(transformImageUrls) 
        : transformImageUrls(data)
    }
    originalSend.call(this, data)
  }
  next()
})

function transformImageUrls(item) {
  return {
    ...item,    
    imageUrl: item.imageUrl?.startsWith('http')
      ? item.imageUrl
      : `${BASE_URL}/images/${item.imageUrl}`
  }
}

server.use(middlewares)
// Add this before server.use(router)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}))
server.use(router)
server.listen(3000, () => {
    console.log('JSON Server is running')
})

// Export the Server API
module.exports = server
