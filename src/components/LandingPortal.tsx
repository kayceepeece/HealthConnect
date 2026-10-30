import React, { useState } from 'react';
import {
  UserCheck,
  Stethoscope,
  FlaskConical,
  Landmark,
  ArrowRight,
  UserPlus,
  Lock,
  Mail,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import type { Hospital, PatientRecord, User, UserRole } from '../types';

interface LandingPortalProps {
  users: User[];
  patients: PatientRecord[];
  hospitals: Hospital[];
  onRequestRoleAuth: (role: UserRole) => void;
  onLoginWithCredentials: (email: string, password: string) => Promise<void>;
  onRegisterPatient: (payload: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
    genotype: string;
    phoneNumber: string;
    email: string;
    address: string;
    emergencyContactName: string;
    emergencyContactRelation: string;
    emergencyContactPhone: string;
    initialAllergySubstance: string;
    initialAllergySeverity: string;
    initialAllergyReaction: string;
  }) => Promise<void>;
}

const ROLE_PRESETS: Array<{
  role: UserRole;
  label: string;
  email: string;
  password: string;
}> = [
  { role: 'PATIENT', label: 'Patient', email: 'patient@gdg.com', password: '123456' },
  { role: 'DOCTOR', label: 'Doctor', email: 'doctor@gdg.com', password: '123456' },
  { role: 'LAB_TECH', label: 'Lab Tech', email: 'lab@gdg.com', password: '123456' },
  { role: 'GOV_ADMIN', label: 'Gov Admin', email: 'admin@gdg.com', password: '123456' },
];

