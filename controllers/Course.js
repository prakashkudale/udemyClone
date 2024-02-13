const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("instructorDetails", instructorDetails);

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        userId: userId,
        message: "instructor details not found",
      });
    }

    // verifying Category in DB
    const validatingCategory = await Category.findById(category);
    if (!validatingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category details not found",
      });
    }

    // uploading thumbnail to cloudinary
    const thumbnailUpload = await uploadImageToCloudinary(
      thumbnail,
      process.env.CLOUDINARY_FOLDER_NAME
    );

    // inserting into database

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      instructor: instructorDetails._id,
      price,
      category: validatingCategory._id,
      thumbnail: thumbnailUpload.secure_url,
    });

    // adding this course to user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // updating Category schema
    await Category.findByIdAndUpdate(
      validatingCategory._id,
      { $push: { course: newCourse._id } },
      { new: true }
    );

    // returning response
    return res.status(200).json({
      success: true,
      message: "Course created successfully..",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "failed to create course",
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourse = await Course.find({})
      .populate([
        "instructor",
        "courseContent",
        "ratingAndReviews",
        "category",
        "studentsEnrolled",
      ])
      .exec();

    return res.status(200).json({
      success: true,
      message: "course fetched successfully",
      data: allCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to fetch all course",
      error: error.message,
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findById({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "SubSection",
          options: { strictPopulate: false },
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
