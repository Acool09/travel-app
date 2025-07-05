const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Listing = require("../models/listing");

// ✅ POST /listings - создать новое жильё (только с токеном)
router.post("/", verifyToken, async (req, res) => {
  try {
    const newListing = new Listing({
      ...req.body,
      host: req.user.userId,
    });
    const saved = await newListing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /listings - получить все объявления с фильтрами
router.get("/", async (req, res) => {
  try {
    const { location, minPrice, maxPrice, sort, guests, type, amenities } = req.query;

    const filter = {};

    // 🔍 Поиск по локации
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // 💰 Фильтр по цене
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 👥 Кол-во гостей
    if (guests) {
      filter.maxGuests = { $gte: Number(guests) };
    }

    // 🏠 Тип жилья
    if (type) {
      filter.type = type;
    }

    // ✅ Удобства
    if (amenities) {
      const amenitiesArray = amenities.split(",").map((a) => a.trim().toLowerCase());
      filter.amenities = { $all: amenitiesArray };
    }

    // ↕️ Сортировка по цене
    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const listings = await Listing.find(filter).sort(sortOption);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /listings/my - получить только свои объявления
router.get("/my", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.userId });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT /listings/:id - обновить жильё (только владелец)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Жильё не найдено" });

    if (listing.host.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа к редактированию" });
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /listings/:id - удалить жильё (только владелец)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Жильё не найдено" });

    if (listing.host.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа к удалению" });
    }

    await listing.deleteOne();
    res.json({ message: "Жильё удалено" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT /listings/:id/like - лайк/разлайк жилья (только авторизованные)
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Жильё не найдено" });

    const userId = req.user.userId;
    const hasLiked = listing.likes?.includes(userId);

    if (hasLiked) {
      listing.likes = listing.likes.filter((id) => id !== userId);
    } else {
      listing.likes = [...(listing.likes || []), userId];
    }

    const updated = await listing.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 GET /listings/:id — получить одно жильё по ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Жильё не найдено" });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

// cd server
// node index.js
