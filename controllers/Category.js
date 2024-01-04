const Category = require("../models/Category");

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
