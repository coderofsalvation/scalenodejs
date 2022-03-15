const { Server, Client } = require('ezrpc')
const service = new Server( parseInt(process.env.port) )

let appget = () => service.app ? service.app 
                               : service.app = new Client( process.env.upstream || 'localhost', 9999).methods

service.module.exports = {
  async ping () {
    let app = appget()
    console.log('[foo|'+process.pid+'] ping!')
    await app.log('centralized log', 'foo')
  }
}

let start = async () => {
  let app = appget()
  await app.ping()                 // following gets called on one of the local/remote workers 
  //await app.set("foo.bar",[{x:1}]) // this gets called (centrally) at server/loadbalancer.js	
  //console.log( await app.get("foo.bar") )     
  //console.log( await app.findOne("foo.bar",{x:{$lt:2}}) )
}

setTimeout( start, 100) // dont block

console.log('[foo|'+process.pid+'] started on port '+process.env.port)
