import { SubjectRepo } from "./subject.repo.js";
import { SubjectService } from "./subject.service.js";

const subjectRepo = new SubjectRepo();
export const subjectService = new SubjectService(subjectRepo);
