const { sendEmail } = require("../utils/eMail");
const User = require("../models/userModel");

const Otp = async (email) => {
  console.log("EMAIL IS ", email);
  if (typeof email === "object" && email.email) {
    email = email.email;
  }

  const user = await User.findOne({ email });

  const otp = parseInt(1000 + Math.random() * 9000);

  const message = `Use this ${otp} to complete sigUp process.`;

  try {
    await sendEmail({
      message: message,
      email: email,
    });
  } catch (err) {
    console.log("Error is ", err.message);
  }
  return otp;
};

module.exports = Otp;
