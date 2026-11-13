import type { ITeacher, ITeacherCreate } from "../../teacher.interface.js";
import type { ITeacherRepo } from "../../teacher.repo.js";
import { TeacherService } from "../../teacher.service.js";

describe("TeacherService", () => {
  let repo: jest.Mocked<ITeacherRepo>;
  let service: TeacherService;

  const makeTeacher = (o: Partial<ITeacher> = {}): ITeacher => ({
    id: "teacher-1",
    schoolId: "school-1",
    title: "Mr.",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@gmail.com",
    phone: "1234567890",
    staffCode: "T001",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...o,
  });

  const createData: ITeacherCreate = {
    schoolId: "school-1",
    title: "Mr.",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@gmail.com",
    phone: "1234567890",
    staffCode: "T001",
    isActive: true,
  };

  beforeEach(() => {
    repo = {
      createTeacher: jest.fn(),
      getTeachers: jest.fn(),
      getTeacherById: jest.fn(),
      updateTeacher: jest.fn(),
      deleteTeacher: jest.fn(),
      findDuplicate: jest.fn(),
    };
    service = new TeacherService(repo);
  });

  describe("TeacherService.createTeacher", () => {
    it("creates a teacher when no duplicate exists", async () => {
      const created = makeTeacher();
      repo.findDuplicate.mockResolvedValue(null);
      repo.createTeacher.mockResolvedValue(created);

      const result = await service.createTeacher(createData);

      expect(result).toEqual(created);
      expect(repo.findDuplicate).toHaveBeenCalledWith("school-1", {
        email: "johndoe@gmail.com",
        staffCode: "T001",
      });
      expect(repo.createTeacher).toHaveBeenCalledWith(createData);
    });

    it("rejects a duplicate with 409", async () => {
      repo.findDuplicate.mockResolvedValue(makeTeacher());

      await expect(service.createTeacher(createData)).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(repo.createTeacher).not.toHaveBeenCalled();
    });

    it("trims fields before saving", async () => {
      repo.findDuplicate.mockResolvedValue(null);
      repo.createTeacher.mockResolvedValue(makeTeacher());

      await service.createTeacher({ ...createData, firstName: "  John " });

      expect(repo.createTeacher).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: "John" }),
      );
    });

    it("rejects empty data with 400", async () => {
      await expect(
        service.createTeacher({} as ITeacherCreate),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
  describe("TeacherService.updateTeacher", () => {
    it("updates a teacher when no duplicate exists", async () => {
      const updateData = { firstName: "Jane", lastName: "Doe" };
      const updated = makeTeacher(updateData);

      repo.findDuplicate.mockResolvedValue(null);
      repo.updateTeacher.mockResolvedValue(updated);

      const result = await service.updateTeacher("teacher-1", updateData);

      expect(result).toEqual(updated);
      expect(repo.updateTeacher).toHaveBeenCalledWith("teacher-1", updateData);
    });
    it("returns null when the teacher does not exist", async () => {
      repo.updateTeacher.mockResolvedValue(null);
      expect(
        await service.updateTeacher("nope", { firstName: "Jane" }),
      ).toBeNull();
    });

    it("rejects an empty update", async () => {
      await expect(
        service.updateTeacher("teacher-1", {}),
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(repo.updateTeacher).not.toHaveBeenCalled();
    });

    it("trims values before saving", async () => {
      repo.updateTeacher.mockResolvedValue(makeTeacher());
      await service.updateTeacher("teacher-1", { firstName: "  Jane " });
      expect(repo.updateTeacher).toHaveBeenCalledWith("teacher-1", {
        firstName: "Jane",
      });
    });
  });
});
