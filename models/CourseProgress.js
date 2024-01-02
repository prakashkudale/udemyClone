const mongoose = require("mongoose");

const CourseProgress = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    require: true,
  },
completedVideos : [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref : "SubSection"
    }
]
});

module.exports = mongoose.model("CourseProgress", CourseProgress);
