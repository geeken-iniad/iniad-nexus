import type { SemesterType } from "@/types/timetable";

export type AssignmentStatus =
  | "todo"
  | "in_progress"
  | "submitted"
  | "done"
  | "overdue";

export type AssignmentPriority = "high" | "medium" | "low";

export type AssignmentSubmissionType =
  | "online"
  | "paper"
  | "presentation"
  | "other";

export interface AssignmentLink {
  label: string; // Display label for a related resource.
  url: string; // URL for LMS pages, references, or submission forms.
}

export interface Assignment {
  id: string; // Assignment row id.
  user_id: string; // Owner profile id.
  title: string; // Assignment title.
  subject: string; // Subject name. Backfilled to a non-null value by migration.
  due_date: string; // Due datetime from the existing v3.2 schema.
  memo: string | null; // Existing free-form memo.
  done_at: string | null; // Synced by DB trigger when status changes to done.
  priority: AssignmentPriority; // Readable priority after migration.
  academic_year: number; // Academic year for term filtering.
  semester: SemesterType; // Term label reused from timetable types.
  timetable_entry_id: string | null; // Optional link to timetable.id.
  description: string | null; // Richer assignment details.
  submission_type: AssignmentSubmissionType; // How the assignment is submitted.
  submission_location: string | null; // LMS, URL, classroom, or other destination.
  status: AssignmentStatus; // Workflow status for task-like UI.
  links: AssignmentLink[]; // Structured related links.
  created_at: string; // Created timestamp.
  updated_at: string; // Updated timestamp.
}

export type AssignmentInsert = Omit<
  Assignment,
  "id" | "user_id" | "created_at" | "updated_at" | "done_at"
>;

export type AssignmentUpdate = Partial<AssignmentInsert>;

export interface AssignmentFilters {
  academic_year?: number;
  semester?: SemesterType;
  status?: AssignmentStatus;
  priority?: AssignmentPriority;
  subject?: string;
  timetable_entry_id?: string | null;
}
