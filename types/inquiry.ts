export type InquiryCategory =
  | "bug_report"
  | "feature_request"
  | "other_feedback";

export type InquiryCategoryOption = {
  value: InquiryCategory;
  label: string;
};

export const INQUIRY_CATEGORY_OPTIONS: InquiryCategoryOption[] = [
  { value: "bug_report", label: "不具合・バグの報告" },
  { value: "feature_request", label: "機能の要望・改善案" },
  { value: "other_feedback", label: "その他・感想" },
];

export interface InquiryFormValues {
  category: InquiryCategory;
  subject: string;
  content: string;
  studentNumber: string;
  isAnonymous: boolean;
}