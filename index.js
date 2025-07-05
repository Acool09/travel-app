const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Импорт маршрутов
const favoritesRoutes = require("./routes/favorites");
const listingRoutes = require("./routes/listing");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const bookingsRoutes = require("./routes/bookings");
const reviewRoutes = require("./routes/reviews");

const app = express(); // Инициализация Express
const PORT = 5050;

// 🔧 Логирование
console.log("🚀 Запуск index.js...");
console.log("🔑 URI из .env:", process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json()); // ⚠️ обязательно до маршрутов!

// Маршруты
app.use("/favorites", favoritesRoutes);
app.use("/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/reviews", reviewRoutes); // ✅ Только один раз подключаем!

// Тестовый маршрут
app.get("/test", (req, res) => {
  res.json({ message: "Тест работает!" });
});

// Главная
app.get("/", (req, res) => {
  res.send("Backend работает!");
});

// Подключение к MongoDB и запуск сервера
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Подключено к MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
  });

// cd server
// node index.js
