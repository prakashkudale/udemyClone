const { default: mongoose } = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailVerificationTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  otp: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    require: true,
    default: Date.now(),
    expries: 5 * 60,
  },
});

// pre middleware for sending OTP when user Signup

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = mailSender(
      email,
      "Verification Mail From Udemy",
      emailVerificationTemplate(otp)
    );
    console.log("Email Send Successfully :- ", mailResponse);
  } catch (err) {
    console.log("error in sending verification mail : " + err.message);
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
