import { z } from "zod"

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
  full_name: z.string().nullable(),
  role: z.enum(["admin", "user", "pending", "root"]),
})
