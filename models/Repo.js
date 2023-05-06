const mongoose = require('mongoose')

const Schema = mongoose.Schema

const RepoSchema = new Schema({
  repoTitle: { type: String, require: true },

  repoNoteNum: { type: Number, require: true, default: 0 },
  visitNum: { type: Number, require: true, default: 0 },
  updateTime: { type: Number, require: true, default: Date.parse(new Date()) },

  isStar: { type: Boolean, require: true, default: false },
  starTime: { type: Number, require: true, default: Date.parse(new Date()) },

  isDel: { type: Boolean, require: true, default: false },
  delTime: { type: Number, require: true, default: Date.parse(new Date()) },

  repoDesc: String,

  createTime: { type: Number, require: true, default: Date.parse(new Date()) },
  userId: String,
  userName: String,

  noteList: { type: Array, require: true, default: [] },
})

RepoSchema.methods.addNum = function () {
  this.repoNoteNum += 1
}

module.exports = mongoose.model('Repo', RepoSchema)
