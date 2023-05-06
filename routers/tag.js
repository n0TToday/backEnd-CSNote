const express = require('express')
const router = express.Router()
const tagModel = require('../models/Tag')
const {
  createTag,
  formatManyTagId,
  saveTagActive,
} = require('../utils/model-helper')

// 查询标签列表
router.get('/', (req, res) => {
  const { userId } = req.auth
  if (userId) {
    tagModel
      .find({ userId: userId })
      .then((findres) => {
        if (findres) {
          formatManyTagId(findres).then((formatres) =>
            res.send(formatres).end()
          )
        }
      })
      .catch((err) => {
        console.error('查询知识库下笔记列表错误')
      })
  } else res.sendStatus(403)
})

// 创建新标签
router.post('/', (req, res) => {
  console.log(req.body)
  const tagDetail = req.body
  createTag(tagDetail.tagTitle, tagDetail.userId, tagDetail.userName)
    .then((saveres) => {
      saveTagActive(saveres._id, 1, tagDetail.userId, saveres.tagTitle)
      res.send(saveres._id)
    })
    .catch((err) => {
      console.error('创建新标签错误')
      res.sendStatus(500)
    })
})

// // 更新标签内容
// router.put('/:findId', (req, res) => {
//   const { findId } = req.params
//   const { userId } = req.auth
//   if (userId) {
//     const tagDetail = req.body
//     tag
//       .findByIdAndUpdate(findId, tagDetail)
//       .then(() => {
//         res.send('更新成功')
//       })
//       .catch((err) => {
//         console.error('更新标签错误')
//         res.sendStatus(500)
//       })
//   } else res.sendStatus(403)
// })

// // 删除标签
// // 还删吗、、、、不删了
// router.delete('/:findId', (req, res) => {
//   const { findId } = req.params
//   const { userId } = req.query
//   if (userId) {
//     tag
//       .findByIdAndRemove(findId)
//       .then((delres) => {
//         console.log('已删除标签：' + delres.tagTitle)
//         res.send(true)
//       })
//       .catch((err) => {
//         console.error('删除标签错误')
//         res.send(false)
//       })
//   } else res.sendStatus(403)
// })

module.exports = router
