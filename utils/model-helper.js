const statsModel = require('../models/Stats')
const authModel = require('../models/Auth')
const repoModel = require('../models/Repo')
const noteModel = require('../models/Note')
const tagModel = require('../models/Tag')
const { getTimeStamp } = require('./time')

/* 统计模块 */

function saveTagActive(objId, type, userId, detail) {
  const tagActive = new statsModel({
    activeObjType: 'tag',
    activeObjId: objId,
    activeType: type,
    activeUserId: userId,
    activeDetail: detail,
    activeTime: getTimeStamp(),
  })
    .save()
    .then((saveres) => {
      return true
    })
    .catch((err) => {
      console.error(err + '记录Tag活动错误')
      return false
    })
}
function saveNoteActive(objType, objId, type, userId, detail) {
  const noteActive = new statsModel({
    activeObjType: objType,
    activeObjId: objId,
    activeType: type,
    activeUserId: userId,
    activeDetail: detail,
    activeTime: getTimeStamp(),
  })
    .save()
    .then((saveres) => {
      return true
    })
    .catch((err) => {
      console.error(err + '记录Note活动错误')
      return false
    })
}
function saveRepoActive(objId, type, userId, detail) {
  const repoActive = new statsModel({
    activeObjType: 'repo',
    activeObjId: objId,
    activeType: type,
    activeUserId: userId,
    activeTime: getTimeStamp(),
    activeDetail: detail,
  })
    .save()
    .then((saveres) => {
      return true
    })
    .catch((err) => {
      console.error(err + '记录repo活动错误')
      return false
    })
}
// ToDo
function saveAuthActive(objId, type, userId, detail) {
  const authActive = new statsModel({
    activeObjType: 'auth',
    activeObjId: objId,
    activeType: type,
    activeUserId: userId,
    activeDetail: detail,
    activeTime: getTimeStamp(),
  })
    .save()
    .then((saveres) => {
      return true
    })
    .catch((err) => {
      console.error(err + '记录auth活动错误')
      return false
    })
}

// 查有多少活动记录
function getActiveNum(userId) {
  return new Promise(function (resolve, reject) {
    statsModel
      .count({ activeUserId: userId })
      .then((res) => {
        console.log(res)
        resolve(res)
      })
      .catch((err) => {
        resolve(0)
      })
  })
}

// 格式化activeId
function formatActiveId(active) {
  res = JSON.parse(JSON.stringify(active).replace(/_id/g, 'activeId'))
  return res
}

// 格式化许多activeId
function formatManyActiveId(List) {
  return new Promise(function (resolve, reject) {
    var list = []
    for (let i of List) {
      list.push(formatActiveId(i))
    }
    resolve(list)
  })
}

/* Repo模块 */

// 向repo中添加note
function addNoteToRepo(noteTitle, noteId, repoId) {
  // 获取repo详情
  repoModel
    .findById(repoId)
    .then((findres) => {
      console.log(findres.repoNoteNum)
      findres.repoNoteNum = findres.repoNoteNum + 1
      // 修改保存
      repoModel.findByIdAndUpdate(repoId, findres).then((updateres) => {
        saveRepoActive(repoId, 11, findres.userId, findres.repoTitle)
        return true
      })
      // 完事
    })
    .catch((err) => {
      console.error(err + 'helper向repo中添加note失败')
      return false
    })
}

// 从repo中删除note
function removeNoteFromRepo(noteId, repoId) {
  repoModel
    .findById(repoId)
    .then((findres) => {
      var updateres = findres
      updateres.repoNoteNum -= 1
      repoModel
        .findByIdAndUpdate(repoId, updateres)
        .then((res) => {
          saveRepoActive(repoId, 12, findres.userId, findres.repoTitle)
        })
        .catch((err) => {
          console.error('helper从repo中删除note失败')
        })
    })
    .catch((err) => {
      console.error('helper从repo中删除note失败')
    })
}

