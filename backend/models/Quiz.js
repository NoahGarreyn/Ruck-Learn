const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  choix: {
    type: [String],
    required: true
  },
  // true = plusieurs réponses possibles (cases à cocher),
  // false = une seule réponse (boutons radio).
  // Ce champ est visible par l'élève : il ne révèle pas les bonnes réponses.
  multiple: {
    type: Boolean,
    default: false
  },
  // Index des bonnes réponses dans `choix` (ex: [0, 2]).
  bonnesReponses: {
    type: [Number],
    default: []
  },
  // Ancien format (une seule bonne réponse). Gardé uniquement pour que les
  // quiz déjà créés restent corrigeables : plus obligatoire.
  bonneReponse: {
    type: Number
  },
})

const quizSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    default: null
  },
  dateLimit: {
    type: Date,
    required: true
  },
  questions: {
    type: [questionSchema],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true })

module.exports = mongoose.model('Quiz', quizSchema)