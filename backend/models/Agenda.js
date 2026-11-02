const mongoose = require('mongoose')

const agendaSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['cours', 'devoir', 'quiz', 'evenement'],
    required: true
  },
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    default: null
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true })

module.exports = mongoose.model('Agenda', agendaSchema)