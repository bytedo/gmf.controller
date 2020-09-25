/**
 * 控制器基类
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/24 15:45:17
 */

import { sha1 } from 'crypto.js'

export default class Controller {
  // 初始化方法, 取代原先的构造方法
  __f_i_v_e__(ctx, req, res) {
    this.context = ctx
    this.name = req.app
    this.request = req
    this.response = res

    this.smarty = ctx.$$smarty
  }

  // 定义一个模板变量
  assign(key, val) {
    if (val === undefined || val === null) {
      val = ''
    }
    key += ''

    if (key && this.smarty) {
      this.smarty.assign(key, val)
    }
  }

  // 模板渲染, 参数是模板名, 可不带后缀, 默认是
  render(file, noParse = false) {
    if (this.smarty) {
      this.smarty
        .render(file, noParse)
        .then(html => {
          this.response.render(html)
        })
        .catch(err => {
          this.response.error(err)
        })
    }
  }

  get jwt() {
    var { enabled, ttl } = this.context.get('jwt')
    var { mixKey } = this.request

    if (enabled) {
      var tmp = Object.create(null)

      tmp.sign = data => this.context.$$jwt.sign(data, mixKey, ttl)

      tmp.check = _ => {
        var str = this.request.header('authorization')
        if (str) {
          return this.context.$$jwt.verify(str, mixKey)
        }
      }
      return tmp
    } else {
      throw Error('Jwt was disabled.')
    }
  }

  // cookie读写
  cookie(key, val, opt) {
    if (arguments.length < 2) {
      return this.request.cookie(key)
    }

    if (!opt) {
      opt = {}
    }
    opt.domain = opt.domain || this.context.get('domain')

    if (val === null || val === undefined) {
      delete opt.expires
      opt.maxAge = -1
    }

    this.response.cookie(key, val, opt)
  }

  // 会话读写
  session(key, val) {
    var { enabled } = this.context.get('session')
    var { ssid } = this.request
    if (enabled) {
      if (arguments.length < 2) {
        // 这里返回的是Promise对象
        return this.context.$$session.get(ssid, key)
      }

      key += ''
      this.context.$$session.set(ssid, key, val)
    } else {
      throw Error('Session was disabled.')
    }
  }

  // resfull-api规范的纯API返回
  send(status = 200, msg = 'success', data = {}) {
    if (typeof msg === 'object') {
      data = msg
      msg = 'success'
    }
    this.response.send(status, msg, data)
  }

  //针对框架定制的debug信息输出
  xdebug(err) {
    var msg = err
    if (this.context.get('debug')) {
      msg = err.message || err
    }

    msg = encodeURIComponent(msg + '')

    this.response.append('X-debug', msg)
  }
}
