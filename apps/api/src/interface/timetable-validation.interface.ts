export interface TimetableValidationError {
  code: string;
  category: "CURRICULUM" | "CONFLICT" | "ROOM" | "TEACHER" | "AVAILABILITY";
  message: string;
  details?: Record<string, any>;
}

export interface TimetableValidationSummary {
  isValid: boolean;
  totalErrors: number;
  errorsByCategory: {
    curriculum: number;
    conflicts: number;
    rooms: number;
    teachers: number;
  };
  errors: TimetableValidationError[];
}
