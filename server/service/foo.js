const { Server, Client } = require('ezrpc')
const service = new Server( parseInt(process.env.port) )

service.module.exports = {
  ping () {
    console.log('[process '+process.pid+'] ping!')
  }
}

let main = async () => {
  const app = new Client( process.env.upstream || 'localhost', 9999).methods
  await app.ping()                 // following gets called on one of the local/remote workers 
  await app.set("foo.bar",[{x:1}]) // this gets called (centrally) at server/loadbalancer.js	
  console.log( await app.get("foo.bar") )     
  console.log( await app.findOne("foo.bar",{x:{$lt:2}}) )
}

setTimeout( main, 1) // dont block

