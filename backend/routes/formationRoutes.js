const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { creerFormation, getFormations, modifierFormation, archiverFormation } = require('../controllers/formationController')

// Créer une formation — admin seulement
router.post('/', auth, role('admin'), creerFormation)
// Récupérer toutes les formations actives — tout le monde connecté
router.get('/', auth, getFormations)
// Modifier une formation — admin seulement
router.put('/:id', auth, role('admin'), modifierFormation)
// Archiver une formation — admin seulement
router.put('/:id/archiver', auth, role('admin'), archiverFormation)

module.exports = router