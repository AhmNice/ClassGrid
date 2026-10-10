import { PeriodRepo } from "./period.repo.js";
import { PeriodService } from "./period.service.js";

const periodRepo = new PeriodRepo();
export const periodService = new PeriodService(periodRepo);
