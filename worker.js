const { Server } = require('ezrpc')

console.log("starting worker on port "+process.env.port)
const server = new Server( parseInt(process.env.port) )

server.module.exports = {
  ping () {
    return '[process '+process.pid+'] ping!'
  }
}
