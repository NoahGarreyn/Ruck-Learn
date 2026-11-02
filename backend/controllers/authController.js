const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// REGISTER
const register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, formation } = req.body

    // Vérifie si l'email existe déjà
    const userExiste = await User.findOne({ email })
    if (userExiste) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' })
    }

    // Hashe le mot de passe
    const salt = await bcrypt.genSalt(10)
    const passwordHashe = await bcrypt.hash(password, salt)

    // Crée l'utilisateur
    const user = await User.create({
    nom,
    prenom,
    email,
    password: passwordHashe,
    role,
    formation: role === 'eleve' ? formation : null
    })

    const { password: _, ...userSansPassword } = user.toObject()
    res.status(201).json({ message: 'Compte créé avec succès', user: userSansPassword })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Aucun compte n'est rattaché à cette adresse Email" })
    }

    // Vérifie le mot de passe
    const passwordCorrect = await bcrypt.compare(password, user.password)
    if (!passwordCorrect) {
      return res.status(400).json({ message: 'Mot de passe incorrect' })
    }

    // Génère le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, formation: user.formation },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        formation: user.formation
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { register, login }