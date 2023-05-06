const express = require('express')
const app = express()
// 连接数据库
const mongoose = require('./db/connect')

// 导入中间件
const bodyParser = require('body-parser')
const vertoken = require('./utils/token')
const expressJwt = require('express-jwt')
const cors = require('cors')

// 导入路由
const repoRoute = require('./routers/repo')
const noteRoute = require('./routers/note')
const tagRoute = require('./routers/tag')
const statsRoute = require('./routers/stats')
const authRoute = require('./routers/auth')

// 使用中间件并配置

// 配置跨域
app.use(
  cors({
    origin: 'http://localhost:3200',
  })
)

// 使用 body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//验证token是否过期并规定那些路由不需要验证
app.use(
  expressJwt
    .expressjwt({
      secret: 'csnote',
      algorithms: ['HS256'],
    })
    .unless({
      //用户登录、注册的时候不需要验证token
      path: ['/auth/login', '/auth/create'],
    })
)

//解析token获取用户信息
app.use(function (req, res, next) {
  console.log(req.url + '正在解析token')
  var token = req.headers['authorization']
  if (!token) {
    console.log('token未找到')
    return next()
  } else {
    vertoken
      .getToken(token)
      .then((data) => {
        req.auth = data
        return next()
      })
      .catch((error) => {
        return next()
      })
  }
})

//token失效返回信息
app.use(function (err, req, res, next) {
  if (err.status == 410) {
    console.log('检测到token失效')
    return res.status(410).send()
  }
})

// 路由配置
app.use('/auth', authRoute)
app.use('/stats', statsRoute)
app.use('/repo', repoRoute)
app.use('/note', noteRoute)
app.use('/tag', tagRoute)
app.use('/', (req, res) => {
  console.log(req.ip + '访问：' + req.url)
  res.status(403).send('error')
})
// app.use('/stats', statsRoute)

app.listen(3000, '0.0.0.0', () => {
  console.log('服务端开启成功，监听端口3000')
})
