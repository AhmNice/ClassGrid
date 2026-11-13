import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import TitleCard from "../components/TitleCard";
import { School, Verified } from "lucide-react";
import ClassFilter from "../components/class/ClassFilter";
import {
  type ClassFilterState,
  DEFAULT_CLASS_FILTERS,
} from "../components/class/classTypes";
import AddClass_armModal from "../components/modal/AddClass_armModal";
import type {
  IClassArm,
  IClassArmCreate,
} from "../interface/classArm.interface";
import type { IClassLevelCreate } from "../interface/class.interface";
import { useClassStore } from "../store/class.store";
import ClassArmTable from "../components/class/ClassArmTable";
import ClassInspector from "../components/class/ClassInspector";
import { filterClassArm } from "../utils/class.filter";

const Classes = () => {
  const [filters, setFilters] = useState<ClassFilterState>(
    DEFAULT_CLASS_FILTERS,
  );
  const [modal, setModal] = useState(false);
  const classLevels = useClassStore((s) => s.classes);
  const getClassLevels = useClassStore((s) => s.getClassLevels);
  const getClassArms = useClassStore((s) => s.getClassArms);
  const classArms = useClassStore((s) => s.classArms);
  const createClassArm = useClassStore((s) => s.createClassArm);
  const handleModalOpen = () => {
    setModal(true);
  };
  const visible = filterClassArm(classArms, filters)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const handleModalClose = () => {
    setModal(false);
  };

  // The arm form needs the class levels to choose from, so load them when the
  // page opens. (`classLevels` is an array, so the old `!classLevels` check
  // was never true and nothing was ever fetched.)
  useEffect(() => {
    Promise.all([getClassLevels(), getClassArms()]);
  }, [getClassLevels]);

  const handleSubmit = async (values: IClassArmCreate | IClassLevelCreate) => {
    const res = await createClassArm(values as IClassArmCreate);
    if (res.success) setModal(false);
  };
  const [selected, setSelected] = useState<IClassArm | null>(null);
  const handleSelect = (item: IClassArm) => {
    setSelected(item);
  };
  return (
    <MainLayout>
      <section className="flex flex-col gap-3">
        {modal && (
          <AddClass_armModal
            type="ARM"
            onClose={handleModalClose}
            onSubmit={handleSubmit}
            classLevels={classLevels}
          />
        )}
        <TitleCard
          secondaryAction={{
            label: "View Class Level",
            to: "/classes/level",
            icon: <School size={16} strokeWidth={2} />,
          }}
          title="Class and Arms Management"
          actionLabel="Add New Class Arm"
          onButtonClick={handleModalOpen}
          description="Configure student cohorts, stream tracks (Sciences, Arts), assigned form tutors, base homeroom allocations, and period loads."
        />
        <ClassFilter
          classes={classArms}
          filters={filters}
          onChange={setFilters}
        />
        {/* Table takes two thirds, the inspector one third. On small screens
            they stack. `min-w-0` lets the table scroll sideways inside its
            column instead of stretching the page. */}
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <ClassArmTable
              title="Class Cohort Directory"
              data={visible}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
          <ClassInspector item={selected} />
        </div>
      </section>
      <section className="flex gap-3 mt-3">
        <div className="bg-surface flex gap-2 p-space-md">
          <div
            aria-hidden="true"
            className="max-h-max bg-secondary-container p-space-md rounded-md text-primary shrink-0"
          >
            <Verified size={18} strokeWidth={2} />
          </div>

          <div className="space-y-space-xs">
            <h3 className="font-heading text-primary font-bold leading-tight text-md">
              NERDC Curriculum Compliance
              <span className="ml-2  inline-flex items-center gap-1 rounded-sm bg-primary-container px-space-sm py-space-xs font-mono text-[11px] font-medium uppercase tracking-wide text-on-primary-container">
                <Verified size={12} strokeWidth={2.5} aria-hidden="true" />
                Verified
              </span>
            </h3>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              All 28 class arms strictly adhere to the Nigerian Educational
              Research and Development Council (NERDC) secondary curriculum
              framework, ensuring 35 instructional periods of 40 minutes per
              week across both Junior and Senior divisions.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Classes;
