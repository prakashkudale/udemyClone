const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email is Not Registered",
      });
    }

    const token = crypto.randomUUID();

    const updateDetails = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    const url = `https://localhost:3000/update-password/${token}`;

    await mailSender(
      email,
      "Reset Password Link",
      `Password Reset Link : ${url}`
    );

    return res.json({
      success: true,
      message: "email send successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reset password" + error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password Does Not Match",
      });
    }
    const userDetails = await User.findOne({ token });
    if (!userDetails) {
      return res.status(500).json({
        success: false,
        message: "Token Is invalid ",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token Is Expire Please try Again",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate({ token }, { password: hashedPassword });
    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong" + error.message,
    });
  }
};
