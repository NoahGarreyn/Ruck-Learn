const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { creerQuiz, getQuiz, getQuizById, soumettreQuiz, getCorrection, getResultatsQuiz, modifierQuiz, supprimerQuiz } = require('../controllers/quizController')

router.post('/', auth, role('prof', 'admin'), creerQuiz)
router.get('/', auth, getQuiz)
router.get('/:id', auth, getQuizById)
router.get('/:id/correction', auth, role('eleve'), getCorrection)
router.get('/:id/resultats', auth, role('prof', 'admin'), getResultatsQuiz)
router.post('/:id/soumettre', auth, role('eleve'), soumettreQuiz)
router.put('/:id', auth, role('prof', 'admin'), modifierQuiz)
router.delete('/:id', auth, role('prof', 'admin'), supprimerQuiz)

module.exports = router