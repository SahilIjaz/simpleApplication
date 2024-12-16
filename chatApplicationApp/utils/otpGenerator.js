const { sendEmail } = require("../utils/eMail");
const User = require("../models/userModel");

const Otp = async (email) => {
  console.log("EMAIL IS ", email);
  if (typeof email === "object" && email.email) {
    email = email.email; // Extract the email if it's wrapped in an object
  }

  console.log("EMAIL IS ", email);
  const user = await User.findOne({ email });
  // console.log("user is : ", user);
  // console.log("user is : ", user);
  // if (user) {
  //   console.log("USER IS :", user);
  // }
  const otp = parseInt(1000 + Math.random() * 9000);
  console.log("OTP IS : ", otp);
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
