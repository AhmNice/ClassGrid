import { ISubject, ISubjectCreate } from "../../subject.interface.js";
import { ISubjectRepo } from "../../subject.repo.js";
import { SubjectService } from "../../subject.service.js";
describe("SubjectService", () => {
  let repo: jest.Mocked<ISubjectRepo>;
  let service: SubjectService;
  const makeSubject = (o: Partial<ISubject> = {}): ISubject => ({
    id: "subj-1",
    schoolId: "School-1",
    name: "SUBJECT-1",
    code: "SUB-1",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    defaultAllowConsecutive: true,
    defaultMaxConsecutive: 1,
    defaultMaxPeriodsPerDay: 3,
    defaultPeriodsPerWeek: 5,
    ...o,
  });
  const createSubject: ISubjectCreate = {
    schoolId: "School-1",
    name: "Mathematics",
    code: "Maths",
    isActive: true,
    defaultAllowConsecutive: true,
    defaultMaxConsecutive: 1,
    defaultMaxPeriodsPerDay: 2,
    defaultPeriodsPerWeek: 5,
  };
  beforeEach(() => {
    repo = {
      createSubject: jest.fn(),
      getSubjects: jest.fn(),
      getSubjectById: jest.fn(),
      updateSubject: jest.fn(),
      deleteSubject: jest.fn(),
      findDuplicate: jest.fn(),
    };
    service = new SubjectService(repo);
  });

  describe("SubjectService.createSubject", () => {
    it("should create a subject when no duplicate exists", async () => {
      const created = makeSubject();
      repo.findDuplicate.mockResolvedValue(null);
      repo.createSubject.mockResolvedValue(created);

      const result = await service.createSubject(createSubject);
      expect(repo.findDuplicate).toHaveBeenCalledWith("School-1", {
        name: "Mathematics",
        code: "Maths",
      });
      expect(result).toEqual(created);
      expect(repo.createSubject).toHaveBeenCalledWith(createSubject);
    });
    it("should throw an error when a duplicate subject exists", async () => {
      const duplicate = makeSubject({ name: "Mathematics" });
      repo.findDuplicate.mockResolvedValue(duplicate);
      await expect(service.createSubject(createSubject)).rejects.toThrow(
        "Subject name or code already exists",
      );
    });
    it("should throw an error when a field in subject data is empty ", async () => {
      await expect(
        service.createSubject({
          schoolId: "School-1",
          name: "   ", // name is empty
        }),
      ).rejects.toThrow("name cannot be empty");
    });
    it("should throw an error when subject data is empty", async () => {
      await expect(service.createSubject({} as ISubjectCreate)).rejects.toThrow(
        "Subject data cannot be empty",
      );
    });
  });
  describe("SubjectService.updateSubject", () => {
    it("should update a subject when no duplicate exists", async () => {
      const existing = makeSubject();
      const updatedData = { name: "Updated Subject", code: "Updated Code" };
      const updated = makeSubject(updatedData);

      repo.getSubjectById.mockResolvedValue(existing);
      repo.getSubjects.mockResolvedValue({
        items: [existing], // only itself, which is excluded by currentId
        total: 1,
        page: 1,
        limit: 100,
      });
      repo.updateSubject.mockResolvedValue(updated);

      const result = await service.updateSubject("subj-1", updatedData);

      expect(result).toEqual(updated);
      expect(repo.updateSubject).toHaveBeenCalledWith("subj-1", {
        ...updatedData,
      });
    });

    it("returns null when the subject does not exist", async () => {
      repo.getSubjectById.mockResolvedValue(null);
      expect(await service.updateSubject("nope", { name: "X" })).toBeNull();
      expect(repo.updateSubject).not.toHaveBeenCalled();
    });

    it("rejects a name used by another subject", async () => {
      repo.getSubjectById.mockResolvedValue(makeSubject());
      repo.getSubjects.mockResolvedValue({
        items: [makeSubject({ id: "subj-2", name: "Updated Subject" })],
        total: 1,
        page: 1,
        limit: 100,
      });

      await expect(
        service.updateSubject("subj-1", { name: "Updated Subject" }),
      ).rejects.toThrow("Subject name or code already exists");
      expect(repo.updateSubject).not.toHaveBeenCalled();
    });

    it("rejects invalid scheduling values", async () => {
      repo.getSubjectById.mockResolvedValue(makeSubject());
      await expect(
        service.updateSubject("subj-1", { defaultMaxPeriodsPerDay: 10 }), // > 5 per week
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });
});
