var dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
// import 'dayjs/locale/zh-cn' // ES 2015

dayjs.locale('zh-cn') // 全局使用
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
function getTimeStamp() {
  var now = dayjs().valueOf()
  return now
}
function getRelativeTime(time) {
  return dayjs(time).toNow()
}
module.exports = { getTimeStamp, getRelativeTime }
