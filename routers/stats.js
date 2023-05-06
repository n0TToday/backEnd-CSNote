// 查询不同的活动记录
// 全部、按user
// 重要：创建、删除
// 不重要：修改、访问
// 特殊：收藏、归档、回收、分享及反操作
const express = require('express')
const router = express.Router()
const statsModel = require('../models/Stats')
const {
  isUserRepo,
  isUserNote,
  formatManyActiveId,
  getActiveNum,
  getTagNum,
  getNoteNum,
  getRepoNum,
  getLastLoginIP,
  getRegisterTime,
} = require('../utils/model-helper')

router.get('/', (req, res) => {
  console.log('获取用户所有活动')
  const findId = req.auth.userId

  statsModel
    .find({ activeUserId: findId })
    .sort('-activeTime')
    .limit(100)
    .then((findres) => {
      if (findres) {
        return formatManyActiveId(findres)
      }
    })
    .then((formatres) => {
      res.send(formatres).end()
    })
    .catch((err) => {
      console.error('错误')
      res.sendStatus(500)
    })
})

router.get('/auth', (req, res) => {
  console.log('获取用户账号活动')
  const findId = req.auth.userId
  statsModel
    .find({ activeUserId: findId, activeObjType: 'auth' })
    .sort('-activeTime')
    .then((findres) => {
      if (findres) {
        return formatManyActiveId(findres)
      }
    })
    .then((formatres) => {
      res.send(formatres).end()
    })
    .catch((err) => {
      console.error('错误')
      res.sendStatus(500)
    })
})

router.get('/repo/:findId', (req, res) => {
  console.log('获取单一repo活动记录')
  const { findId } = req.params
  const { userId } = req.auth
  isUserRepo(userId, findId)
    .then((isres) => {
      statsModel
        .find({
          activeUserId: userId,
          activeObjType: 'repo',
          activeObjId: findId,
        })
        .sort('-activeTime')
        .limit(50)
        .then((findres) => {
          if (findres) {
            return formatManyActiveId(findres)
          }
        })
        .then((formatres) => {
          res.send(formatres).end()
        })
        .catch((err) => {
          console.error('错误')
          res.sendStatus(500)
        })
    })
    .catch((err) => {
      res.sendStatus(403)
    })
})

router.get('/note/:findId', (req, res) => {
  console.log('获取note活动记录')
  const { findId } = req.params
  const { userId } = req.auth
  isUserNote(userId, findId)
    .then((isres) => {
      statsModel
        .find({
          activeUserId: userId,
          activeObjType: 'note',
          activeObjId: findId,
        })
        .sort('-activeTime')
        .limit(50)
        .then((findres) => {
          if (findres) {
            return formatManyActiveId(findres)
          }
        })
        .then((formatres) => {
          res.send(formatres).end()
        })
        .catch((err) => {
          console.error('错误')
          res.sendStatus(500)
        })
    })
    .catch((err) => {
      res.sendStatus(403)
    })
})

router.get('/info', (req, res) => {
  console.log(req.auth.userName + '获取主页活动记录')
  const userId = req.auth.userId
  let info = {
    noteNum: 0,
    tagNum: 0,
    repoNum: 0,
    activeNum: 0,
    lastLoginIP: '',
    useDay: 0,
  }
  console.log('获取笔记、标签、知识库数')
  getRepoNum(userId)
    .then((res) => (info.repoNum = res))
    .then(() => {
      return getNoteNum(userId)
    })
    .then((res) => (info.noteNum = res))
    .then(() => {
      return getTagNum(userId)
    })
    .then((res) => (info.tagNum = res))
    .then(() => {
      return getActiveNum(userId)
    })
    .then((res) => (info.activeNum = res))
    .then(() => {
      console.log('获取最近一次登录IP')
      return getLastLoginIP(userId)
    })
    .then((res) => (info.lastLoginIP = res))
    .then(() => {
      console.log('获取注册时间')
      return getRegisterTime(userId)
    })
    .then((res) => (info.useDay = getIntervalDay(res)))
    .then(() => {
      res.send(info)
    })
    .catch((err) => {
      console.error('获取AuthInfo错误')
      res.sendStatus(500)
    })
})

router.get('/work', (req, res) => {
  console.log('获取近期重要活动记录')
  const findId = req.auth.userId
  statsModel
    .find({ activeUserId: findId })
    .where('activeType')
    .in([1, 2, 3, 6, 7])
    .sort('-activeTime')
    .limit(10)
    .then((findres) => {
      if (findres) return formatManyActiveId(findres)
    })
    .then((formatres) => {
      res.send(formatres).end()
    })
    .catch((err) => {
      console.error('错误')
      res.sendStatus(500)
    })
})

function getIntervalDay(startTime) {
  // return Math.round((now - time) / (1000 * 60 * 60 * 60 * 24));

  const date1 = startTime
  const date2 = Date.now()
  const date3 = date2 - date1
  const days = Math.floor(date3 / (24 * 3600 * 1000))
  return days
}

module.exports = router
// 从用户角度kaolv
/* 使用场景：


工作台
统计页面

info


work
展示用户最近重要活动

/
展示用户全部活动
/auth
展示用户最近平台使用情况（登录退出ip等
/repo tag note 
知识库详情、笔记详情、标签详情
全部活动



如何存储
statStore
state:{
  workActiveList:[]
  allActiveList:[]
  authActiveList:[]
  repoActiveList:[]
  noteActiveList
  tagActiveList
}

get userid 
/stats

/
/work
/auth
/repo/id
/note/id
/tag/id



*/
// 删除、以后再做

// 修改、不支持
