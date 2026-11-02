const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['devoir', 'quiz'],
    required: true
  },
  eleve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  devoir: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    default: null
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  contenu: {
    type: String,
    default: null        // texte réponse de l'élève (pour les devoirs)
  },
  fichiers: {
    type: [{
      url: { type: String, required: true },
      nom: { type: String, required: true },
      type: { type: String, default: null },
      size: { type: Number, default: null },
      uploadedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  // Quiz : un élément par question. Nouveau format = tableau d'index
  // (ex: [[2], [0, 3]]), ancien format = simple nombre (ex: [2, 0]).
  // Mixed accepte les deux, sans casser les soumissions déjà enregistrées.
  reponses: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  score: {
    type: Number,
    default: null        // calculé automatiquement (pour les quiz)
  },
  note: {
    type: Number,
    default: null        // donnée par le prof (pour les devoirs)
  },
  commentaire: {
    type: String,
    default: null        // feedback du prof
  },
}, { timestamps: true })

module.exports = mongoose.model('Submission', submissionSchema)