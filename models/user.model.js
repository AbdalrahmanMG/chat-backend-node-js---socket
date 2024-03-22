const mongoose = require('mongoose');
const Joi = require('joi');

// Define Joi validation schema
const userValidationSchema = Joi.object({
  fullName: Joi.string().required().min(3).max(25),
  email: Joi.string().email().required().max(70),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/).required(),
  profilePic: Joi.string().default("https://i.ibb.co/xhbZ5fQ/download.png"),
});

// Define Mongoose user schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 25,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 70,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "https://i.ibb.co/xhbZ5fQ/download.png",
  }
}, { timestamps: true });

// Add virtual id field
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Transform output to JSON
userSchema.set("toJSON", {
  virtuals: true,
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  userValidationSchema
};
