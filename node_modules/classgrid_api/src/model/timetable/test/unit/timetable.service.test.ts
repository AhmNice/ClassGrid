import type { ITermRepo } from "../../../academic-session/term/term.repo.js";
import type {
  ITimetable,
  ITimetableCreate,
  ITimetableUpdate,
} from "../../timetable.interface.js";
import { TimetableService } from "../../timetable.service.js";
import type { ITimeTableRepo } from "../../timetable.repo.js";

describe("TimetableService", () => {
  let repo: jest.Mocked<ITimeTableRepo>;
  let termRepo: jest.Mocked<ITermRepo>;
  let service: TimetableService;

  const makeTimetable = (overrides: Partial<ITimetable> = {}): ITimetable => ({
    id: "timetable-1",
    termId: "term-1",
    name: "First timetable",
    version: 1,
    status: "DRAFT",
    basedOnId: null,
    createdById: null,
    updatedById: null,
    publishedById: null,
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-01"),
    publishedAt: null,
    archivedAt: null,
    ...overrides,
  });

  const createData: ITimetableCreate = {
    termId: "term-1",
    name: "First timetable",
    version: 1,
  };

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findPublishedByTerm: jest.fn(),
      update: jest.fn(),
      duplicate: jest.fn(),
      isValidTargetForDuplication: jest.fn(),
      markAsDraft: jest.fn(),
      markAsPublished: jest.fn(),
      markAsArchived: jest.fn(),
      transaction: jest.fn(),
    };
    termRepo = {
      createTerm: jest.fn(),
      getSessionDates: jest.fn(),
      getTerms: jest.fn(),
      getTermById: jest.fn(),
      updateTerm: jest.fn(),
      activateTerm: jest.fn(),
      deleteTerm: jest.fn(),
      getTermSchoolIdSessionId: jest.fn(),
      transaction: jest.fn(),
    };
    service = new TimetableService(repo, termRepo);
  });

  it("creates a timetable after validating its term", async () => {
    const created = makeTimetable();
    termRepo.getTermSchoolIdSessionId.mockResolvedValue({
      schoolId: "school-1",
      sessionId: "session-1",
    });
    repo.create.mockResolvedValue(created);

    await expect(service.createTimetable(createData)).resolves.toEqual(created);
    expect(repo.create).toHaveBeenCalledWith(createData);
  });

  it("rejects creation when the term does not exist", async () => {
    termRepo.getTermSchoolIdSessionId.mockResolvedValue(null);

    await expect(service.createTimetable(createData)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("allows draft timetables to be renamed", async () => {
    const draft = makeTimetable();
    const update: ITimetableUpdate = { name: "Updated timetable" };
    const updated = makeTimetable(update);
    repo.findById.mockResolvedValue(draft);
    repo.update.mockResolvedValue(updated);

    await expect(
      service.updateDraftTimetable(draft.id, update),
    ).resolves.toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(draft.id, update);
  });

  it("rejects modifications to published timetables", async () => {
    repo.findById.mockResolvedValue(makeTimetable({ status: "PUBLISHED" }));

    await expect(
      service.updateDraftTimetable("timetable-1", { name: "Changed" }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("publishes a draft and archives the current published timetable", async () => {
    const draft = makeTimetable();
    const currentPublished = makeTimetable({
      id: "timetable-old",
      status: "PUBLISHED",
    });
    const published = makeTimetable({
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    repo.findById.mockResolvedValue(draft);
    repo.transaction.mockImplementation(async (callback) => callback(repo));
    repo.findPublishedByTerm.mockResolvedValue(currentPublished);
    repo.markAsArchived.mockResolvedValue(
      makeTimetable({ ...currentPublished, status: "ARCHIVED" }),
    );
    repo.markAsPublished.mockResolvedValue(published);

    await expect(service.publishTimetable(draft.id)).resolves.toEqual(
      published,
    );
    expect(repo.markAsArchived).toHaveBeenCalledWith(currentPublished.id);
    expect(repo.markAsPublished).toHaveBeenCalledWith(draft.id);
  });

  it("archives a published timetable", async () => {
    const published = makeTimetable({ status: "PUBLISHED" });
    const archived = makeTimetable({
      status: "ARCHIVED",
      archivedAt: new Date(),
    });
    repo.findById.mockResolvedValue(published);
    repo.markAsArchived.mockResolvedValue(archived);

    await expect(service.archiveTimetable(published.id)).resolves.toEqual(
      archived,
    );
    expect(repo.markAsArchived).toHaveBeenCalledWith(published.id);
  });

  it("rejects archiving a draft timetable", async () => {
    repo.findById.mockResolvedValue(makeTimetable());

    await expect(service.archiveTimetable("timetable-1")).rejects.toMatchObject(
      { statusCode: 409 },
    );
    expect(repo.markAsArchived).not.toHaveBeenCalled();
  });

  it("duplicates a published timetable through a transaction", async () => {
    const duplicated = makeTimetable({
      id: "timetable-2",
      name: "Second timetable",
      version: 2,
      basedOnId: "timetable-1",
    });
    repo.isValidTargetForDuplication.mockResolvedValue(true);
    repo.transaction.mockImplementation(async (callback) => callback(repo));
    repo.duplicate.mockResolvedValue(duplicated);

    await expect(
      service.duplicateTimetable("timetable-1", duplicated.name),
    ).resolves.toEqual(duplicated);
    expect(repo.duplicate).toHaveBeenCalledWith("timetable-1", duplicated.name);
  });

  it("rejects duplicating a timetable that is not published", async () => {
    repo.isValidTargetForDuplication.mockResolvedValue(false);

    await expect(
      service.duplicateTimetable("timetable-1", "Second timetable"),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(repo.transaction).not.toHaveBeenCalled();
  });
});
