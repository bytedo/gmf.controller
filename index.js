/**
 * 控制器基类
 * @authors yutent (yutent@doui.cc)
 * @date    2016-01-02 23:19:16
 *
 */

import jwt from '@gm5/jwt'

export default class Controller {
  constructor({ ctx, req, res }) {
    this.context = ctx
    this.name = req.app
    this.request = req
    this.response = res

    jwt.expires = ctx.get('session').ttl
    jwt.secret = ctx.get('jwt')

    this.jwt = { sign: jwt.sign }

    // smarty.config('path', this.ctx.get('VIEWS'))
    // smarty.config('ext', this.ctx.get('temp_ext'))
    // smarty.config('cache', !!this.ctx.get('temp_cache'))

    // this.session = this.ctx.ins('session')
  }

  //定义一个变量，类似于smarty，把该
  // assign(key, val) {
  //   key += ''
  //   if (!key) {
  //     return
  //   }

  //   if (val === undefined || val === null) {
  //     val = ''
  //   }

  //   smarty.assign(key, val)
  // }

  //模板渲染, 参数是模板名, 可不带后缀, 默认是 .tpl
  // render(file, noParse = false) {
  //   smarty
  //     .render(file, noParse)
  //     .then(html => {
  //       this.response.render(html)
  //     })
  //     .catch(err => {
  //       this.response.error(err)
  //     })
  // }

  checkAuth() {
    this.jwt.result = jwt.verify(this.request.header('authorized'))
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

  // RESFULL-API规范的纯API返回
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
    if (this.ctx.get('debug')) {
      msg = err.message || err
    }

    msg = encodeURIComponent(msg + '')

    this.response.append('X-debug', msg)
  }
}
