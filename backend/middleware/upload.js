const multer = require('multer');
const path = require('path');
const fs = require('fs');

const fileFilter = (req, file, cb) => {
  const typesAutorises = /pdf|doc|docx|ppt|pptx|xls|xlsx|jpg|jpeg|png|zip/;
  const extValide = typesAutorises.test(path.extname(file.originalname).toLowerCase());
  if (extValide) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

function createUploader(sousDossier) {
  // __dirname = dossier de CE fichier (backend/middleware).
  // On remonte d'un niveau pour viser backend/uploads/<sousDossier>,
  // quel que soit le dossier depuis lequel le serveur est lancé.
  const dossierComplet = path.join(__dirname, '..', 'uploads', sousDossier);

  if (!fs.existsSync(dossierComplet)) {
    fs.mkdirSync(dossierComplet, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dossierComplet),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
}

module.exports = createUploader;