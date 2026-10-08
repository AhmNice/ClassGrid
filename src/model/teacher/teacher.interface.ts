export interface ITeacher {
  id: string;
  schoolId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  staffCode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherCreate {
  schoolId: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  staffCode: string;
  isActive?: boolean;
}
export interface ITeacherUpdate {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  staffCode?: string;
  isActive?: boolean;
}
