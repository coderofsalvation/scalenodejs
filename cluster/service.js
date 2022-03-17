module.exports = {

	service: (name) => {

		const { Server, Client } = require('ezrpc')
		const service = new Server( parseInt(process.env.port) )
		let log       = (msg) => console.log('[service|'+process.pid+'|tcp/'+process.env.port+'] '+msg)

		service.server.on('connection', () => {
			service.client = new Client( process.env.upstream || 'localhost', 9999,{maxReconnectAttempts:-1})
			service.client.socket.on('connect', () => {
				log('cluster-node connected')
				if( service.init ) service.init(service.client.methods)
			})
		})
		log('cluster-node started on port '+process.env.port)

 		return service

	}

}
