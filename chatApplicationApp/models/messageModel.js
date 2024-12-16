const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "sender is required in message Schema"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "receiver is required in message Schema"],
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: [true, "message is required in message Schema"],
    },
    messageType: {
      type: String,
      // default: String,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "chat is required in message model"],
    },
    messageTime: {
      type: String,
      required: [true, "message time is required in message schema"],
    },
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  this.populate({
    path: "sender",
  });
  this.populate({
    path: "receiver",
  });
  this.populate({
    path: "chat",
    // ref: "Chat",
  });
  next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
