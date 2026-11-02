const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const createUploader = require('../middleware/upload')
const upload = createUploader('cours')
const { creerCours, getCours, getCoursById, modifierCours, supprimerCours } = require('../controllers/courseController')

router.post('/', auth, role('prof', 'admin'), upload.array('fichiers', 5), creerCours)
router.get('/', auth, getCours)
router.get('/:id', auth, getCoursById)
router.put('/:id', auth, role('prof', 'admin'), modifierCours)
router.delete('/:id', auth, role('prof', 'admin'), supprimerCours)

module.exports = router