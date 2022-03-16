const { Server, Client } = require('ezrpc')
const service = new Server( parseInt(process.env.port) )
let log       = (msg) => console.log('[service|'+process.pid+'|tcp/'+process.env.port+'] '+msg)

service.module.exports = {
  async ping () {
    let app = service.client.methods
    app.log('ping!', 'cluster')
    //log('local ping!')
    return 123
  }
}

service.server.on('connection', () => {
  service.client = new Client( process.env.upstream || 'localhost', 9999,{maxReconnectAttempts:-1})
  service.client.socket.on('connect', () => log('cluster-node connected') )
  log('cluster-node started on port '+process.env.port)
})

