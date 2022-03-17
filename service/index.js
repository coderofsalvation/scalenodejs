const service = require('./../cluster/service').service('myservice')

service.module.exports = {
  async ping () {
    let app = service.client.methods
    app.log('ping!', 'cluster')
    //log('local ping!')
    return 123
  }
}

service.init = async (app) => {
  await app.log("connected!",'myservice')
  await app.ping()
}
