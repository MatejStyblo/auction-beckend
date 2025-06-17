import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Nastavení úložiště pro obrázky
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // složka musí existovat
  },
  filename: function (req, file, cb) {
    // vezmeme příponu z původního jména
    const ext = path.extname(file.originalname).toLowerCase();
    // nebo z mimetypu: const ext = "." + file.mimetype.split("/")[1];
    // fixní prefix + původní přípona
    cb(null, `main-image${ext}`);
  },
});

const upload = multer({ storage });

export default upload;
