import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const register = asyncHandler(async (req, res, next) => {
  const { fullname, username, email, password, gender } = req.body;

  // Check if username OR email already exists
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return next(new AppError(400, "Username or email already exists"));
  }

  // Generate a highly reliable default avatar using UI-Avatars
  const profilePic = `https://ui-avatars.com/api/?name=${username}&background=random`;

  const newUser = await User.create({
    fullname,
    username,
    email,
    password,
    gender,
    profilePic,
  });

  // Generate JWT token and set it in HTTP-only cookie
  const token = generateTokenAndSetCookie(newUser._id, res);

  // Remove password from response
  const createdUser = await User.findById(newUser._id).select("-password");

  // Production-level successful response
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, token },
        "User registered successfully!",
      ),
    );
});

export const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });

  // Use the isPasswordCorrect method we added to the schema
  if (!user || !(await user.isPasswordCorrect(password))) {
    return next(new AppError(401, "Invalid username or password"));
  }

  // Generate JWT token
  const token = generateTokenAndSetCookie(user._id, res);

  // Remove password from response
  const loggedInUser = await User.findById(user._id).select("-password");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, token },
        "User logged in successfully!",
      ),
    );
});

export const getProfile = asyncHandler(async (req, res, next) => {
  // The user is already fetched and attached to req by the isAuthenticated middleware
  res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "User profile retrieved successfully"),
    );
});

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully!"));
});
