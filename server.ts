import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type {
  ActiveOtpSession,
  Allergy,
  AuditLog,
  Consultation,
  Hospital,
  LabResult,
  PatientRecord,
  Prescription,
  User,
} from './src/types.ts';

interface DatabaseSchema {
  users: User[];
  hospitals: Hospital[];
  patients: PatientRecord[];
  auditLogs: AuditLog[];
  latestSmsOtp: ActiveOtpSession | null;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ehr-database.json');

function getInitialSeedData(): DatabaseSchema {
  const hospitals: Hospital[] = [
    {
      id: 'HOSP-001',
      name: 'Lagos National Teaching Hospital',
      registrationNumber: 'FMOH-NGR-1042',
      location: 'Idi-Araba, Lagos',
      facilityType: 'Teaching Hospital',
      status: 'APPROVED',
      accreditedDate: '2024-01-15',
      chiefMedicalDirector: 'Prof. Babatunde Fashola-Cole',
    },
    {
      id: 'HOSP-002',
      name: 'Abuja Central Diagnostics & Research Centre',
      registrationNumber: 'FMOH-NGR-2089',
      location: 'Garki Area 11, Abuja',
      facilityType: 'Diagnostic Laboratory',
      status: 'APPROVED',
      accreditedDate: '2024-03-22',
      chiefMedicalDirector: 'Dr. Halima Danjuma',
    },
    {
      id: 'HOSP-003',
      name: 'Port Harcourt Federal Medical Centre',
      registrationNumber: 'FMOH-NGR-3190',
      location: 'GRA Phase 2, Port Harcourt',
      facilityType: 'Federal Medical Centre',
      status: 'APPROVED',
      accreditedDate: '2024-06-10',
      chiefMedicalDirector: 'Dr. Chibuike Amaechi-Nwosu',
    },
    {
      id: 'HOSP-004',
      name: 'MetroCare Private Annex Clinic',
      registrationNumber: 'FMOH-NGR-8821',
      location: 'Ikeja, Lagos',
      facilityType: 'General Hospital',
      status: 'REVOKED',
      accreditedDate: '2023-11-04',
      chiefMedicalDirector: 'Dr. Segun Arinze-Bello',
    },
  ];

  const users: User[] = [
    {
      id: 'USR-PAT-01',
      name: 'Amara Okafor',
      email: 'amara.okafor@citizen.gov.ng',
      role: 'PATIENT',
      title: 'Registered Citizen Patient',
      patientId: 'PAT-2026-0891',
      status: 'ACTIVE',
    },
    {
      id: 'USR-DOC-01',
      name: 'Dr. Tunde Adeleke',
      email: 't.adeleke@lnth.gov.ng',
      role: 'DOCTOR',
      title: 'Senior Consultant Physician',
      hospitalId: 'HOSP-001',
      hospitalName: 'Lagos National Teaching Hospital',
      specialty: 'Internal Medicine & Cardiology',
      licenseNumber: 'MDCN/R/44912',
      status: 'ACTIVE',
    },
    {
      id: 'USR-LAB-01',
      name: 'Elena Nwosu, AMLSCN',
      email: 'e.nwosu@abujadiagnostics.gov.ng',
      role: 'LAB_TECH',
      title: 'Chief Medical Laboratory Scientist',
      hospitalId: 'HOSP-002',
      hospitalName: 'Abuja Central Diagnostics & Research Centre',
      specialty: 'Clinical Pathology & Hematology',
      licenseNumber: 'MLSCN/2021/8834',
      status: 'ACTIVE',
    },
    {
      id: 'USR-GOV-01',
      name: 'Director K. Mensah-Bello',
      email: 'director.compliance@health.gov.ng',
      role: 'GOV_ADMIN',
      title: 'Director of National EHR Oversight & Compliance',
      hospitalName: 'Federal Ministry of Health & Social Welfare',
      licenseNumber: 'FMOH-REG-001',
      status: 'ACTIVE',
    },
  ];

  const patients: PatientRecord[] = [
    {
      patientId: 'PAT-2026-0891',
      profileCode: 'PRF-9042-NG',
      fullName: 'Amara Okafor',
      dateOfBirth: '1992-04-18',
      gender: 'Female',
      bloodGroup: 'O+',
      genotype: 'AA',
      phoneNumber: '+234 803 555 0192',
      email: 'amara.okafor@citizen.gov.ng',
      address: '14 Admiralty Way, Lekki Phase 1, Lagos',
      emergencyContact: {
        name: 'Chinedu Okafor',
        relationship: 'Spouse',
        phone: '+234 809 442 1108',
      },
      nationalNin: 'NIN-7482-9104-338',
      allergies: [
        {
          id: 'ALG-01',
          substance: 'Penicillin / Amoxicillin',
          category: 'Medication',
          severity: 'Severe',
          reaction: 'Anaphylaxis, acute urticaria, and airway constriction',
          recordedDate: '2025-02-11',
          recordedBy: 'Dr. Ibrahim Musa (Port Harcourt FMC)',
        },
        {
          id: 'ALG-02',
          substance: 'Sulfonamide Antibiotics',
          category: 'Medication',
          severity: 'Moderate',
          reaction: 'Generalized maculopapular skin rash',
          recordedDate: '2025-08-19',
          recordedBy: 'Dr. Tunde Adeleke (Lagos National Teaching Hospital)',
        },
      ],
      consultations: [
        {
          id: 'CONS-102',
          date: '2026-09-14 10:30',
          hospitalId: 'HOSP-003',
          hospitalName: 'Port Harcourt Federal Medical Centre',
          doctorId: 'USR-DOC-99',
          doctorName: 'Dr. Ibrahim Musa',
          specialty: 'General Internal Medicine',
          visitType: 'Outpatient Consultation',
          chiefComplaint: 'Persistent frontal headaches and episodic dizziness during work hours.',
          diagnosis: 'Essential (Primary) Stage 1 Hypertension',
          icdCode: 'I10',
          clinicalNotes:
            'Patient presented with elevated blood pressure readings over 2 consecutive weeks. Fundoscopy normal. No chest pain or dyspnea. Advised dietary sodium restriction and initiated calcium channel blocker therapy due to penicillin allergy note on record.',
          treatmentPlan: 'Start Amlodipine 5mg once daily. Schedule fasting lipid profile and renal function panel in 4 weeks.',
          vitals: {
            bloodPressure: '146/92 mmHg',
            heartRate: '78 bpm',
            temperature: '36.7 °C',
            spO2: '99%',
            weight: '68.4 kg',
          },
        },
        {
          id: 'CONS-101',
          date: '2026-05-03 14:15',
          hospitalId: 'HOSP-001',
          hospitalName: 'Lagos National Teaching Hospital',
          doctorId: 'USR-DOC-01',
          doctorName: 'Dr. Tunde Adeleke',
          specialty: 'Internal Medicine & Cardiology',
          visitType: 'Outpatient Consultation',
          chiefComplaint: 'Acute febrile illness,joint arthralgia, and generalized fatigue for 3 days.',
          diagnosis: 'Uncomplicated Plasmodium falciparum Malaria',
          icdCode: 'B50.9',
          clinicalNotes:
            'Rapid diagnostic test and blood film positive for P. falciparum. No signs of severe anemia or neurological involvement. Checked central allergy registry: avoided sulfadoxine-pyrimethamine due to documented sulfonamide sensitivity.',
          treatmentPlan: 'Artemether-Lumefantrine 80/480mg BD for 3 days + Paracetamol 1g TDS.',
          vitals: {
            bloodPressure: '124/80 mmHg',
            heartRate: '92 bpm',
            temperature: '38.4 °C',
            spO2: '98%',
            weight: '69.0 kg',
          },
        },
      ],
      prescriptions: [
        {
          id: 'RX-201',
          date: '2026-09-14',
          medicationName: 'Amlodipine Besylate',
          dosage: '5 mg',
          frequency: 'Once daily (Morning)',
          duration: '90 Days (Ongoing)',
          instructions: 'Take with water after breakfast. Monitor home blood pressure twice weekly.',
          prescribedBy: 'Dr. Ibrahim Musa',
          hospitalName: 'Port Harcourt Federal Medical Centre',
          status: 'Active',
        },
        {
          id: 'RX-202',
          date: '2026-05-03',
          medicationName: 'Artemether / Lumefantrine',
          dosage: '80mg / 480mg',
          frequency: 'Twice daily (Every 12 hours)',
          duration: '3 Days',
          instructions: 'Complete full 6-dose regimen with meals.',
          prescribedBy: 'Dr. Tunde Adeleke',
          hospitalName: 'Lagos National Teaching Hospital',
          status: 'Completed',
        },
      ],
      labResults: [
        {
          id: 'LAB-301',
          date: '2026-09-15 09:20',
          testName: 'Fasting Lipid Panel & Renal Electrolyte Assay',
          category: 'Biochemistry',
          specimen: 'Venous Serum (Fasting 12h)',
          orderedBy: 'Dr. Ibrahim Musa',
          uploadedBy: 'Elena Nwosu, AMLSCN',
          laboratoryName: 'Abuja Central Diagnostics & Research Centre',
          hospitalId: 'HOSP-002',
          status: 'Completed',
          parameters: [
            {
              name: 'Total Cholesterol',
              value: '214',
              unit: 'mg/dL',
              referenceRange: '< 200',
              flag: 'High',
            },
            {
              name: 'LDL Cholesterol',
              value: '136',
              unit: 'mg/dL',
              referenceRange: '< 100',
              flag: 'High',
            },
            {
              name: 'HDL Cholesterol',
              value: '54',
              unit: 'mg/dL',
              referenceRange: '> 40',
              flag: 'Normal',
            },
            {
              name: 'Fasting Blood Glucose',
              value: '91',
              unit: 'mg/dL',
              referenceRange: '70 - 99',
              flag: 'Normal',
            },
            {
              name: 'Serum Creatinine',
              value: '0.84',
              unit: 'mg/dL',
              referenceRange: '0.60 - 1.10',
              flag: 'Normal',
            },
          ],
          clinicalInterpretation:
            'Borderline elevated Total and LDL Cholesterol. Renal function and fasting glycemic indices are within normal physiological limits.',
        },
        {
          id: 'LAB-302',
          date: '2026-10-29 16:40',
          testName: 'Complete Blood Count (CBC) & Cardiac Troponin-I',
          category: 'Hematology',
          specimen: 'Whole Blood (EDTA) + Heparin Plasma',
          orderedBy: 'Dr. Tunde Adeleke',
          uploadedBy: 'Pending Lab Upload',
          laboratoryName: 'Abuja Central Diagnostics & Research Centre',
          hospitalId: 'HOSP-002',
          status: 'Pending Investigation',
          parameters: [],
          clinicalInterpretation: 'Specimen collected and logged at central phlebotomy unit. Awaiting analyzer upload.',
        },
      ],
      activeOtp: null,
    },
    {
      patientId: 'PAT-2026-1104',
      profileCode: 'PRF-3318-NG',
      fullName: 'Kelechi Danjuma',
      dateOfBirth: '1985-11-02',
      gender: 'Male',
      bloodGroup: 'A+',
      genotype: 'AS',
      phoneNumber: '+234 802 771 9044',
      email: 'k.danjuma@citizen.gov.ng',
      address: '28 Maitama Boulevard, Abuja',
      emergencyContact: {
        name: 'Zainab Danjuma',
        relationship: 'Sister',
        phone: '+234 805 119 3320',
      },
      nationalNin: 'NIN-5510-2298-104',
      allergies: [
        {
          id: 'ALG-09',
          substance: 'Latex',
          category: 'Environmental',
          severity: 'Mild',
          reaction: 'Localized contact dermatitis',
          recordedDate: '2024-07-12',
          recordedBy: 'Dr. Tunde Adeleke (Lagos National Teaching Hospital)',
        },
      ],
      consultations: [
        {
          id: 'CONS-201',
          date: '2026-08-21 11:00',
          hospitalId: 'HOSP-001',
          hospitalName: 'Lagos National Teaching Hospital',
          doctorId: 'USR-DOC-01',
          doctorName: 'Dr. Tunde Adeleke',
          specialty: 'Internal Medicine & Cardiology',
          visitType: 'Follow-up Review',
          chiefComplaint: 'Routine semi-annual glycemic control checkup.',
          diagnosis: 'Type 2 Diabetes Mellitus without complications',
          icdCode: 'E11.9',
          clinicalNotes: 'Glycemic control stable on Metformin monotherapy. Foot exam normal.',
          treatmentPlan: 'Continue Metformin 500mg BD. Repeat HbA1c in 3 months.',
          vitals: {
            bloodPressure: '122/78 mmHg',
            heartRate: '72 bpm',
            temperature: '36.6 °C',
            spO2: '99%',
            weight: '79.2 kg',
          },
        },
      ],
      prescriptions: [
        {
          id: 'RX-401',
          date: '2026-08-21',
          medicationName: 'Metformin Hydrochloride',
          dosage: '500 mg',
          frequency: 'Twice daily with meals',
          duration: '90 Days',
          instructions: 'Take with morning and evening meals.',
          prescribedBy: 'Dr. Tunde Adeleke',
          hospitalName: 'Lagos National Teaching Hospital',
          status: 'Active',
        },
      ],
      labResults: [],
      activeOtp: null,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-9004',
      timestamp: '2026-10-29 16:40:12',
      actorId: 'USR-DOC-01',
      actorName: 'Dr. Tunde Adeleke',
      actorRole: 'DOCTOR',
      hospitalName: 'Lagos National Teaching Hospital',
      patientId: 'PAT-2026-0891',
      patientName: 'Amara Okafor',
      actionType: 'LAB_RESULT_UPLOADED',
      summary: 'Ordered Complete Blood Count (CBC) & Cardiac Troponin-I investigation for Amara Okafor.',
      ipAddress: '102.89.43.118',
    },
    {
      id: 'AUD-9003',
      timestamp: '2026-09-15 09:20:45',
      actorId: 'USR-LAB-01',
      actorName: 'Elena Nwosu, AMLSCN',
      actorRole: 'LAB_TECH',
      hospitalName: 'Abuja Central Diagnostics & Research Centre',
      patientId: 'PAT-2026-0891',
      patientName: 'Amara Okafor',
      actionType: 'LAB_RESULT_UPLOADED',
      summary: 'Uploaded Fasting Lipid Panel & Renal Electrolyte Assay report (LAB-301).',
      ipAddress: '197.210.76.42',
    },
    {
      id: 'AUD-9002',
      timestamp: '2026-09-14 10:32:08',
      actorId: 'USR-DOC-99',
      actorName: 'Dr. Ibrahim Musa',
      actorRole: 'DOCTOR',
      hospitalName: 'Port Harcourt Federal Medical Centre',
      patientId: 'PAT-2026-0891',
      patientName: 'Amara Okafor',
      actionType: 'DIAGNOSIS_ADDED',
      summary: 'Recorded diagnosis Essential (Primary) Stage 1 Hypertension (ICD-10: I10) and prescribed Amlodipine 5mg.',
      ipAddress: '105.112.19.84',
    },
    {
      id: 'AUD-9001',
      timestamp: '2026-09-01 08:15:00',
      actorId: 'USR-GOV-01',
      actorName: 'Director K. Mensah-Bello',
      actorRole: 'GOV_ADMIN',
      hospitalName: 'Federal Ministry of Health & Social Welfare',
      actionType: 'HOSPITAL_STATUS_CHANGED',
      summary: 'Revoked platform access for MetroCare Private Annex Clinic (HOSP-004) due to compliance audit failure.',
      ipAddress: '41.203.114.9',
    },
  ];

  return {
    users,
    hospitals,
    patients,
    auditLogs,
    latestSmsOtp: null,
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const seed = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    const roleEmailMap: Record<string, string> = {
      PATIENT: 'patient@gdg.com',
      DOCTOR: 'doctor@gdg.com',
      LAB_TECH: 'lab@gdg.com',
      GOV_ADMIN: 'admin@gdg.com',
    };
    parsed.users.forEach((u) => {
      if (roleEmailMap[u.role] && u.id.startsWith('USR-')) {
        u.email = roleEmailMap[u.role];
      }
    });
    if (parsed.patients[0]) {
      parsed.patients[0].email = 'patient@gdg.com';
    }
    return parsed;
  } catch (err) {
    console.error('Error loading database, falling back to seed:', err);
    return getInitialSeedData();
  }
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

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

function formatShortNow(): string {
  return formatNow().slice(0, 16);
}

function formatDateOnly(): string {
  return formatNow().slice(0, 10);
}

function generateProfileCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `PRF-${digits}-NG`;
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function verifyPractitionerEligibility(db: DatabaseSchema, actorUserId: string): {
  ok: boolean;
  error?: string;
  user?: User;
  hospital?: Hospital;
} {
  const user = db.users.find((u) => u.id === actorUserId);
  if (!user) {
    return { ok: false, error: 'Healthcare professional profile not found.' };
  }
  if (user.status !== 'ACTIVE') {
    return {
      ok: false,
      error: `Access denied: Practitioner license for ${user.name} is currently SUSPENDED by the Government Administrator.`,
    };
  }
  if (user.hospitalId) {
    const hospital = db.hospitals.find((h) => h.id === user.hospitalId);
    if (!hospital) {
      return { ok: false, error: 'Affiliated healthcare facility not registered.' };
    }
    if (hospital.status !== 'APPROVED') {
      return {
        ok: false,
        error: `Government Oversight Block: ${hospital.name} currently has '${hospital.status}' accreditation status. Only APPROVED facilities can access or modify national EHR records.`,
      };
    }
    return { ok: true, user, hospital };
  }
  return { ok: true, user };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  let db = loadDatabase();
  saveDatabase(db);

  // Hardcoded Demo Authentication Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPass = String(password || '').trim();

    if (normalizedPass !== '123456') {
      res.status(401).json({
        error: 'Invalid password. Use password: 123456',
      });
      return;
    }

    // Match by exact email, or email role keyword, or requested role
    let matchedRole = role as string | undefined;
    if (!matchedRole) {
      if (normalizedEmail.startsWith('patient')) matchedRole = 'PATIENT';
      else if (normalizedEmail.startsWith('doctor') || normalizedEmail.startsWith('dr')) matchedRole = 'DOCTOR';
      else if (normalizedEmail.startsWith('lab')) matchedRole = 'LAB_TECH';
      else if (normalizedEmail.startsWith('admin') || normalizedEmail.startsWith('gov')) matchedRole = 'GOV_ADMIN';
    }

    const user =
      db.users.find((u) => u.email.toLowerCase() === normalizedEmail) ||
      (matchedRole ? db.users.find((u) => u.role === matchedRole) : undefined);

    if (!user) {
      res.status(401).json({
        error: 'Invalid email. Use patient@gdg.com, doctor@gdg.com, lab@gdg.com, or admin@gdg.com.',
      });
      return;
    }

    res.json({ user, state: db });
  });

