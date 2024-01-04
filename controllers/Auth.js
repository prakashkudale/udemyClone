const User = require("../models/User");
const Otp = require("../models/Otp");
const otpGenrator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    //    checking if user is alerdy exist or not
    const userExits = await User.findOne({ email });

    // if user Already exist , returning response
    if (userExits) {
      return res.status(403).json({
        success: false,
        message: "User Already Exits",
      });
    }

    let otp = otpGenrator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated Otp : ", otp);

    let checkOtpExits = await Otp.findOne({ otp: otp });

    while (checkOtpExits) {
      otp = otpGenrator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      checkOtpExits = await Otp.findOne({ opt: otp });
    }

    // creating a entry in db
    const otpBody = await Otp.create({ email, otp });
    console.log(otpBody);

    return res.status(200).json({
      success: true,
      message: "Otp Send Successfully",
      otp,
    });
  } catch (err) {
    console.log("Otp Error", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// singup

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validating data

    if (!firstName || lastName || email || password || otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    function isValidEmail(email) {
      // Regular expression for a simple email validation
      var emailRegex = /^[a-zA-Z0-9._%+-]+@email\.com$/;

      // Test the email against the regex pattern
      return emailRegex.test(email);
    }

    if (isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password and confirm password does not match,try again",
      });
    }

    // cheking user exist or not
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(403).json({
        success: false,
        message: "User Already Exits",
      });
    }

    //   find most recent OTP stored for the user
    const recentOTP = await Otp.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("recent otp :", recentOTP);

    if (recentOTP.length == 0) {
      return res.status(401).json({
        success: false,
        message: "Otp Not found",
      });
    } else if (otp !== recentOTP.otp) {
      return res.status(401).json({
        success: false,
        message: "Otp Not Matched, Enter Correct Otp",
      });
    }

    //   hashing password

    const hashedPassword = await bcrypt.hash(password, 10);

    //   creating entry in db

    const profileDetails = await Profile.create({
      gender: null,
      about: null,
      contactNumber: null,
      dateOfBirth: null,
    });

    const response = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      contactNumber,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User Is registered successfully ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User cannot registered. something went wrong",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    // checking if user exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User Does Not Exits",
      });
    }

    const hashedPassword = await bcrypt.compare(password, user.password);

    if (hashedPassword) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      const option = {
        expires: new Date(Date.now + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, option).status(200).json({
        success: true,
        token,
        user,
        message: "User Logged in Successfully..",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password does not match please enter correct password",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Login Issue. something went wrong",
      error: err.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  //  class end at 1:9
};
