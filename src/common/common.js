const jwt = require("jsonwebtoken");
const env = require("../environments/environment");

module.exports = function () {
  this.generateJwtToken = (user) => {
    const payload = {
      user: {
        id: user.Id,
        username: user.Username,
        active: user.IsActive,
      },
    };

    return jwt.sign(payload, env.JWT_SECRET_KEY, { expiresIn: "15d" });
  };
};
