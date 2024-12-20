const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "users are required in chat schema"],
      },
    ],
    lastMessage: {
      type: String,
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageTime: {
      type: String,
    },
    messageTime: {
      type: String,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

chatSchema.pre(/^find/, function (next) {
  this.populate({
    path: "users",
  });
  this.populate({
    path: "lastMessageSender",
  });

  next();
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
