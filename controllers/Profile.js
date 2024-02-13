const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;
    const id = req.user.id;

    // Find the profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    });
    await user.save();

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    // Save the updated profile
    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // check in database
    
    const userDetails = await User.findById({_id : userId});
    console.log("id:", userDetails);
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    // await Course.findByIdAndDelete(
    //   { _id: userDetails.courses._id },
    //   { $pull: { courses: userDetails.courses._id } }
    // );
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to delete user",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(403).json({
        success: true,
        message: "User Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Fetched User Details Successfully..",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to fetch all user details",
      error: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const img = req.files.displayPicture;
    const userId = req.user.id;

    if (!img) {
      return res.status(401).json({
        success: false,
        message: "please upload profile picture",
      });
    }

    const uploadImg = await uploadImageToCloudinary(
      img,
      process.env.CLOUDINARY_FOLDER_NAME
    );
    const updatedFields = await User.findByIdAndUpdate(
      { _id: userId },
      { image: uploadImg.secure_url },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      data: updatedFields,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to update profile picture",
      error: error.message,
    });
  }
};
