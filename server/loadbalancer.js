const cluster          = require('./../cluster.json')
const db               = require('./db')({file:'db.json', ratelimit:1500})
const { LoadBalancer } = require('ezrpc')

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
  get: (k,fallback) => db.getpath(db,k,fallback),
  set: (k,v) => db.setpath(db,k,v),
  find: (k,q) => db.find(k,q),
  findOne: (k,q) => db.findOne(k,q),
  log: (msg,id) => console.log(" ├☑ "+(id?id+': ':'')+' '+msg)
}
