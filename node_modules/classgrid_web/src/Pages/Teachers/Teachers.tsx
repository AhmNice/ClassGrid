import MainLayout from "../../layout/MainLayout";
import TitleCard from "../../components/TitleCard";
import { FilePlus, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AddTeacherModal, {
  type TeacherUpdateData,
} from "../../components/modal/AddTeacherModal";
import type {
  ITeacher,
  ITeacherCreate,
} from "../../interface/teacher.interface";
import { useTeacherStore } from "../../store/teacher.store";
import type { RequestResponse } from "../../interface/common.interface";
import TeacherFilter from "../../components/teacher/TeacherFilter";
import {
  DEFAULT_TEACHER_FILTERS,
  type TeacherFilterState,
} from "../../components/teacher/TeacherTypes";
import TeacherTable from "../../components/teacher/TeacherTable";
import ImportTeachersModal, {
  type TeacherImportResult,
} from "../../components/modal/ImportTeacherModal";

// How many teachers are saved at the same time during an import.
const IMPORT_CONCURRENCY = 4;

const Teachers = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [filters, setFilters] = useState<TeacherFilterState>(
    DEFAULT_TEACHER_FILTERS,
  );
  const [selected, setSelected] = useState<ITeacher | null>(null);

  const createTeacher = useTeacherStore((state) => state.createTeacher);
  const teachers = useTeacherStore((state) => state.teachers);
  const fetchTeachers = useTeacherStore((state) => state.getTeachers);

  // Saves the teachers one request each, a few at a time, and reports which
  // ones failed. Swap this for a single bulk request once the server has a
  // `/teachers/import` endpoint: it is faster and can run in one transaction.
  const handleImport = async (
    items: ITeacherCreate[],
  ): Promise<TeacherImportResult> => {
    const failed: TeacherImportResult["failed"] = [];
    let created = 0;
    let next = 0;

    const worker = async () => {
      while (next < items.length) {
        const index = next++;
        try {
          const result = await createTeacher(items[index]);
          if (result.success) {
            created++;
          } else {
            // Prefer the field messages ("Email already in use") over the
            // general one.
            const detail = result.errors?.map((e) => e.message).join(" ");
            failed.push({ index, message: detail || result.message });
          }
        } catch (error) {
          failed.push({
            index,
            message:
              error instanceof Error ? error.message : "Could not be saved",
          });
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(IMPORT_CONCURRENCY, items.length) }, worker),
    );

    // Make sure the table matches the server after the import.
    await fetchTeachers();

    return { created, failed: failed.sort((a, b) => a.index - b.index) };
  };

  // Load once on mount. `fetchTeachers` is stable in your store, so no loop.
  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTeachers = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return teachers.filter((t) => {
      if (filters.status === "ACTIVE" && !t.isActive) return false;
      if (filters.status === "INACTIVE" && t.isActive) return false;
      if (filters.title !== "ALL" && t.title !== filters.title) return false;
      if (!q) return true;
      return [t.firstName, t.lastName, t.email, t.staffCode, t.phone]
        .filter((v): v is string => Boolean(v))
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [teachers, filters]);

  const handleSubmit = async (
    data: ITeacherCreate | TeacherUpdateData,
  ): Promise<RequestResponse<ITeacher>> => {
    const result = await createTeacher(data as ITeacherCreate);
    return result;
  };

  return (
    <MainLayout>
      <section className="flex flex-col gap-3">
        <TitleCard
          title="Teachers & Faculty Management"
          description="Manage teaching staff profiles, subject specializations, maximum period workloads, unavailable time windows, and timetable clash rules."
          PrimaryIcon={UserPlus}
          actionLabel="Add New Teacher"
          onButtonClick={() => setOpenModal(true)}
          secondaryAction={{
            label: "Bulk Import",
            to: () => setOpenImportModal(true),
            icon: <FilePlus strokeWidth={2} size={16} />,
          }}
        />

        {openModal && (
          <AddTeacherModal
            close={() => setOpenModal(false)}
            onSubmit={handleSubmit}
          />
        )}
        {openImportModal && (
          <ImportTeachersModal
            onClose={() => setOpenImportModal(false)}
            onImport={handleImport}
          />
        )}

        <TeacherFilter
          teachers={teachers}
          filters={filters}
          onChange={setFilters}
        />

        <TeacherTable
          data={filteredTeachers}
          title="Teachers"
          selected={selected}
          onSelect={setSelected}
        />
      </section>
    </MainLayout>
  );
};

export default Teachers;