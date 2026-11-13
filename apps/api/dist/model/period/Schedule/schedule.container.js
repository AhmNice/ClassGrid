import { PeriodScheduleRepo } from "./schedule.repo.js";
import { PeriodScheduleService } from "./schedule.service.js";
export const periodScheduleService = new PeriodScheduleService(new PeriodScheduleRepo());
