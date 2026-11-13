import { TimeTableRepo } from "../timetable.repo.js";
import { TimetableEntryRepo } from "./timetabel-entry.repo.js";
import { TimetableEntryService } from "./timetable-entry.service.js";
const timetableEntryRepo = new TimetableEntryRepo();
export const timetableEntryService = new TimetableEntryService(timetableEntryRepo, new TimeTableRepo());
