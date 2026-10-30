export type UserRole = 'PATIENT' | 'DOCTOR' | 'LAB_TECH' | 'GOV_ADMIN';

export interface Hospital {
  id: string;
  name: string;
  registrationNumber: string;
  location: string;
  facilityType: 'Teaching Hospital' | 'Federal Medical Centre' | 'Diagnostic Laboratory' | 'General Hospital';
  status: 'APPROVED' | 'REVOKED' | 'PENDING';
  accreditedDate: string;
  chiefMedicalDirector: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  hospitalId?: string;
  hospitalName?: string;
  specialty?: string;
  licenseNumber?: string;
  patientId?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Allergy {
  id: string;
  substance: string;
  category: 'Medication' | 'Food' | 'Environmental';
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
  recordedDate: string;
  recordedBy: string;
}

export interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  spO2: string;
  weight: string;
}

export interface Consultation {
  id: string;
  date: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  visitType: 'Outpatient Consultation' | 'Emergency Admission' | 'Follow-up Review' | 'Specialist Referral';
  chiefComplaint: string;
  diagnosis: string;
  icdCode: string;
  clinicalNotes: string;
  treatmentPlan: string;
  vitals: VitalSigns;
}

export interface Prescription {
  id: string;
  date: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  hospitalName: string;
  status: 'Active' | 'Completed';
}

export interface LabParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface LabResult {
  id: string;
  date: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Immunology' | 'Radiology';
  specimen: string;
  orderedBy: string;
  uploadedBy: string;
  laboratoryName: string;
  hospitalId: string;
  status: 'Completed' | 'Pending Investigation';
  parameters: LabParameter[];
  clinicalInterpretation: string;
}

export interface ActiveOtpSession {
  otpCode: string;
  profileCodeUsed: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  requestedByUserId: string;
  requestedByName: string;
  requestedByRole: UserRole;
  hospitalName: string;
  createdAt: string;
  expiresAt: string;
  verified: boolean;
}

export interface PatientRecord {
  patientId: string;
  profileCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  genotype: string;
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  nationalNin: string;
  allergies: Allergy[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  labResults: LabResult[];
  activeOtp?: ActiveOtpSession | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  hospitalName: string;
  patientId?: string;
  patientName?: string;
  actionType:
    | 'OTP_REQUESTED'
    | 'RECORD_ACCESSED'
    | 'DIAGNOSIS_ADDED'
    | 'PRESCRIPTION_ADDED'
    | 'ALLERGY_ADDED'
    | 'LAB_RESULT_UPLOADED'
    | 'LAB_RESULT_UPDATED'
    | 'PROFILE_CODE_ROTATED'
    | 'PATIENT_REGISTERED'
    | 'HOSPITAL_STATUS_CHANGED'
    | 'HOSPITAL_REGISTERED'
    | 'USER_STATUS_CHANGED'
    | 'USER_REGISTERED';
  summary: string;
  ipAddress: string;
}

export interface AppStateResponse {
  users: User[];
  hospitals: Hospital[];
  patients: PatientRecord[];
  auditLogs: AuditLog[];
  latestSmsOtp: ActiveOtpSession | null;
}
