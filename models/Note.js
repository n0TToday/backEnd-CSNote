const mongoose = require('mongoose')
const { getTimeStamp } = require('../utils/time')
const Schema = mongoose.Schema

const NoteSchema = new Schema({
  noteTitle: String,
  noteType: { type: String, require: true, default: 'note' },

  isShare: { type: Boolean, require: true, default: false },
  shareTime: { type: Number, require: true, default: getTimeStamp() },

  isStar: { type: Boolean, require: true, default: false },
  starTime: { type: Number, require: true, default: getTimeStamp() },

  isArchive: { type: Boolean, require: true, default: false },
  archTime: { type: Number, require: true, default: getTimeStamp() },

  isDel: { type: Boolean, require: true, default: false },
  delTime: { type: Number, require: true, default: getTimeStamp() },

  visitNum: { type: Number, require: true, default: 0 },

  repoId: String,
  tagList: [String],
  updateTime: { type: Number, require: true, default: getTimeStamp() },

  createTime: { type: Number, require: true, default: getTimeStamp() },
  userId: { type: String, require: true },
  userName: { type: String, require: true },

  noteContent: Object,
})

module.exports = mongoose.model('Note', NoteSchema)
