const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Listing = require("../models/listing");
const verifyToken = require("../middleware/verifyToken");

// ✅ POST /reviews — оставить отзыв
router.post("/", verifyToken, async (req, res) => {
  const { listing, rating, comment } = req.body || {};

  if (!listing || rating == null || !comment) {
    return res
      .status(400)
      .json({ error: "Все поля (listing, rating, comment) обязательны" });
  }

  // 🔒 Проверка валидности rating и длины comment
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Рейтинг должен быть числом от 1 до 5" });
  }

  if (typeof comment !== "string" || comment.trim().length < 3) {
    return res.status(400).json({ error: "Комментарий должен содержать минимум 3 символа" });
  }

  try {
    const existing = await Review.findOne({ listing, user: req.user.userId });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Вы уже оставили отзыв для этого жилья" });
    }

    const newReview = new Review({
      listing,
      user: req.user.userId,
      rating,
      comment,
    });

    const saved = await newReview.save();

    const allReviews = await Review.find({ listing });
    const average =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Listing.findByIdAndUpdate(listing, {
      averageRating: average.toFixed(1),
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /reviews/:listingId — получить все отзывы по жилью
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT /reviews/:id — обновить отзыв
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Отзыв не найден" });
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа к редактированию" });
    }

    const { rating, comment } = req.body;
    if (!rating && !comment) {
      return res
        .status(400)
        .json({ error: "Нужно передать хотя бы одно поле: rating или comment" });
    }

    if (rating) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Рейтинг должен быть числом от 1 до 5" });
      }
      review.rating = rating;
    }

    if (comment) {
      if (typeof comment !== "string" || comment.trim().length < 3) {
        return res.status(400).json({ error: "Комментарий должен содержать минимум 3 символа" });
      }
      review.comment = comment;
    }

    const updated = await review.save();

    const allReviews = await Review.find({ listing: review.listing });
    const average =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Listing.findByIdAndUpdate(review.listing, {
      averageRating: average.toFixed(1),
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /reviews/:id — удалить свой отзыв
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Отзыв не найден" });
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Нет прав на удаление" });
    }

    const listingId = review.listing;
    await review.deleteOne();

    const remaining = await Review.find({ listing: listingId });

    let average = 0;
    if (remaining.length > 0) {
      average =
        remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length;
    }

    await Listing.findByIdAndUpdate(listingId, {
      averageRating: average.toFixed(1),
    });

    res.json({ message: "Отзыв удалён" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;