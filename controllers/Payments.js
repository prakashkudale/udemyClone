const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId || userId) {
      return res.status(401).json({
        success: false,
        message: "course id missing",
      });
    }

    let courseDetails;
    try {
      courseDetails = await Course.findById({ _id: courseId });

      if (!courseDetails) {
        return res.status(401).json({
          success: false,
          message: "course does not exist",
        });
      }

      //   user already pay for the same course
      const uid = new mongoose.Types.ObjectId(userId);
      if (courseDetails.studentsEnrolled.includes(uid)) {
        return res.status(401).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // order create
    const amount = courseDetails.price;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId,
        userId,
      },
    };

    try {
      // initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);

      return res.status(200).json({
        success: true,
        message: "order",
        courseName: courseDetails.courseName,
        courseDescription: courseDetails.courseDescription,
        thumbnail: courseDetails.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      console.log(error);
      return res.json({
        success: false,
        message: "could not initiate order",
      });
    }
  } catch (error) {
    return res.status(501).json({
      success: false,
      message: "failed to capture payment",
      error: error,
    });
  }
};

exports.verifyPayment  = async (req, res) => {
  const webHookSecret = "something";
  const signature = req.headers["X-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webHookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature == digest) {
    console.log("Payment is Authorized");

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    const enrolledCourse = await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      return res.status(501).json({
        success: false,
        message: "course not found..",
      });
    }

    console.log(enrolledCourse);

    const enrolledStudent = await User.findByIdAndUpdate(
      { userId },
      { $push: { courses: courseId } },
      { new: true }
    );

    console.log(enrolledStudent);

    // mail send
    const emailResponse = await mailSender(
      enrolledStudent.email,
      "StudyNotion | CodeHelp",
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
      )
    );

    console.log(emailResponse);

    return res.status(200).json({
      success: true,
      message: "Signature verified and course added successfully",
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "failed to verify  Signature",
      error: error.message,
    });
  }
};
