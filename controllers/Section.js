const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(401).json({
        success: false,
        message: "please enter all field",
      });
    }
    // inserting a section
    const createdSection = await Section.create({ sectionName });

    // updating a course db
    await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { courseContent: createdSection._id } }
    );
    return (
      res.status(200).
      json({
        success: true,
        message: "section created successfully",
      })
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to create section",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionId, sectionName } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(401).json({
        success: false,
        message: "please enter section id",
      });
    }

    await Section.findByIdAndUpdate({ _id: sectionId }, { sectionName });

    return (
      res.status(200),
      json({
        success: true,
        message: "section updated successfully",
      })
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to update section",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    // sending id in header
    const { sectionId, courseId } = req.params;

    await Section.findByIdAndDelete(sectionId);

    // deleting from course db also

    await Course.findByIdAndDelete(courseId, {
      $pull: { courseContent: sectionId },
    });

    return res.status(200).json({
      success: false,
      message: "section deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "failed to delete section",
      error: error.message,
    });
  }
};
