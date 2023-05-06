var jwt = require('jsonwebtoken')
var jwtScrect = 'csnote' //签名

//登录接口 生成token的方法
var setToken = function (userName, userId) {
  return new Promise((resolve, reject) => {
    //expiresln 设置token过期的时间
    const token = jwt.sign({ userName: userName, userId: userId }, jwtScrect, {
      expiresIn: '24h',
    })
    resolve(token)
  })
}

//各个接口需要验证token的方法
var getToken = function (token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      console.log('token是空的')
      reject({
        error: 'token 是空的',
      })
    } else {
      var info = jwt.verify(token.split(' ')[1], jwtScrect)
      resolve(info)
    }
  })
}

module.exports = {
  setToken,
  getToken,
}
