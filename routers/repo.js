const express = require('express')
const router = express.Router()
const repoModel = require('../models/Repo')
const {
  saveRepoActive,
  getRepoTitleByRepoId,
  isUserRepo,
  formatManyRepoId,
  formatRepoId,
  getNoteListInRepo,
  formatManyNoteId,
} = require('../utils/model-helper')
const { getTimeStamp, getRelativeTime } = require('../utils/time')

// 查询未被删除的 知识库信息列表
router.get('/', (req, res) => {
  const { type } = req.query
  const { userId, userName } = req.auth

  if (userId) {
    if (type == 'del') {
      repoModel
        .find({ userId: userId, isDel: true }, 'repoTitle repoNoteNum delTime')
        .then((findres) => {
          if (findres) {
            formatManyRepoId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error(err + '查询回收站知识库列表错误')
          res.send([])
        })
    } else if (type == 'star') {
      repoModel
        .find(
          { userId: userId, isDel: false, isStar: true },
          'repoTitle repoNoteNum starTime'
        )
        .then((findres) => {
          if (findres) {
            formatManyRepoId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询收藏知识库列表错误')
          res.send([])
        })
    } else {
      repoModel
        .find(
          { userId: userId, isDel: false },
          'repoTitle repoNoteNum isStar createTime'
        )
        .then((findres) => {
          if (findres) {
            formatManyRepoId(findres).then((formatres) => {
              res.send(formatres).end()
            })
          }
        })
        .catch((err) => {
          console.error('查询知识库信息列表错误')
          res.send([])
        })
    }
  } else {
    console.log('1非本人知识库')
    res.sendStatus(403)
  }
})

// 查询知识库详情
router.get('/:findId', (req, res) => {
  const { findId } = req.params
  const { userId, userName } = req.auth

  isUserRepo(userId, findId)
    .then((isres) => {
      if (isres) {
        repoModel
          .findById(findId)
          .then((findres) => {
            console.log('获取知识库详情')
            saveRepoActive(findId, 9, userId, findres.repoTitle)
            var formatres = formatRepoId(findres)
            getNoteListInRepo(findId)
              .then((findres) => {
                var noteList = findres
                return formatManyNoteId(noteList)
              })
              .then((fmres) => {
                formatres.noteList = fmres
                res.send(formatres).end()
              })
          })
          .catch((err) => {
            console.error(err + '查询知识库详情错误')
            res.sendStatus(404)
          })
      }
    })
    .catch((err) => {
      console.log('2非本人知识库')
      res.sendStatus(403)
    })
})

// router.get('/test/:findId', async (req, res) => {
//   const { findId } = req.params
//   const { userId } = req.query
//   isUserRepo(userId, findId)
//     .then((isres) => {
//       if (isres) {
//         repoModel
//           .findById(findId)
//           .then((findres) => {
//             saveRepoActive(findId, 'visit', userId, findres.repoTitle)
//             findres.repoNoteNum += 1
//             repoModel.findByIdAndUpdate(findId, findres)
//             const formatres = formatRepoId(findres)
//             res.send(formatres)
//           })
//           .catch((err) => {
//             console.error('查询知识库详情错误')
//             res.sendStatus(404)
//           })
//       }
//     })
//     .catch((err) => res.sendStatus(403))
// })

// 创建新知识库
router.post('/', (req, res) => {
  const repoDetail = req.body
  const { userId, userName } = req.auth
  const newRepo = new repoModel({
    repoTitle: repoDetail.repoTitle,
    userId: userId,
    userName: userName,
    createTime: getTimeStamp(),
  })
    .save()
    .then((saveres) => {
      saveRepoActive(saveres._id, 1, saveres.userId, saveres.repoTitle)
      console.log(saveres._id)
      res.send(saveres._id)
    })
    .catch((err) => {
      console.error(err + '创建新知识库错误')
      res.sendStatus(500)
    })
})

// 更新知识库详情
router.put('/:findId', (req, res) => {
  const { findId } = req.params
  const { type } = req.query
  const { userId, userName } = req.auth
  console.log('进入修改repo流程')
  var typeNum = 0
  isUserRepo(userId, findId)
    .then((isres) => {
      const repoDetail = req.body
      if (type == 'del') {
        // del
        typeNum = 3
        repoDetail.isDel = repoDetail.isDel ? false : true
        repoDetail.delTime = getTimeStamp()
      } else if (type == 'star') {
        typeNum = 6
        repoDetail.isStar = repoDetail.isStar ? false : true
        // star
        repoDetail.starTime = getTimeStamp()
      } else {
        // update
        typeNum = 4
        repoDetail.updateTime = getTimeStamp()
      }
      saveRepoActive(findId, typeNum, userId, repoDetail.repoTitle)
      repoModel
        .findByIdAndUpdate(findId, repoDetail)
        .then((findres) => {
          repoModel.findById(findres._id).then((findres) => {
            const formatres = formatRepoId(findres)
            res.send(formatres)
          })
        })
        .catch((err) => {
          console.error('更新知识库详情错误')
          res.sendStatus(500)
        })
    })
    .catch((err) => {
      console.log('3非本人知识库' + err)
      res.sendStatus(403)
    })
})

// 删除知识库
router.delete('/:findId', (req, res) => {
  const { findId } = req.params
  const { userId, userName } = req.auth
  isUserRepo(userId, findId)
    .then((isres) => {
      repoModel
        .findByIdAndRemove(findId)
        .then((delres) => {
          console.log('已删除知识库：' + delres.repoTitle)
          // 根据ID查找知识库名称
          getRepoTitleByRepoId(findId).then((repoTitle) =>
            saveRepoActive(findId, 2, userId, repoTitle)
          )
          res.send(true)
        })
        .catch((err) => {
          console.error('删除知识库错误')
          res.send(false)
        })
    })
    .catch((err) => {
      console.log('4非本人知识库')
      res.sendStatus(403)
    })
})

module.exports = router
