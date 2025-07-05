const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  image: String,

  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  likes: {
    type: [String], // массив userId, которые лайкнули жильё
    default: [],
  },

  // 🧍‍♂️ Максимум гостей
  maxGuests: {
    type: Number,
    required: true,
    default: 2,
  },

  // 🏠 Тип жилья (для фильтрации)
  type: {
    type: String,
    enum: ["apartment", "house", "tent", "villa", "cabin"],
    default: "apartment",
  },

  // ✅ Удобства (Wi-Fi, кухня, кондиционер и т.д.)
  amenities: {
    type: [String],
    default: [],
  },

  // ⭐ Средняя оценка (обновляется после отзывов)
  averageRating: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

// ✅ Не пересоздаёт модель, если уже зарегистрирована
const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);

module.exports = Listing;
