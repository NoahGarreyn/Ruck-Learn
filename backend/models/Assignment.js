const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    default: null
  },
  dateLimit: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true })

module.exports = mongoose.model('Assignment', assignmentSchema)