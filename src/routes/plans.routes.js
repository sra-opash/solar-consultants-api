const express = require("express");
const router = express.Router();
const plansController = require("../controllers/plans.controller");
const purchasePlansController = require("../controllers/purchase-plans.controller");
const authorize = require("../middleware/authorize");

router.use(authorize.authorization);
router.get("/", plansController.getPlans);
router.get("/:id", purchasePlansController.getMyPlans);
router.post("/purchase-plan", purchasePlansController.createPlans);
router.put("/update-plan", purchasePlansController.updatePlans);

module.exports = router;