  // 1. Get Full Application State
  app.get('/api/state', (_req, res) => {
    res.json(db);
  });

  // 2. Reset Demo State
  app.post('/api/reset-demo', (_req, res) => {
    db = getInitialSeedData();
    saveDatabase(db);
    res.json(db);
  });

  // 3. Register a New Patient
  app.post('/api/patients/register', (req, res) => {
    const {
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      genotype,
      phoneNumber,
      email,
      address,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      initialAllergySubstance,
      initialAllergySeverity,
      initialAllergyReaction,
    } = req.body;

    if (!fullName || !phoneNumber) {
      res.status(400).json({ error: 'Full name and registered phone number are required.' });
      return;
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const patientId = `PAT-2026-${randomId}`;
    const profileCode = generateProfileCode();

    const allergies: Allergy[] = [];
    if (initialAllergySubstance && initialAllergySubstance.trim()) {
      allergies.push({
        id: `ALG-${Date.now()}`,
        substance: initialAllergySubstance.trim(),
        category: 'Medication',
        severity: initialAllergySeverity || 'Moderate',
        reaction: initialAllergyReaction || 'Reported during patient registration',
        recordedDate: formatDateOnly(),
        recordedBy: 'Patient Self-Registration Verified',
      });
    }

    const newPatient: PatientRecord = {
      patientId,
      profileCode,
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth || '1990-01-01',
      gender: gender || 'Female',
      bloodGroup: bloodGroup || 'O+',
      genotype: genotype || 'AA',
      phoneNumber: phoneNumber.trim(),
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@citizen.gov.ng`,
      address: address || 'Abuja Municipal Area Council, FCT',
      emergencyContact: {
        name: emergencyContactName || 'Next of Kin',
        relationship: emergencyContactRelation || 'Family',
        phone: emergencyContactPhone || '+234 800 000 0000',
      },
      nationalNin: `NIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-109`,
      allergies,
      consultations: [],
      prescriptions: [],
      labResults: [],
      activeOtp: null,
    };

    const newUser: User = {
      id: `USR-PAT-${Date.now()}`,
      name: newPatient.fullName,
      email: newPatient.email,
      role: 'PATIENT',
      title: 'Registered Citizen Patient',
      patientId: newPatient.patientId,
      status: 'ACTIVE',
    };

    db.patients.unshift(newPatient);
    db.users.push(newUser);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: newUser.id,
      actorName: newPatient.fullName,
      actorRole: 'PATIENT',
      hospitalName: 'National Citizen Portal',
      patientId: newPatient.patientId,
      patientName: newPatient.fullName,
      actionType: 'PATIENT_REGISTERED',
      summary: `Registered centralized EHR profile (${newPatient.patientId}) with initial Profile Code ${newPatient.profileCode}.`,
      ipAddress: '102.89.12.44',
    });

    saveDatabase(db);
    res.json({ patient: newPatient, user: newUser, state: db });
  });

  // 4. Patient Rotates / Generates New Shareable Profile Code
  app.post('/api/patients/:patientId/rotate-code', (req, res) => {
    const { patientId } = req.params;
    const patient = db.patients.find((p) => p.patientId === patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient record not found.' });
      return;
    }

    const oldCode = patient.profileCode;
    const newCode = generateProfileCode();
    patient.profileCode = newCode;
    patient.activeOtp = null;

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: `USR-${patient.patientId}`,
      actorName: patient.fullName,
      actorRole: 'PATIENT',
      hospitalName: 'Citizen Self-Service Portal',
      patientId: patient.patientId,
      patientName: patient.fullName,
      actionType: 'PROFILE_CODE_ROTATED',
      summary: `Patient rotated shareable Profile Code from ${oldCode} to ${newCode}. Previous OTP sessions invalidated.`,
      ipAddress: '102.89.43.11',
    });

    saveDatabase(db);
    res.json({ profileCode: newCode, patient, state: db });
  });

  // 5. Patient Updates Registered Phone Number
  app.patch('/api/patients/:patientId/phone', (req, res) => {
    const { patientId } = req.params;
    const { phoneNumber } = req.body;
    const patient = db.patients.find((p) => p.patientId === patientId);
    if (!patient || !phoneNumber) {
      res.status(400).json({ error: 'Valid patient and phone number required.' });
      return;
    }

    patient.phoneNumber = phoneNumber.trim();
    saveDatabase(db);
    res.json({ patient, state: db });
  });

  // 6. Step 1 of Access Flow: Doctor or Lab Tech Enters Patient Profile Code -> Sends SMS OTP to Patient's Phone
  app.post('/api/access/request-otp', (req, res) => {
    const { codeOrId, actorUserId } = req.body;
    if (!codeOrId || !actorUserId) {
      res.status(400).json({ error: 'Please enter a valid Patient Profile Code or Patient ID.' });
      return;
    }

    const eligibility = verifyPractitionerEligibility(db, actorUserId);
    if (!eligibility.ok || !eligibility.user) {
      res.status(403).json({ error: eligibility.error });
      return;
    }

    const normalized = String(codeOrId).trim().toUpperCase();
    const patient = db.patients.find(
      (p) => p.profileCode.toUpperCase() === normalized || p.patientId.toUpperCase() === normalized
    );

    if (!patient) {
      res.status(404).json({
        error: `No patient found matching Profile Code or ID "${codeOrId}". Verify the code with the patient.`,
      });
      return;
    }

    const otpCode = generateOtpCode();
    const nowMs = Date.now();
    const expiresDate = new Date(nowMs + 10 * 60 * 1000); // 10 minutes validity

    const otpSession: ActiveOtpSession = {
      otpCode,
      profileCodeUsed: patient.profileCode,
      patientId: patient.patientId,
      patientName: patient.fullName,
      phoneNumber: patient.phoneNumber,
      requestedByUserId: eligibility.user.id,
      requestedByName: eligibility.user.name,
      requestedByRole: eligibility.user.role,
      hospitalName: eligibility.hospital?.name || eligibility.user.hospitalName || 'Authorized Facility',
      createdAt: formatNow(),
      expiresAt: expiresDate.toISOString(),
      verified: false,
    };

    patient.activeOtp = otpSession;
    db.latestSmsOtp = otpSession;

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: eligibility.user.id,
      actorName: eligibility.user.name,
      actorRole: eligibility.user.role,
      hospitalName: otpSession.hospitalName,
      patientId: patient.patientId,
      patientName: patient.fullName,
      actionType: 'OTP_REQUESTED',
      summary: `Entered Profile Code (${patient.profileCode}). 6-digit SMS OTP dispatched to patient's registered phone (${patient.phoneNumber}).`,
      ipAddress: '102.89.43.118',
    });

    saveDatabase(db);
    res.json({
      message: `SMS OTP sent to patient's registered phone number (${patient.phoneNumber}).`,
      otpSession,
      patientPreview: {
        patientId: patient.patientId,
        fullName: patient.fullName,
        phoneNumber: patient.phoneNumber,
        profileCode: patient.profileCode,
      },
      state: db,
    });
  });

