const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },

    // 🔢 Количество гостей
    guestsCount: {
      type: Number,
      default: 1,
    },

    // 💬 Сообщение от пользователя
    message: {
      type: String,
      default: "",
    },

    // 📆 Кол-во ночей (можно считать при создании)
    nights: {
      type: Number,
      default: 1,
    },

    // 💰 Итоговая стоимость
    totalPrice: {
      type: Number,
      default: 0,
    },

    // 🚦 Статус бронирования
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
