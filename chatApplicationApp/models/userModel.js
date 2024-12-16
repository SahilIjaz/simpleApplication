const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email must be provided"],
      validate: [validator.isEmail, "Email must be valid."],
    },
    password: {
      type: String,
      required: [true, "password is required."],
      select: false,
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
      },
    },
    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg",
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    otp: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetPermission: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isNotification: {
      type: Boolean,
      default: true,
    },
    otpExpiration: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//password encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

//:::::::::::::::::pre hooks
userSchema.pre(/^find/, function (next) {
  this.find({
    isDeleted: false,
  });
  next();
});

//password checking
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
