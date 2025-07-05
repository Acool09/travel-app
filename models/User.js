const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // email должен быть уникальным
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  // 🔥 Добавляем список лайкнутых объявлений
  likedListings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
}, { timestamps: true }); // автоматически добавляет createdAt и updatedAt

module.exports = mongoose.model("User", userSchema);
