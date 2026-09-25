import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";
import { useToast } from "./ToastContext";

const DataContext = createContext(null);

// ---------------------------------------------------------------------------
// DataContext is the ONLY place that talks to the backend. Every page calls
// action functions from here instead of calling `api` directly. On mount it
// bootstraps every collection in one request (fine for this dataset's size),
// then every mutator below calls the matching Express route and merges the
// response back into local state — so reads stay instant (no route loads
// spinners of their own) while writes go through the database.
// ---------------------------------------------------------------------------

function replaceById(list, updated) {
  return list.map((item) => (item.id === updated.id ? updated : item));
}

export function DataProvider({ children }) {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [internships, setInternships] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/bootstrap");
      setStudents(data.students);
      setProfessors(data.professors);
      setCompanies(data.companies);
      setListings(data.listings);
      setApplications(data.applications);
      setInterviews(data.interviews);
      setInternships(data.internships);
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------------- lookups (unchanged from the prototype) ----------------
  const getStudent = (id) => students.find((s) => s.id === id);
  const getCompany = (id) => companies.find((c) => c.id === id);
  const getListing = (id) => listings.find((l) => l.id === id);
  const getApplication = (id) => applications.find((a) => a.id === id);
  const getProfessor = (id) => professors.find((p) => p.id === id);
  const getInternship = (id) => internships.find((i) => i.id === id);
  const applicationsForStudent = (studentId) => applications.filter((a) => a.studentId === studentId);
  const applicationsForListing = (listingId) => applications.filter((a) => a.listingId === listingId);
  const interviewsForApplication = (applicationId) => interviews.filter((i) => i.applicationId === applicationId);
  const studentsForProfessor = (professorId) => students.filter((s) => s.professorId === professorId);
  const listingsForCompany = (companyId) => listings.filter((l) => l.companyId === companyId);

  // Derived per-role notification lists, shaped exactly like the original
  // prototype's three separate arrays (each item also gets a `<role>Id` key
  // pointing at its owner, since that's what the page components read).
  const studentNotifications = notifications.filter((n) => n.role === "student").map((n) => ({ ...n, studentId: n.ownerId }));
  const professorNotifications = notifications.filter((n) => n.role === "professor").map((n) => ({ ...n, professorId: n.ownerId }));
  const companyNotifications = notifications.filter((n) => n.role === "company").map((n) => ({ ...n, companyId: n.ownerId }));

  // ================= STUDENT ACTIONS =================
  const updateStudentProfile = async (studentId, updates) => {
    const updated = await api.patch(`/students/${studentId}`, updates);
    setStudents((prev) => replaceById(prev, updated));
    showToast("Profile updated successfully.", "success");
  };

  const uploadResume = async (studentId, filename) => {
    const updated = await api.patch(`/students/${studentId}/resume`, { resumeName: filename });
    setStudents((prev) => replaceById(prev, updated));
    showToast("Resume uploaded.", "success");
  };

  const applyToListing = async (studentId, listingId) => {
    const newApp = await api.post("/applications", { studentId, listingId });
    setApplications((prev) => [...prev, newApp]);
    showToast("Application submitted successfully.", "success");
    return newApp.id;
  };

  const withdrawApplication = async (applicationId) => {
    const updated = await api.patch(`/applications/${applicationId}/withdraw`);
    setApplications((prev) => replaceById(prev, updated));
    showToast("Application withdrawn.", "info");
  };

  // Saved listings now live on the student document, scoped per-student.
  const toggleSaveListing = async (studentId, listingId) => {
    const updated = await api.patch(`/students/${studentId}/saved-listings`, { listingId });
    setStudents((prev) => replaceById(prev, updated));
    const isSaved = updated.savedListingIds.includes(listingId);
    showToast(isSaved ? "Opportunity saved." : "Removed from saved opportunities.", "info");
  };

  const uploadInternshipDocument = async (internshipId, docId, filename) => {
    const updated = await api.post(`/internships/${internshipId}/documents`, { docId, name: filename });
    setInternships((prev) => replaceById(prev, updated));
    showToast("Document uploaded.", "success");
  };

  const deleteInternshipDocument = async (internshipId, docId) => {
    const updated = await api.del(`/internships/${internshipId}/documents/${docId}`);
    setInternships((prev) => replaceById(prev, updated));
    showToast("Document removed.", "info");
  };

  // ================= NOTIFICATIONS (shared shape) =================
  const markNotificationRead = async (role, id) => {
    const updated = await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => replaceById(prev, updated));
  };

  const markAllNotificationsRead = async (role, ownerId) => {
    const updated = await api.patch("/notifications/read-all", { role, ownerId });
    const updatedIds = new Set(updated.map((n) => n.id));
    setNotifications((prev) => [...prev.filter((n) => !updatedIds.has(n.id)), ...updated]);
    showToast("All notifications marked as read.", "info");
  };

  // ================= PROFESSOR ACTIONS =================
  const approveListing = async (listingId) => {
    const updated = await api.patch(`/listings/${listingId}/approve`);
    setListings((prev) => replaceById(prev, updated));
    showToast("Listing approved and is now visible to students.", "success");
  };

  const rejectListing = async (listingId, reason) => {
    const updated = await api.patch(`/listings/${listingId}/reject`, { reason });
    setListings((prev) => replaceById(prev, updated));
    showToast("Listing rejected.", "danger");
  };

  const requestListingChanges = async (listingId, feedback) => {
    const updated = await api.patch(`/listings/${listingId}/request-changes`, { feedback });
    setListings((prev) => replaceById(prev, updated));
    showToast("Change request sent to the company.", "info");
  };

  const verifyInternship = async (internshipId) => {
    const updated = await api.patch(`/internships/${internshipId}/verify`);
    setInternships((prev) => replaceById(prev, updated));
    showToast("Internship verified.", "success");
  };

  const rejectInternshipVerification = async (internshipId, reason) => {
    const updated = await api.patch(`/internships/${internshipId}/reject-verification`, { reason });
    setInternships((prev) => replaceById(prev, updated));
    showToast("Correction request sent to the student.", "info");
  };

  // ================= COMPANY ACTIONS =================
  const updateCompanyProfile = async (companyId, updates) => {
    const updated = await api.patch(`/companies/${companyId}`, updates);
    setCompanies((prev) => replaceById(prev, updated));
    showToast("Company profile updated.", "success");
  };

  const createListing = async (companyId, data, submit) => {
    const newListing = await api.post("/listings", { companyId, submit, ...data });
    setListings((prev) => [newListing, ...prev]);
    showToast(submit ? "Listing submitted for professor approval." : "Draft saved.", "success");
    return newListing.id;
  };

  const editListing = async (listingId, updates) => {
    const updated = await api.patch(`/listings/${listingId}`, updates);
    setListings((prev) => replaceById(prev, updated));
    showToast("Listing updated.", "success");
  };

  const submitDraftForApproval = async (listingId) => {
    const updated = await api.post(`/listings/${listingId}/submit`);
    setListings((prev) => replaceById(prev, updated));
    showToast("Listing submitted for professor approval.", "success");
  };

  const closeListing = async (listingId) => {
    const updated = await api.patch(`/listings/${listingId}/close`);
    setListings((prev) => replaceById(prev, updated));
    showToast("Listing closed.", "info");
  };

  const shortlistApplicant = async (applicationId) => {
    const updated = await api.patch(`/applications/${applicationId}/shortlist`);
    setApplications((prev) => replaceById(prev, updated));
    showToast("Applicant shortlisted.", "success");
  };

  const rejectApplicant = async (applicationId) => {
    const updated = await api.patch(`/applications/${applicationId}/reject`);
    setApplications((prev) => replaceById(prev, updated));
    showToast("Applicant rejected.", "danger");
  };

  const scheduleInterview = async (applicationId, data) => {
    const { interview, application } = await api.post("/interviews", { applicationId, ...data });
    setInterviews((prev) => [...prev, interview]);
    setApplications((prev) => replaceById(prev, application));
    showToast("Interview scheduled. The student has been notified.", "success");
    return interview.id;
  };

  const rescheduleInterview = async (interviewId, data) => {
    const updated = await api.patch(`/interviews/${interviewId}`, data);
    setInterviews((prev) => replaceById(prev, updated));
    showToast("Interview rescheduled. The student has been notified.", "success");
  };

  const cancelInterview = async (interviewId) => {
    const updated = await api.patch(`/interviews/${interviewId}/cancel`);
    setInterviews((prev) => replaceById(prev, updated));
    showToast("Interview cancelled.", "info");
  };

  const selectCandidate = async (applicationId, offerData) => {
    const { application, listing, internship } = await api.post(`/applications/${applicationId}/select`, offerData);
    setApplications((prev) => replaceById(prev, application));
    setListings((prev) => replaceById(prev, listing));
    setInternships((prev) => [...prev, internship]);
    showToast("Candidate selected. Student and professor have been notified.", "success");
    return internship.id;
  };

  const value = {
    loading,
    error,
    refetch: loadAll,
    students,
    professors,
    companies,
    listings,
    applications,
    interviews,
    internships,
    studentNotifications,
    professorNotifications,
    companyNotifications,
    getStudent,
    getCompany,
    getListing,
    getApplication,
    getProfessor,
    getInternship,
    applicationsForStudent,
    applicationsForListing,
    interviewsForApplication,
    studentsForProfessor,
    listingsForCompany,
    updateStudentProfile,
    uploadResume,
    applyToListing,
    withdrawApplication,
    toggleSaveListing,
    uploadInternshipDocument,
    deleteInternshipDocument,
    markNotificationRead,
    markAllNotificationsRead,
    approveListing,
    rejectListing,
    requestListingChanges,
    verifyInternship,
    rejectInternshipVerification,
    updateCompanyProfile,
    createListing,
    editListing,
    submitDraftForApproval,
    closeListing,
    shortlistApplicant,
    rejectApplicant,
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    selectCandidate,
  };

  if (loading) {
    return (
      <div className="state-box" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="spinner" />
        <p className="mt-12">Connecting to CampusLink...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-box" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="state-icon">⚠️</div>
        <div className="state-title">Couldn't reach the server</div>
        <p>{error}</p>
        <div className="mt-16">
          <button className="btn btn-primary" onClick={loadAll}>Try Again</button>
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
