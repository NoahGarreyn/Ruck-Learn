const Submission = require('../models/Submission')
const Assignment = require('../models/Assignment')

// Soumettre un devoir
const soumettreDevoir = async (req, res) => {
  try {
    const { contenu } = req.body

    const devoir = await Assignment.findById(req.params.id)
    if (!devoir) {
      return res.status(404).json({ message: 'Devoir introuvable' })
    }

    // Vérifie si l'élève a déjà soumis ce devoir
    const dejasoumis = await Submission.findOne({
      devoir: req.params.id,
      eleve: req.user.id
    })
    if (dejasoumis) {
      return res.status(400).json({ message: 'Tu as déjà soumis ce devoir' })
    }

    // Vérifie si la deadline est dépassée
    if (new Date() > new Date(devoir.dateLimit)) {
      return res.status(400).json({ message: 'La date limite est dépassée' })
    }

    // req.files vient de multer — on reconstruit le tableau fichiers
    // à partir de ce que l'élève a réellement envoyé.
    const fichiers = (req.files || []).map((file) => ({
      url: `/uploads/soumissions/${file.filename}`,
      nom: file.originalname,
      type: file.mimetype,
      size: file.size,
    }))

    const submission = await Submission.create({
      type: 'devoir',
      eleve: req.user.id,
      devoir: req.params.id,
      contenu,
      fichiers,
    })

    res.status(201).json({ message: 'Devoir soumis avec succès', submission })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer les soumissions d'un devoir (prof seulement)
const getSubmissionsDevoir = async (req, res) => {
  try {
    const submissions = await Submission.find({ devoir: req.params.id })
      .populate('eleve', 'nom prenom email formation')

    res.status(200).json(submissions)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Noter un devoir (prof seulement)
const noterDevoir = async (req, res) => {
  try {
    const { note, commentaire } = req.body

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { note, commentaire },
      { new: true }
    )

    if (!submission) {
      return res.status(404).json({ message: 'Soumission introuvable' })
    }

    res.status(200).json({ message: 'Devoir noté avec succès', submission })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer les soumissions de l'élève connecté
const getMesSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ eleve: req.user.id })
      .populate('devoir', 'titre dateLimit')
      .populate('quiz', 'titre')

    res.status(200).json(submissions)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { soumettreDevoir, getSubmissionsDevoir, noterDevoir, getMesSubmissions }