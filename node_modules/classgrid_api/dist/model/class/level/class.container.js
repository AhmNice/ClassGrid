import { ClassLevelRepo } from "./class.repo.js";
import { ClassLevelService } from "./class.service.js";
const repo = new ClassLevelRepo();
const classLevelService = new ClassLevelService(repo);
export { classLevelService };
