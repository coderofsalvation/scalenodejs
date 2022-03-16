const fs = require('fs')

// fallback config
if( !process.env.JSON_CLUSTER && !fs.existsSync('./cluster.json') ) fs.copyFileSync('test/data/cluster.json','cluster.json')
if( !process.env.JSON_DB      && !fs.existsSync('./db.json')      ) fs.copyFileSync('test/data/db.json','db.json')

require("cluster-service").start({config: process.env.JSON_CLUSTER || "cluster.json"})
