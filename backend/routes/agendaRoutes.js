const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { creerEvenement, getEvenements, modifierEvenement, supprimerEvenement } = require('../controllers/agendaController')

router.post('/', auth, role('prof', 'admin'), creerEvenement)
router.get('/', auth, getEvenements)
router.put('/:id', auth, role('prof', 'admin'), modifierEvenement)
router.delete('/:id', auth, role('prof', 'admin'), supprimerEvenement)

module.exports = router