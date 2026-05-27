import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please enter your name"],
      index: true,
    },
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: 6,
    },
    gender: {
      type: String,
      required: [true, "Please enter your gender"],
      enum: ["male", "female"],
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Hey there! I am using BackChodi.",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Custom method to compare entered password with hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
