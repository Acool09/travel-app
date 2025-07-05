const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/listing");
const verifyToken = require("../middleware/verifyToken");

// 👍 Добавить жильё в избранное
router.post("/:listingId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // ✅ используем userId
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const listingId = req.params.listingId;

    if (!user.likedListings.includes(listingId)) {
      user.likedListings.push(listingId);
      await user.save();
    }

    res.status(200).json({ message: "Добавлено в избранное" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👎 Удалить из избранного
router.delete("/:listingId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // ✅
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const listingId = req.params.listingId;

    user.likedListings = user.likedListings.filter(
      (id) => id.toString() !== listingId
    );

    await user.save();

    res.status(200).json({ message: "Удалено из избранного" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📃 Получить все лайкнутые объявления пользователя
router.get("/my", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("likedListings"); // ✅
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.status(200).json(user.likedListings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
