/**
 * 控制器基类
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/24 15:45:17
 */

export default class Controller {
  // 初始化方法, 取代原先的构造方法
  __f_i_v_e__(ctx, req, res) {
    this.context = ctx
    this.name = req.app
    this.request = req
    this.response = res
  }

  // 定义一个模板变量
  assign(key, val) {
    if (val === undefined || val === null) {
      val = ''
    }
    key += ''

    if (key) {
      this.context.$$views.assign(key, val)
    }
  }

  // 模板渲染, 参数是模板名, 可不带后缀, 默认是
  render(file, noParse = false) {
    this.context.$$views
      .render(file, noParse)
      .then(html => {
        this.response.render(html)
      })
      .catch(err => {
        this.response.error(err)
      })
  }

  // jwt 生成token及校验token
  jwt(data) {
    var { enabled, ttl } = this.context.get('jwt')
    var { mixKey } = this.request
    var auth = this.request.header('authorization')

    if (enabled) {
      if (data) {
        return this.context.$$jwt.sign(data, mixKey, ttl)
      } else {
        if (auth) {
          this.jwt.result = this.context.$$jwt.verify(auth, mixKey)
          return this.jwt.result
        }
      }
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
