/*
 * deadsimple jsonfile-as-proxy-object with mongo-style queries:
 *
 * const db = require('./app/db')({file:'db.json', ratelimit:1500})
 * db.accounts = {a:[{foo:1},{foo:2}]}
 * let result  = db.find('accounts.a',{foo:{$lt:2}}) )
 */

const fs   = require("fs");
const sift = require("sift")

function readFile(file) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return {}
    throw err;
  }
  if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) return parsed;
  throw new Error("File does not contain a JSON object");
}

class ProxyHandler {
  constructor(opts) {
    opts.ratelimit = opts.ratelimit || 1500
    this.opts     = opts;
    this.saveLast = null
    this.target   = {}
    this.save = () => {
      clearTimeout(this.saveLast)
      setTimeout( () => fs.writeFileSync(this.opts.file, JSON.stringify(this.target,null,2),"utf-8"), this.opts.ratelimit)
    }
    this.getpath = function get(xs,x,fallback) {
        return String(x).split('.').reduce(function(acc, x) {
            if (acc == null || acc == undefined ) return fallback;
            return new Function("x","acc","return acc['" + x.split(".").join("']['") +"']" )(x, acc) || fallback
        }, xs)
    }
		this.setpath = (obj, path, value) => {
			var last
			var o = obj
			path = String(path)
			var vars = path.split(".")
			var lastVar = vars[vars.length - 1]
			vars.map(function(v) {
				if (lastVar == v) return
				o = (new Function("o","return o." + v)(o) || new Function("o","return o."+v+" = {}")(o))
				last = v
			})
			new Function("o","v","o." + lastVar + " = v")(o, value)
			this.target = obj
			this.save()
    }
    this.find = (path, query) => {
			let arr = this.getpath(this.target,path)
			return arr && arr.filter ? arr.filter( sift(query) ) : []
    }
    this.findOne = (path, query) => {
			let arr = this.find(path,query)
			return arr.filter && arr.length ? arr[0] : undefined
    }
  }

  get(target, key) {
		if( this[key] ) return this[key]
    return target[key];
  }

  set(target, key, value) {
    target[key] = value;
    this.target = target
    this.save()
    return value;
  }

  deleteProperty(target, key) {
    delete target[key];
    this.target = target 
    this.save()
    return 
  }
}

module.exports = function jsonObject(options) {
  return new Proxy(readFile(options.file), new ProxyHandler(options));
};
