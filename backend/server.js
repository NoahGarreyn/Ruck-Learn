const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes')
const quizRoutes = require('./routes/quizRoutes')
const submissionRoutes = require('./routes/submissionRoutes')
const agendaRoutes = require('./routes/agendaRoutes')
const messageRoutes = require('./routes/messageRoutes')
const userRoutes = require('./routes/userRoutes')
const formationRoutes = require('./routes/formationRoutes')
const progressRoutes = require('./routes/progressRoutes')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => console.log('❌ Erreur MongoDB :', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cours', courseRoutes)
app.use('/api/devoirs', assignmentRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/agenda', agendaRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users',userRoutes)
app.use('/api/formations', formationRoutes)
app.use('/api/progress', progressRoutes)

// Route de test
app.get('/', (req, res) => {
  res.json({ message: '🚀 Serveur LMS opérationnel' })
})

// Lancement du serveur
app.listen(process.env.PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${process.env.PORT}`)
})