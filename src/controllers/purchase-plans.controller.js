const environment = require("../environments/environment");
const purchasePlans = require("../models/purchase-plans.modal");

exports.getMyPlans = async (req, res) => {
  try {
    const id = req.params.id;
    const plans = await purchasePlans.getMyPlans(id);
    if (plans) {
      res.send({ error: false, data: plans });
    }
  } catch (error) {
    return res.status(500).send({ error: true, data: error });
  }
};

exports.createPlans = async (req, res) => {
  try {
    const data = new purchasePlans(req.body);
    const id = await purchasePlans.create(data);
    if (id) {
      res.send({ error: false, data: id });
    }
  } catch (error) {
    return res.status(500).send({ error: true, data: error });
  }
};

exports.updatePlans = async (req, res) => {
  try {
    const data = req.body;
    const isUpdate = await purchasePlans.update(data.leftMins, data.profileId);
    if (isUpdate) {
      res.send();
    }
  } catch (error) {
    return res.status(500).send({ error: true, data: error });
  }
};
