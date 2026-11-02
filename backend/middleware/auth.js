const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  try {
    // Récupère le token dans le header de la requête
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Accès refusé, token manquant' })
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Ajoute les infos de l'utilisateur à la requête
    req.user = decoded

    next()
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' })
  }
}

module.exports = auth