import React, { useState } from 'react';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  AlertTriangle,
  FileText,
  Pill,
  FlaskConical,
  ShieldCheck,
  Clock,
  Building2,
  Edit3,
} from 'lucide-react';
import type { AuditLog, PatientRecord } from '../types';

interface PatientViewProps {
  patient: PatientRecord;
  allPatients: PatientRecord[];
  auditLogs: AuditLog[];
  onSelectPatientId: (patientId: string) => void;
  onRotateProfileCode: (patientId: string) => Promise<void>;
  onUpdatePhone: (patientId: string, phoneNumber: string) => Promise<void>;
  onRefreshState: () => Promise<void>;
  onSwitchToRole: (role: 'DOCTOR' | 'LAB_TECH') => void;
}

type PatientTab = 'overview' | 'consultations' | 'prescriptions' | 'labs' | 'audit';

export const PatientView: React.FC<PatientViewProps> = ({
  patient,
  allPatients,
  auditLogs,
  onSelectPatientId,
  onRotateProfileCode,
  onUpdatePhone,
  onRefreshState,
  onSwitchToRole,
}) => {
  const [activeTab, setActiveTab] = useState<PatientTab>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(patient.phoneNumber);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const patientAuditLogs = auditLogs.filter((log) => log.patientId === patient.patientId);

  const handleCopyProfileCode = () => {
    navigator.clipboard?.writeText(patient.profileCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard?.writeText(otp).catch(() => {});
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleRotateCode = async () => {
    setRotating(true);
    try {
      await onRotateProfileCode(patient.patientId);
    } finally {
      setRotating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshState();
      const now = new Date();
      setLastRefreshed(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    await onUpdatePhone(patient.patientId, phoneInput.trim());
    setEditingPhone(false);
  };

  return (
    <div className="space-y-6">
      {/* Patient Identity & Refresh Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{patient.fullName}</h1>
            {allPatients.length > 1 && (
              <select
                value={patient.patientId}
                onChange={(e) => {
                  onSelectPatientId(e.target.value);
                  const found = allPatients.find((p) => p.patientId === e.target.value);
                  if (found) setPhoneInput(found.phoneNumber);
                }}
                aria-label="Switch patient profile"
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
              >
                {allPatients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.fullName} ({p.profileCode})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-mono tabular-nums text-teal-700 font-medium">
              {patient.patientId}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{patient.nationalNin}</span>
            <span aria-hidden="true">·</span>
            <span>DOB: {patient.dateOfBirth}</span>
            <span aria-hidden="true">·</span>
            <span>{patient.gender}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-900">Blood: {patient.bloodGroup}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-900">Genotype: {patient.genotype}</span>
            <span aria-hidden="true">·</span>
            <span>{patient.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Synced: {lastRefreshed}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-700' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Profile Code & Allergies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-700" />
              <span>Access Credentials</span>
            </h2>
            <button
              onClick={() => onSwitchToRole('DOCTOR')}
              className="text-xs text-teal-700 hover:underline font-medium cursor-pointer"
            >
              Test in Doctor Console →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profile Code */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Shareable Profile Code</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-teal-800 tracking-wider">
                  {patient.profileCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyProfileCode}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRotateCode}
                  disabled={rotating}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rotating ? 'animate-spin' : ''}`} />
                  <span>New Code</span>
                </button>
              </div>
            </div>

            {/* Registered Phone */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-teal-700" />
                  Registered SMS OTP Phone
                </span>
                {editingPhone ? (
                  <form onSubmit={handleSavePhone} className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono border border-slate-300 rounded bg-white"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-teal-700 text-white text-xs font-medium rounded cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <p className="text-base font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {patient.phoneNumber}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setPhoneInput(patient.phoneNumber);
                    setEditingPhone(!editingPhone);
                  }}
                  className="text-teal-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{editingPhone ? 'Cancel' : 'Edit Phone'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active SMS OTP Banner */}
          {patient.activeOtp && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-900">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>SMS OTP Dispatched to {patient.activeOtp.phoneNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {patient.activeOtp.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <p className="text-amber-800">
                  Requested by <span className="font-semibold">{patient.activeOtp.requestedByName}</span> (
                  {patient.activeOtp.hospitalName})
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xl font-bold font-mono tabular-nums tracking-widest text-amber-950 bg-white border border-amber-300 px-3 py-1.5 rounded-lg">
                  {patient.activeOtp.otpCode}
                </span>
                <button
                  onClick={() => handleCopyOtp(patient.activeOtp!.otpCode)}
                  className="px-3 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copiedOtp ? 'Copied' : 'Copy OTP'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Allergies & Emergency Contact */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Allergies ({patient.allergies.length})
              </h2>
            </div>

            {patient.allergies.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No documented allergies.</p>
            ) : (
              <div className="space-y-2.5">
                {patient.allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="p-3 rounded-lg bg-red-50/50 border border-red-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-900">{allergy.substance}</span>
                      <span className="text-red-700 font-medium">
                        {allergy.severity} · {allergy.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{allergy.reaction}</p>
                    <p className="text-[11px] text-slate-500">
                      {allergy.recordedDate} · {allergy.recordedBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-medium text-slate-800">Emergency Contact:</span>{' '}
              {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
            </div>
            <span className="font-mono tabular-nums">{patient.emergencyContact.phone}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'overview', label: 'All Records' },
            {
              id: 'consultations',
              label: `Diagnoses & Visits (${patient.consultations.length})`,
            },
            {
              id: 'prescriptions',
              label: `Prescriptions (${patient.prescriptions.length})`,
            },
            { id: 'labs', label: `Lab Results (${patient.labResults.length})` },
            {
              id: 'audit',
              label: `Access Log (${patientAuditLogs.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PatientTab)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* 1. Consultations */}
        {(activeTab === 'overview' || activeTab === 'consultations') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-900">Diagnoses & Hospital Visits</h2>
            </div>

            {patient.consultations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                No hospital consultations recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {patient.consultations.map((cons) => (
                  <div
                    key={cons.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono tabular-nums text-slate-700 font-medium">
                            {cons.date}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-teal-700">{cons.hospitalName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{cons.visitType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">ICD-10: {cons.icdCode}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{cons.diagnosis}</h3>
                      </div>
                      <div className="text-xs text-slate-600 sm:text-right">
                        <p className="font-semibold text-slate-900">{cons.doctorName}</p>
                        <p className="text-slate-500">{cons.specialty}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                      <div className="lg:col-span-8 space-y-3">
                        <div>
                          <span className="font-semibold text-slate-800 block mb-0.5">
                            Chief Complaint
                          </span>
                          <p className="text-slate-600 leading-relaxed">{cons.chiefComplaint}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block mb-0.5">
                            Clinical Notes
                          </span>
                          <p className="text-slate-600 leading-relaxed">{cons.clinicalNotes}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block mb-0.5">
                            Treatment Plan
                          </span>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {cons.treatmentPlan}
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
                        <span className="font-semibold text-slate-800 block border-b border-slate-200 pb-1.5">
                          Vital Signs
                        </span>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <span className="text-[11px] text-slate-500 block">BP</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {cons.vitals.bloodPressure}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Heart Rate</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {cons.vitals.heartRate}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Temperature</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {cons.vitals.temperature}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">SpO2 / Weight</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {cons.vitals.spO2} · {cons.vitals.weight}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. Prescriptions */}
        {(activeTab === 'overview' || activeTab === 'prescriptions') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-900">Prescriptions</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Medication</th>
                      <th className="py-3 px-4">Regimen</th>
                      <th className="py-3 px-4">Instructions</th>
                      <th className="py-3 px-4">Prescriber</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {patient.prescriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No prescriptions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      patient.prescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                            {rx.date}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">
                              {rx.medicationName}
                            </span>
                            <span className="font-mono text-slate-600">{rx.dosage}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="block font-medium">{rx.frequency}</span>
                            <span className="text-slate-500">{rx.duration}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs">{rx.instructions}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="font-medium text-slate-800 block">
                              {rx.prescribedBy}
                            </span>
                            <span className="text-slate-500">{rx.hospitalName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium whitespace-nowrap">
                            <span
                              className={
                                rx.status === 'Active'
                                  ? 'text-teal-700 font-semibold'
                                  : 'text-slate-500'
                              }
                            >
                              {rx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 3. Laboratory Results */}
        {(activeTab === 'overview' || activeTab === 'labs') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-900">Laboratory Results</h2>
            </div>

            {patient.labResults.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                No laboratory investigations uploaded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {patient.labResults.map((lab) => (
                  <div
                    key={lab.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono tabular-nums">{lab.date}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{lab.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>{lab.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{lab.specimen}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{lab.testName}</h3>
                      </div>

                      <div className="text-xs sm:text-right">
                        <span
                          className={`font-semibold block ${
                            lab.status === 'Completed' ? 'text-green-700' : 'text-amber-700'
                          }`}
                        >
                          {lab.status}
                        </span>
                        <span className="text-slate-500">
                          {lab.laboratoryName} · {lab.uploadedBy}
                        </span>
                      </div>
                    </div>

                    {lab.parameters.length > 0 && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                              <th className="py-2.5 px-4">Parameter</th>
                              <th className="py-2.5 px-4 text-right">Value</th>
                              <th className="py-2.5 px-4">Unit</th>
                              <th className="py-2.5 px-4">Reference Range</th>
                              <th className="py-2.5 px-4 text-right">Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {lab.parameters.map((param, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="py-2.5 px-4 font-medium text-slate-900">
                                  {param.name}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                                  {param.value}
                                </td>
                                <td className="py-2.5 px-4 font-mono text-slate-500">
                                  {param.unit}
                                </td>
                                <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                                  {param.referenceRange}
                                </td>
                                <td className="py-2.5 px-4 text-right font-semibold">
                                  <span
                                    className={
                                      param.flag === 'Normal'
                                        ? 'text-green-700'
                                        : param.flag === 'Critical'
                                        ? 'text-red-700'
                                        : 'text-amber-700'
                                    }
                                  >
                                    {param.flag}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
                      <span className="font-semibold text-slate-800">Interpretation: </span>
                      <span className="text-slate-700">{lab.clinicalInterpretation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Access Audit Log */}
        {(activeTab === 'overview' || activeTab === 'audit') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-900">Record Access & Activity Log</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Professional</th>
                      <th className="py-3 px-4">Facility</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {patientAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {log.timestamp}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{log.actorName}</span>
                          <span className="text-slate-500">{log.actorRole}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            {log.hospitalName}
                          </span>
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
      </div>
    </div>
  );
};
