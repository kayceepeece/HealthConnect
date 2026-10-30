/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  X,
} from 'lucide-react';
import type {
  ActiveOtpSession,
  Allergy,
  AppStateResponse,
  Consultation,
  Hospital,
  LabParameter,
  LabResult,
  PatientRecord,
  Prescription,
  User,
  UserRole,
} from './types';
import { getInitialClientSeedData } from './seedData';
import { LandingPortal } from './components/LandingPortal';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';
import { LabTechView } from './components/LabTechView';
import { GovAdminView } from './components/GovAdminView';
import { SimulatedSmsDrawer } from './components/SimulatedSmsDrawer';

const ROLE_AUTH_PRESETS: Record<
  UserRole,
  { label: string; email: string; password: string }
> = {
  PATIENT: { label: 'Patient', email: 'patient@gdg.com', password: '123456' },
  DOCTOR: { label: 'Doctor', email: 'doctor@gdg.com', password: '123456' },
  LAB_TECH: { label: 'Laboratory Technician', email: 'lab@gdg.com', password: '123456' },
  GOV_ADMIN: { label: 'Government Admin', email: 'admin@gdg.com', password: '123456' },
};

const STORAGE_KEY = 'healthconnect_ehr_state_v1';

function formatNow(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

function loadLocalFallbackState(): AppStateResponse {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppStateResponse;
      return parsed;
    }
  } catch {
    // Ignore storage errors
  }
  const seed = getInitialClientSeedData();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // Ignore
  }
  return seed;
}

function saveLocalFallbackState(state: AppStateResponse) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

