const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const createUploader = require('../middleware/upload')
const upload = createUploader('soumissions')
const { soumettreDevoir, getSubmissionsDevoir, noterDevoir, getMesSubmissions } = require('../controllers/submissionController')

router.post('/devoir/:id', auth, role('eleve'), upload.array('fichiers', 5), soumettreDevoir)
router.get('/devoir/:id', auth, role('prof', 'admin'), getSubmissionsDevoir)
router.put('/:id/noter', auth, role('prof', 'admin'), noterDevoir)
router.get('/mes-soumissions', auth, role('eleve'), getMesSubmissions)

module.exports = router