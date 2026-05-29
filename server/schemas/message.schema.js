import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z.string().optional().or(z.literal("")),
  file: z.string().optional(),
  fileType: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
}).refine((data) => data.message || data.file, {
  message: "Either message or file must be provided",
  path: ["message"],
});
