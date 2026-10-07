import type { IClassLevelRepo } from "../../../class.repo.js";
import type { IClassLevel } from "../../../class.interface.js";
import type { IClassArm, IClassArmCreate } from "../../arm.interface.js";
import type { IClassArmRepo } from "../../arm.repo.js";
import { ClassArmService } from "../../arm.service.js";

jest.mock("../../../class.repo.js", () => ({ classLevelRepo: {} }));
jest.mock("../../arm.repo.js", () => ({ classArmRepo: {} }));

type ArmPage = Awaited<ReturnType<IClassArmRepo["getClassArms"]>>;

describe("ClassArmService.createClassArm", () => {
  let repo: jest.Mocked<IClassArmRepo>;
  let classLevelRepo: jest.Mocked<IClassLevelRepo>;
  let service: ClassArmService;

  const makeLevel = (o: Partial<IClassLevel> = {}): IClassLevel => ({
    id: "level-1",
    schoolId: "school-1",
    name: "JSS 1",
    rank: 1,
    stage: "JSS",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...o,
  });

  const makeArm = (o: Partial<IClassArm> = {}): IClassArm => ({
    id: "arm-1",
    classLevelId: "level-1",
    name: "A",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...o,
  });

  // Match the IPaginatedResult field names.
  const page = (items: IClassArm[]): ArmPage =>
    ({ items, total: items.length, page: 1, limit: 100 }) as ArmPage;

  beforeEach(() => {
    repo = {
      createClassArm: jest.fn(),
      getClassArms: jest.fn(),
      getClassArmById: jest.fn(),
      updateClassArm: jest.fn(),
      deleteClassArm: jest.fn(),
    };
    classLevelRepo = {
      createClassLevel: jest.fn(),
      getClassLevels: jest.fn(),
      getClassLevelById: jest.fn(),
      updateClassLevel: jest.fn(),
      deleteClassLevel: jest.fn(),
    };
    service = new ClassArmService(repo, classLevelRepo);
  });

  it("creates a class arm with a unique name", async () => {
    const data: IClassArmCreate = { classLevelId: "level-1", name: " A " };
    const created = makeArm({ name: "A" });

    classLevelRepo.getClassLevelById.mockResolvedValue(makeLevel());
    repo.getClassArms.mockResolvedValue(page([]));
    repo.createClassArm.mockResolvedValue(created);

    const result = await service.createClassArm(data);

    expect(result).toEqual(created);
    expect(repo.createClassArm).toHaveBeenCalledWith({ ...data, name: "A" });
  });

  it("rejects a duplicate arm name in the same class level", async () => {
    classLevelRepo.getClassLevelById.mockResolvedValue(makeLevel());
    repo.getClassArms.mockResolvedValue(page([makeArm({ name: "A" })]));

    await expect(
      service.createClassArm({ classLevelId: "level-1", name: " a " }),
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(repo.createClassArm).not.toHaveBeenCalled();
  });

  it("throws 404 when the class level does not exist", async () => {
    classLevelRepo.getClassLevelById.mockResolvedValue(null);

    await expect(
      service.createClassArm({ classLevelId: "nope", name: "A" }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(repo.createClassArm).not.toHaveBeenCalled();
  });
});