export const LandingPortal: React.FC<LandingPortalProps> = ({
  users,
  patients,
  hospitals,
  onRequestRoleAuth,
  onLoginWithCredentials,
  onRegisterPatient,
}) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('PATIENT');
  const [email, setEmail] = useState('patient@gdg.com');
  const [password, setPassword] = useState('123456');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '1994-06-15',
    gender: 'Female',
    bloodGroup: 'O+',
    genotype: 'AA',
    phoneNumber: '+234 806 234 8891',
    email: '',
    address: 'Victoria Island, Lagos',
    emergencyContactName: 'Emeka Nwosu',
    emergencyContactRelation: 'Brother',
    emergencyContactPhone: '+234 803 111 2233',
    initialAllergySubstance: '',
    initialAllergySeverity: 'Moderate',
    initialAllergyReaction: '',
  });

  const patientUser = users.find((u) => u.role === 'PATIENT') || users[0];
  const doctorUser = users.find((u) => u.role === 'DOCTOR') || users[1];
  const labUser = users.find((u) => u.role === 'LAB_TECH') || users[2];
  const adminUser = users.find((u) => u.role === 'GOV_ADMIN') || users[3];

  const primaryPatient = patients[0];
  const approvedHospitals = hospitals.filter((h) => h.status === 'APPROVED');

  const handleSelectPreset = (preset: (typeof ROLE_PRESETS)[number]) => {
    setSelectedRoleTab(preset.role);
    setEmail(preset.email);
    setPassword(preset.password);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await onLoginWithCredentials(email, password);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) return;
    setSubmitting(true);
    try {
      await onRegisterPatient(formData);
      setShowRegisterModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      {/* 1. Hero Section + Auto-Filled Sign-In */}
      <section className="bg-white border border-slate-200 rounded-xl p-8 lg:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Gradient_H_Connection_Health_Icon_99789294.png"
                  alt="HealthConnect Icon"
                  className="w-11 h-11 object-contain mix-blend-multiply shrink-0"
                />
                <img
                  src="/assets/aistudio/HealthConnect_Two-Tone_Wordmark_0cf6c45f.png"
                  alt="HealthConnect"
                  className="h-7 object-contain mix-blend-multiply shrink-0"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-[1.15]">
                One National Health Record Across Every Accredited Hospital
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                Citizens control access to their longitudinal medical history using a shareable
                Profile Code and SMS OTP verification—connecting doctors, diagnostic laboratories,
                and government regulators on a unified clinical grid.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onRequestRoleAuth('PATIENT')}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Access Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-teal-700" />
                <span>Register New Patient</span>
              </button>
            </div>
          </div>

          {/* Hardcoded Role Sign-In Card */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/aistudio/Gradient_H_Connection_Health_Icon_99789294.png"
                  alt=""
                  className="w-6 h-6 object-contain mix-blend-multiply shrink-0"
                />
                <h2 className="text-base font-bold text-slate-900">Sign In</h2>
              </div>
              <Lock className="w-4 h-4 text-teal-700 shrink-0" />
            </div>

            {/* Role Selector Tabs (Auto-Fills Email & Password) */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-lg text-xs">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-2 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedRoleTab === preset.role
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      const lower = val.trim().toLowerCase();
                      const match = ROLE_PRESETS.find((r) => r.email === lower);
                      if (match) {
                        setSelectedRoleTab(match.role);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {loggingIn
                    ? 'Signing In...'
                    : `Sign In as ${
                        ROLE_PRESETS.find((r) => r.role === selectedRoleTab)?.label || 'User'
                      }`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Full-Width 4-Column KPI Strip Below Hero Split */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
              {patients.length}
            </span>
            <span className="text-xs text-slate-500">Centralized Patient Profiles</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-700 block">
              {approvedHospitals.length}
            </span>
            <span className="text-xs text-slate-500">Government-Approved Facilities</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
              2-Step
            </span>
            <span className="text-xs text-slate-500">Profile Code + SMS OTP Consent</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
              100%
            </span>
            <span className="text-xs text-slate-500">Audited Record Modifications</span>
          </div>
        </div>
      </section>

      {/* 2. Asymmetric Bento-Grid of Platform Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">How HealthConnect Works</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bento 1: Patient Profile Code & SMS OTP (Span 7) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                01. Patient Profile Code & Registered Phone OTP
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients share their Profile Code at the hospital desk. Entering the code sends a
                6-digit OTP to the patient&apos;s phone before any record is unlocked.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Shareable Profile Code</span>
                  <span className="text-base font-bold font-mono tabular-nums text-teal-800">
                    {primaryPatient?.profileCode || 'PRF-9042-NG'}
                  </span>
                </div>
                <KeyRound className="w-4 h-4 text-teal-700" />
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">SMS Verification Phone</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {primaryPatient?.phoneNumber || '+234 803 555 0192'}
                  </span>
                </div>
                <Smartphone className="w-4 h-4 text-teal-700" />
              </div>
            </div>
          </div>

          {/* Bento 2: Role-Based Clinical & Diagnostic Access (Span 5) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                02. Role-Based Clinical & Lab Updates
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorized Doctors record diagnoses, clinical notes, and prescriptions. Laboratory
                Technicians upload verified diagnostic test panels.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Doctor Write Scope</span>
                <span className="font-mono text-teal-700">Diagnoses · Notes · Rx</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-900">Lab Tech Write Scope</span>
                <span className="font-mono text-teal-700">Assays · Reference Ranges</span>
              </div>
            </div>
          </div>

          {/* Bento 3: Government Oversight & Accredited Network (Span 12) */}
          <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-base font-bold text-slate-900">
                03. Government Accreditation & Immutable Audit Trail
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only government-approved hospitals can access or update records. Every access event
                is logged with practitioner identity, facility, and timestamp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {approvedHospitals.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="font-medium text-slate-900">{h.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-700 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Role Portals with Hardcoded Credentials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Role Portals</h2>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Patient Profile Code: {primaryPatient?.profileCode || 'PRF-9042-NG'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Patient */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5 hover:border-teal-600 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Patient</h3>
                <UserCheck className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-900">{patientUser.name}</p>
                <p className="font-mono text-teal-700">patient@gdg.com</p>
                <p className="font-mono text-slate-500">Password: 123456</p>
              </div>
            </div>

            <button
              onClick={() => onRequestRoleAuth('PATIENT')}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Sign In as Patient</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Doctor */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5 hover:border-teal-600 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Doctor</h3>
                <Stethoscope className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-900">{doctorUser.name}</p>
                <p className="font-mono text-teal-700">doctor@gdg.com</p>
                <p className="font-mono text-slate-500">Password: 123456</p>
              </div>
            </div>

            <button
              onClick={() => onRequestRoleAuth('DOCTOR')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Sign In as Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Lab Tech */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5 hover:border-teal-600 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Lab Technician</h3>
                <FlaskConical className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-900">{labUser.name}</p>
                <p className="font-mono text-teal-700">lab@gdg.com</p>
                <p className="font-mono text-slate-500">Password: 123456</p>
              </div>
            </div>

            <button
              onClick={() => onRequestRoleAuth('LAB_TECH')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Sign In as Lab Tech</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Gov Admin */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5 hover:border-teal-600 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Gov Admin</h3>
                <Landmark className="w-5 h-5 text-teal-700" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-900">{adminUser.name}</p>
                <p className="font-mono text-teal-700">admin@gdg.com</p>
                <p className="font-mono text-slate-500">Password: 123456</p>
              </div>
            </div>

            <button
              onClick={() => onRequestRoleAuth('GOV_ADMIN')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Sign In as Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Register New Patient</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chidinma Eze"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Phone Number (SMS OTP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Blood</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Genotype</label>
                    <select
                      value={formData.genotype}
                      onChange={(e) => setFormData({ ...formData, genotype: e.target.value })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                    >
                      <option value="AA">AA</option>
                      <option value="AS">AS</option>
                      <option value="SS">SS</option>
                      <option value="AC">AC</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Known Allergy (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={formData.initialAllergySubstance}
                    onChange={(e) =>
                      setFormData({ ...formData, initialAllergySubstance: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register & Open Dashboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
