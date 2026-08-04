import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "employee"]).default("employee"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const changeEmployeePasswordSchema = z
  .object({
    id: z.string().min(1, "Employee ID is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type ChangeEmployeePasswordInput = z.infer<typeof changeEmployeePasswordSchema>;
