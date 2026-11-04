# Ruck&Learn

Plateforme LMS (Learning Management System) sur mesure pour **« La mêlée des métiers »**, l'organisme de formation du cabinet **CG Comines**. Elle centralise les cours, les devoirs, les quiz, l'agenda, la messagerie et le suivi de progression des apprenants, pour trois profils : administrateur, formateur et apprenant.

Projet réalisé dans le cadre du titre professionnel **Concepteur Développeur d'Applications (CDA)**, par Noah Garreyn.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancement](#lancement)
- [Structure du projet](#structure-du-projet)
- [API REST](#api-rest)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Limites connues et perspectives](#limites-connues-et-perspectives)

## Fonctionnalités

| Profil | Ce qu'il peut faire |
|---|---|
| **Administrateur** | Crée les comptes (formateurs et apprenants), gère les formations (création, modification, archivage), consulte le suivi des élèves, l'agenda et la messagerie |
| **Formateur** | Publie des cours avec fichiers, crée des devoirs et les note, crée des quiz (choix simples ou multiples), planifie l'agenda, suit la progression des élèves, échange par messagerie |
| **Apprenant** | Consulte les cours de sa formation et marque sa progression, rend ses devoirs avant la date limite, passe les quiz (correction automatique), consulte l'agenda, écrit à ses formateurs |

Règles métier appliquées côté serveur :
- un apprenant ne voit que les contenus de **sa formation** ;
- un seul rendu par devoir et un seul passage par quiz ;
- rendu et quiz refusés après la date limite ;
- les bonnes réponses d'un quiz ne sont jamais envoyées à l'apprenant, et la correction détaillée n'est disponible qu'après la date limite ;
- pas de messages d'apprenant à apprenant.

## Stack technique

**Front-end** : React 19, Vite, React Router, Context API, Axios, jwt-decode, CSS Modules (avec des design tokens dans `variables.css`).

**Back-end** : Node.js, Express 5, MongoDB Atlas, Mongoose, JSON Web Token, bcryptjs, Multer, cors, dotenv.

**Outils** : Git / GitHub (Projects en Kanban), Postman, MongoDB Compass, ESLint, Figma (maquettes).

## Prérequis

- **Node.js 20.19 ou supérieur** (développé avec Node 24) et npm
- Un cluster **MongoDB Atlas** (le palier gratuit M0 suffit)
- Git

> Sur Atlas, pense à autoriser ton adresse IP (**Network Access**). Un cluster gratuit se met en pause après une longue inactivité : clique sur **Resume** dans l'interface si la connexion échoue.

## Installation

```bash
git clone https://github.com/NoahGarreyn/ruck-and-learn.git
cd ruck-and-learn

# Back-end
cd backend
npm install

# Front-end
cd ../frontend
npm install
```

## Variables d'environnement

Les fichiers `.env` ne sont **pas versionnés**. Il faut les créer à la main.

**`backend/.env`**

```env
PORT=5000
MONGO_URI=mongodb+srv://<utilisateur>:<mot_de_passe>@<cluster>.mongodb.net/rucklearn?retryWrites=true&w=majority
JWT_SECRET=<une_longue_chaine_aleatoire>
```

Pour générer un secret JWT :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

Avec Vite, une variable doit être préfixée par `VITE_` pour être accessible dans le code du navigateur. Après avoir modifié un `.env`, redémarre le serveur concerné.

## Lancement

Les deux serveurs doivent tourner en même temps, dans deux terminaux.

**1. Back-end** (http://localhost:5000)

```bash
cd backend
npm start
```

Tu dois voir `Serveur lancé sur le port 5000` puis `MongoDB connecté`.

**2. Créer le premier administrateur**

L'inscription publique n'existe pas : seul un administrateur peut créer des comptes. Le premier est créé par un script, hors de l'API. Ouvre `backend/scripts/seedAdmin.js`, **modifie l'email et le mot de passe** qu'il contient, puis :

```bash
cd backend
node scripts/seedAdmin.js
```

**3. Front-end** (http://localhost:5173)

```bash
cd frontend
npm run dev
```

**4. Première utilisation**

1. Connecte-toi avec le compte administrateur.
2. Crée les formations (page *Formations*).
3. Crée les comptes formateurs et apprenants (page *Utilisateurs*), en rattachant chaque apprenant à sa formation.

Autres commandes du front-end : `npm run build` (build de production), `npm run preview`, `npm run lint`.

## Structure du projet

```
ruck-and-learn/
├── backend/
│   ├── controllers/     # logique métier (une par ressource)
│   ├── middleware/      # auth.js (JWT), role.js (rôles), upload.js (Multer)
│   ├── models/          # schémas Mongoose (9 collections)
│   ├── routes/          # définition des endpoints
│   ├── scripts/         # seedAdmin.js
│   ├── uploads/         # fichiers déposés (non versionné)
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # composants réutilisables (Sidebar, cartes...)
        ├── context/     # AuthContext (session et rôle)
        ├── layouts/     # un layout par profil (navbar + sidebar)
        ├── pages/       # admin/, prof/, eleve/, auth/ + pages partagées
        ├── routes/      # PrivateRoute, RoleRoute
        ├── services/    # appels API (Axios et un service par ressource)
        └── styles/      # variables.css (palette et design tokens)
```

**Collections MongoDB** : User, Formation, Course, Assignment, Quiz, Submission, Agenda, Message, Progress.

Les fichiers déposés sont stockés dans `backend/uploads/{cours,devoirs,soumissions}` (dossiers créés automatiquement) et servis sur `/uploads`. Extensions acceptées : pdf, doc, docx, ppt, pptx, xls, xlsx, jpg, jpeg, png, zip. Limites : 10 Mo par fichier, 5 fichiers par envoi.

## API REST

Toutes les routes sont préfixées par `/api` et protégées par un token JWT (`Authorization: Bearer <token>`), sauf la connexion.

| Ressource | Endpoints principaux |
|---|---|
| Authentification | `POST /auth/login` · `POST /auth/register` (admin) |
| Utilisateurs | `GET /users` · `GET /users/:id` · `DELETE /users/:id` |
| Formations | `POST` · `GET` · `PUT /:id` · `PUT /:id/archiver` |
| Cours | `POST` (multipart) · `GET` · `GET /:id` · `PUT /:id` · `DELETE /:id` |
| Devoirs | `POST` (multipart) · `GET` · `GET /:id` · `PUT /:id` · `DELETE /:id` |
| Quiz | `POST` · `GET` · `GET /:id` · `POST /:id/soumettre` · `GET /:id/correction` · `GET /:id/resultats` · `PUT` · `DELETE` |
| Soumissions | `POST /submissions/devoir/:id` (multipart) · `GET /submissions/devoir/:id` · `PUT /submissions/:id/noter` · `GET /submissions/mes-soumissions` |
| Agenda | `POST` · `GET` · `PUT /:id` · `DELETE /:id` |
| Messages | `POST` · `GET` · `GET /non-lus` · `GET /contacts` · `GET /:userId` |
| Progression | `POST /:courseId` · `PUT /:courseId/terminer` · `GET` · `GET /all` · `GET /suivi` |

Les endpoints de création, de modification et de suppression sont réservés aux rôles prof et admin, les actions des apprenants (soumissions, progression) à l'apprenant.

## Sécurité

- Mots de passe hachés avec **bcrypt** (jamais stockés en clair).
- Authentification par **JWT** vérifié sur chaque route protégée, côté client et côté serveur.
- Contrôle d'accès par rôle (`role.js`) : `403` si le rôle n'est pas autorisé.
- Cloisonnement par formation et règles métier appliqués **côté serveur**, pas seulement dans l'interface.
- Bonnes réponses des quiz masquées pour les apprenants, score calculé côté serveur.
- Upload filtré par extension et par taille.
- Secrets (`MONGO_URI`, `JWT_SECRET`) dans des fichiers `.env` exclus de Git.
- Déconnexion automatique côté client à la réception d'un `401`.

## Tests

Les tests fonctionnels sont réalisés manuellement avec **Postman** pour l'API et dans le navigateur pour les parcours. Le plan de tests (cas, résultats attendus et obtenus) figure dans le dossier de projet CDA. Il n'y a pas de tests automatisés pour le moment.

## Auteur

**Noah Garreyn** — alternant développeur chez CG Comines (Comines, 59), titre professionnel CDA.
