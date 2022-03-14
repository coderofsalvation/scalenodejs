# horizontal scaleable nodejs boilerplate

> `app.json`:

```json
{
  "master":  "./cluster.js", 
  "workers": {
    "worker1":{ "worker":"./worker.js", "count":1, "port":5000 }, 
    "worker2":{ "worker":"./worker.js", "count":1, "port":5001 },
    "worker3":{ "worker":"./worker.js", "count":1, "port":5002 } 
  }, 
  "remotes":[
    { "host":"192.23.4.56", "port":6000 },       // same app but runs on other server
    { "host":"192.23.4.56", "port":6001 },       // they become workers of this server
    { "host":"192.23.4.58", "port":6002 },       //
  ], 
  "accessKey": "test",                       // rest api-key
  "cli":false                                // manage workers using REST or cli 
}
```        

## run distributed app

```bash
$ node cluster.js
starting worker on port 5000
starting worker on port 5001
starting worker on port 5002
'[process 368] ping!'
'[process 369] ping!'
'[process 375] ping!'

## manage/update workers using REST or cli

thanks to godaddy's [npmjs.org/cluster-service](https://npmjs.org/cluster-service) see [video here](http://x.co/bpnodevid)

## scale horizontally by loadbalancing rpc calls

thanks to [npmjs.org/ezrpc](https://npmjs.org/ezrpc)
