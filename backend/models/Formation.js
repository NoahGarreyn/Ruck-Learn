const mongoose = require('mongoose')

// On définit la structure de la collection Formation
// Remplace les valeurs fixes 'TP-GP', 'TP-GCF', 'TP-SC' par de vrais documents
// Plus flexible — on peut ajouter, modifier ou archiver une formation sans toucher au code
const formationSchema = new mongoose.Schema({

  // Nom complet de la formation
  // ex: "Technicien Paie - Gestion de la Paie"
  nom: {
    type: String,
    required: true
  },

  // Identifiant court utilisé dans les URLs et le code
  // ex: "tp-gp", "tp-gcf", "tp-sc"
  // unique: true — deux formations ne peuvent pas avoir le même slug
  slug: {
    type: String,
    required: true,
    unique: true
  },

  // Description de la formation
  description: {
    type: String,
    default: null
  },

  // Permet d'archiver une formation sans la supprimer
  // false = formation archivée, elle n'apparaît plus dans l'app
  // true = formation active
  actif: {
    type: Boolean,
    default: true
  },

}, { timestamps: true })

module.exports = mongoose.model('Formation', formationSchema)