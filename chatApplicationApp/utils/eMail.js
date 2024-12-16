const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // 2) Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    console.log("EMAIL SENDER IS : ", process.env.EMAIL_FROM);
    console.log("EMAIL PASSWORD IS : ", process.env.EMAIL_PASSWORD);
    // 3) Actually send the email
    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error is ----->", err.message);
  }
};
module.exports = { sendEmail };
