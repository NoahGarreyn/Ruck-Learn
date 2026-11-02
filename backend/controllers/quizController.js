const Quiz = require('../models/Quiz')
const Submission = require('../models/Submission')

// Renvoie une copie du quiz SANS les bonnes réponses (ancien ET nouveau champ).
const sansReponses = (quiz) => {
  const obj = quiz.toObject()
  obj.questions.forEach((q) => {
    delete q.bonneReponse
    delete q.bonnesReponses
  })
  return obj
}

// Bonnes réponses d'une question, avec repli sur l'ancien format
const bonnesReponsesDe = (q) =>
  q.bonnesReponses && q.bonnesReponses.length > 0 ? q.bonnesReponses : [q.bonneReponse]

// Deux listes contiennent-elles exactement les mêmes index ? (l'ordre n'importe pas)
const memeEnsemble = (a, b) => a.length === b.length && a.every((x) => b.includes(x))

// Ancien format = simple nombre, nouveau format = tableau
const enTableau = (r) => (Array.isArray(r) ? r : [r])

const creerQuiz = async (req, res) => {
  try {
    const { titre, description, formation, dateLimit, questions } = req.body

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Un quiz doit contenir au moins une question' })
    }

    const questionsNormalisees = questions.map((q) => ({
      ...q,
      bonnesReponses: Array.isArray(q.bonnesReponses)
        ? q.bonnesReponses
        : Number.isInteger(q.bonneReponse) ? [q.bonneReponse] : [],
    }))

    const invalide = questionsNormalisees.some((q) =>
      !q.question ||
      !Array.isArray(q.choix) || q.choix.length < 2 ||
      q.bonnesReponses.length === 0 ||
      q.bonnesReponses.some((n) => !Number.isInteger(n) || n < 0 || n >= q.choix.length) ||
      (!q.multiple && q.bonnesReponses.length !== 1)
    )
    if (invalide) {
      return res.status(400).json({
        message: 'Questions invalides : 2 choix minimum, au moins une bonne réponse (une seule si la question n\'est pas à choix multiples)'
      })
    }

    const quiz = await Quiz.create({
      titre,
      description,
      formation,
      dateLimit,
      questions: questionsNormalisees,
      createdBy: req.user.id
    })

    res.status(201).json({ message: 'Quiz créé avec succès', quiz })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const getQuiz = async (req, res) => {
  try {
    if (req.user.role === 'prof' || req.user.role === 'admin') {
      const quiz = await Quiz.find()
      return res.status(200).json(quiz)
    }

    const quiz = await Quiz.find({ formation: req.user.formation })
    res.status(200).json(quiz.map(sansReponses))

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz introuvable' })
    }

    if (req.user.role === 'eleve') {
      return res.status(200).json(sansReponses(quiz))
    }

    res.status(200).json(quiz)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const soumettreQuiz = async (req, res) => {
  try {
    const { reponses } = req.body

    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz introuvable' })
    }

    const dejasoumis = await Submission.findOne({
      quiz: req.params.id,
      eleve: req.user.id
    })
    if (dejasoumis) {
      return res.status(400).json({ message: 'Tu as déjà soumis ce quiz' })
    }

    if (new Date() > new Date(quiz.dateLimit)) {
      return res.status(400).json({ message: 'La date limite est dépassée' })
    }

    if (!Array.isArray(reponses) || reponses.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Tu dois répondre à toutes les questions' })
    }

    const reponsesNormalisees = reponses.map(enTableau)

    const valides = reponsesNormalisees.every((r, i) => {
      const q = quiz.questions[i]
      return (
        r.length >= 1 &&
        new Set(r).size === r.length &&
        r.every((n) => Number.isInteger(n) && n >= 0 && n < q.choix.length) &&
        (q.multiple || r.length === 1)
      )
    })
    if (!valides) {
      return res.status(400).json({ message: 'Réponses invalides' })
    }

    // Correction : 1 point si l'élève coche EXACTEMENT les bonnes réponses
    let score = 0
    quiz.questions.forEach((question, index) => {
      if (memeEnsemble(bonnesReponsesDe(question), reponsesNormalisees[index])) {
        score++
      }
    })

    const submission = await Submission.create({
      type: 'quiz',
      eleve: req.user.id,
      quiz: req.params.id,
      reponses: reponsesNormalisees,
      score,
    })

    res.status(201).json({
      message: 'Quiz soumis avec succès',
      score: `${score}/${quiz.questions.length}`,
      submission
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

// Correction détaillée pour l'élève connecté.
// Condition de sécurité : il faut avoir DÉJÀ soumis ce quiz, sinon on
// refuse (403). C'est ce qui empêche de lire les bonnes réponses avant de passer le quiz.
const getCorrection = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz introuvable' })
    }

    const submission = await Submission.findOne({
      quiz: req.params.id,
      eleve: req.user.id
    })
    if (!submission) {
      return res.status(403).json({ message: 'Passe le quiz pour voir la correction' })
    }

    if (new Date() < new Date(quiz.dateLimit)) {
      return res.status(403).json({ message: 'La correction sera disponible après la date limite' })
    }

    const questions = quiz.questions.map((q, i) => {
      const bonnes = bonnesReponsesDe(q)
      const reponses = enTableau(submission.reponses[i])
      return {
        question: q.question,
        choix: q.choix,
        multiple: q.multiple,
        bonnesReponses: bonnes,
        reponses,
        correct: memeEnsemble(bonnes, reponses),
      }
    })

    res.status(200).json({
      score: submission.score,
      total: quiz.questions.length,
      questions,
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const getResultatsQuiz = async (req, res) => {
  try {
    const submissions = await Submission.find({ quiz: req.params.id })
      .populate('eleve', 'nom prenom email')
      .sort({ createdAt: -1 })

    res.status(200).json(submissions)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const modifierQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz introuvable' })
    }

    res.status(200).json({ message: 'Quiz modifié avec succès', quiz })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

const supprimerQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz introuvable' })
    }

    res.status(200).json({ message: 'Quiz supprimé avec succès' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', err })
  }
}

module.exports = { creerQuiz, getQuiz, getQuizById, soumettreQuiz, getCorrection, getResultatsQuiz, modifierQuiz, supprimerQuiz }