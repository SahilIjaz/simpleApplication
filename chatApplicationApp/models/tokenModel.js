const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    fcmToken: {
      type: String,
    },
    person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

tokenSchema.pre(/^find/, function (next) {
  this.populate({
    path: "person",
  });
  next();
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
