// This file now only holds small, static UI constants shared across pages
// (dropdown options, badge color mappings). All real data — students,
// listings, applications, etc. — now comes from the Express/MongoDB API via
// DataContext, not from this file.

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Electrical Engineering",
];

export const STATUS_COLORS = {
  Applied: "info",
  Shortlisted: "warning",
  "Interview Scheduled": "warning",
  Selected: "success",
  Rejected: "danger",
  Withdrawn: "neutral",
  Approved: "success",
  "Pending Approval": "warning",
  Closed: "neutral",
  Draft: "neutral",
  Upcoming: "info",
  Ongoing: "warning",
  Completed: "success",
  Verified: "success",
  "Pending Verification": "warning",
  "Needs Correction": "danger",
  Scheduled: "info",
  Filled: "success",
};
