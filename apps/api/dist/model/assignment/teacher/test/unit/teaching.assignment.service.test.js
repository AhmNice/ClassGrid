import { TeachingAssignmentService } from "../../teaching.assignment.service.js";
describe("TeachingAssignmentService", () => {
    let repo;
    let service;
    const createData = {
        sessionId: "session-1",
        teacherId: "teacher-1",
        subjectId: "subject-1",
        classArmId: "arm-1",
        periodsPerWeek: 5,
    };
    const assignment = (overrides = {}) => ({
        id: "assignment-1",
        sessionId: "session-1",
        teacherId: "teacher-1",
        subjectId: "subject-1",
        classArmId: "arm-1",
        isActive: true,
        periodsPerWeek: 5,
        requiresDoublePeriod: false,
        requiredRoomType: null,
        maxPeriodsPerDay: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });
    beforeEach(() => {
        repo = {
            isValidCreateTarget: jest.fn(),
            findByUniqueKey: jest.fn(),
            findById: jest.fn(),
            list: jest.fn(),
            getByTeacher: jest.fn(),
            getClassArmTeachingAssignmentData: jest.fn(),
            create: jest.fn(),
            reactivate: jest.fn(),
            unassign: jest.fn(),
            update: jest.fn(),
            reassign: jest.fn(),
            transaction: jest.fn(),
        };
        service = new TeachingAssignmentService(repo);
    });
    it("creates an assignment for a valid teacher-subject relationship", async () => {
        const created = assignment();
        repo.isValidCreateTarget.mockResolvedValue(true);
        repo.findByUniqueKey.mockResolvedValue(null);
        repo.create.mockResolvedValue(created);
        await expect(service.createTeachingAssignment(createData, "school-1")).resolves.toEqual(created);
        expect(repo.create).toHaveBeenCalledWith(createData);
    });
    it("rejects an invalid teacher-subject relationship", async () => {
        repo.isValidCreateTarget.mockResolvedValue(false);
        await expect(service.createTeachingAssignment(createData, "school-1")).rejects.toMatchObject({ statusCode: 422 });
        expect(repo.create).not.toHaveBeenCalled();
    });
    it("rejects duplicate active assignments", async () => {
        repo.isValidCreateTarget.mockResolvedValue(true);
        repo.findByUniqueKey.mockResolvedValue(assignment());
        await expect(service.createTeachingAssignment(createData, "school-1")).rejects.toMatchObject({ statusCode: 422 });
    });
    it("reassigns a class subject to another eligible teacher", async () => {
        const existing = assignment();
        const updated = assignment({ teacherId: "teacher-2" });
        repo.findById.mockResolvedValue(existing);
        repo.isValidCreateTarget.mockResolvedValue(true);
        repo.findByUniqueKey.mockResolvedValue(null);
        repo.reassign.mockResolvedValue(updated);
        await expect(service.updateTeachingAssignment(existing.id, "school-1", { teacherId: "teacher-2" })).resolves.toEqual(updated);
        expect(repo.reassign).toHaveBeenCalledWith(existing.id, "school-1", { teacherId: "teacher-2" });
    });
    it("rejects reassignment to a duplicate active teacher assignment", async () => {
        const existing = assignment();
        repo.findById.mockResolvedValue(existing);
        repo.isValidCreateTarget.mockResolvedValue(true);
        repo.findByUniqueKey.mockResolvedValue(assignment({ id: "other-assignment", teacherId: "teacher-2" }));
        await expect(service.updateTeachingAssignment(existing.id, "school-1", { teacherId: "teacher-2" })).rejects.toMatchObject({ statusCode: 422 });
        expect(repo.reassign).not.toHaveBeenCalled();
    });
    it("stores the weekly period requirement", async () => {
        const existing = assignment();
        const updated = assignment({ periodsPerWeek: 8 });
        repo.findById.mockResolvedValue(existing);
        repo.isValidCreateTarget.mockResolvedValue(true);
        repo.findByUniqueKey.mockResolvedValue(null);
        repo.reassign.mockResolvedValue(updated);
        await service.updateTeachingAssignment(existing.id, "school-1", { periodsPerWeek: 8 });
        expect(repo.reassign).toHaveBeenCalledWith(existing.id, "school-1", { periodsPerWeek: 8 });
    });
});