export default function App() {
  const [appState, setAppState] = useState<AppStateResponse>(() => loadLocalFallbackState());
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-2026-0891');
  const [doctorAuthorizedPatientId, setDoctorAuthorizedPatientId] = useState<string | null>(null);
  const [labAuthorizedPatientId, setLabAuthorizedPatientId] = useState<string | null>(null);
  const [smsDrawerOpen, setSmsDrawerOpen] = useState<boolean>(false);
  const [externalOtpToFill, setExternalOtpToFill] = useState<string>('');
  const [resetting, setResetting] = useState<boolean>(false);

  // Hardcoded Auth Modal state when switching tabs via the top nav bar
  const [authModalRole, setAuthModalRole] = useState<UserRole | null>(null);
  const [modalEmail, setModalEmail] = useState<string>('');
  const [modalPassword, setModalPassword] = useState<string>('123456');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);

  const updateAndPersistState = useCallback((nextState: AppStateResponse) => {
    setAppState(nextState);
    saveLocalFallbackState(nextState);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data: AppStateResponse = await res.json();
        updateAndPersistState(data);
        return;
      }
    } catch {
      // Fallback to local state when running on a static/shared preview without backend
    }
    const local = loadLocalFallbackState();
    setAppState(local);
  }, [updateAndPersistState]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const openRoleAuthGate = (role: UserRole) => {
    if (currentUser?.role === role) {
      return;
    }
    const preset = ROLE_AUTH_PRESETS[role];
    setAuthModalRole(role);
    setModalEmail(preset.email);
    setModalPassword(preset.password);
    setModalError(null);
  };

  const handleGoToLandingPage = () => {
    setAuthModalRole(null);
    setCurrentUser(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRole = (role: UserRole | 'HOME') => {
    if (role === 'HOME') {
      handleGoToLandingPage();
      return;
    }
    openRoleAuthGate(role);
  };

  const handleLoginWithCredentials = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    if (normalizedPassword !== '123456') {
      throw new Error('Invalid password. Use hardcoded demo password: 123456');
    }

    const emailToRole: Record<string, UserRole> = {
      'patient@gdg.com': 'PATIENT',
      'doctor@gdg.com': 'DOCTOR',
      'lab@gdg.com': 'LAB_TECH',
      'admin@gdg.com': 'GOV_ADMIN',
    };

    let resolvedRole: UserRole | undefined = emailToRole[normalizedEmail];
    if (!resolvedRole) {
      if (normalizedEmail.startsWith('patient')) resolvedRole = 'PATIENT';
      else if (normalizedEmail.startsWith('doctor') || normalizedEmail.startsWith('dr')) {
        resolvedRole = 'DOCTOR';
      } else if (normalizedEmail.startsWith('lab')) resolvedRole = 'LAB_TECH';
      else if (normalizedEmail.startsWith('admin') || normalizedEmail.startsWith('gov')) {
        resolvedRole = 'GOV_ADMIN';
      }
    }

    if (!resolvedRole) {
      const existingUser = appState.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (existingUser) {
        resolvedRole = existingUser.role;
      }
    }

    if (!resolvedRole) {
      throw new Error(
        'Invalid email. Use patient@gdg.com, doctor@gdg.com, lab@gdg.com, or admin@gdg.com'
      );
    }

    if (expectedRole && resolvedRole !== expectedRole) {
      throw new Error(
        `Please sign in with ${ROLE_AUTH_PRESETS[expectedRole].email} to access the ${ROLE_AUTH_PRESETS[expectedRole].label} tab.`
      );
    }

    // Attempt server login sync, with automatic client-side fallback for shared/static links
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password: normalizedPassword,
          role: resolvedRole,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        setCurrentUser(data.user);
        if (data.user.role === 'PATIENT' && data.user.patientId) {
          setSelectedPatientId(data.user.patientId);
        }
        return;
      }
    } catch {
      // Fallback to local appState below
    }

    const targetUser =
      appState.users.find((u) => u.email.toLowerCase() === normalizedEmail) ||
      appState.users.find((u) => u.role === resolvedRole);

    if (targetUser) {
      setCurrentUser({
        ...targetUser,
        email: ROLE_AUTH_PRESETS[resolvedRole].email,
      });
      if (targetUser.role === 'PATIENT' && targetUser.patientId) {
        setSelectedPatientId(targetUser.patientId);
      }
      return;
    }

    throw new Error('Unable to sign in.');
  };

  const handleModalAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authModalRole) return;
    setModalError(null);
    setModalSubmitting(true);
    try {
      await handleLoginWithCredentials(modalEmail, modalPassword, authModalRole);
      setAuthModalRole(null);
    } catch (err: any) {
      setModalError(err.message || 'Authentication failed');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data: AppStateResponse = await res.json();
        updateAndPersistState(data);
      } else {
        const fresh = getInitialClientSeedData();
        updateAndPersistState(fresh);
      }
    } catch {
      const fresh = getInitialClientSeedData();
      updateAndPersistState(fresh);
    } finally {
      setDoctorAuthorizedPatientId(null);
      setLabAuthorizedPatientId(null);
      setSmsDrawerOpen(false);
      setExternalOtpToFill('');
      setSelectedPatientId('PAT-2026-0891');
      setResetting(false);
    }
  };

  const handleRegisterPatient = async (payload: {
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
  }) => {
    try {
      const res = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        setSelectedPatientId(data.patient.patientId);
        setCurrentUser(data.user);
        return;
      }
    } catch {
      // Fallback to client state below
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const patientId = `PAT-2026-${randomId}`;
    const profileCode = `PRF-${Math.floor(1000 + Math.random() * 9000)}-NG`;

    const newPatient: PatientRecord = {
      patientId,
      profileCode,
      fullName: payload.fullName.trim(),
      dateOfBirth: payload.dateOfBirth || '1990-01-01',
      gender: (payload.gender as any) || 'Female',
      bloodGroup: payload.bloodGroup || 'O+',
      genotype: payload.genotype || 'AA',
      phoneNumber: payload.phoneNumber.trim(),
      email: payload.email || 'patient@gdg.com',
      address: payload.address || 'Lagos, Nigeria',
      emergencyContact: {
        name: payload.emergencyContactName || 'Next of Kin',
        relationship: payload.emergencyContactRelation || 'Family',
        phone: payload.emergencyContactPhone || '+234 800 000 0000',
      },
      nationalNin: `NIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-109`,
      allergies: payload.initialAllergySubstance
        ? [
            {
              id: `ALG-${Date.now()}`,
              substance: payload.initialAllergySubstance,
              category: 'Medication',
              severity: (payload.initialAllergySeverity as any) || 'Moderate',
              reaction: payload.initialAllergyReaction || 'Reported on registration',
              recordedDate: formatNow().slice(0, 10),
              recordedBy: 'Patient Self-Registration',
            },
          ]
        : [],
      consultations: [],
      prescriptions: [],
      labResults: [],
      activeOtp: null,
    };

    const newUser: User = {
      id: `USR-PAT-${Date.now()}`,
      name: newPatient.fullName,
      email: 'patient@gdg.com',
      role: 'PATIENT',
      title: 'Registered Citizen Patient',
      patientId: newPatient.patientId,
      status: 'ACTIVE',
    };

    const nextState: AppStateResponse = {
      ...appState,
      patients: [newPatient, ...appState.patients],
      users: [...appState.users, newUser],
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: newUser.id,
          actorName: newPatient.fullName,
          actorRole: 'PATIENT',
          hospitalName: 'Citizen Portal',
          patientId: newPatient.patientId,
          patientName: newPatient.fullName,
          actionType: 'PATIENT_REGISTERED',
          summary: `Registered centralized EHR profile (${newPatient.patientId}) with Profile Code ${newPatient.profileCode}.`,
          ipAddress: '102.89.12.44',
        },
        ...appState.auditLogs,
      ],
    };
    updateAndPersistState(nextState);
    setSelectedPatientId(newPatient.patientId);
    setCurrentUser(newUser);
  };

  const handleRotateProfileCode = async (patientId: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/rotate-code`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const newCode = `PRF-${Math.floor(1000 + Math.random() * 9000)}-NG`;
    const targetPatient = appState.patients.find((p) => p.patientId === patientId);
    if (!targetPatient) return;

    const nextState: AppStateResponse = {
      ...appState,
      patients: appState.patients.map((p) =>
        p.patientId === patientId ? { ...p, profileCode: newCode, activeOtp: null } : p
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: `USR-${patientId}`,
          actorName: targetPatient.fullName,
          actorRole: 'PATIENT',
          hospitalName: 'Citizen Portal',
          patientId,
          patientName: targetPatient.fullName,
          actionType: 'PROFILE_CODE_ROTATED',
          summary: `Rotated Profile Code from ${targetPatient.profileCode} to ${newCode}.`,
          ipAddress: '102.89.43.11',
        },
        ...appState.auditLogs,
      ],
    };
    updateAndPersistState(nextState);
  };

  const handleUpdatePhone = async (patientId: string, phoneNumber: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}/phone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const nextState: AppStateResponse = {
      ...appState,
      patients: appState.patients.map((p) =>
        p.patientId === patientId ? { ...p, phoneNumber } : p
      ),
    };
    updateAndPersistState(nextState);
  };

  const handleRequestOtp = async (codeOrId: string) => {
    if (!currentUser) return null;
    try {
      const res = await fetch('/api/access/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeOrId,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        setSmsDrawerOpen(true);
        setExternalOtpToFill('');
        const otpSession: ActiveOtpSession = data.otpSession;
        return {
          patientId: otpSession.patientId,
          fullName: otpSession.patientName,
          phoneNumber: otpSession.phoneNumber,
          profileCode: otpSession.profileCodeUsed,
          otpCode: otpSession.otpCode,
        };
      }
    } catch {
      // Fallback below
    }

    // Client-side fallback validation & OTP generation
    const hospital = appState.hospitals.find((h) => h.id === currentUser.hospitalId);
    if (hospital && hospital.status !== 'APPROVED') {
      throw new Error(
        `Government Oversight Block: ${hospital.name} currently has '${hospital.status}' status.`
      );
    }
    const normalized = codeOrId.trim().toUpperCase();
    const patient = appState.patients.find(
      (p) =>
        p.profileCode.toUpperCase() === normalized || p.patientId.toUpperCase() === normalized
    );
    if (!patient) {
      throw new Error(`No patient found matching "${codeOrId}".`);
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpSession: ActiveOtpSession = {
      otpCode,
      profileCodeUsed: patient.profileCode,
      patientId: patient.patientId,
      patientName: patient.fullName,
      phoneNumber: patient.phoneNumber,
      requestedByUserId: currentUser.id,
      requestedByName: currentUser.name,
      requestedByRole: currentUser.role,
      hospitalName: currentUser.hospitalName || 'Authorized Facility',
      createdAt: formatNow(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      verified: false,
    };

    const nextState: AppStateResponse = {
      ...appState,
      latestSmsOtp: otpSession,
      patients: appState.patients.map((p) =>
        p.patientId === patient.patientId ? { ...p, activeOtp: otpSession } : p
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          hospitalName: otpSession.hospitalName,
          patientId: patient.patientId,
          patientName: patient.fullName,
          actionType: 'OTP_REQUESTED',
          summary: `Entered Profile Code (${patient.profileCode}). 6-digit SMS OTP dispatched to ${patient.phoneNumber}.`,
          ipAddress: '102.89.43.118',
        },
        ...appState.auditLogs,
      ],
    };

    updateAndPersistState(nextState);
    setSmsDrawerOpen(true);
    setExternalOtpToFill('');
    return {
      patientId: otpSession.patientId,
      fullName: otpSession.patientName,
      phoneNumber: otpSession.phoneNumber,
      profileCode: otpSession.profileCodeUsed,
      otpCode: otpSession.otpCode,
    };
  };

  const handleVerifyOtp = async (patientId: string, otpCode: string) => {
    if (!currentUser) return null;
    try {
      const res = await fetch('/api/access/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          otpCode,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        if (currentUser.role === 'DOCTOR') {
          setDoctorAuthorizedPatientId(patientId);
        } else if (currentUser.role === 'LAB_TECH') {
          setLabAuthorizedPatientId(patientId);
        }
        return data.patient as PatientRecord;
      }
    } catch {
      // Fallback below
    }

    const patient = appState.patients.find((p) => p.patientId === patientId);
    if (!patient || !patient.activeOtp) {
      throw new Error('No active OTP session found.');
    }
    if (otpCode.trim() !== patient.activeOtp.otpCode) {
      throw new Error('Invalid 6-digit SMS OTP code.');
    }

    const updatedOtp: ActiveOtpSession = { ...patient.activeOtp, verified: true };
    const updatedPatient: PatientRecord = { ...patient, activeOtp: updatedOtp };

    const nextState: AppStateResponse = {
      ...appState,
      latestSmsOtp: updatedOtp,
      patients: appState.patients.map((p) =>
        p.patientId === patientId ? updatedPatient : p
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          hospitalName: currentUser.hospitalName || 'Authorized Facility',
          patientId: patient.patientId,
          patientName: patient.fullName,
          actionType: 'RECORD_ACCESSED',
          summary: `Verified SMS OTP (${otpCode}) and unlocked medical record for ${patient.fullName}.`,
          ipAddress: '102.89.43.118',
        },
        ...appState.auditLogs,
      ],
    };

    updateAndPersistState(nextState);
    if (currentUser.role === 'DOCTOR') {
      setDoctorAuthorizedPatientId(patientId);
    } else if (currentUser.role === 'LAB_TECH') {
      setLabAuthorizedPatientId(patientId);
    }
    return updatedPatient;
  };

  const handleAddConsultation = async (
    patientId: string,
    payload: {
      visitType: string;
      chiefComplaint: string;
      diagnosis: string;
      icdCode: string;
      clinicalNotes: string;
      treatmentPlan: string;
      vitals: {
        bloodPressure: string;
        heartRate: string;
        temperature: string;
        spO2: string;
        weight: string;
      };
      prescription?: {
        medicationName: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
      };
    }
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const patient = appState.patients.find((p) => p.patientId === patientId);
    if (!patient) return;

    const newCons: Consultation = {
      id: `CONS-${Math.floor(100 + Math.random() * 900)}`,
      date: formatNow().slice(0, 16),
      hospitalId: currentUser.hospitalId || 'HOSP-001',
      hospitalName: currentUser.hospitalName || 'Lagos National Teaching Hospital',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      specialty: currentUser.specialty || 'Internal Medicine',
      visitType: (payload.visitType as any) || 'Outpatient Consultation',
      chiefComplaint: payload.chiefComplaint || 'Clinical evaluation',
      diagnosis: payload.diagnosis,
      icdCode: payload.icdCode || 'I10',
      clinicalNotes: payload.clinicalNotes,
      treatmentPlan: payload.treatmentPlan,
      vitals: payload.vitals,
    };

    const newPrescriptions: Prescription[] = [...patient.prescriptions];
    if (payload.prescription && payload.prescription.medicationName) {
      newPrescriptions.unshift({
        id: `RX-${Math.floor(100 + Math.random() * 900)}`,
        date: formatNow().slice(0, 10),
        medicationName: payload.prescription.medicationName,
        dosage: payload.prescription.dosage || '10 mg',
        frequency: payload.prescription.frequency || 'Once daily',
        duration: payload.prescription.duration || '30 Days',
        instructions: payload.prescription.instructions || 'Take as directed',
        prescribedBy: currentUser.name,
        hospitalName: currentUser.hospitalName || 'Lagos National Teaching Hospital',
        status: 'Active',
      });
    }

    const nextState: AppStateResponse = {
      ...appState,
      patients: appState.patients.map((p) =>
        p.patientId === patientId
          ? {
              ...p,
              consultations: [newCons, ...p.consultations],
              prescriptions: newPrescriptions,
            }
          : p
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: 'DOCTOR',
          hospitalName: currentUser.hospitalName || 'Lagos National Teaching Hospital',
          patientId,
          patientName: patient.fullName,
          actionType: 'DIAGNOSIS_ADDED',
          summary: `Added diagnosis "${newCons.diagnosis}" (${newCons.icdCode}).`,
          ipAddress: '102.89.43.118',
        },
        ...appState.auditLogs,
      ],
    };
    updateAndPersistState(nextState);
  };

  const handleAddAllergy = async (
    patientId: string,
    payload: { substance: string; category: string; severity: string; reaction: string }
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const newAllergy: Allergy = {
      id: `ALG-${Math.floor(100 + Math.random() * 900)}`,
      substance: payload.substance,
      category: (payload.category as any) || 'Medication',
      severity: (payload.severity as any) || 'Severe',
      reaction: payload.reaction || 'Hypersensitivity',
      recordedDate: formatNow().slice(0, 10),
      recordedBy: `${currentUser.name} (${currentUser.hospitalName})`,
    };

    const nextState: AppStateResponse = {
      ...appState,
      patients: appState.patients.map((p) =>
        p.patientId === patientId ? { ...p, allergies: [newAllergy, ...p.allergies] } : p
      ),
    };
    updateAndPersistState(nextState);
  };

  const handleUploadLabResult = async (
    patientId: string,
    payload: {
      existingLabId?: string;
      testName: string;
      category: string;
      specimen: string;
      orderedBy: string;
      parameters: LabParameter[];
      clinicalInterpretation: string;
    }
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/lab-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const patient = appState.patients.find((p) => p.patientId === patientId);
    if (!patient) return;

    const newLab: LabResult = {
      id: payload.existingLabId || `LAB-${Math.floor(400 + Math.random() * 599)}`,
      date: formatNow().slice(0, 16),
      testName: payload.testName,
      category: (payload.category as any) || 'Hematology',
      specimen: payload.specimen,
      orderedBy: payload.orderedBy,
      uploadedBy: currentUser.name,
      laboratoryName: currentUser.hospitalName || 'Abuja Central Diagnostics',
      hospitalId: currentUser.hospitalId || 'HOSP-002',
      status: 'Completed',
      parameters: payload.parameters,
      clinicalInterpretation: payload.clinicalInterpretation,
    };

    const updatedLabs = payload.existingLabId
      ? patient.labResults.map((l) => (l.id === payload.existingLabId ? newLab : l))
      : [newLab, ...patient.labResults];

    const nextState: AppStateResponse = {
      ...appState,
      patients: appState.patients.map((p) =>
        p.patientId === patientId ? { ...p, labResults: updatedLabs } : p
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: 'LAB_TECH',
          hospitalName: currentUser.hospitalName || 'Abuja Central Diagnostics',
          patientId,
          patientName: patient.fullName,
          actionType: 'LAB_RESULT_UPLOADED',
          summary: `Uploaded lab report "${newLab.testName}" (${newLab.id}).`,
          ipAddress: '197.210.76.42',
        },
        ...appState.auditLogs,
      ],
    };
    updateAndPersistState(nextState);
  };

  const handleToggleHospitalStatus = async (
    hospitalId: string,
    status: 'APPROVED' | 'REVOKED'
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/admin/hospitals/${hospitalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const targetHosp = appState.hospitals.find((h) => h.id === hospitalId);
    const nextState: AppStateResponse = {
      ...appState,
      hospitals: appState.hospitals.map((h) =>
        h.id === hospitalId ? { ...h, status } : h
      ),
      auditLogs: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: 'GOV_ADMIN',
          hospitalName: 'Federal Ministry of Health',
          actionType: 'HOSPITAL_STATUS_CHANGED',
          summary: `Updated accreditation status for ${targetHosp?.name || hospitalId} to ${status}.`,
          ipAddress: '41.203.114.9',
        },
        ...appState.auditLogs,
      ],
    };
    updateAndPersistState(nextState);
  };

  const handleRegisterHospital = async (payload: {
    name: string;
    registrationNumber: string;
    location: string;
    facilityType: string;
    chiefMedicalDirector: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const newHosp: Hospital = {
      id: `HOSP-00${appState.hospitals.length + 1}`,
      name: payload.name,
      registrationNumber: payload.registrationNumber,
      location: payload.location,
      facilityType: (payload.facilityType as any) || 'General Hospital',
      status: 'APPROVED',
      accreditedDate: formatNow().slice(0, 10),
      chiefMedicalDirector: payload.chiefMedicalDirector || 'Chief Medical Director',
    };
    updateAndPersistState({
      ...appState,
      hospitals: [newHosp, ...appState.hospitals],
    });
  };

  const handleToggleUserStatus = async (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    updateAndPersistState({
      ...appState,
      users: appState.users.map((u) => (u.id === userId ? { ...u, status } : u)),
    });
  };

  const handleRegisterPractitioner = async (payload: {
    name: string;
    email: string;
    role: 'DOCTOR' | 'LAB_TECH';
    title: string;
    hospitalId: string;
    specialty: string;
    licenseNumber: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          actorUserId: currentUser.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updateAndPersistState(data.state);
        return;
      }
    } catch {
      // Fallback below
    }

    const hosp =
      appState.hospitals.find((h) => h.id === payload.hospitalId) || appState.hospitals[0];
    const newUser: User = {
      id: `USR-${payload.role}-${Date.now()}`,
      name: payload.name,
      email: payload.email || `${payload.role.toLowerCase()}@gdg.com`,
      role: payload.role,
      title: payload.title,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      specialty: payload.specialty,
      licenseNumber: payload.licenseNumber,
      status: 'ACTIVE',
    };
    updateAndPersistState({
      ...appState,
      users: [...appState.users, newUser],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full space-y-4 text-center">
          <img
            src="/assets/aistudio/Gradient_H_Connection_Health_Icon_99789294.png"
            alt="HealthConnect Icon"
            className="w-12 h-12 object-contain mx-auto mix-blend-multiply"
          />
          <img
            src="/assets/aistudio/HealthConnect_Two-Tone_Wordmark_0cf6c45f.png"
            alt="HealthConnect"
            className="h-7 object-contain mx-auto mix-blend-multiply"
          />
        </div>
      </div>
    );
  }

  const activePatientRecord =
    appState.patients.find((p) => p.patientId === selectedPatientId) || appState.patients[0];

  const doctorUnlockedPatient = doctorAuthorizedPatientId
    ? appState.patients.find((p) => p.patientId === doctorAuthorizedPatientId) || null
    : null;

  const labUnlockedPatient = labAuthorizedPatientId
    ? appState.patients.find((p) => p.patientId === labAuthorizedPatientId) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
        {/* Zone 1: Brand Lockup (Icon + Two-Tone Wordmark) — Click returns to Landing Page */}
        <button
          type="button"
          onClick={handleGoToLandingPage}
          title="Return to HealthConnect Landing Page"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
        >
          <img
            src="/assets/aistudio/Gradient_H_Connection_Health_Icon_99789294.png"
            alt="HealthConnect Home"
            className="w-9 h-9 object-contain mix-blend-multiply shrink-0"
          />
          <img
            src="/assets/aistudio/HealthConnect_Two-Tone_Wordmark_0cf6c45f.png"
            alt="HealthConnect"
            className="h-6 object-contain mix-blend-multiply shrink-0"
          />
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleGoToLandingPage();
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              !currentUser ? 'text-teal-700 font-semibold underline underline-offset-4' : ''
            }`}
          >
            Home
          </a>
          <a
            href="#patient"
            onClick={(e) => {
              e.preventDefault();
              handleSelectRole('PATIENT');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentUser?.role === 'PATIENT'
                ? 'text-teal-700 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Patient
          </a>
          <a
            href="#doctor"
            onClick={(e) => {
              e.preventDefault();
              handleSelectRole('DOCTOR');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentUser?.role === 'DOCTOR'
                ? 'text-teal-700 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Doctor
          </a>
          <a
            href="#laboratory"
            onClick={(e) => {
              e.preventDefault();
              handleSelectRole('LAB_TECH');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentUser?.role === 'LAB_TECH'
                ? 'text-teal-700 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Laboratory
          </a>
          <a
            href="#oversight"
            onClick={(e) => {
              e.preventDefault();
              handleSelectRole('GOV_ADMIN');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentUser?.role === 'GOV_ADMIN'
                ? 'text-teal-700 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Gov Admin
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {!currentUser ? (
          <LandingPortal
            users={appState.users}
            patients={appState.patients}
            hospitals={appState.hospitals}
            onRequestRoleAuth={(role) => openRoleAuthGate(role)}
            onLoginWithCredentials={handleLoginWithCredentials}
            onRegisterPatient={handleRegisterPatient}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-8">
            {currentUser.role === 'PATIENT' && (
              <PatientView
                patient={activePatientRecord}
                allPatients={appState.patients}
                auditLogs={appState.auditLogs}
                onSelectPatientId={(id) => setSelectedPatientId(id)}
                onRotateProfileCode={handleRotateProfileCode}
                onUpdatePhone={handleUpdatePhone}
                onRefreshState={fetchState}
                onSwitchToRole={(role) => handleSelectRole(role)}
              />
            )}

            {currentUser.role === 'DOCTOR' && (
              <DoctorView
                currentDoctor={currentUser}
                hospitals={appState.hospitals}
                allPatients={appState.patients}
                authorizedPatient={doctorUnlockedPatient}
                externalOtpToFill={externalOtpToFill}
                onRequestOtp={handleRequestOtp}
                onVerifyOtp={handleVerifyOtp}
                onAddConsultation={handleAddConsultation}
                onAddAllergy={handleAddAllergy}
                onClosePatientSession={() => setDoctorAuthorizedPatientId(null)}
              />
            )}

            {currentUser.role === 'LAB_TECH' && (
              <LabTechView
                currentLabTech={currentUser}
                hospitals={appState.hospitals}
                allPatients={appState.patients}
                authorizedPatient={labUnlockedPatient}
                externalOtpToFill={externalOtpToFill}
                onRequestOtp={handleRequestOtp}
                onVerifyOtp={handleVerifyOtp}
                onDirectSelectAuthorizedPatient={(p) => setLabAuthorizedPatientId(p.patientId)}
                onUploadLabResult={handleUploadLabResult}
                onClosePatientSession={() => setLabAuthorizedPatientId(null)}
              />
            )}

            {currentUser.role === 'GOV_ADMIN' && (
              <GovAdminView
                currentAdmin={currentUser}
                hospitals={appState.hospitals}
                users={appState.users}
                auditLogs={appState.auditLogs}
                onToggleHospitalStatus={handleToggleHospitalStatus}
                onRegisterHospital={handleRegisterHospital}
                onToggleUserStatus={handleToggleUserStatus}
                onRegisterPractitioner={handleRegisterPractitioner}
              />
            )}
          </div>
        )}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={handleGoToLandingPage}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <img
              src="/assets/aistudio/Gradient_H_Connection_Health_Icon_99789294.png"
              alt=""
              className="w-6 h-6 object-contain mix-blend-multiply"
            />
            <img
              src="/assets/aistudio/HealthConnect_Two-Tone_Wordmark_0cf6c45f.png"
              alt="HealthConnect"
              className="h-4 object-contain mix-blend-multiply"
            />
          </button>
          <span>Federal Ministry of Health</span>
        </div>
      </footer>

      {/* Hardcoded Role Authentication Gate Modal when switching tabs */}
      {authModalRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/aistudio/Gradient_H_Connection_Health_Icon_99789294.png"
                  alt=""
                  className="w-6 h-6 object-contain mix-blend-multiply shrink-0"
                />
                <h3 className="text-base font-bold text-slate-900">
                  {ROLE_AUTH_PRESETS[authModalRole].label} Sign In
                </h3>
              </div>
              <button
                onClick={() => setAuthModalRole(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                aria-label="Close sign in modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalAuthSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
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
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalRole(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {modalSubmitting
                      ? 'Verifying...'
                      : `Sign In as ${ROLE_AUTH_PRESETS[authModalRole].label}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated SMS Notification Drawer for Live Single-Screen Demo */}
      {smsDrawerOpen && appState.latestSmsOtp && (
        <SimulatedSmsDrawer
          smsSession={appState.latestSmsOtp}
          onDismiss={() => setSmsDrawerOpen(false)}
          onQuickFillOtp={(otp) => setExternalOtpToFill(otp)}
        />
      )}
    </div>
  );
}
