const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AuthSchema = new Schema({
  refreshToken: { type: String, require: true, default: '__TOKEN__' },
  userRole: { type: String, require: true, default: 'user' },
  userName: { type: String, require: true, default: '' },
  password: { type: String, require: true, default: '' },
  userPhone: { type: String, require: true, default: '未绑定' },
  createTime: { type: Number, require: true, default: Date.parse(new Date()) },
})

module.exports = mongoose.model('Auth', AuthSchema)
