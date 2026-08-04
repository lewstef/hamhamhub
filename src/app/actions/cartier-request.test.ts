import { describe, expect, it, vi, beforeEach } from "vitest";
import { requestNewCartierAction } from "./organizations";
import { auth } from "@/auth";
import { sendMail } from "@/lib/email";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendMail: vi.fn(),
}));

describe("requestNewCartierAction Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if user is not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await requestNewCartierAction({
      cityName: "Cluj-Napoca",
      cartierName: "Mănăștur Nord",
    });

    expect(res).toEqual({ error: "Unauthorized access" });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("should return error if cityName is empty", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "user@example.com" } } as any);

    const res = await requestNewCartierAction({
      cityName: "",
      cartierName: "Mănăștur Nord",
    });

    expect(res).toEqual({ error: "Numele localității este obligatoriu." });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("should return error if cartierName is empty", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "user@example.com" } } as any);

    const res = await requestNewCartierAction({
      cityName: "Cluj-Napoca",
      cartierName: "   ",
    });

    expect(res).toEqual({ error: "Numele cartierului este obligatoriu." });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("should successfully trigger email to stefan.wrabeli@gmail.com and return success message", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "owner@dogwalker.ro" } } as any);
    vi.mocked(sendMail).mockResolvedValue({ success: true } as any);

    const res = await requestNewCartierAction({
      cityName: "Cluj-Napoca",
      cartierName: "Borhanci Vest",
      notes: "Aria nouă rezidențială",
    });

    expect(res).toEqual({
      success: true,
      message: "We received your request for a new coverage zone, we will be back soon",
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith({
      to: "stefan.wrabeli@gmail.com",
      subject: "HamHamHub - Solicitare adaugare Cartier nou: Borhanci Vest (Cluj-Napoca)",
      html: expect.stringContaining("Borhanci Vest"),
    });
  });

  it("should return generic error message when sendMail fails", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "owner@dogwalker.ro" } } as any);
    vi.mocked(sendMail).mockRejectedValueOnce(new Error("SMTP Connection failed"));

    const res = await requestNewCartierAction({
      cityName: "Cluj-Napoca",
      cartierName: "Borhanci Vest",
    });

    expect(res).toEqual({ error: "A apărut o eroare la trimiterea solicitării. Vă rugăm să încercați din nou." });
  });
});
