import { TeacherSubjectRepo } from "./teacher-subject.repo.js";
import { TeacherSubjectService } from "./teacher-subject.service.js";

export const teacherSubjectService = new TeacherSubjectService(
  new TeacherSubjectRepo(),
);
