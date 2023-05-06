const mongoose = require('mongoose')
const { getTimeStamp } = require('../utils/time')

const Schema = mongoose.Schema

const StatsSchema = new Schema({
  activeObjType: String,
  activeObjId: String,
  activeType: { type: Number, require: true, default: 0 },
  activeTime: { type: Number, require: true, default: getTimeStamp() },
  activeUserId: String,
  activeDetail: Object,
})

module.exports = mongoose.model('Stats', StatsSchema)
