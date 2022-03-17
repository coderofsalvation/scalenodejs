const { LoadBalancer, Client } = require('ezrpc')
const cluster  = require('./../'+ (process.env.JSON_CLUSTER || 'cluster.json' ) )
const db       = require('./db')({file: process.env.JSON_DB || 'db.json', ratelimit:1500})
let log        = (msg) => console.log('[loadbal|'+process.pid+'|tcp/9999] '+msg)

const initApp = async () => {
  log('initing cluster-app')
  let app = service.client.methods
  let projects = await app.get('project')
  console.dir(projects)
  // projects.map( async (p) => await app.startProject(p) )
}

let workers = cluster.remotes.map( (x) => x)
for ( let i in cluster.workers ) {
  let worker = cluster.workers[i]
  for (let j = 0; j < worker.count; j++ ){
    workers.push({ host: 'localhost', port: worker.port+j })
  }
}
  
const service = new LoadBalancer(workers, 9999,{maxReconnectAttempts:-1})
  
service.module.exports = {
  get: async (k,fallback) => db.getpath(db,k,fallback),
  set: async (k,v) => db.setpath(db,k,v),
  find: async (k,q) => db.find(k,q),
  findOne: async (k,q) => db.findOne(k,q),
  update: async (q,v) => db.update(q,v),
  updateOne: async (q,v) => db.updateOne(q,v),
  log: async (msg,id) => console.log("["+String( new Date().toISOString() ).substr(5,14)+"] ├☑ "+(id?id+': ':'')+' '+msg)
}

service.server.on('connection', async () => {
  if( !service.client ){
    service.client = new Client( process.env.upstream || 'localhost', 9999,{maxReconnectAttempts:-1})
    service.client.socket.on('connect', initApp )
  }
})

log('loadbalancer started')
