require('./server/loadbalancer')
const { Client }       = require('ezrpc')

let app = new Client('localhost', 9999).methods
setInterval( () => {

  app.ping().then( console.dir )          // gets called on one of the local/remote workers
  app.getSharedData().then( console.dir ) // see server.module.exports above 

}, 1000)
