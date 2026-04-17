const multer = require("multer");
const path = require("path");

// Configuración del almacenamiento con multer
const storage = multer.memoryStorage() && multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta donde se guardarán las imágenes
 },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único para evitar duplicados
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes en formato JPEG, JPG o PNG"));
  }
};
//Guarda la imagen en memoria (si la deseas en Base64)
//const upload = multer({ storage: storage });

// Configurar multer con las opciones de almacenamiento y filtrado
const upload = multer({ storage, fileFilter });

module.exports = upload;