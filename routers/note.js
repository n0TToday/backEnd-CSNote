const { error } = require('console')
const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const noteModel = require('../models/Note')
const {
  isUserNote,
  saveNoteActive,
  addNoteToRepo,
  addNoteToTag,
  removeNoteFromTag,
  removeNoteFromRepo,
  formatManyNoteId,
  formatNoteId,
} = require('../utils/model-helper')
const { getTimeStamp } = require('../utils/time')

// 查询删除和收藏的笔记列表，不查全部的，归档和分享的emmm，也查，查询速记列表！！！
router.get('/', (req, res) => {
  const { type, repoId } = req.query
  const { userId, userName } = req.auth
  console.log(userName + '正在查询' + type + '笔记列表' + userId)
  if (userId) {
    if (repoId) {
      noteModel
        .find({
          userId: userId,
          isDel: false,
          repoId: repoId,
          isArchive: false,
        })
        .then((findres) => {
          if (findres) {
            formatManyNoteId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询知识库下笔记列表错误')
        })
    } else if (type == 'fast') {
      noteModel
        .find(
          { userId: userId, noteType: 'fast', isDel: false },
          'noteContent createTime'
        )
        .sort('-createTime')
        .then((findres) => {
          if (findres) {
            formatManyNoteId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询速记笔记列表错误')
        })
    } else if (type == 'del') {
      noteModel
        .find({ userId: userId, isDel: true })
        .then((findres) => {
          if (findres) {
            formatManyNoteId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询回收站笔记列表错误')
        })
    } else if (type == 'star') {
      noteModel
        .find({ userId: userId, isDel: false, isStar: true, isArchive: false })
        .then((findres) => {
          if (findres) {
            formatManyNoteId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询收藏笔记列表错误')
        })
    } else if (type == 'arch') {
      noteModel
        .find({ userId: userId, isDel: false, isArchive: true, isStar: false })
        .then((findres) => {
          if (findres) {
            formatManyNoteId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询归档笔记列表错误')
        })
    } else if (type == 'share') {
      noteModel
        .find({ userId: userId, isDel: false, isShare: true })
        .then((findres) => {
          if (findres) {
            formatManyNoteId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询已分享笔记列表错误')
        })
    } else res.sendStatus(404)
  } else res.sendStatus(403)
})

// 查询笔记详情
router.get('/:findId', (req, res) => {
  const { findId } = req.params
  const { userId, userName } = req.auth
  isUserNote(userId, findId)
    .then((isres) => {
      noteModel
        .findById(findId)
        .then((findres) => {
          // 记录
          saveNoteActive(findres.noteType, findId, 9, userId, findres.noteTitle)
          const formatres = formatNoteId(findres)
          res.send(formatres)
        })
        .catch((err) => {
          console.error('查询笔记详情错误')
          res.sendStatus(404)
        })
    })
    .catch((err) => {
      res.sendStatus(403)
    })
})

// 创建新笔记
router.post('/', (req, res) => {
  console.log(req.body)
  const noteDetail = req.body
  const { userId, userName } = req.auth
  const newNote = new noteModel({
    noteTitle: noteDetail.noteTitle,
    noteType: noteDetail.noteType,
    userId: userId,
    userName: userName,
    noteContent: noteDetail.noteContent,
    repoId: '',
    tagList: [],
    createTime: getTimeStamp(),
  })
  // 用户是否选择知识库及标签，之后的处理
  if (noteDetail.repoId) {
    newNote.repoId = noteDetail.repoId
  }
  if (noteDetail.tagList) {
    newNote.tagList = noteDetail.tagList
  }
  newNote
    .save()
    .then((saveres) => {
      // 记录
      saveNoteActive(
        saveres.noteType,
        saveres._id,
        1,
        saveres.userId,
        saveres.noteTitle
      )
      if (noteDetail.repoId)
        addNoteToRepo(saveres.noteTitle, saveres._id, saveres.repoId)
      // To-Do
      // 依次修改所选标签中笔记数量
      if (noteDetail.tagList) {
        for (const tag of noteDetail.tagList) {
          addNoteToTag(tag, saveres.userId, saveres.userName)
        }
      }
      res.send(saveres._id)
    })
    .catch((err) => {
      console.error('创建新笔记错误')
      res.sendStatus(500)
    })
})

// 更新笔记内容
// 类型：star、arch、del、share、repo tag content、info
// repo tag info 没法判断，直接放进一个去，然后对比
router.put('/:findId', (req, res) => {
  console.log('进入修改note')
  const { findId } = req.params
  let { type } = req.query
  const { userId, userName } = req.auth

  var typeNum = 0

  isUserNote(userId, findId)
    .then((isres) => {
      const noteDetail = req.body
      if (type == 'star') {
        typeNum = 6
        noteDetail.isStar = noteDetail.isStar ? false : true
        noteDetail.starTime = getTimeStamp()
      } else if (type == 'arch') {
        typeNum = 7
        noteDetail.isArchive = noteDetail.isArchive ? false : true
        console.log(noteDetail.isArchive)
        noteDetail.archTime = getTimeStamp()
      } else if (type == 'del') {
        typeNum = 3
        noteDetail.isDel = noteDetail.isDel ? false : true
        noteDetail.delTime = getTimeStamp()
      } else if (type == 'share') {
        typeNum = 8
        noteDetail.isShare = noteDetail.isShare ? false : true
        noteDetail.shareTime = getTimeStamp()
      } else {
        typeNum = 4
        noteDetail.updateTime = getTimeStamp()
        noteModel
          .findById(findId, 'repoId tagList')
          .then((findres) => {
            if (noteDetail.repoId != findres.repoId) {
              type = 'class'
              removeNoteFromRepo(findId, findres.repoId)
              console.log(noteDetail.repoId)
              console.log(findres.repoId)
              addNoteToRepo(noteDetail.noteTitle, findId, noteDetail.repoId)
            }
            if (noteDetail.tagList != findres.tagList) {
              type = 'class'
              for (const i of findres.tagList) removeNoteFromTag(i, userId)
              if (noteDetail.tagList)
                for (const i of noteDetail.tagList)
                  addNoteToTag(i, noteDetail.userId, noteDetail.userName)
            }
          })
          .catch((err) => console.log(err))
      }
      noteModel
        .findByIdAndUpdate(findId, noteDetail)
        .then((findres) => {
          // 记录
          noteModel.findById(findres._id).then((findres) => {
            saveNoteActive(
              findres.noteType,
              findId,
              typeNum,
              userId,
              findres.noteTitle
            )
            const formatres = formatNoteId(findres)
            res.send(formatres)
          })
        })
        .catch((err) => {
          console.error('更新笔记错误')
          res.sendStatus(500)
        })
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(403)
    })
})

// 删除笔记
router.delete('/:findId', (req, res) => {
  const { findId } = req.params
  const { userId, userName } = req.auth
  isUserNote(userId, findId)
    .then((isres) => {
      noteModel
        .findByIdAndRemove(findId)
        .then((delres) => {
          if (delres.repoId) {
            removeNoteFromRepo(delres._id, delres.repoId)
          }
          if (delres.tagList) {
            for (const tagTitle of delres.tagList) {
              removeNoteFromTag(tagTitle, userId)
            }
          }
          console.log('已删除笔记：' + delres.noteTitle)
          saveNoteActive(delres.noteType, findId, 2, userId, delres.noteTitle)

          res.send(true)
        })
        .catch((err) => {
          console.error('删除笔记错误')
          res.send(false)
        })
    })
    .catch((err) => {
      console.log(err)
      res.sendStatus(403)
    })
})

module.exports = router