  // 7. Step 2 of Access Flow: Doctor or Lab Tech Enters 6-Digit SMS OTP to Unlock Record
  app.post('/api/access/verify-otp', (req, res) => {
    const { patientId, otpCode, actorUserId } = req.body;

    const eligibility = verifyPractitionerEligibility(db, actorUserId);
    if (!eligibility.ok || !eligibility.user) {
      res.status(403).json({ error: eligibility.error });
      return;
    }

    const patient = db.patients.find((p) => p.patientId === patientId);
    if (!patient || !patient.activeOtp) {
      res.status(400).json({ error: 'No active OTP session found for this patient. Please request a new OTP.' });
      return;
    }

    if (String(otpCode).trim() !== patient.activeOtp.otpCode) {
      res.status(401).json({ error: 'Invalid 6-digit SMS OTP code. Please check the code sent to the patient’s phone.' });
      return;
    }

    patient.activeOtp.verified = true;
    if (db.latestSmsOtp && db.latestSmsOtp.patientId === patient.patientId) {
      db.latestSmsOtp.verified = true;
    }

    const hospitalName = eligibility.hospital?.name || eligibility.user.hospitalName || 'Authorized Facility';

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: eligibility.user.id,
      actorName: eligibility.user.name,
      actorRole: eligibility.user.role,
      hospitalName,
      patientId: patient.patientId,
      patientName: patient.fullName,
      actionType: 'RECORD_ACCESSED',
      summary: `Verified SMS OTP (${patient.activeOtp.otpCode}) and unlocked full medical record for ${patient.fullName}.`,
      ipAddress: '102.89.43.118',
    });

