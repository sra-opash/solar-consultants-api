require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var featuredPlans = function (plan) {
  this.amount = plan.amount;
  this.title = plan.title;
  this.description = plan.description;
  this.isFeature = plan.isFeature;
};

featuredPlans.getPlans = async (data) => {
  try {
    const query = "select * from featuredPlans";
    const plans = await executeQuery(query);
    if (plans) {
      return plans;
    }
  } catch (error) {
    return error;
  }
};

module.exports = featuredPlans;
