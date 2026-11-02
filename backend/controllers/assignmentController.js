const Assignment = require('../models/Assignment')

// Créer un devoir (prof seulement)
const creerDevoir = async (req, res) => {
  try {
    const { titre, description, formation, dateLimit } = req.body

    // req.files vient de multer (pas req.body.fichiers) — on reconstruit
    // le tableau attendu par le schéma à partir des fichiers réellement reçus.
    const fichiers = (req.files || []).map((file) => ({
      url: `/uploads/devoirs/${file.filename}`,
      nom: file.originalname,
      type: file.mimetype,
      size: file.size,
    }))

    const devoir = await Assignment.create({
      titre,
      description,
      fichiers,
      formation,
      dateLimit,
      createdBy: req.user.id
    })

    res.status(201).json({ message: 'Devoir créé avec succès', devoir })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const getDevoirs = async (req, res) => {
  try {
    let devoirs

    if (req.user.role === 'prof' || req.user.role === 'admin') {
      devoirs = await Assignment.find()
    } else {
      devoirs = await Assignment.find({ formation: req.user.formation })
    }

    res.status(200).json(devoirs)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const getDevoirById = async (req, res) => {
  try {
    const devoir = await Assignment.findById(req.params.id)

    if (!devoir) {
      return res.status(404).json({ message: 'Devoir introuvable' })
    }

    res.status(200).json(devoir)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const modifierDevoir = async (req, res) => {
  try {
    const devoir = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!devoir) {
      return res.status(404).json({ message: 'Devoir introuvable' })
    }

    res.status(200).json({ message: 'Devoir modifié avec succès', devoir })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const supprimerDevoir = async (req, res) => {
  try {
    const devoir = await Assignment.findByIdAndDelete(req.params.id)

    if (!devoir) {
      return res.status(404).json({ message: 'Devoir introuvable' })
    }

    res.status(200).json({ message: 'Devoir supprimé avec succès' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { creerDevoir, getDevoirs, getDevoirById, modifierDevoir, supprimerDevoir }