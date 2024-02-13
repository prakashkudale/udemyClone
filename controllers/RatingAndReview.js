const RatingAndReviews = require("../models/RatingAndReviews");
const Course = require("../models/Course");
const mongoose = require("mongoose");

exports.createRating = async (req, res) => {
  try {
    const { rating, review, courseId } = req.body;
    const userId = req.user.id;

    // check if user is enrolled  or not

    const checkEnrolled = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!checkEnrolled) {
      return res.status(401).json({
        success: false,
        message: "User not enrolled the course",
      });
    }

    // Check if the user has already submitted a review for the same course
    const existingRating = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this course.",
      });
    }

    const newRating = await RatingAndReviews.create({
      user: userId,
      rating,
      review,
      course: courseId,
    });

    // update course with this rating and reviews

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { ratingAndReviews: newRating._id } },
      { new: true }
    );

    console.log(updatedCourseDetails);

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully.",
      rating: newRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to submit rating.",
    });
  }
};

exports.getAvgRatings = async (req, res) => {
  try {
    const { courseId } = req.body;

    const avgRatings = await RatingAndReviews.aggregate([
      { $match: new mongoose.Schema.Types.ObjectId(courseId) },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    if (avgRatings > 0) {
      return res.status(200).json({
        success: false,
        message: "Ratings fetched successfully",
        averageRating: avgRatings[0].avgRating,
      });
    }

    // if no ratings exits
    return res.status(200).json({
      success: true,
      message: "No ratings found for this course.",
      averageRating: 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get average rating.",
    });
  }
};

exports.getCourseRatings = async (req, res) => {
  try {
    const { courseId } = req.body;

    const allRatings = await RatingAndReviews.findOne({
      course: courseId,
    }).populate("user");

    if (allRatings.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No ratings found for this course." });
    }

    res.status(200).json({ success: true, ratings: allRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get ratings.",
    });
  }
};

exports.getAllRatings = async (req, res) => {
  try {
    const allRatings = await RatingAndReviews.find({})
      .sort({ rating: -1 })
      .populate({ path: "user", select: "firstName lastName email image" })
      .populate({ path: "course", select: "courseName" })
      .exec(); 

    if (allRatings.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No ratings found for this course." });
    }

    res.status(200).json({ success: true, ratings: allRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get ratings.",
    });
  }
};
