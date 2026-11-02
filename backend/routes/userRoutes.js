const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { getUsers,getUserById } = require ('../controllers/userController')

router.get('/', getUsers)  
router.get('/:id',auth, getUserById)

module.exports = router