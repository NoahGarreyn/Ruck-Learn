const User = require('../models/User')

const getUsers = async (req, res) => {
    try {
        // .select('-password') exclut le champ password de la réponse
        // Le - devant password signifie "tout sauf ce champ"
        const users = await User.find().select('-password')
        res.status(200).json(users)

    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", err })
    }
}

const getUserById = async (req, res) => {
    try {
        // Même logique — on exclut le password
        const user = await User.findById(req.params.id).select('-password')

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" })
        }

        res.status(200).json(user)

    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", err })
    }
}

module.exports = { getUsers, getUserById }