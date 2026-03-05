import { z } from "zod";

export const emailJobSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  body: z.string().min(1, "Body is required").max(50000, "Body too long"),
});

export type EmailJobPayload = z.infer<typeof emailJobSchema>;
