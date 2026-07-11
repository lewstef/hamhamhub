import { vi, describe, it, expect, beforeEach } from "vitest";
import { updateSubServiceSettingsAction } from "./subservices";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Dummy database URL to satisfy drizzle setup
process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";

const mockSelect = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => {
  const chain: any = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockImplementation(() => Promise.resolve(mockSelect()));
  
  const db = {
    select: vi.fn().mockReturnValue(chain),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => mockUpdate()),
      }),
    }),
  };

  return { db };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("updateSubServiceSettingsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({ error: "Unauthorized: Access Denied." });
  });

  it("should return error if subServiceId is missing", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    const formData = new FormData();
    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({ error: "Sub-service identifier is required." });
  });

  it("should return error if editing another organization without admin/employee role", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    formData.append("orgId", "user-2"); // different org
    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({
      error: "Unauthorized: You do not have permission to edit this organization's services.",
    });
  });

  it("should succeed if admin editing another organization", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "admin-1", role: "admin" },
      expires: "any",
    });

    mockUpdate.mockResolvedValueOnce({ count: 1 });

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    formData.append("orgId", "user-2");
    formData.append("hasField", "true");
    formData.append("fieldDesc", "Spacious turf training area");

    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should return error if field description is missing when dedicated training field is enabled", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    formData.append("hasField", "true");
    formData.append("fieldDesc", ""); // missing description

    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({
      error: "Training field description is required when dedicated training field is enabled.",
    });
  });

  it("should return error if parking description is missing when parking is enabled", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    formData.append("hasParking", "true");
    formData.append("parkingDesc", ""); // missing description

    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({
      error: "Parking description is required when parking is enabled.",
    });
  });

  it("should return error if trainer institution is missing when certified trainer is enabled", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    formData.append("hasCertifiedTrainer", "true");
    formData.append("trainerInstitution", ""); // missing

    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({
      error: "Certifier name is required when certified dog trainer is enabled.",
    });
  });

  it("should successfully update basic training sub-service settings", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    mockUpdate.mockResolvedValueOnce({ count: 1 });

    const formData = new FormData();
    formData.append("subServiceId", "basic-training-and-obedience");
    formData.append("hasField", "true");
    formData.append("fieldDesc", "Grass field");
    formData.append("hasParking", "false");
    formData.append("terms", "Dogs must be vaccinated");
    formData.append("programIncludes", "Obedience manual");
    formData.append("hasCertifiedTrainer", "true");
    formData.append("trainerInstitution", "KPA");

    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/services/dog-training");
  });

  it("should successfully update group training sub-service settings", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "organization" },
      expires: "any",
    });

    mockUpdate.mockResolvedValueOnce({ count: 1 });

    const formData = new FormData();
    formData.append("subServiceId", "group-basic-obedience-training");
    formData.append("hasField", "false");
    formData.append("hasParking", "true");
    formData.append("parkingDesc", "Underground garage free parking");
    formData.append("terms", "Handler must stay");
    formData.append("programIncludes", "Interactive collar and treats");
    formData.append("hasCertifiedTrainer", "false");

    const result = await updateSubServiceSettingsAction(null, formData);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/services/dog-training");
  });
});
