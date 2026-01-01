const express = require("express");
const router = express.Router();
const paymentController = require("../Controller/paymentController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");


router.post("/create-order", verifyToken, paymentController.createOrder);
router.post("/verify-payment", verifyToken, paymentController.verifyPayment);
router.get("/history/all", verifyToken, authorizeRoles("admin"), paymentController.getAllPaymentHistory);

module.exports = router;
