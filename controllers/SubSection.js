const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubsection = async (req, res) => {
  try {
    const { title, timeDuration, description, sectionId } = req.body;
    const videoFile = req.files.videoFile;

    if (!title || !timeDuration || !description || !videoFile || sectionId) {
      return res.status(401).json({
        success: false,
        message: "failed to create section",
        error: error.message,
      });
    }

    // uploading video to cloudinary
    const uploadVideo = await uploadImageToCloudinary(
      videoFile,
      process.env.CLOUDINARY_FOLDER_NAME_VIDEO
    );

    // inserting in subsection db
    const createSubsection = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadVideo.secure_url,
    });

    // updating in section db
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSection: createSubsection._id },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "SubSection Created Successfully",
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      message: "failed to create subsection",
    });
  }
};

exports.updateSubsection = async (req, res) => {
  try {
    const { title, timeDuration, description, sectionId } = req.body;
    const videoFile = req.files.videoFile;

    const updatedFields = {};

    if (title) {
      existingSubsection.title = title;
    }
    if (timeDuration) {
      existingSubsection.timeDuration = timeDuration;
    }
    if (description) {
      existingSubsection.description = description;
    }
    if (videoFile) {
      const uploadVideo = await uploadImageToCloudinary(
        videoFile,
        process.env.CLOUDINARY_FOLDER_NAME_VIDEO
      );
      existingSubsection.videoFile = uploadVideo.secure_url;
    }

    const updatedSubsection = await SubSection.findOneAndUpdate(
      { sectionId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedSubsection) {
      return res.status(404).json({ error: "Subsection not found" });
    }

    return res.status(200).json({ message: "Subsection updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteSelection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    if (!subSectionId || !sectionId) {
      return res.status(401).json({
        success: true,
        message: "Please fill all the field",
      });
    }

    await SubSection.findByIdAndDelete({ _id: subSectionId });

    // delete from section also

    await Section.findByIdAndDelete(
      { _id: sectionId },
      { $pull: { subSection: subSectionId } }
    );

    return res.status(200).json({
      success: true,
      message: "SubSection Delete Successfully",
    });
  } catch (error) {}
};

