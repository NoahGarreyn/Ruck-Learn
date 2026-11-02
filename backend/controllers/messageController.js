const Message = require('../models/Message')
const User = require('../models/User')

// Envoyer un message
const envoyerMessage = async (req, res) => {
  try {
    const { destinataire, contenu } = req.body

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' })
    }

    if (String(destinataire) === req.user.id) {
      return res.status(400).json({ message: 'Tu ne peux pas t\'écrire à toi-même' })
    }

    const destinataireExiste = await User.findById(destinataire)
    if (!destinataireExiste) {
      return res.status(404).json({ message: 'Destinataire introuvable' })
    }

    // Règle métier : pas de message d'élève à élève.
    // Vérifiée ICI (côté serveur) et pas seulement dans l'interface,
    // sinon un appel direct à l'API contournerait la règle.
    if (req.user.role === 'eleve' && destinataireExiste.role === 'eleve') {
      return res.status(403).json({ message: 'Un élève ne peut pas écrire à un autre élève' })
    }

    const message = await Message.create({
      expediteur: req.user.id,
      destinataire,
      contenu: contenu.trim(),
    })

    res.status(201).json({ message: 'Message envoyé avec succès', message })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Liste des personnes à qui l'utilisateur connecté a le droit d'écrire
const getContacts = async (req, res) => {
  try {
    // On exclut toujours soi-même
    const filtre = { _id: { $ne: req.user.id } }

    // Un élève ne peut contacter que les profs et les admins
    if (req.user.role === 'eleve') {
      filtre.role = { $in: ['prof', 'admin'] }
    }

    // select : on ne renvoie jamais le password ni l'email inutile
    const contacts = await User.find(filtre).select('nom prenom role').sort({ nom: 1 })
    res.status(200).json(contacts)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer la conversation entre deux personnes
const getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { expediteur: req.user.id, destinataire: req.params.userId },
        { expediteur: req.params.userId, destinataire: req.user.id }
      ]
    })
    .populate('expediteur', 'nom prenom role')
    .populate('destinataire', 'nom prenom role')
    .sort({ createdAt: 1 })

    // Marque les messages comme lus
    await Message.updateMany(
      { expediteur: req.params.userId, destinataire: req.user.id, lu: false },
      { lu: true }
    )

    res.status(200).json(messages)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer toutes les conversations de l'utilisateur connecté
const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { expediteur: req.user.id },
        { destinataire: req.user.id }
      ]
    })
    .populate('expediteur', 'nom prenom role')
    .populate('destinataire', 'nom prenom role')
    .sort({ createdAt: -1 })

    // Garde uniquement le dernier message par conversation
    const conversations = []
    const vus = new Set()

    messages.forEach(msg => {
      const autreUserId = msg.expediteur._id.toString() === req.user.id
        ? msg.destinataire._id.toString()
        : msg.expediteur._id.toString()

      if (!vus.has(autreUserId)) {
        vus.add(autreUserId)
        conversations.push(msg)
      }
    })

    res.status(200).json(conversations)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Récupérer le nombre de messages non lus
const getNonLus = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      destinataire: req.user.id,
      lu: false
    })

    res.status(200).json({ nonLus: count })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { envoyerMessage, getContacts, getConversation, getConversations, getNonLus }