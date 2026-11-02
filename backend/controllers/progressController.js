const Progress = require('../models/Progress')
const Course = require('../models/Course')
const User = require('../models/User')

// ─── OUVRIR / METTRE À JOUR LA PROGRESSION ────────────────────────────────────
// Route : POST /api/progress/:courseId  (élèves seulement)
const ouvrirCours = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
      return res.status(404).json({ message: 'Cours introuvable' })
    }

    // Un élève ne peut suivre que les cours de SA formation
    if (String(course.formation) !== String(req.user.formation)) {
      return res.status(403).json({ message: 'Ce cours n\'appartient pas à ta formation' })
    }

    // upsert = "met à jour si ça existe, sinon crée", en UNE seule opération
    // atomique côté MongoDB. Évite l'erreur de doublon quand deux requêtes
    // arrivent en même temps (l'ancien findOne puis create n'était pas atomique).
    // $set        : appliqué à chaque ouverture (dernière consultation)
    // $setOnInsert: appliqué uniquement à la création → un cours déjà
    //               terminé garde son statut "completed" quand on le rouvre
    const progress = await Progress.findOneAndUpdate(
      { eleve: req.user.id, course: req.params.courseId },
      {
        $set: { lastViewedAt: new Date() },
        $setOnInsert: { status: 'in_progress' }
      },
      { new: true, upsert: true }
    )

    res.status(200).json(progress)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── MARQUER UN COURS COMME TERMINÉ ──────────────────────────────────────────
// Route : PUT /api/progress/:courseId/terminer  (élèves seulement)
const terminerCours = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { eleve: req.user.id, course: req.params.courseId },
      {
        status: 'completed',
        completedAt: new Date(),
        lastViewedAt: new Date()
      },
      { new: true }
    )

    if (!progress) {
      return res.status(404).json({ message: 'Progression introuvable — ouvrez d\'abord le cours' })
    }

    res.status(200).json({ message: 'Cours marqué comme terminé', progress })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── PROGRESSION DE L'ÉLÈVE CONNECTÉ ─────────────────────────────────────────
// Route : GET /api/progress  (élèves seulement)
const getMaProgression = async (req, res) => {
  try {
    const progression = await Progress.find({ eleve: req.user.id })
      .populate('course', 'titre description formation')

    res.status(200).json(progression)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── TOUTES LES PROGRESSIONS (brut) ──────────────────────────────────────────
// Route : GET /api/progress/all  (prof et admin)
const getToutesProgressions = async (req, res) => {
  try {
    const progressions = await Progress.find()
      .populate('eleve', 'nom prenom email formation')
      .populate('course', 'titre formation')

    res.status(200).json(progressions)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// ─── SUIVI PAR ÉLÈVE (agrégé) ────────────────────────────────────────────────
// Route : GET /api/progress/suivi  (prof et admin)
// Pour CHAQUE élève (même ceux qui n'ont rien ouvert), renvoie la liste des
// cours de sa formation avec le statut de chacun, et les totaux.
const getSuivi = async (req, res) => {
  try {
    // Trois requêtes lancées en parallèle (plus rapide qu'en séquence)
    const [courses, eleves, progressions] = await Promise.all([
      Course.find().select('titre formation'),
      User.find({ role: 'eleve' }).select('nom prenom email formation').sort({ nom: 1, prenom: 1 }),
      Progress.find().select('eleve course status lastViewedAt completedAt'),
    ])

    // Index "eleve_cours" → progression, pour un accès direct sans reparcourir
    // le tableau à chaque fois
    const progMap = new Map()
    progressions.forEach((p) => progMap.set(`${p.eleve}_${p.course}`, p))

    const suivi = eleves.map((eleve) => {
      // Les cours qui concernent cet élève = ceux de sa formation
      const coursEleve = courses.filter((c) => String(c.formation) === String(eleve.formation))

      const detail = coursEleve.map((c) => {
        const p = progMap.get(`${eleve._id}_${c._id}`)
        return {
          course: { _id: c._id, titre: c.titre },
          // Pas de progression enregistrée = cours jamais ouvert
          status: p ? p.status : 'not_started',
          lastViewedAt: p ? p.lastViewedAt : null,
          completedAt: p ? p.completedAt : null,
        }
      })

      return {
        eleve,
        total: detail.length,
        completed: detail.filter((d) => d.status === 'completed').length,
        inProgress: detail.filter((d) => d.status === 'in_progress').length,
        courses: detail,
      }
    })

    res.status(200).json(suivi)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { ouvrirCours, terminerCours, getMaProgression, getToutesProgressions, getSuivi }