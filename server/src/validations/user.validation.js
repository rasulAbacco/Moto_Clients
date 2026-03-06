import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9]+$/)
    .optional(),
});
