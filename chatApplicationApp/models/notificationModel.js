const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    notificationType: {
      type: String,
      required: [true, "Notification type is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Receiver is required"],
      },
    ],
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    text: {
      type: String,
      required: [true, "Text is required"],
    },
    data: {
      type: Object,
      default: [true, "data is required in notification schema"],
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: "sender",
    select: "fullName",
  });
  this.populate({
    path: "receiver",
    select: "fullName",
  }),
    next();
});

module.exports = mongoose.model("Notification", notificationSchema);
