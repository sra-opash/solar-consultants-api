const jwt = require("jsonwebtoken");
const tokenBlacklist = new Set(); 
const env = require('../environments/environment') 

exports.authorization = function (req, res, next) {
  //Get token from header
  console.log(req.headers.authorization);

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    //Check if token exist
    if (!token) {
      return res.status(401).json({ message: "Unauthorized token" });
    }

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: "invalid token" });
    }

    //Verify token
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET_KEY); 
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ message: "not valid token" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized token" });
  }
};


exports.setTokenInList = function (token) {
  tokenBlacklist.add(token);
};