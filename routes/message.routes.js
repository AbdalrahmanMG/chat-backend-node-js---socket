const router = require('express').Router()
let {sendMessage, getMessage, updateMessage, deleteMessage} = require('../controllers/message.controller')
const protectedRoutes = require('../middlewares/protectedRoutes')

// router.post('/send',protectedRoutes,sendMessage)
router.post('/get',protectedRoutes,getMessage)
router.patch('/update',protectedRoutes,updateMessage)
// router.delete('/delete',protectedRoutes,deleteMessage)


module.exports = router