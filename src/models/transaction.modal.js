require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Transactions = function (transaction) {
  this.paymentIntentId = transaction.paymentIntentId;
  this.profileId = transaction.profileId;
  this.creatorId = transaction.creatorId;
  this.amount = transaction.amount;
  this.status = transaction.status;
  this.practitionerId = transaction.practitionerId;
};

Transactions.create = async (data) => {
  try {
    console.log("transaction", data);
    const query = "Insert into payment_transactions set ?";
    const values = [data];
    const transaction = await executeQuery(query, values);
    if (transaction) {
      return transaction.insertId;
    }
  } catch (error) {
    console.log("transaction", error);
    return error;
  }
};

Transactions.update = async (data) => {
  try {
    const query = "update payment_transactions set ? where paymentIntentId = ?";
    const values = [data, data.paymentIntentId];
    const transaction = await executeQuery(query, values);
    // if (transaction) {
    //   return transaction.insertId;
    // }
    return true;
  } catch (error) {
    return error;
  }
};

module.exports = Transactions;
