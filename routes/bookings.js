const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");

// ✅ POST /bookings — создать бронирование с проверкой доступности
router.post("/", verifyToken, async (req, res) => {
  const { listing, checkIn, checkOut, guestsCount = 1, message = "" } = req.body;

  if (!listing || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Все поля обязательны: listing, checkIn, checkOut" });
  }

  try {
    // Проверка, что жильё существует
    const listingData = await Listing.findById(listing);
    if (!listingData) {
      return res.status(404).json({ error: "Жильё не найдено" });
    }

    // Проверка корректности дат
    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ error: "Дата выезда должна быть позже даты заезда" });
    }

    // Проверка на занятость
    const overlapping = await Booking.findOne({
      listing,
      $or: [
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ error: "Эти даты уже заняты" });
    }

    // Подсчёт ночей и общей цены
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listingData.price;

    const newBooking = new Booking({
      listing,
      guest: req.user.userId,
      checkIn,
      checkOut,
      guestsCount,
      message,
      nights,
      totalPrice,
      status: "confirmed"
    });

    const saved = await newBooking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /bookings/my — получить свои бронирования
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user.userId }).populate("listing");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE /bookings/:id — удалить бронирование
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Бронирование не найдено" });
    }

    if (!booking.guest || booking.guest.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа к удалению" });
    }

    await booking.deleteOne();
    res.json({ message: "Бронирование удалено" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /bookings/:listingId/availability?start=2025-07-10&end=2025-07-12
router.get("/:listingId/availability", async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Укажите даты start и end" });
  }

  try {
    const overlapping = await Booking.findOne({
      listing: req.params.listingId,
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } }
      ]
    });

    res.json({ available: !overlapping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
