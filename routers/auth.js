const express = require('express')
const router = express.Router()
const authModel = require('../models/Auth')
const {
  saveAuthActive,
  formatManyUserId,
  formatUserId,
} = require('../utils/model-helper')
const crypto = require('crypto-js')
var vertoken = require('../utils/token')

// 获取验证码
router.post('/getSmsCode', (req, res) => {
  // To-Do
  // 生成验证码
  res.send('123456')
})

// 用户+密码 登录
router.post('/login', (req, res) => {
  console.log('进入登录流程')
  const { userName = undefined, password = undefined } = req.body
  if (!userName || !password) {
    console.log('请输入用户名或密码！')
    res.statusCode = 412
    res.send()
  } else {
    authModel
      .findOne({ userName: userName, password: password })
      .then((findres) => {
        saveAuthActive(findres._id, 10, findres._id, req.ip)

        vertoken.setToken(userName, findres._id).then((token) => {
          console.log(userName + '登录成功')
          res.status(200).send({
            token: token,
            refreshToken: findres.refreshToken,
          })
        })
      })
      .catch((err) => {
        console.log('用户名或密码错误！')
        res.statusCode = 411
        res.send()
      })
  }
})

router.post('/create', (req, res) => {
  console.log('进入注册流程')
  const {
    userName = undefined,
    password = undefined,
    userPhone = undefined,
  } = req.body
  if (!userName || !password) {
    res.statusCode(ERROR_PARAM_CODE).statusMessage(ERROR_PARAM_MSG).send()
  }
  // 生成retoken
  const refreshToken = crypto.MD5(userName + Date.now().toString())
  // 加密密码
  const pwd = crypto.MD5(password)
  // 生成新用户
  const newUser = new authModel({
    password: pwd,
    userName: userName,
    userPhone: userPhone,
    refreshToken: refreshToken,
  })
    .save()
    .then((findres) => {
      // 生成token
      vertoken.setToken(userName, findres._id).then((token) => {
        saveAuthActive(findres._id, 1, findres._id, userName)

        console.log('注册成功')
        res.status(200).send({
          token: token,
          refreshToken: findres.refreshToken,
        })
      })
    })
    .catch((err) => {
      res.statusCode(401)
      res.statusMessage('用户名或密码错误！')
      res.send()
    })
})

// 获取用户信息(请求头携带token, 根据token获取用户信息)
router.get('/getUserInfo', (req, res) => {
  console.log('进入获取userInfo流程')

  authModel
    .findById(req.auth.userId, 'userName userPhone userRole createTime')
    .then((findres) => {
      const userInfo = formatUserId(findres)
      res.send(userInfo)
    })
    .catch((err) => {
      res.statusCode(401).send('用户信息异常！')
    })
})

// 如果过期刷新token
router.post('/updateToken', (req, res) => {
  console.log('进入刷新token流程')
  const { refreshToken = '' } = options.body
  authModel
    .findOne({ refreshToken: refreshToken })
    .then((findres) => {
      // 生成token
      vertoken.setToken(userName, findres._id).then((token) => {
        res.send({
          token: token,
          refreshToken: findres.refreshToken,
        })
      })
    })
    .catch((err) => {
      res.status(410).send('用户已失效或不存在！')
    })
})
module.exports = router
