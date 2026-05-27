import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import { config } from "../config/env.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// Register
export const register = asyncHandler(async (req, res, next) => {
  const { fullname, username, email, password, gender } = req.body;

  // Check if username OR email already exists
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return next(new AppError(400, "Username or email already exists"));
  }

  const newUser = await User.create({
    fullname,
    username,
    email,
    password,
    gender,
    profilePic: req.body.profilePic || "",
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

// Login
export const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "New user found"));
  }

  // Use the isPasswordCorrect method we added to the schema
  if (!(await user.isPasswordCorrect(password))) {
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

// GetProfile
export const getProfile = asyncHandler(async (req, res, next) => {
  // The user is already fetched and attached to req by the isAuthenticated middleware
  res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "User profile retrieved successfully"),
    );
});

export const logout = asyncHandler(async (req, res, next) => {
  const isProduction = config.NODE_ENV === "production";
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully!"));
});

// GetOtherUsers
export const getOtherUsers = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  console.log(loggedInUserId);

  // Find all users except the currently logged-in user
  const otherUsers = await User.find({ _id: { $ne: loggedInUserId } })
    .select("-password")
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(200, otherUsers, "Other users retrieved successfully"),
    );
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(404, "User not found with this email"));
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (15 mins from now)
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const clientUrl = config.CLIENT_URL.replace(/\/$/, "");
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) have requested the reset of a password.\n\nPlease make a POST request to:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

  try {
    const mailResult = await sendEmail({
      email: user.email,
      subject: "Password Reset Request - BackChodi Chat",
      message,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981; text-align: center;">Password Reset Request</h2>
          <p>You are receiving this email because you (or someone else) requested a password reset for your BackChodi account.</p>
          <p>Please click the button below to reset your password. This link is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain secure.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">If you have trouble clicking the button, copy and paste the link below into your browser:</p>
          <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetUrl}</p>
        </div>
      `,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          emailSent: !mailResult.mocked,
          token: config.NODE_ENV !== "production" ? resetToken : undefined,
          resetUrl: config.NODE_ENV !== "production" ? resetUrl : undefined,
        },
        mailResult.mocked
          ? "SMTP not configured. Reset link logged to console."
          : `Email sent to ${user.email} successfully`
      )
    );
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(500, "Email could not be sent. Try again later."));
  }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Hash token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(400, "Invalid or expired password reset token"));
  }

  // Set new password (will trigger userSchema pre-save hashing hook)
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password reset successfully!"));
});

// Change Password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user; // populated by auth middleware

  // Check old password
  if (!(await user.isPasswordCorrect(oldPassword))) {
    return next(new AppError(400, "Incorrect old password"));
  }

  // Check if new password is same as old
  if (oldPassword === newPassword) {
    return next(new AppError(400, "New password cannot be same as old password"));
  }

  // Update password (will trigger pre-save hook)
  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password updated successfully!"));
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullname, username, email, profilePic, gender, bio } = req.body;
  const user = req.user; // populated by auth middleware

  if (username && username !== user.username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return next(new AppError(400, "Username already exists"));
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new AppError(400, "Email already exists"));
    }
    user.email = email;
  }

  if (fullname) user.fullname = fullname;
  if (gender) user.gender = gender;
  if (bio !== undefined) user.bio = bio;
  if (profilePic !== undefined) user.profilePic = profilePic;

  await user.save();

  // Return the updated user (without password)
  const updatedUser = await User.findById(user._id).select("-password");

  res.status(200).json(
    new ApiResponse(200, updatedUser, "Profile updated successfully!")
  );
});
