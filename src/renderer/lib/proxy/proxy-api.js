/**
 * Created by luoyang on 2019-02-08
 */

const AnyProxy = require('anyproxy')

class ProxyApi {
  constructor () {
    this.proxyServer = null
    this.options = {
      port: 8001,
      // rule: require('myRuleModule'),
      webInterface: {
        enable: true,
        webPort: 8002
      },
      throttle: 10000,
      forceProxyHttps: true,
      wsIntercept: false, // 不开启websocket代理
      silent: false
    }
  }

  init () {
    this.proxyServer = new AnyProxy.ProxyServer(this.options)
  }

  start (onUpdate) {
    this.proxyServer.once('ready', function () { console.log('启动完成') })
    if (onUpdate) {
      this.proxyServer.recorder.on('update', (data) => {
        onUpdate(data)
      })
    }
    this.proxyServer.start()
  }

  stop () {
    this.proxyServer.off('update')
    this.proxyServer.stop()
  }

  fetchBody (id) {
    return new Promise((resolve, reject) => {
      this.proxyServer.recorder.getDecodedBody(id, (err, result) => {
        if (err || !result || !result.content) {
          reject(err || new Error())
        } else if (result.type && result.type === 'image' && result.mime) {
          resolve({
            raw: true,
            type: result.mime,
            content: result.content
          })
        } else {
          resolve({
            id: id,
            type: result.type,
            content: result.content
          })
        }
      })
    })
  }

  getSingleLog (id) {
    return new Promise((resolve, reject) => {
      if (this.proxyServer.recorder) {
        this.proxyServer.recorder.getSingleRecord(id, (err, data) => {
          if (err) {
            reject(err.toString())
          } else {
            resolve(data[0])
          }
        })
      } else {
        reject(new Error())
      }
    })
  }
}

export default new ProxyApi()