import Course from "../models/courseModel.js";
import Stripe from 'stripe';
import User from "../models/userModel.js";
import dotenv from "dotenv"
dotenv.config()

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.RAZORPAY_SECRET;
const stripe = new Stripe(stripeSecret);

export const createOrder = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.title,
              description: course.subTitle || course.description || 'Course Enrollment',
            },
            unit_amount: course.price * 100, // Amount in paise/cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/viewcourse/${courseId}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/viewcourse/${courseId}?payment_cancel=true`,
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `Order creation failed ${err.message}` });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const { session_id, courseId, userId } = req.body;

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const cId = courseId || session.metadata.courseId;
      const uId = userId || session.metadata.userId;

      // Update user and course enrollment
      const user = await User.findById(uId);
      if (user) {
        if (!user.enrolledCourses.includes(cId)) {
          user.enrolledCourses.push(cId);
          await user.save();
        }
      }

      const course = await Course.findById(cId).populate("lectures");
      if (course) {
        if (!course.enrolledStudents.includes(uId)) {
          course.enrolledStudents.push(uId);
          await course.save();
        }
      }

      return res.status(200).json({ message: "Payment verified and enrollment successful" });
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error during payment verification" });
  }
};
