const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const createUploader = require('../middleware/upload')
const upload = createUploader('devoirs')
const { creerDevoir, getDevoirs, getDevoirById, modifierDevoir, supprimerDevoir } = require('../controllers/assignmentController')

router.post('/', auth, role('prof', 'admin'), upload.array('fichiers', 5), creerDevoir)
router.get('/', auth, getDevoirs)
router.get('/:id', auth, getDevoirById)
router.put('/:id', auth, role('prof', 'admin'), modifierDevoir)
router.delete('/:id', auth, role('prof', 'admin'), supprimerDevoir)

module.exports = router