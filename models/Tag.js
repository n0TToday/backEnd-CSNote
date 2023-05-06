const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TagSchema = new Schema({
  tagTitle: { type: String, require: true },
  tagNoteNum: { type: Number, require: true, default: 0 },
  createTime: { type: Number, require: true, default: Date.parse(new Date()) },
  userId: { type: String, require: true },
  userName: { type: String, require: true },
})

TagSchema.methods.addNote = function () {
  this.tagNoteNum += 1
  console.log('向标签中添加笔记成功')
}
TagSchema.methods.removeNote = function () {
  this.tagNoteNum -= 1
  console.log('向标签中删除笔记成功')
}

module.exports = mongoose.model('Tag', TagSchema)
