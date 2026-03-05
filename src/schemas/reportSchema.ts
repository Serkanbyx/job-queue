import { z } from "zod";

export const reportJobSchema = z.object({
  type: z.enum(["pdf", "csv"], {
    errorMap: () => ({ message: "Type must be 'pdf' or 'csv'" }),
  }),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  data: z
    .array(z.record(z.string(), z.unknown()))
    .min(1, "Data array must have at least one item")
    .max(10000, "Data array too large"),
});

export type ReportJobPayload = z.infer<typeof reportJobSchema>;
