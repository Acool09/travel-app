const express = require("express");
const router = express.Router();
const multer = require("multer");
const { cloudinary } = require("../utils/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const verifyToken = require("../middleware/verifyToken");

// Настройка Cloudinary-хранилища
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "airbnb-clone",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: file.originalname.split(".")[0], // можно убрать, если хочешь уникальные ID
  }),
});

const upload = multer({ storage });

// 📤 Загрузка одного изображения
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не был загружен" });
    }

    console.log("✅ Загружен файл:", req.file);

    // Cloudinary возвращает path = secure_url
    return res.status(200).json({ imageUrl: req.file.path });
  } catch (err) {
    console.error("❌ Ошибка загрузки:", err);
    return res.status(500).json({ error: err.message || "Ошибка загрузки" });
  }
});

module.exports = router;
