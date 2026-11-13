import { IAcademicSession } from "../../academic-session.interface.js";
import type { IAcademicSessionRepo } from "../../academic-session.repo.js";
import { AcademicSessionService } from "../../academic-session.service.js";

jest.mock("../../academic-session.repo.js", () => ({
  academicSessionRepo: {},
}));

describe("Academic Session Model", () => {
  const repo: jest.Mocked<IAcademicSessionRepo> = {
    createAcademicSession: jest.fn(),
    getAcademicSessions: jest.fn(),
    getAcademicSessionById: jest.fn(),
    getTerms: jest.fn(),
    updateAcademicSession: jest.fn(),
    activateAcademicSession: jest.fn(),
    deleteAcademicSession: jest.fn(),
  };
  it("should create an academic session", async () => {
    const service = new AcademicSessionService(repo);

    const data = {
      name: "  2026/2027  ",
      schoolId: "school-1",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-07-31"),
      isCurrent: false,
    };

    const expectedSession = {
      id: "session-1",
      schoolId: "school-1",
      name: "2026/2027",
      startDate: data.startDate,
      endDate: data.endDate,
      isCurrent: false,
      createdAt: new Date("2026-08-01"),
      updatedAt: new Date("2026-08-01"),
    };

    repo.createAcademicSession.mockResolvedValue(expectedSession);

    const result = await service.createAcademicSession(data);

    expect(result).toEqual(expectedSession);
    expect(repo.createAcademicSession).toHaveBeenCalledWith({
      ...data,
      name: data.name.trim(),
    });
  });
  it("should throw an error if start date is after end date", async () => {
    const service = new AcademicSessionService(repo);
    const data = {
      name: "2026/2027",
      schoolId: "school-1",
      startDate: new Date("2027-09-01"),
      endDate: new Date("2026-07-31"),
      isCurrent: false,
    };
    await expect(service.createAcademicSession(data)).rejects.toThrow(
      "Start date must be before end date",
    );
  });
  it("should throw an error if term dates are outside session dates", async () => {
    const service = new AcademicSessionService(repo);
    const sessionData = {
      name: "2026/2027",
      schoolId: "school-1",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-07-31"),
      isCurrent: false,
    };
    const existingSession: IAcademicSession = {
      id: "session-1",
      schoolId: "school-1",
      name: "2026/2027",
      startDate: sessionData.startDate,
      endDate: sessionData.endDate,
      isCurrent: false,
      createdAt: new Date("2026-08-01"),
      updatedAt: new Date("2026-08-01"),
    };

    const terms = [
      { startDate: new Date("2026-08-01"), endDate: new Date("2026-12-31") },
      { startDate: new Date("2027-01-01"), endDate: new Date("2027-08-31") },
    ];
    repo.getAcademicSessionById.mockResolvedValue(existingSession);
    repo.getTerms.mockResolvedValue(terms);
    await expect(
      service.updateAcademicSession(existingSession.id, sessionData),
    ).rejects.toThrow(
      "Academic session start date cannot be after a term start date",
    );
  });
});
