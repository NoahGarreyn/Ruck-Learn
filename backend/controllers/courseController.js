const Course = require('../models/Course')

// Créer un cours (prof seulement)
const creerCours = async (req, res) => {
  try {
    const { titre, description, contenu, formation } = req.body

    // req.files vient de multer (pas req.body.fichiers) — on reconstruit
    // le tableau attendu par le schéma à partir des fichiers réellement reçus,
    // plutôt que de faire confiance à ce que le client prétend avoir envoyé.
    const fichiers = (req.files || []).map((file) => ({
      url: `/uploads/cours/${file.filename}`,
      nom: file.originalname,
      type: file.mimetype,
      size: file.size,
    }))

    const cours = await Course.create({
      titre,
      description,
      contenu,
      fichiers,
      formation,
      createdBy: req.user.id
    })

    res.status(201).json({ message: 'Cours créé avec succès', cours })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer les cours (selon la formation de l'élève)
const getCours = async (req, res) => {
  try {
    let cours

    if (req.user.role === 'prof' || req.user.role === 'admin') {
      // Le prof voit tous les cours
      cours = await Course.find()
    } else {
      // L'élève voit seulement les cours de sa formation
      cours = await Course.find({ formation: req.user.formation })
    }

    res.status(200).json(cours)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer un cours par son id
const getCoursById = async (req, res) => {
  try {
    const cours = await Course.findById(req.params.id)

    if (!cours) {
      return res.status(404).json({ message: 'Cours introuvable' })
    }

    res.status(200).json(cours)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Modifier un cours (prof seulement)
const modifierCours = async (req, res) => {
  try {
    const cours = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!cours) {
      return res.status(404).json({ message: 'Cours introuvable' })
    }

    res.status(200).json({ message: 'Cours modifié avec succès', cours })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Supprimer un cours (prof seulement)
const supprimerCours = async (req, res) => {
  try {
    const cours = await Course.findByIdAndDelete(req.params.id)

    if (!cours) {
      return res.status(404).json({ message: 'Cours introuvable' })
    }

    res.status(200).json({ message: 'Cours supprimé avec succès' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { creerCours, getCours, getCoursById, modifierCours, supprimerCours }