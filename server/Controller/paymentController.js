const Razorpay = require("../Config/razorpay");
const crypto = require("crypto");
const Plan = require("../model/PlanModel");
const Subscription = require("../model/SubscriptionModel");

// 1. Initialize Payment (Create Order)
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const options = {
      amount: plan.price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await Razorpay.orders.create(options);

    // Create a temporary subscription record
    await Subscription.create({
      user: req.user.id,
      plan: plan._id,
      orderId: order.id,
      amount: plan.price,
      status: 'created'
    });

    res.json({
      success: true,
      order,
      plan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify Payment (Called after user pays on Frontend)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment Successful

      // Find the pending subscription
      const subscription = await Subscription.findOne({ orderId: razorpay_order_id });
      const plan = await Plan.findById(subscription.plan);

      if(!subscription) return res.status(404).json({message: "Subscription record not found"});

      // Calculate expiry date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.durationInDays);

      // Update Subscription
      subscription.paymentId = razorpay_payment_id;
      subscription.status = 'active';
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      await subscription.save();

      res.json({ success: true, message: "Payment verified, Membership Active" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllPaymentHistory = async (req, res) => {
  try {
    const history = await Subscription.find()
      .populate('user', 'name email') // Get user details
      .populate('plan', 'name')       // Get plan name
      .sort({ createdAt: -1 });       // Newest first

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
