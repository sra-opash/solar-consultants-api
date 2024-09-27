const environment = require("../environments/environment");
const featuredPlans = require("../models/plans.modal");

exports.getPlans = async (req, res) => {
  try {
    const plans = await featuredPlans.getPlans();
    if (plans) {
      res.send({ error: false, data: plans });
    }
  } catch (error) {
    return res.status(500).send({ error: true, data: error });
  }
};
