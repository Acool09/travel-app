const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 📌 Регистрация пользователя
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Проверка на существующий email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email уже зарегистрирован" });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Регистрация успешна", user: newUser });
  } catch (err) {
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
});

// 📌 Вход пользователя
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    // 🔑 Генерация токена с правильным полем `id`
    const token = jwt.sign(
      { id: user._id }, // 👈 важно: должно быть `id`, чтобы потом работал req.user.id
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Успешный вход",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Ошибка при входе" });
  }
});

module.exports = router;
