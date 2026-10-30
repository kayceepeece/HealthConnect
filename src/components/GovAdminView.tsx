import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  X,
} from 'lucide-react';
import type { AuditLog, Hospital, User } from '../types';

interface GovAdminViewProps {
  currentAdmin: User;
  hospitals: Hospital[];
  users: User[];
  auditLogs: AuditLog[];
  onToggleHospitalStatus: (
    hospitalId: string,
    status: 'APPROVED' | 'REVOKED'
  ) => Promise<void>;
  onRegisterHospital: (payload: {
    name: string;
    registrationNumber: string;
    location: string;
    facilityType: string;
    chiefMedicalDirector: string;
  }) => Promise<void>;
  onToggleUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  onRegisterPractitioner: (payload: {
    name: string;
    email: string;
    role: 'DOCTOR' | 'LAB_TECH';
    title: string;
    hospitalId: string;
    specialty: string;
    licenseNumber: string;
  }) => Promise<void>;
}

type AdminTab = 'hospitals' | 'practitioners' | 'audit';

export const GovAdminView: React.FC<GovAdminViewProps> = ({
  currentAdmin,
  hospitals,
  users,
  auditLogs,
  onToggleHospitalStatus,
  onRegisterHospital,
  onToggleUserStatus,
  onRegisterPractitioner,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('hospitals');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>('ALL');

  // New Hospital Modal
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospReg, setHospReg] = useState('FMOH-NGR-5120');
  const [hospLoc, setHospLoc] = useState('');
  const [hospType, setHospType] = useState('Teaching Hospital');
  const [hospCmd, setHospCmd] = useState('');

  // New Practitioner Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [pracName, setPracName] = useState('');
  const [pracEmail, setPracEmail] = useState('');
  const [pracRole, setPracRole] = useState<'DOCTOR' | 'LAB_TECH'>('DOCTOR');
  const [pracTitle, setPracTitle] = useState('Consultant Physician');
  const [pracHospitalId, setPracHospitalId] = useState(hospitals[0]?.id || 'HOSP-001');
  const [pracSpecialty, setPracSpecialty] = useState('Internal Medicine');
  const [pracLicense, setPracLicense] = useState('MDCN/R/61094');

  const practitioners = users.filter((u) => u.role === 'DOCTOR' || u.role === 'LAB_TECH');
  const approvedCount = hospitals.filter((h) => h.status === 'APPROVED').length;
  const revokedCount = hospitals.filter((h) => h.status === 'REVOKED').length;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesRole = auditRoleFilter === 'ALL' || log.actorRole === auditRoleFilter;
    const q = auditSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.hospitalName.toLowerCase().includes(q) ||
      (log.patientName && log.patientName.toLowerCase().includes(q)) ||
      log.summary.toLowerCase().includes(q) ||
      log.actionType.toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName.trim() || !hospLoc.trim()) return;
    await onRegisterHospital({
      name: hospName,
      registrationNumber: hospReg,
      location: hospLoc,
      facilityType: hospType,
      chiefMedicalDirector: hospCmd,
    });
    setHospName('');
    setHospLoc('');
    setHospCmd('');
    setShowHospitalModal(false);
  };

  const handleCreatePractitioner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pracName.trim()) return;
    await onRegisterPractitioner({
      name: pracName,
      email: pracEmail,
      role: pracRole,
      title: pracTitle,
      hospitalId: pracHospitalId,
      specialty: pracSpecialty,
      licenseNumber: pracLicense,
    });
    setPracName('');
    setPracEmail('');
    setShowUserModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header & National KPIs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{currentAdmin.name}</h1>
            <p className="text-xs text-slate-600">
              {currentAdmin.hospitalName} · {currentAdmin.licenseNumber}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowHospitalModal(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Accredit Hospital</span>
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Authorize Practitioner</span>
            </button>
          </div>
        </div>

        {/* 4-Column National Oversight Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Approved Hospitals</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-green-700 mt-1 block">
              {approvedCount}
            </span>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Revoked Facilities</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-red-700 mt-1 block">
              {revokedCount}
            </span>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Authorized Professionals</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {practitioners.length}
            </span>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Audit Trail Events</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-700 mt-1 block">
              {auditLogs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'hospitals'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('practitioners')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'practitioners'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Professionals ({practitioners.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Hospitals */}
      {activeTab === 'hospitals' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Registration No.</th>
                  <th className="py-3.5 px-4">Type & Location</th>
                  <th className="py-3.5 px-4">Medical Director</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{h.name}</span>
                      <span className="font-mono text-slate-500">
                        {h.id} · {h.accreditedDate}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700">
                      {h.registrationNumber}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-800 block">{h.facilityType}</span>
                      <span className="text-slate-500">{h.location}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-700">{h.chiefMedicalDirector}</td>
                    <td className="py-4 px-4">
                      {h.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          APPROVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-red-700">
                          <XCircle className="w-4 h-4" />
                          REVOKED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {h.status === 'APPROVED' ? (
                        <button
                          onClick={() => onToggleHospitalStatus(h.id, 'REVOKED')}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleHospitalStatus(h.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Approve Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: Professionals */}
      {activeTab === 'practitioners' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Role & Specialty</th>
                  <th className="py-3.5 px-4">License No.</th>
                  <th className="py-3.5 px-4">Facility</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {practitioners.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-slate-500">{u.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-teal-800 block">{u.role}</span>
                      <span className="text-slate-500">{u.specialty}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700">{u.licenseNumber}</td>
                    <td className="py-4 px-4 text-slate-700">{u.hospitalName}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold ${
                          u.status === 'ACTIVE' ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={() => onToggleUserStatus(u.id, 'SUSPENDED')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleUserStatus(u.id, 'ACTIVE')}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === 'audit' && (
        <section className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by practitioner, hospital, patient, or event..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {['ALL', 'PATIENT', 'DOCTOR', 'LAB_TECH', 'GOV_ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setAuditRoleFilter(role)}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                    auditRoleFilter === role
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role === 'ALL' ? 'All' : role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Facility</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {log.timestamp}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{log.actorName}</span>
                        <span className="text-slate-500">
                          {log.actorRole} · {log.ipAddress}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          {log.hospitalName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.patientName ? (
                          <div>
                            <span className="font-medium text-slate-900 block">
                              {log.patientName}
                            </span>
                            <span className="font-mono text-slate-500">{log.patientId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-800 whitespace-nowrap">
                        {log.actionType}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Modal: Accredit Hospital */}
      {showHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Accredit Hospital</h3>
              <button
                onClick={() => setShowHospitalModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateHospital} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enugu State Teaching Hospital"
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration No.</label>
                <input
                  type="text"
                  value={hospReg}
                  onChange={(e) => setHospReg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parklane, Enugu"
                  value={hospLoc}
                  onChange={(e) => setHospLoc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Type</label>
                <select
                  value={hospType}
                  onChange={(e) => setHospType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Teaching Hospital">Teaching Hospital</option>
                  <option value="Federal Medical Centre">Federal Medical Centre</option>
                  <option value="Diagnostic Laboratory">Diagnostic Laboratory</option>
                  <option value="General Hospital">General Hospital</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Director</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Obinna Nwankwo"
                  value={hospCmd}
                  onChange={(e) => setHospCmd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowHospitalModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white font-medium rounded-lg cursor-pointer"
                >
                  Approve & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Authorize Practitioner */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Authorize Practitioner</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePractitioner} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Fatima Bello"
                  value={pracName}
                  onChange={(e) => setPracName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={pracRole}
                    onChange={(e) => setPracRole(e.target.value as 'DOCTOR' | 'LAB_TECH')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="LAB_TECH">Laboratory Technician</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License No.</label>
                  <input
                    type="text"
                    value={pracLicense}
                    onChange={(e) => setPracLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hospital</label>
                <select
                  value={pracHospitalId}
                  onChange={(e) => setPracHospitalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialty</label>
                <input
                  type="text"
                  value={pracSpecialty}
                  onChange={(e) => setPracSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white font-medium rounded-lg cursor-pointer"
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
