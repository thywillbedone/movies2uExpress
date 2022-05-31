const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, min: 255, max: 6 },
  password: { type: String, required: true, min: 6, max: 1024 },
  date: { type: Date, default: Date.now },
});
mongoose.model("User", userSchema);