    saveDatabase(db);
    res.json({
      patient,
      state: db,
    });
  });

  // 8. Doctor Adds Diagnosis, Clinical Note, Vitals & Optional Prescription
  app.post('/api/patients/:patientId/consultations', (req, res) => {
    const { patientId } = req.params;
    const {
      actorUserId,
      visitType,
      chiefComplaint,
      diagnosis,
      icdCode,
      clinicalNotes,
      treatmentPlan,
      vitals,
      prescription,
    } = req.body;

    const eligibility = verifyPractitionerEligibility(db, actorUserId);
    if (!eligibility.ok || !eligibility.user) {
      res.status(403).json({ error: eligibility.error });
      return;
    }
    if (eligibility.user.role !== 'DOCTOR') {
      res.status(403).json({ error: 'Role Permission Denied: Only authorized Doctors can add clinical diagnoses and prescriptions.' });
      return;
    }

    const patient = db.patients.find((p) => p.patientId === patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient record not found.' });
      return;
    }

    if (!diagnosis || !clinicalNotes) {
      res.status(400).json({ error: 'Diagnosis and clinical notes are required.' });
      return;
    }

    const hospitalName = eligibility.hospital?.name || eligibility.user.hospitalName || 'Lagos National Teaching Hospital';

    const newConsultation: Consultation = {
      id: `CONS-${Math.floor(100 + Math.random() * 900)}`,
      date: formatShortNow(),
      hospitalId: eligibility.user.hospitalId || 'HOSP-001',
      hospitalName,
      doctorId: eligibility.user.id,
      doctorName: eligibility.user.name,
      specialty: eligibility.user.specialty || 'Internal Medicine',
      visitType: visitType || 'Outpatient Consultation',
      chiefComplaint: chiefComplaint || 'Clinical evaluation during hospital visit.',
      diagnosis: diagnosis.trim(),
      icdCode: icdCode?.trim() || 'Z00.0',
      clinicalNotes: clinicalNotes.trim(),
      treatmentPlan: treatmentPlan?.trim() || 'Continue supportive management and follow up.',
      vitals: {
        bloodPressure: vitals?.bloodPressure || '128/82 mmHg',
        heartRate: vitals?.heartRate || '76 bpm',
        temperature: vitals?.temperature || '36.8 °C',
        spO2: vitals?.spO2 || '99%',
        weight: vitals?.weight || '68.5 kg',
      },
    };

    patient.consultations.unshift(newConsultation);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: eligibility.user.id,
      actorName: eligibility.user.name,
      actorRole: 'DOCTOR',
      hospitalName,
      patientId: patient.patientId,
      patientName: patient.fullName,
      actionType: 'DIAGNOSIS_ADDED',
      summary: `Added clinical consultation & diagnosis: "${newConsultation.diagnosis}" (ICD-10: ${newConsultation.icdCode}).`,
      ipAddress: '102.89.43.118',
    });

    if (prescription && prescription.medicationName && prescription.medicationName.trim()) {
      const newRx: Prescription = {
        id: `RX-${Math.floor(100 + Math.random() * 900)}`,
        date: formatDateOnly(),
        medicationName: prescription.medicationName.trim(),
        dosage: prescription.dosage?.trim() || '500 mg',
        frequency: prescription.frequency?.trim() || 'Twice daily',
        duration: prescription.duration?.trim() || '14 Days',
        instructions: prescription.instructions?.trim() || 'Take as directed after meals.',
        prescribedBy: eligibility.user.name,
        hospitalName,
        status: 'Active',
      };
      patient.prescriptions.unshift(newRx);

      db.auditLogs.unshift({
        id: `AUD-${Date.now() + 1}`,
        timestamp: formatNow(),
        actorId: eligibility.user.id,
        actorName: eligibility.user.name,
        actorRole: 'DOCTOR',
        hospitalName,
        patientId: patient.patientId,
        patientName: patient.fullName,
        actionType: 'PRESCRIPTION_ADDED',
        summary: `Prescribed ${newRx.medicationName} (${newRx.dosage}, ${newRx.frequency} for ${newRx.duration}).`,
        ipAddress: '102.89.43.118',
      });
    }

    saveDatabase(db);
    res.json({ patient, consultation: newConsultation, state: db });
  });

  // 9. Doctor Adds Allergy Record
  app.post('/api/patients/:patientId/allergies', (req, res) => {
    const { patientId } = req.params;
    const { actorUserId, substance, category, severity, reaction } = req.body;

    const eligibility = verifyPractitionerEligibility(db, actorUserId);
    if (!eligibility.ok || !eligibility.user) {
      res.status(403).json({ error: eligibility.error });
      return;
    }

    const patient = db.patients.find((p) => p.patientId === patientId);
    if (!patient || !substance) {
      res.status(400).json({ error: 'Patient and allergy substance are required.' });
      return;
    }

    const hospitalName = eligibility.hospital?.name || eligibility.user.hospitalName || 'Accredited Hospital';
    const newAllergy: Allergy = {
      id: `ALG-${Math.floor(100 + Math.random() * 900)}`,
      substance: substance.trim(),
      category: category || 'Medication',
      severity: severity || 'Severe',
      reaction: reaction?.trim() || 'Hypersensitivity reaction',
      recordedDate: formatDateOnly(),
      recordedBy: `${eligibility.user.name} (${hospitalName})`,
    };

    patient.allergies.unshift(newAllergy);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: eligibility.user.id,
      actorName: eligibility.user.name,
      actorRole: eligibility.user.role,
      hospitalName,
      patientId: patient.patientId,
      patientName: patient.fullName,
      actionType: 'ALLERGY_ADDED',
      summary: `Documented ${newAllergy.severity} allergy to ${newAllergy.substance}.`,
      ipAddress: '102.89.43.118',
    });

    saveDatabase(db);
    res.json({ patient, state: db });
  });

  // 10. Laboratory Technician Uploads New Lab Result or Completes Pending Investigation
  app.post('/api/patients/:patientId/lab-results', (req, res) => {
    const { patientId } = req.params;
    const {
      actorUserId,
      existingLabId,
      testName,
      category,
      specimen,
      orderedBy,
      parameters,
      clinicalInterpretation,
    } = req.body;

    const eligibility = verifyPractitionerEligibility(db, actorUserId);
    if (!eligibility.ok || !eligibility.user) {
      res.status(403).json({ error: eligibility.error });
      return;
    }
    if (eligibility.user.role !== 'LAB_TECH') {
      res.status(403).json({
        error: 'Role Permission Denied: Only authorized Laboratory Technicians can upload or update diagnostic laboratory reports.',
      });
      return;
    }

    const patient = db.patients.find((p) => p.patientId === patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient record not found.' });
      return;
    }

    const laboratoryName =
      eligibility.hospital?.name || eligibility.user.hospitalName || 'Abuja Central Diagnostics & Research Centre';

    if (existingLabId) {
      const existing = patient.labResults.find((l) => l.id === existingLabId);
      if (existing) {
        existing.date = formatShortNow();
        existing.testName = testName?.trim() || existing.testName;
        existing.category = category || existing.category;
        existing.specimen = specimen?.trim() || existing.specimen;
        existing.uploadedBy = eligibility.user.name;
        existing.laboratoryName = laboratoryName;
        existing.status = 'Completed';
        existing.parameters = Array.isArray(parameters) ? parameters : existing.parameters;
        existing.clinicalInterpretation =
          clinicalInterpretation?.trim() || 'Diagnostic assay verified and released to central EHR.';

        db.auditLogs.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: formatNow(),
          actorId: eligibility.user.id,
          actorName: eligibility.user.name,
          actorRole: 'LAB_TECH',
          hospitalName: laboratoryName,
          patientId: patient.patientId,
          patientName: patient.fullName,
          actionType: 'LAB_RESULT_UPDATED',
          summary: `Completed and uploaded laboratory investigation results for "${existing.testName}" (${existing.id}).`,
          ipAddress: '197.210.76.42',
        });

        saveDatabase(db);
        res.json({ patient, labResult: existing, state: db });
        return;
      }
    }

    if (!testName) {
      res.status(400).json({ error: 'Laboratory test name is required.' });
      return;
    }

    const newLab: LabResult = {
      id: `LAB-${Math.floor(400 + Math.random() * 599)}`,
      date: formatShortNow(),
      testName: testName.trim(),
      category: category || 'Hematology',
      specimen: specimen?.trim() || 'Venous Whole Blood / Serum',
      orderedBy: orderedBy?.trim() || 'Dr. Tunde Adeleke',
      uploadedBy: eligibility.user.name,
      laboratoryName,
      hospitalId: eligibility.user.hospitalId || 'HOSP-002',
      status: 'Completed',
      parameters: Array.isArray(parameters) ? parameters : [],
      clinicalInterpretation:
        clinicalInterpretation?.trim() || 'Quality-assured diagnostic report uploaded to national EHR.',
    };

    patient.labResults.unshift(newLab);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: eligibility.user.id,
      actorName: eligibility.user.name,
      actorRole: 'LAB_TECH',
      hospitalName: laboratoryName,
      patientId: patient.patientId,
      patientName: patient.fullName,
      actionType: 'LAB_RESULT_UPLOADED',
      summary: `Uploaded verified laboratory report: "${newLab.testName}" (${newLab.id}) with ${newLab.parameters.length} assayed parameters.`,
      ipAddress: '197.210.76.42',
    });

    saveDatabase(db);
    res.json({ patient, labResult: newLab, state: db });
  });

  // 11. Government Admin: Approve or Revoke Hospital Access
  app.patch('/api/admin/hospitals/:hospitalId', (req, res) => {
    const { hospitalId } = req.params;
    const { status, actorUserId } = req.body;

    const admin = db.users.find((u) => u.id === actorUserId && u.role === 'GOV_ADMIN');
    if (!admin) {
      res.status(403).json({ error: 'Only Government Administrators can modify hospital accreditation status.' });
      return;
    }

    const hospital = db.hospitals.find((h) => h.id === hospitalId);
    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found.' });
      return;
    }

    hospital.status = status;

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: admin.id,
      actorName: admin.name,
      actorRole: 'GOV_ADMIN',
      hospitalName: 'Federal Ministry of Health & Social Welfare',
      actionType: 'HOSPITAL_STATUS_CHANGED',
      summary: `Changed national EHR accreditation status for ${hospital.name} (${hospital.registrationNumber}) to ${status}.`,
      ipAddress: '41.203.114.9',
    });

    saveDatabase(db);
    res.json({ hospital, state: db });
  });

  // 12. Government Admin: Register New Hospital
  app.post('/api/admin/hospitals', (req, res) => {
    const { name, registrationNumber, location, facilityType, chiefMedicalDirector, actorUserId } = req.body;

    const admin = db.users.find((u) => u.id === actorUserId && u.role === 'GOV_ADMIN');
    if (!admin) {
      res.status(403).json({ error: 'Only Government Administrators can register healthcare facilities.' });
      return;
    }

    if (!name || !location) {
      res.status(400).json({ error: 'Facility name and location are required.' });
      return;
    }

    const newHospital: Hospital = {
      id: `HOSP-00${db.hospitals.length + 1}`,
      name: name.trim(),
      registrationNumber: registrationNumber?.trim() || `FMOH-NGR-${Math.floor(4000 + Math.random() * 5000)}`,
      location: location.trim(),
      facilityType: facilityType || 'General Hospital',
      status: 'APPROVED',
      accreditedDate: formatDateOnly(),
      chiefMedicalDirector: chiefMedicalDirector?.trim() || 'Dr. A. Olanrewaju',
    };

    db.hospitals.unshift(newHospital);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: admin.id,
      actorName: admin.name,
      actorRole: 'GOV_ADMIN',
      hospitalName: 'Federal Ministry of Health & Social Welfare',
      actionType: 'HOSPITAL_REGISTERED',
      summary: `Accredited and onboarded ${newHospital.name} (${newHospital.registrationNumber}) onto the national EHR grid.`,
      ipAddress: '41.203.114.9',
    });

    saveDatabase(db);
    res.json({ hospital: newHospital, state: db });
  });

  // 13. Government Admin: Toggle Practitioner Status (Active / Suspended)
  app.patch('/api/admin/users/:userId', (req, res) => {
    const { userId } = req.params;
    const { status, actorUserId } = req.body;

    const admin = db.users.find((u) => u.id === actorUserId && u.role === 'GOV_ADMIN');
    if (!admin) {
      res.status(403).json({ error: 'Only Government Administrators can modify practitioner authorization.' });
      return;
    }

    const targetUser = db.users.find((u) => u.id === userId);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    targetUser.status = status;

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: admin.id,
      actorName: admin.name,
      actorRole: 'GOV_ADMIN',
      hospitalName: 'Federal Ministry of Health & Social Welfare',
      actionType: 'USER_STATUS_CHANGED',
      summary: `Updated practitioner access status for ${targetUser.name} (${targetUser.licenseNumber || targetUser.role}) to ${status}.`,
      ipAddress: '41.203.114.9',
    });

    saveDatabase(db);
    res.json({ user: targetUser, state: db });
  });

  // 14. Government Admin: Register New Healthcare Professional
  app.post('/api/admin/users', (req, res) => {
    const { name, email, role, title, hospitalId, specialty, licenseNumber, actorUserId } = req.body;

    const admin = db.users.find((u) => u.id === actorUserId && u.role === 'GOV_ADMIN');
    if (!admin) {
      res.status(403).json({ error: 'Only Government Administrators can authorize new practitioners.' });
      return;
    }

    const hospital = db.hospitals.find((h) => h.id === hospitalId) || db.hospitals[0];

    const newUser: User = {
      id: `USR-${role}-${Date.now()}`,
      name: name.trim(),
      email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@health.gov.ng`,
      role: role === 'LAB_TECH' ? 'LAB_TECH' : 'DOCTOR',
      title: title?.trim() || (role === 'LAB_TECH' ? 'Medical Laboratory Scientist' : 'Consultant Physician'),
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      specialty: specialty?.trim() || 'General Medicine',
      licenseNumber: licenseNumber?.trim() || `MDCN/R/${Math.floor(10000 + Math.random() * 89999)}`,
      status: 'ACTIVE',
    };

    db.users.push(newUser);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: formatNow(),
      actorId: admin.id,
      actorName: admin.name,
      actorRole: 'GOV_ADMIN',
      hospitalName: 'Federal Ministry of Health & Social Welfare',
      actionType: 'USER_REGISTERED',
      summary: `Authorized ${newUser.name} (${newUser.role}, License: ${newUser.licenseNumber}) at ${newUser.hospitalName}.`,
      ipAddress: '41.203.114.9',
    });

    saveDatabase(db);
    res.json({ user: newUser, state: db });
  });

  // Mount Vite or Static Build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedGov Central EHR Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
