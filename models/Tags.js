const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    require: true,

  },
});

module.exports = mongoose.model("Tag", TagSchema);
