# horizontal scaleable nodejs boilerplate

```bash
$ node server.js
[loadbal|300457|tcp/9999] loadbalancer started
[service|300469|tcp/5000] cluster-node started on port 5000
[service|300471|tcp/5001] cluster-node started on port 5001
[service|300469|tcp/5000] cluster-node connected
[service|300471|tcp/5001] cluster-node connected
[loadbal|300457|tcp/9999] initing cluster-app
connected 
[03-16T14:40:27] ├☑ cluster:  ping!                 # called on cluster 
```

## cluster definition 

```json
{
  "master":  "./cluster/loadbalancer.js", 
  "workers": {                                   // cpus
    "serviceA":{ "worker":"./service/index.js", "count":1, "port":5000 },
    "serviceB":{ "worker":"./service/index.js", "count":1, "port":5001 }
  }, 
  "remotes":[
    { "host":"192.23.4.56", "port":5000 },       // same app but runs on other server
    { "host":"192.23.4.56", "port":5001 },       // they become workers of this server
  ], 
  "remotes":[], 
  "accessKey": "test",                           // cluster management over rest/cli
  "cli":false                                    // thanks to npmjs.org/cluster-service
}
```


> cluster functions:

```js
const { Server, Client } = require('ezrpc')
const service = new Server( parseInt(process.env.port) )

service.module.exports = {
  async ping () {
    let app = service.client.methods
    app.log('ping!', 'cluster')
    return 123
  }
}

service.server.on('connection', () => {
  service.client = new Client( process.env.upstream || 'localhost', 9999,{maxReconnectAttempts:-1})
  service.client.socket.on('connect', () => log('cluster-node connected') )
  log('cluster-node started on port '+process.env.port)
})
```

## scale horizontally 

* across cpu's thanks to [npmjs.org/cluster-service](https://npmjs.org/cluster-service)
* across servers thanks to [npmjs.org/ezrpc](https://npmjs.org/ezrpc)
* update/manage workers using REST/cli thanks to [npmjs.org/cluster-service](https://npmjs.org/cluster-service)

> when using remotes, use env-var `upstream=main.myserver.org` e.g. on remotes. By doing so, `app.ping()` will run through loadbalancer `main.myserver.org`.

## centralized data

all workers can save data centrally on `cluster/loadbalancer.js`:

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

## Lightweight 55MB all-in-one-binary / docker-image

```javascript
$ podman build -t elastinode
$ podman images
REPOSITORY                   TAG             IMAGE ID       CREATED              SIZE
elasticnode                  latest          79988bafb26d   32 seconds ago       51.5MB
$ DOCKER_BUILDKIT=1 docker build -t elasticnode --output out
$ ls -la out/server
-rwxr-xr-x 1 44M mrt 16 16:10 out/server
```

> not bad for a distributed scalable app no?

## test

```javascript
$ node test/test.js
[loadbal|301490|tcp/9999] loadbalancer started
[service|301502|tcp/5000] cluster-node started on port 5000
[service|301502|tcp/5000] cluster-node connected
[service|301503|tcp/5001] cluster-node started on port 5001
[loadbal|301490|tcp/9999] initing cluster-app
[service|301503|tcp/5001] cluster-node connected
[ { id: 'projectA',  data: {} },  { id: 'projectB',  data: {} } ]
connected 
[03-16T14:50:15] ├☑ cluster:  ping!
OK : app.ping => 123
done

