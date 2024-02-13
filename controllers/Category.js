const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const CategoryDetails = await Category.create({ name, description });

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    ); //second is make sure all the fields are available
    return res.status(200).json({
      success: true,
      data: allCategory,
      message: "Category Fetched Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something Went wrong " + error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const selectedCategory = await Category.findById({
      _id: categoryId,
    })
      .populate("course")
      .exec();

    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: "Not Found Course with this category",
      });
    }

    const differentCategory = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("course")
      .exec();

    // Find all courses in the category and sort by the number of studentsEnrolled in descending order
    const topSellingCourses = await Course.find({ category: categoryId })
      .sort({ studentsEnrolled: -1 })
      .limit(10); // You can adjust the limit based on your requirement

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        topSellingCourses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to get courses.",
    });
  }
};
