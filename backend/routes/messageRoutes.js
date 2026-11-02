const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { envoyerMessage, getContacts, getConversation, getConversations, getNonLus } = require('../controllers/messageController')

router.post('/', auth, envoyerMessage)
router.get('/', auth, getConversations)
router.get('/non-lus', auth, getNonLus)
// IMPORTANT : /contacts doit être déclaré AVANT /:userId, sinon Express
// interprète "contacts" comme un id d'utilisateur.
router.get('/contacts', auth, getContacts)
router.get('/:userId', auth, getConversation)

module.exports = router