import { z } from "zod";

export const signupSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(6, "Confirm new password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

export const updateProfileSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  gender: z.enum(["male", "female"]).optional(),
  bio: z.string().max(200, "Bio must be at most 200 characters").optional(),
  profilePic: z.string().optional(),
});
