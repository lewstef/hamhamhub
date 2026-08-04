import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const changeUserPasswordSchema = z
  .object({
    id: z.string().min(1, "User ID is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserInput = z.infer<typeof userSchema>;
export type ChangeUserPasswordInput = z.infer<typeof changeUserPasswordSchema>;