// 从repo中查note在第几个
function hasNoteInRepo(noteId, repoId) {
  return new Promise(function (resolve, reject) {
    // 获取repo详情
    repoModel
      .findById(repoId)
      .then((findres) => {
        // 查找note
        var index = 0
        for (var i of findres.noteList) {
          console.log('fenli')
          const v1 = i.noteId + ''
          const v2 = noteId + ''
          if (v1 === v2) {
            resolve(findres, index)
          } else index++
        }
        reject(false)
      })
      .catch((err) => reject(false))
  })
}

// 根据repoID查repo名称
function getRepoTitleByRepoId(repoId) {
  return new Promise(function (resolve, reject) {
    repoModel
      .findById(repoId, 'repoTitle')
      .then((findres) => {
        resolve(findres.repoTitle)
      })
      .catch((err) => {
        console.error('helper根据repoID查repo名称失败')
        reject(false)
      })
  })
}

// 根据Id查用户
function findUserIdByRepoId(repoId) {
  return new Promise(function (resolve, reject) {
    repoModel
      .findOne({ _id: repoId }, 'userId')
      .then((findres) => {
        resolve(findres.userId)
      })
      .catch((err) => {
        console.error('helper查找repo用户错误')
        reject(err)
      })
  })
}

// 判断是否是用户的repo
function isUserRepo(userId, repoId) {
  return new Promise(function (resolve, reject) {
    repoModel
      .findById(repoId, 'userId')
      .then((findres) => {
        if (userId == findres.userId) resolve(true)
        else reject(false)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// 格式化repoId
function formatRepoId(repo) {
  res = JSON.parse(JSON.stringify(repo).replace(/_id/g, 'repoId'))
  return res
}

// 格式化许多repoId
function formatManyRepoId(List) {
  return new Promise(function (resolve, reject) {
    var list = []
    for (let i of List) {
      list.push(formatRepoId(i))
    }
    resolve(list)
  })
}

// 查有多少知识库
function getRepoNum(userId) {
  return new Promise(function (resolve, reject) {
    repoModel
      .count({ userId: userId })
      .then((res) => resolve(res))
      .catch((err) => {
        resolve(0)
      })
  })
}

/* Note模块 */

function getNoteListInRepo(repoId) {
  return noteModel.find(
    { repoId: repoId, isDel: false },
    'noteTitle createTime isArchive isStar updateTime'
  )
}

// 根据ID查名称
function getNoteTitleByNoteId(noteId) {
  return new Promise(function (resolve, reject) {
    noteModel
      .findById(noteId, 'noteTitle')
      .then((findres) => {
        resolve(findres.noteTitle)
      })
      .catch((err) => {
        console.error('helper根据noteID查note名称失败')
        reject(false)
      })
  })
}

// 根据noteId查用户id
function findUserIdByNoteId(noteId) {
  return new Promise(function (resolve, reject) {
    noteModel
      .findOne({ _id: noteId }, 'userId')
      .then((findres) => {
        resolve(findres.userId)
      })
      .catch((err) => {
        console.error('helper查找笔记用户错误')
        reject(false)
      })
  })
}

// 判断是否是用户的note
function isUserNote(userId, noteId) {
  return new Promise(function (resolve, reject) {
    noteModel
      .findById(noteId, 'userId')
      .then((res) => {
        console.log(userId)
        console.log(res.userId)
        if (userId == res.userId) resolve(true)
        else reject('比对本人笔记出错')
      })
      .catch((err) => reject('非本人笔记'))
  })
}

// 格式化noteId
function formatNoteId(note) {
  res = JSON.parse(JSON.stringify(note).replace(/_id/g, 'noteId'))
  return res
}

// 格式化许多noteId
function formatManyNoteId(List) {
  return new Promise(function (resolve, reject) {
    var list = []
    for (let i of List) {
      list.push(formatNoteId(i))
    }
    resolve(list)
  })
}

// 查有多少笔记
function getNoteNum(userId) {
  return new Promise(function (resolve, reject) {
    noteModel
      .count({ userId: userId })
      .then((res) => resolve(res))
      .catch((err) => {
        resolve(0)
      })
  })
}

/* Tag模块 */

// 向Tag中添加note
function addNoteToTag(tagTitle, userId, userName) {
  hasTagByTitle(tagTitle, userId)
    .then((res) => {
      res.tagNoteNum += 1
      tagModel.findByIdAndUpdate(res._id, res).catch((err) => {
        console.error('向Tag中添加note错误')
      })
    })
    .catch((err) => {
      createTag(tagTitle, userId, userName).then((res) => {
        res.tagNoteNum += 1
        tagModel.findByIdAndUpdate(res._id, res).catch((err) => {
          console.error('向Tag中添加note错误')
        })
      })
    })
}

// 从Tag中移除note
function removeNoteFromTag(tagTitle, userId) {
  tagModel
    .findOne({ tagTitle: tagTitle, userId: userId })
    .then((res) => {
      res.tagNoteNum -= 1

      tagModel.findByIdAndUpdate(res._id, res).catch((err) => {
        console.error('从Tag中删除note错误')
      })
    })
    .catch((err) => {
      console.error('从Tag中删除note错误')
    })
}

// 查询是否存在tagBy名称
function hasTagByTitle(tagTitle, userId) {
  return new Promise(function (resolve, reject) {
    tagModel
      .findOne({ tagTitle: tagTitle, userId: userId })
      .then((findres) => {
        resolve(findres)
      })
      .catch((err) => {
        reject(false)
      })
  })
}

// 创建tag
function createTag(tagTitle, userId, userName) {
  return new Promise(function (resolve, reject) {
    const newTag = new tagModel({
      tagTitle: tagTitle,
      userId: userId,
      userName: userName,
    })
      .save()
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(false)
      })
  })
}

// 格式化tagId
function formatTagId(tag) {
  res = JSON.parse(JSON.stringify(tag).replace(/_id/g, 'tagId'))
  return res
}

// 格式化许多tagId
function formatManyTagId(List) {
  return new Promise(function (resolve, reject) {
    var list = []
    for (let i of List) {
      list.push(formatTagId(i))
    }
    resolve(list)
  })
}

// 查有多少标签
function getTagNum(userId) {
  return new Promise(function (resolve, reject) {
    tagModel
      .count({ userId: userId })
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        console.error(err)
        resolve(0)
      })
  })
}

/* Auth模块 */

// 获取最近登录ip
function getLastLoginIP(userId) {
  return new Promise(function (resolve, reject) {
    statsModel
      .findOne(
        {
          activeUserId: userId,
          activeType: 10,
        },
        'activeDetail'
      )
      .then((findres) => {
        resolve(findres.activeDetail)
      })
      .catch((err) => {
        console.error(err)
        resolve('')
      })
  })
}

// 获取注册时间
function getRegisterTime(userId) {
  return new Promise(function (resolve, reject) {
    authModel
      .findById(userId, 'createTime')
      .then((findres) => {
        resolve(findres.createTime)
      })
      .catch((err) => {
        console.error(err)
        resolve(Date.now())
      })
  })
}

// 格式化userId
function formatUserId(user) {
  res = JSON.parse(JSON.stringify(user).replace(/_id/g, 'userId'))
  return res
}

// 格式化许多userId
function formatManyUserId(List) {
  return new Promise(function (resolve, reject) {
    var list = []
    for (let i of List) {
      list.push(formatUserId(i))
    }
    resolve(list)
  })
}

module.exports = {
  saveAuthActive,
  saveNoteActive,
  saveRepoActive,
  saveTagActive,
  getRepoTitleByRepoId,
  findUserIdByRepoId,
  isUserRepo,
  getNoteTitleByNoteId,
  findUserIdByNoteId,
  isUserNote,
  addNoteToRepo,
  createTag,
  hasTagByTitle,
  addNoteToTag,
  removeNoteFromTag,
  removeNoteFromRepo,
  formatNoteId,
  formatRepoId,
  formatManyRepoId,
  formatManyNoteId,
  formatTagId,
  formatManyTagId,
  formatManyActiveId,
  getActiveNum,
  getTagNum,
  getNoteNum,
  getRepoNum,
  getLastLoginIP,
  getRegisterTime,
  formatManyUserId,
  formatUserId,
  getNoteListInRepo,
}
