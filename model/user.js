const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  FbId: String,
  name: String,
});

module.exports = mongoose.model("user", userSchema);
