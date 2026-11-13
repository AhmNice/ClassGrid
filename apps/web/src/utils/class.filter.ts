import type { IClassArm } from "../interface/classArm.interface";
import type { ClassFilterState } from "../components/class/classTypes";

export const filterClassArm = (
  classes: IClassArm[],
  filters: ClassFilterState,
): IClassArm[] => {
  const needle = filters.query.trim().toLowerCase();

  return classes.filter((arm) => {
    // Search: arm name OR full class name ("JSS 1" + "A" matches "jss 1a").
    if (needle) {
      const haystack = `${arm.className} ${arm.name}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    // Stage: JSS | SS | ALL
    if (filters.stage !== "ALL" && arm.classStage !== filters.stage) {
      return false;
    }

    // Track: SCIENCE | ART | ALL
    if (filters.track !== "ALL" && arm.track !== filters.track) {
      return false;
    }

    // Status: ACTIVE | INACTIVE | ALL  (mapped to isActive)
    if (filters.status === "ACTIVE" && !arm.isActive) return false;
    if (filters.status === "INACTIVE" && arm.isActive) return false;

    return true;
  });
};