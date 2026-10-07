import { ApiError } from "@/utils/errorHandler.js";
import type { IClassLevelRepo } from "../../class.repo.js";
import type { IClassLevel, IClassLevelCreate } from "../../class.interface.js";
import { ClassLevelService } from "../../class.service.js";

jest.mock("../../class.repo.js", () => ({
  classLevelRepo: {},
}));

const classLevel = (overrides: Partial<IClassLevel> = {}): IClassLevel => ({
  id: "level-1",
  schoolId: "school-1",
  name: "JSS 1",
  rank: 1,
  stage: "JSS",
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

describe("ClassLevelService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  let repo: jest.Mocked<IClassLevelRepo>;
  let service: ClassLevelService;
  beforeEach(() => {
    repo = {
      createClassLevel: jest.fn(),
      getClassLevels: jest.fn(),
      getClassLevelById: jest.fn(),
      updateClassLevel: jest.fn(),
      deleteClassLevel: jest.fn(),
    };
    service = new ClassLevelService(repo);
  });
  it("creates a class-level with a unique name", async () => {
    const data: IClassLevelCreate = {
      schoolId: "school-1",
      name: " jss 1 ",
      rank: 2,
      stage: "JSS",
    };
    const created = classLevel({ name: "jss 1" });

    repo.getClassLevels.mockResolvedValue({ items: [], total: 0 });
    repo.createClassLevel.mockResolvedValue(created);

    const result = await service.createClassLevel(data);

    expect(result).toEqual(created);
    expect(repo.getClassLevels).toHaveBeenCalledWith("school-1", {
      page: 1,
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
    });
    expect(repo.createClassLevel).toHaveBeenCalledWith({
      ...data,
      name: "jss 1", // trimmed, case preserved
    });
  });
  it("rejects a duplicate class-level name within a school", async () => {
    const service = new ClassLevelService(repo);
    const data: IClassLevelCreate = {
      schoolId: "school-1",
      name: " jss 1 ",
      rank: 2,
      stage: "JSS",
    };

    repo.getClassLevels.mockResolvedValue({ items: [classLevel()], total: 1 });

    await expect(service.createClassLevel(data)).rejects.toEqual(
      new ApiError(422, "Class level name already exists"),
    );
    expect(repo.createClassLevel).not.toHaveBeenCalled();
  });

  it("rejects changing a class-level name to an existing name", async () => {
    const service = new ClassLevelService(repo);

    repo.getClassLevelById.mockResolvedValue(classLevel());
    repo.getClassLevels.mockResolvedValue({
      items: [classLevel(), classLevel({ id: "level-2", name: "JSS 2" })],
      total: 2,
    });

    await expect(
      service.updateClassLevel("level-1", { name: " jss 2 " }),
    ).rejects.toEqual(new ApiError(422, "Class level name already exists"));
    expect(repo.updateClassLevel).not.toHaveBeenCalled();
  });
});
