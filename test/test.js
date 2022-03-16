process.env.JSON_CLUSTER = 'test/data/cluster.json'
process.env.JSON_DB      = 'test/data/db.json'
const {Client} = require('ezrpc')
const cluster  = require('cluster')
require('./../server.js')

test = (info,a) => a !== false ? console.log("OK : "+info) : console.error("ERR: "+info)

async function run(){
  client = new Client( process.env.upstream || 'localhost', 9999,{maxReconnectAttempts:-1})
  client.socket.on('connect', async () => {
    console.log("connected ")
    let app = client.methods
    let res = await app.ping()
    test("app.ping => 123", res == 123 )
    console.log("done")
    process.exit()
  })
}

if( cluster.isMaster ) 
  setTimeout( run, 1000 ) // 1 second for cluster to settle
