const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { ouvrirCours, terminerCours, getMaProgression, getToutesProgressions, getSuivi } = require('../controllers/progressController')

// Ouvrir un cours / mettre à jour la progression — élèves seulement
router.post('/:courseId', auth, role('eleve'), ouvrirCours)
// Marquer un cours comme terminé — élèves seulement
router.put('/:courseId/terminer', auth, role('eleve'), terminerCours)
// Récupérer sa propre progression — élèves seulement
router.get('/', auth, role('eleve'), getMaProgression)
// Récupérer toutes les progressions (brut) — prof et admin seulement
router.get('/all', auth, role('prof', 'admin'), getToutesProgressions)
// Suivi agrégé par élève — prof et admin seulement
router.get('/suivi', auth, role('prof', 'admin'), getSuivi)

module.exports = router