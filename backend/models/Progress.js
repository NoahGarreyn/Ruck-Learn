const mongoose = require('mongoose')

// On définit la structure de la collection Progress
// Permet de suivre l'avancement de chaque élève sur chaque cours
const progressSchema = new mongoose.Schema({

  // Référence vers l'élève concerné
  eleve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Référence vers le cours concerné
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  // Statut d'avancement du cours
  // not_started = pas encore ouvert
  // in_progress = ouvert mais pas terminé
  // completed = terminé
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },

  // Date de dernière consultation du cours
  lastViewedAt: {
    type: Date,
    default: null
  },

  // Date de complétion du cours
  // Vaut null tant que le cours n'est pas terminé
  completedAt: {
    type: Date,
    default: null
  },

}, { timestamps: true })

// Index unique — un élève ne peut avoir qu'une seule progression par cours
progressSchema.index({ eleve: 1, course: 1 }, { unique: true })

module.exports = mongoose.model('Progress', progressSchema)