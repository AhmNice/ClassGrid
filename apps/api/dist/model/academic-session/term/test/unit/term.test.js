import { TermService } from "../../term.service.js";
jest.mock("../../term.repo.js", () => ({ termRepo: {} }));
describe("TermService.createTerm", () => {
    let repo;
    let service;
    const session = {
        startDate: new Date("2026-09-01"),
        endDate: new Date("2027-08-31"),
    };
    const makeTerm = (overrides = {}) => ({
        id: "term-x",
        sessionId: "session-1",
        name: "SECOND",
        startDate: new Date("2027-01-01"),
        endDate: new Date("2027-04-30"),
        midTermStartDate: new Date("2027-02-01"),
        midTermEndDate: new Date("2027-02-15"),
        examStartDate: new Date("2027-04-15"),
        examEndDate: new Date("2027-04-30"),
        isCurrent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });
    const data = {
        sessionId: "session-1",
        name: "FIRST",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-12-31"),
        midTermStartDate: new Date("2026-10-15"),
        midTermEndDate: new Date("2026-10-31"),
        examStartDate: new Date("2026-12-15"),
        examEndDate: new Date("2026-12-31"),
    };
    beforeEach(() => {
        repo = {
            createTerm: jest.fn(),
            getSessionDates: jest.fn(),
            getTerms: jest.fn(),
            getTermById: jest.fn(),
            updateTerm: jest.fn(),
            activateTerm: jest.fn(),
            deleteTerm: jest.fn(),
        };
        service = new TermService(repo);
        repo.getSessionDates.mockResolvedValue(session);
    });
    it("should create a term", async () => {
        const existingTerms = [
            makeTerm({ id: "term-2" }),
            makeTerm({
                id: "term-3",
                name: "THIRD",
                startDate: new Date("2027-05-01"),
                endDate: new Date("2027-08-31"),
            }),
        ];
        const createdTerm = makeTerm({ ...data, id: "term-1" });
        repo.getTerms.mockResolvedValue(existingTerms);
        repo.createTerm.mockResolvedValue(createdTerm);
        const result = await service.createTerm(data);
        expect(result).toEqual(createdTerm);
        expect(repo.getSessionDates).toHaveBeenCalledWith("session-1");
        expect(repo.createTerm).toHaveBeenCalledWith(data);
    });
    it("should throw 404 if the session does not exist", async () => {
        repo.getSessionDates.mockResolvedValue(null);
        await expect(service.createTerm(data)).rejects.toMatchObject({
            statusCode: 404,
        });
        expect(repo.createTerm).not.toHaveBeenCalled();
    });
    it("should reject when start date is not before end date", async () => {
        await expect(service.createTerm({
            ...data,
            startDate: data.endDate,
            endDate: data.startDate,
        })).rejects.toMatchObject({ statusCode: 422 });
        expect(repo.createTerm).not.toHaveBeenCalled();
    });
    it("should reject a term outside the session dates", async () => {
        await expect(service.createTerm({ ...data, startDate: new Date("2026-08-01") })).rejects.toMatchObject({ statusCode: 422 });
    });
    it("should reject a term that overlaps an existing term", async () => {
        repo.getTerms.mockResolvedValue([
            makeTerm({
                startDate: new Date("2026-12-01"),
                endDate: new Date("2027-03-01"),
            }),
        ]);
        await expect(service.createTerm(data)).rejects.toMatchObject({
            statusCode: 422,
        });
        expect(repo.createTerm).not.toHaveBeenCalled();
    });
});
