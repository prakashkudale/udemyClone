const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token Is missing ",
      });
    }
    try {
      const jwtDecode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("jwtDecode",jwtDecode);

      req.user = jwtDecode;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Token Is invalid ",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong On Auth " + err.message,
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(400).json({
        success: false,
        message: "Sorry This Protected Routes For Student",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role can not be verified",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(400).json({
        success: false,
        message: "Sorry This Protected Routes For Instructor",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role can not be verified",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(400).json({
        success: false,
        message: "Sorry This Protected Routes For Admin",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Role can not be verified",
    });
  }
};
