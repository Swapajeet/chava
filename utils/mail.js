const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // तुमचा gmail
    pass: process.env.EMAIL_PASS  // app password
  }
});

module.exports = transporter;