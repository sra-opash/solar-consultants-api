const environment = require("../environments/environment");
const Transaction = require("../models/transaction.modal");

exports.create = async (data) => {
  try {
    const transactionData = new Transaction(data);
    await Transaction.create(transactionData);
  } catch (error) {
    return error;
  }
};

exports.update = async (data) => {
  try {
    await Transaction.update(data);
  } catch (error) {
    return error;
  }
};
