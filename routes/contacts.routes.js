const { getContactsSideBar, getChats, createGroupChat } = require('../controllers/contacts.controller')
const protectedRoutes = require('../middlewares/protectedRoutes')

const router = require('express').Router()

router.get('/',protectedRoutes,getContactsSideBar)
router.get('/chats',protectedRoutes,getChats)
router.post('/chats/create',protectedRoutes,createGroupChat)


module.exports = router