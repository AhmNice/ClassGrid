import { TeacherRepo } from "./teacher.repo.js";
import { TeacherService } from "./teacher.service.js";

const teacherRepo = new TeacherRepo();
export const teacherService = new TeacherService(teacherRepo);
