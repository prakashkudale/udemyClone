const mongoose = require("mongoose");

const RatingAndReviews = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  rating: {
    type: Number,
    require: true,
  },
  review: {
    type: String,
    require: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
});

module.exports = mongoose.model("RatingAndReviews", RatingAndReviews);
