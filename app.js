require('./server/loadbalancer')
const { Client }  = require('ezrpc')
const app         = new Client('localhost', 9999).methods

let x

let main = async () => {
  await app.ping()                 // following gets called on one of the local/remote workers 
  await app.set("foo.bar",[{x:1}]) // this gets called (centrally) in server/loadbalancer.js	
  console.log( await app.get("foo.bar") )     
  console.log( await app.findOne("foo.bar",{x:{$lt:2}}) )
}

main()
