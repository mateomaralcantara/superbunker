export type Role =
  | "STUDENT"
  | "INSTRUCTOR"
  | "RANGE_ADMIN"
  | "PROGRAM_DIRECTOR"
  | "COMPLIANCE"
  | "ORG_ADMIN";

export type LabStatus = "PENDING" | "PROVISIONING" | "RUNNING" | "EXPIRED" | "FAILED";
export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "GRADED";

export type AuditAction =
  | "AUTH_REGISTER"
  | "AUTH_LOGIN"
  | "LAB_TEMPLATE_CREATE"
  | "LAB_INSTANCE_CREATE"
  | "SUBMISSION_CREATE"
  | "SUBMISSION_GRADE";
