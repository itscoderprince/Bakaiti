import * as z from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const signupSchema = z
  .object({
    fullname: z.string().min(2, "Full name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmpassword: z.string(),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    profilePic: z
      .any()
      .optional()
      .refine(
        (files) =>
          !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
        `Max file size is 5MB.`
      )
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
      ),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
  });

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
