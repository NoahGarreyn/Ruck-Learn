const Formation = require('../models/Formation')

// ─── CRÉER UNE FORMATION ──────────────────────────────────────────────────────
// Route : POST /api/formations
// Accès : admin seulement
const creerFormation = async (req, res) => {
  try {
    const { nom, slug, description } = req.body

    // Vérifie si le slug existe déjà
    const existe = await Formation.findOne({ slug })
    if (existe) {
      return res.status(400).json({ message: 'Ce slug est déjà utilisé' })
    }

    const formation = await Formation.create({ nom, slug, description })
    res.status(201).json({ message: 'Formation créée avec succès', formation })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── RÉCUPÉRER TOUTES LES FORMATIONS ─────────────────────────────────────────
// Route : GET /api/formations
// Accès : tout le monde connecté
const getFormations = async (req, res) => {
  try {
    // On récupère uniquement les formations actives
    const formations = await Formation.find({ actif: true })
    res.status(200).json(formations)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── MODIFIER UNE FORMATION ───────────────────────────────────────────────────
// Route : PUT /api/formations/:id
// Accès : admin seulement
const modifierFormation = async (req, res) => {
  try {
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!formation) {
      return res.status(404).json({ message: 'Formation introuvable' })
    }

    res.status(200).json({ message: 'Formation modifiée avec succès', formation })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── ARCHIVER UNE FORMATION ───────────────────────────────────────────────────
// Route : PUT /api/formations/:id/archiver
// Accès : admin seulement
// On archive plutôt que supprimer — les données historiques sont conservées
const archiverFormation = async (req, res) => {
  try {
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    )

    if (!formation) {
      return res.status(404).json({ message: 'Formation introuvable' })
    }

    res.status(200).json({ message: 'Formation archivée avec succès', formation })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { creerFormation, getFormations, modifierFormation, archiverFormation }