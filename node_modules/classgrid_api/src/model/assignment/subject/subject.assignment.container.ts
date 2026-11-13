import { SubjectRepo } from "@/model/subject/subject.repo.js";
import { SubjectAssignmentService } from "./subject.assignment.service.js";
import { ClassLevelRepo } from "@/model/class/level/class.repo.js";
import { ClassLevelSubjectRepo } from "./subject.assignment.repo.js";
const subjectRepo = new SubjectRepo();
const classLevelRepo = new ClassLevelRepo();
const classLevelSubjectRepo = new ClassLevelSubjectRepo();
export const subjectAssignmentService = new SubjectAssignmentService(
  classLevelSubjectRepo,
  subjectRepo,
  classLevelRepo,
)