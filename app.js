const cluster          = require('./app.json')
const { LoadBalancer } = require('ezrpc')
const { Client }       = require('ezrpc')

let port = 5000
let workers = cluster.remotes.map( (x) => x)
for ( let i in cluster.workers ) {
  let worker = cluster.workers[i]
  for (let j = 0; j < worker.count; j++ ){
    workers.push({ host: 'localhost', port: worker.port })
  }
}

const server = new LoadBalancer(workers, 9999)

server.module.exports = {
  getSharedData: () => [1, 2, 3]
}

let app = new Client('localhost', 9999).methods
setInterval( () => {
  app.ping().then( console.dir )          // gets called on one of the local/remote workers
  app.getSharedData().then( console.dir ) // see server.module.exports above 
}, 1000)
