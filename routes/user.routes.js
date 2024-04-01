const router = require('express').Router()
const {login, logout ,signup, editprofile} = require('../controllers/user.controller.js')
const protectedRoutes = require('../middlewares/protectedRoutes.js')

router.post('/signup', signup )
router.post('/login', login)
router.post('/logout', logout)
router.patch('/editprofile',protectedRoutes, editprofile)



module.exports = router