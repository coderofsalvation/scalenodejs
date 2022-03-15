# horizontal scaleable nodejs boilerplate

```bash
$ node server.js
starting worker on port 5000
starting worker on port 5001
starting worker on port 5002
'[process 368] ping!'          # executed on a local/remote cpu 
'[process 369] ping!'          #
'[process 375] ping!'          #
```

> app.js:

```js
require('./server/loadbalancer')
const { Client }  = require('ezrpc')
const app         = new Client('localhost', 9999).methods

let main = async () => {
  await app.ping()                // distribute call: on one of the local/remote cpu-workers
  await app.set("foo.bar",{x:1})  // central call: server/loadbalancer.js 
}

main()
```

> `cluster.json`:

```json
{
  "master":  "./app.js", 
  "workers": {
    "worker1":{ "worker":"./server/pkg/mypkg.js", "count":1, "port":5000 }, 
    "worker2":{ "worker":"./server/pkg/mypkg.js", "count":1, "port":5001 },
    "worker3":{ "worker":"./server/pkg/mypkg.js", "count":1, "port":5002 } 
  }, 
  "remotes":[
    { "host":"192.23.4.56", "port":6000 },       // same app but runs on other server
    { "host":"192.23.4.56", "port":6001 },       // they become workers of this server
    { "host":"192.23.4.58", "port":6002 },       //
  ], 
  "accessKey": "test",                       // rest api-key
  "cli":true                                 // manage workers using REST or cli 
}
```        

## manage/update workers using REST or cli

thanks to godaddy's [npmjs.org/cluster-service](https://npmjs.org/cluster-service) see [video here](http://x.co/bpnodevid)

## scale horizontally by loadbalancing rpc calls

thanks to [npmjs.org/ezrpc](https://npmjs.org/ezrpc)

## centralized data

all workers can save data centrally on `server/loadbalancer.js`:

```javascript
await app.set("foo.bar",[{x:1}])         // generates db.json
await app.get("foo.bar") )               // [{x:1}]
await app.find("foo.bar",   {x:{$lt:2}}) // [{x:1}]
await app.findOne("foo.bar",{x:{$lt:2}}) // {x:1}
```

> `db.json` now contains `{foo:{bar:[{x:1}]}}`, which you can easily backup/edit

## decentralized data (proxy-to-jsonfile)

workers can easily use own databases:

```
const db = require('./server/db')({file:'mydb.json', ratelimit:1500})
db.accounts = {a:[{foo:1},{foo:2}]}
let some = db.find('accounts.a',{foo:{$lt:2}}) )
let one  = db.findOne('accounts.a',{foo:{$lt:2}}) )
```
