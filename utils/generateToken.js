const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const generateToken = (userId) => {
  return jwt.sign({userId:userId}, SECRET_KEY, {
    expiresIn: "1d",
  });
};

module.exports = generateToken;
