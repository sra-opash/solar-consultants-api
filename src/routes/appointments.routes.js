const express = require("express");
const router = express.Router();
const appointmentsController = require("../controllers/appointments.controller");
const utilsController = require("../controllers/utils.controller");
const authorize = require("../middleware/authorize");

router.use(authorize.authorization);
router.post("/", appointmentsController.findAll);
router.post("/create-appointment", appointmentsController.createAppointment);
router.get(
  "/practitioner-appointments/:id",
  appointmentsController.getPractitionerAppointments
);
router.get(
  "/user-appointments/:id",
  appointmentsController.getUserAppointments
);
router.put("/change-status", appointmentsController.changeAppointmentStatus);

module.exports = router;
