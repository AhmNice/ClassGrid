import {
  BookOpen,
  CalendarCog,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Clock,
  Cog,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  SlidersVertical,
  Sparkles,
  UserRoundCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  links: NavItem[];
}

// Single source of truth for the sidebar and the breadcrumbs.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Scheduling",
    links: [
      { label: "Overview", icon: LayoutDashboard, path: "/overview" },
      { label: "Timetables", icon: CalendarDays, path: "/timetables" },
      {
        label: "Timetable editor",
        icon: CalendarCog,
        path: "/timetable-editor",
      },
      {
        label: "Teacher availability",
        icon: Clock,
        path: "/teacher-availability",
      },
      { label: "Generate", icon: Sparkles, path: "/generate" },
    ],
  },
  {
    title: "Curriculum",
    links: [
      { label: "Classes", icon: Users, path: "/classes" },
      { label: "Teachers", icon: GraduationCap, path: "/teachers" },
      { label: "Subjects", icon: BookOpen, path: "/subjects" },
      { label: "Assignments", icon: ClipboardList, path: "/assignments" },
    ],
  },
  {
    title: "Structure",
    links: [
      { label: "Rooms", icon: DoorOpen, path: "/rooms" },
      { label: "Periods", icon: Clock, path: "/periods" },
      { label: "Sessions & terms", icon: CalendarRange, path: "/sessions" },
    ],
  },
  {
    title: "System & Administration",
    links: [
      {
        label: "Settings",
        icon: SlidersVertical,
        children: [
          {
            label: "Timetable Officer & IM",
            icon: UserRoundCog,
            path: "/settings/timetable-officer",
          },
          {
            label: "General configuration",
            icon: Cog,
            path: "/settings/general",
          },
        ],
      },
    ],
  },
];
