const express = require("express");
const router = express.Router();
const planController = require("../Controller/planController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Public (To show pricing)
router.get("/", planController.getAllPlans);

// Admin Only (Manage Plans)
router.post("/", verifyToken, authorizeRoles("admin"), planController.createPlan);
router.put("/:id", verifyToken, authorizeRoles("admin"), planController.updatePlan);
router.delete("/:id", verifyToken, authorizeRoles("admin"), planController.deletePlan);

module.exports = router;
