const { User, userValidationSchema } = require("../models/user.model.js");
const bcryptjs = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");

// regester function
const signup = async (req, res) => {
  try {
    const { error, value } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        error: error.details[0].message,
      });
    }

    const { fullName, email, password } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Validation Error",
        error: "Email already exists"
      });
    }

    const passwordHashed = await bcryptjs.hash(password, 10);

    const newUser = await User({
      fullName,
      password: passwordHashed,
      email,
    });

    if (!newUser) {
      return res.status(401).json({
        success: false,
        message: "failed to create User!",
      });
    }

    await newUser.save();
    generateToken(newUser._id, res);

    return res.status(201).json({
      success: true,
      message: "User is Created!"
    });
    // return res.status(201).json({
    //   id:newUser._id,
    //   fullName: newUser.fullName,
    //   email: newUser.email,
    //   profilePic: newUser.profilePic
    // });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: error.message, message: "server error!" });
  }
};

// login funciton
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ message: "user is not found" });
    }

    const token = generateToken(user.id);
    
    return res.status(200).json({
      id:user.id,
      fullName:user.fullName,
      email:user.email,
      profilePic:user.profilePic,
      // createdAt:user.createdAt,
      // updatedAt: user.updatedAt
      token: token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// logout function
const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({
      message: "logged out!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const editprofile = async (req, res) => {
  try {
    const loggedUserId = req.user.id;
    const {profilePic, fullName, email} = req.body;
    let checkEmail= await User.findOne({email: email})
    if (checkEmail) {
      return res.status(400).json({success: false, message: "email is already taken!"})
    }

    const updatedUser = await User.findByIdAndUpdate(
      loggedUserId,
      {
        profilePic,
        fullName,
        email
      },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return res.status(400).json({ message: "user is not found" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, logout, signup, editprofile };
