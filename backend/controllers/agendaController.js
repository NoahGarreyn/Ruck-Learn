const Agenda = require('../models/Agenda')

const creerEvenement = async (req, res) => {
  try {
    const { titre, description, type, formation, dateDebut, dateFin } = req.body

    const evenement = await Agenda.create({
      titre,
      description,
      type,
      formation,
      dateDebut,
      dateFin,
      createdBy: req.user.id
    })

    res.status(201).json({ message: 'Événement créé avec succès', evenement })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const getEvenements = async (req, res) => {
  try {
    let evenements

    if (req.user.role === 'prof' || req.user.role === 'admin') {
      evenements = await Agenda.find()
    } else {
      evenements = await Agenda.find({ formation: req.user.formation })
    }

    res.status(200).json(evenements)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const modifierEvenement = async (req, res) => {
  try {
    const evenement = await Agenda.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!evenement) {
      return res.status(404).json({ message: 'Événement introuvable' })
    }

    res.status(200).json({ message: 'Événement modifié avec succès', evenement })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const supprimerEvenement = async (req, res) => {
  try {
    const evenement = await Agenda.findByIdAndDelete(req.params.id)

    if (!evenement) {
      return res.status(404).json({ message: 'Événement introuvable' })
    }

    res.status(200).json({ message: 'Événement supprimé avec succès' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { creerEvenement, getEvenements, modifierEvenement, supprimerEvenement }