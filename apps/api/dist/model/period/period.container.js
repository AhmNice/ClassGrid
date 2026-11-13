import { PeriodRepo } from "./period.repo.js";
import { PeriodService } from "./period.service.js";
import { PeriodScheduleRepo } from "./Schedule/schedule.repo.js";
const periodRepo = new PeriodRepo();
const periodScheduleRepo = new PeriodScheduleRepo();
export const periodService = new PeriodService(periodRepo, periodScheduleRepo);
