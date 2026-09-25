import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import StatCard from "../../components/common/StatCard";
import { DEPARTMENTS } from "../../data/mockData";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const MONTH_VALUES = [4, 7, 6, 9, 11, 8]; // mock trend data

export default function Reports() {
  const { user } = useAuth();
  const data = useData();
  const { showToast } = useToast();
  const [deptFilter, setDeptFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");

  const myStudents = data.studentsForProfessor(user.id);
  const studentIds = new Set(myStudents.map((s) => s.id));
  const withInternship = new Set(data.internships.filter((i) => studentIds.has(i.studentId)).map((i) => i.studentId));

  const byDept = DEPARTMENTS.map((d) => {
    const deptApps = data.applications.filter((a) => data.getStudent(a.studentId).department === d);
    return { dept: d, count: deptApps.length };
  }).filter((r) => r.count > 0);
  const maxDept = Math.max(1, ...byDept.map((r) => r.count));

  const byCompany = data.companies.map((c) => {
    const count = data.listingsForCompany(c.id).reduce((sum, l) => sum + data.applicationsForListing(l.id).length, 0);
    return { name: c.name, count };
  }).sort((a, b) => b.count - a.count);
  const maxCompany = Math.max(1, ...byCompany.map((r) => r.count));

  const totalApps = data.applications.length;
  const selectedApps = data.applications.filter((a) => a.status === "Selected").length;
  const selectionRate = totalApps ? Math.round((selectedApps / totalApps) * 100) : 0;

  const paidCount = data.listings.filter((l) => l.paid).length;
  const unpaidCount = data.listings.filter((l) => !l.paid).length;

  const internshipCount = data.listings.filter((l) => l.type === "Internship").length;
  const jobCount = data.listings.filter((l) => l.type === "Job").length;

  const locationCounts = {};
  data.listings.forEach((l) => { locationCounts[l.location] = (locationCounts[l.location] || 0) + 1; });

  const maxMonth = Math.max(...MONTH_VALUES);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Department-wide internship placement insights.</p>
        </div>
        <button className="btn btn-primary" onClick={() => showToast("Report exported as PDF (mock).", "success")}>Export Report</button>
      </div>

      <div className="card card-pad mb-24 flex gap-12 wrap">
        <select className="select" style={{ maxWidth: 220 }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option>All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="select" style={{ maxWidth: 220 }} value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
          <option>All Companies</option>
          {data.companies.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
        <input className="input" type="date" style={{ maxWidth: 180 }} />
      </div>

      <div className="grid grid-stats mb-24">
        <StatCard label="With Internships" value={withInternship.size} icon="💼" tone="success" />
        <StatCard label="Without Internships" value={myStudents.length - withInternship.size} icon="🕒" tone="neutral" />
        <StatCard label="Selection Rate" value={`${selectionRate}%`} sub={`${selectedApps} of ${totalApps} applications`} icon="🎯" tone="info" />
        <StatCard label="Most Active Company" value={byCompany[0]?.name || "—"} sub={`${byCompany[0]?.count || 0} applicants`} icon="🏢" tone="info" />
      </div>

      <div className="grid grid-2 mb-24">
        <div className="card card-pad">
          <div className="card-title mb-16">Applications by Department</div>
          {byDept.map((r) => (
            <div key={r.dept} className="mb-12">
              <div className="flex justify-between text-sm mb-4"><span>{r.dept}</span><span className="font-semibold">{r.count}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(r.count / maxDept) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <div className="card-title mb-16">Applications by Company</div>
          {byCompany.map((r) => (
            <div key={r.name} className="mb-12">
              <div className="flex justify-between text-sm mb-4"><span>{r.name}</span><span className="font-semibold">{r.count}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(r.count / maxCompany) * 100}%`, background: "var(--color-accent)" }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-3 mb-24">
        <div className="card card-pad">
          <div className="card-title mb-12">Internship Types</div>
          <div className="flex justify-between text-sm mb-8"><span>Internship</span><span className="font-semibold">{internshipCount}</span></div>
          <div className="progress-track mb-12"><div className="progress-fill" style={{ width: `${(internshipCount / (internshipCount + jobCount || 1)) * 100}%` }} /></div>
          <div className="flex justify-between text-sm mb-8"><span>Job</span><span className="font-semibold">{jobCount}</span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(jobCount / (internshipCount + jobCount || 1)) * 100}%`, background: "var(--color-accent)" }} /></div>
        </div>
        <div className="card card-pad">
          <div className="card-title mb-12">Paid vs Unpaid</div>
          <div className="flex justify-between text-sm mb-8"><span>Paid</span><span className="font-semibold">{paidCount}</span></div>
          <div className="progress-track mb-12"><div className="progress-fill" style={{ width: `${(paidCount / (paidCount + unpaidCount || 1)) * 100}%` }} /></div>
          <div className="flex justify-between text-sm mb-8"><span>Unpaid</span><span className="font-semibold">{unpaidCount}</span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(unpaidCount / (paidCount + unpaidCount || 1)) * 100}%`, background: "var(--color-warning)" }} /></div>
        </div>
        <div className="card card-pad">
          <div className="card-title mb-12">Internship Locations</div>
          {Object.entries(locationCounts).slice(0, 4).map(([loc, count]) => (
            <div key={loc} className="flex justify-between text-sm mb-8"><span>{loc}</span><span className="font-semibold">{count}</span></div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="card-title mb-16">Monthly Application Trends</div>
        <div className="bar-chart">
          {MONTH_VALUES.map((v, i) => (
            <div className="bar-col" key={MONTHS[i]}>
              <div className="text-xs font-semibold">{v}</div>
              <div className="bar" style={{ height: `${(v / maxMonth) * 100}%` }} />
              <div className="text-xs text-muted">{MONTHS[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
