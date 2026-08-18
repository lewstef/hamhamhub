import { describe, it, expect } from "vitest";
import { employeeSchema, changeEmployeePasswordSchema } from "./employees";

describe("Employee Validation Schemas (src/lib/validations/employees.ts)", () => {
  it("validates valid employee input", () => {
    const res = employeeSchema.safeParse({
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      role: "employee",
      password: "securepassword",
    });
    expect(res.success).toBe(true);
  });

  it("validates change employee password matching & mismatching", () => {
    const valid = changeEmployeePasswordSchema.safeParse({
      id: "emp-1",
      password: "newpassword123",
      confirmPassword: "newpassword123",
    });
    expect(valid.success).toBe(true);

    const mismatch = changeEmployeePasswordSchema.safeParse({
      id: "emp-1",
      password: "newpassword123",
      confirmPassword: "differentpassword",
    });
    expect(mismatch.success).toBe(false);
  });
});
