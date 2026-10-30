# MedGov Central — National Electronic Health Record (EHR) Platform

MedGov Central is a centralized, government-governed Electronic Health Record (EHR) platform that unifies patient medical histories across accredited hospitals while giving citizens transparent control over who accesses their health data through a Profile Code and SMS OTP verification workflow.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions incorporate your confirmed preferences from our clarification step and optimize the platform for a seamless end-to-end live hackathon demonstration.

- **Confirmed Decision 1 — Instant Role Switching & Demo Login Cards**: Users can log in via dedicated one-click role cards on the portal landing screen (or register a new Patient profile), and seamlessly switch between **Patient**, **Doctor**, **Laboratory Technician**, and **Government Administrator** at any time via a persistent Demo Role Switcher bar without losing session context.
- **Confirmed Decision 2 — Profile Code + Registered Phone SMS OTP Authorization**: Patients have a unique **Patient ID** and a shareable **Profile Code** tied to their registered phone number. When a Doctor or Lab Technician enters the Patient's Profile Code, the backend dispatches a time-limited 6-digit **SMS OTP** to the patient's registered phone number. To make the live demonstration frictionless on a single screen, a simulated **Live SMS Notification Drawer / Virtual Phone Toast** displays the incoming SMS OTP with a one-click copy/fill action alongside the Patient Dashboard's active OTP view.
- **Confirmed Decision 3 — Zero-Config Express + Persistent Local Datastore**: An Express API server integrated with Vite persists all patients, hospitals, healthcare professionals, clinical consultations, lab reports, OTP sessions, and audit logs to a local disk database seeded with realistic multi-hospital clinical records.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces fragmented hospital silos with a single national health record. Patients view their complete medical history, diagnoses, prescriptions, allergies, lab investigations, and hospital visits, and see an immutable log of every healthcare professional who accessed or updated their file. Accredited doctors and lab technicians request access using the patient's Profile Code, verify authorization via the SMS OTP sent to the patient's phone, and append new clinical diagnoses, prescriptions, or laboratory results in real time. Government administrators oversee hospital accreditation, verify practitioner licenses, and audit nationwide data access.
- **Target Audience / Persona**:
  1. **Patients**: Citizens managing their longitudinal health records and authorizing clinical access during hospital visits.
  2. **Doctors**: Attending physicians at participating hospitals reviewing prior history and recording diagnoses, clinical notes, and prescriptions.
  3. **Laboratory Technicians**: Diagnostic specialists retrieving authorized records and uploading structured lab test results and clinical reference ranges.
  4. **Government Administrators**: Ministry of Health regulators approving or revoking hospital participation, managing practitioner credentials, and inspecting security audit trails.
- **Key Value**: Eliminates repeat diagnostic testing and dangerous prescription conflicts across hospitals while enforcing strict patient consent, role-based write permissions, and government regulatory oversight.

---

## 2. User Experience & Visual Design

### Key User Flows (8-Step End-to-End Hackathon Demonstration)

1. **Patient Login & Longitudinal Dashboard**: The Patient selects their demo card (or logs in/registers) and views their unified health summary: vital allergies, active prescriptions, chronological consultations across multiple hospitals, laboratory investigation reports, and recent access history.
2. **Profile Code Retrieval & Management**: The Patient views or regenerates their shareable **Profile Code** (e.g., `PRF-9042-NG`) and verifies their registered phone number (`+234 803 555 0192`).
3. **Doctor Profile Code Entry & SMS OTP Trigger**: Switching to the **Doctor** role via the top demo bar, the physician enters the patient's Profile Code (`PRF-9042-NG`) and clicks **Request Patient OTP**. The platform triggers an SMS OTP to the patient's registered phone number (visibly surfaced via a realistic simulated SMS notification banner and in the Patient's portal).
4. **OTP Verification & Medical History Retrieval**: The Doctor enters the 6-digit SMS OTP sent to the patient's phone. Upon verification, the patient's complete cross-hospital medical history unlocks, and an `"ACCESS_GRANTED"` event is recorded in the audit log.
5. **Doctor Adds Diagnosis, Clinical Note & Prescription**: The Doctor submits a new consultation entry including ICD-10 diagnosis, clinical examination notes, treatment plan, and prescribed medication with dosage.
6. **Lab Technician Authorizes & Uploads Lab Result**: Switching to the **Laboratory Technician** role, the technician authorizes access (or uses active facility lab order authorization), selects the pending investigation or creates a new test report (e.g., Complete Blood Count / Lipid Panel with measured values, units, reference ranges, and status flags), and submits the report.
7. **Patient Refreshes Dashboard & Inspects Transparency Log**: Switching back to the **Patient** role, the dashboard immediately reflects the Doctor's new diagnosis/prescription and the Lab Technician's uploaded test results, along with timestamped entries in the **Who Accessed My Record** transparency log.
8. **Government Administrator Oversight**: Switching to the **Government Administrator** role, the regulator inspects registered hospitals (approving or revoking hospital platform access — where revoking a hospital immediately blocks its practitioners from requesting patient records), manages healthcare professionals, and filters the real-time national audit trail.

### Visual Identity & Theme

- **Aesthetic Direction**: Institutional Clinical Precision — inspired by modern national digital health portals and high-density clinical SaaS workspaces. Clean, trustworthy, high-contrast surfaces with zero visual clutter.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - **60% Dominant Neutral Canvas**: Crisp Alabaster White (`#F8FAFC` / `bg-slate-50`) workspace background with pure white (`#FFFFFF`) primary data surfaces.
  - **30% Structural Surfaces & Typography**: Deep Slate Ink (`#0F172A` / `text-slate-900`) for primary headings and clinical prose, Muted Slate (`#475569` / `text-slate-600`) for labels, and 1px hairline borders (`#E2E8F0` / `border-slate-200`).
  - **10% Semantic & Action Accents**:
    - Primary Clinical Trust Accent: Deep Medical Teal (`#0F766E` / `bg-teal-700`, hover `bg-teal-800`) for primary CTAs and active navigation states.
    - Verified / Normal Range: Clinical Emerald (`#15803D` / `text-green-700`) always paired with explicit text labels and check icons.
    - Warning / Pending OTP / Abnormal Lab Flag: Amber (`#B45309` / `text-amber-700`).
    - Critical Allergy / Revoked Facility / High Alert: Crimson (`#B91C1C` / `text-red-700`).
- **Typography & Hierarchy (2+1 Font Rule)**:
  - **Display & Navigation Face**: `Plus Jakarta Sans` (SemiBold 600 / Bold 700) for institutional headers, section titles, and patient names with `text-wrap: balance`.
  - **Body & Clinical Notes**: `Public Sans` (Regular 400 / Medium 500) for high-legibility medical narratives, prescription instructions, and form controls.
  - **Monospace & Tabular Data**: `JetBrains Mono` with `tabular-nums` strictly enforced for Patient IDs, Profile Codes, 6-digit SMS OTP inputs, timestamps, laboratory numerical results, and audit log hashes.
- **Component Styling & Spatial Math**:
  - **Desktop Workspace Architecture**: Full-viewport 1440px layout featuring a fixed-width left navigation sidebar (`260px`), a streamlined single-row top header bar following the 3-zone contract, and a structured main content canvas.
  - **Interactive Demo Role Switcher**: A dedicated, high-visibility top utility bar allowing instant 1-click switching between the 4 demo personas (**Patient: Amara Okafor**, **Doctor: Dr. Tunde Vance**, **Lab Tech: Elena Rostova**, **Gov Admin: Director K. Mensah**) plus a simulated **SMS Inbox Notification Toast** whenever an OTP is dispatched to a patient's phone.
  - **Single-Elevation Depth & Zero-Pill Metadata**: Flat clinical panels with `1px solid` hairline borders (`border-slate-200`). Static metadata (dates, hospital names, department categories, ICD codes) rendered as clean unboxed inline text separated by middle dots (`·`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Two-Step Profile Code + Simulated SMS OTP Flow**
  - *Chosen Approach*: When a clinician enters the patient's shareable Profile Code, the server generates a 6-digit OTP bound to that patient's registered phone number and clinician session, and pushes a simulated SMS toast notification on-screen containing the OTP code and a one-click **"Paste OTP"** button.
  - *Why*: Faithfully demonstrates real-world 2FA patient consent over SMS without requiring external telecom API keys or physical phone dependency during a live 30-minute hackathon presentation.
  - *Alternatives Considered*: Static access codes (less secure, doesn't reflect the requested SMS OTP flow) or real Twilio SMS (requires external credentials and delays demo).
- **Decision 2: Strict Role-Based & Facility-Based Enforcement on the Backend**
  - *Chosen Approach*: Every API mutation checks both the active user's role (`DOCTOR` for diagnoses/prescriptions, `LAB_TECH` for lab reports, `GOV_ADMIN` for facility/user governance) and verifies that the practitioner's affiliated hospital currently has `"APPROVED"` government status.
  - *Why*: Proves that government oversight is functionally enforced in the architecture—if the Government Admin revokes a hospital's accreditation, doctors at that hospital are immediately blocked from accessing or modifying patient records.
- **Decision 3: Unified Full-Stack Express + Disk-Backed JSON Store**
  - *Chosen Approach*: Express API routes mounted directly inside the Vite dev/production server persisting state atomically to a local JSON database file with automatic initial seeding and a one-click **"Reset Demo Data"** control.
  - *Why*: Zero external cloud setup latency, survives browser refreshes, supports cross-role state updates immediately, and guarantees 100% reliability during live judging.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   DEMO CONTROL & SMS OTP NOTIFICATION BAR                    │
│  [Role Switcher: Patient | Doctor | Lab Tech | Gov Admin]  [Live SMS Toast]  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────────────┐
│                         REACT FRONTEND WORKSPACE                             │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Patient Portal  │  │  Doctor Console  │  │ Lab Console  │  │Gov Admin │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤  ├──────────┤  │
│  │• Health Summary  │  │• Profile Code In │  │• Code + OTP  │  │• Hospital│  │
│  │• Profile Code &  │  │• SMS OTP Verify  │  │  Verification│  │  Approval│  │
│  │  Phone Settings  │  │• Patient History │  │• Upload Lab  │  │• Medical │  │
│  │• Diagnoses, Rx,  │  │• Add Diagnosis,  │  │  Test Report │  │  Staff   │  │
│  │  & Lab Results   │  │  Clinical Note & │  │• Update Test │  │  Registry│  │
│  │• Access & Audit  │  │  Prescription    │  │  Status &    │  │• National│  │
│  │  Transparency    │  │  Form            │  │  Values      │  │  Audit   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  └────┬─────┘  │
└───────────┼─────────────────────┼───────────────────┼───────────────┼────────┘
            │                     │ REST API (/api/*) │               │
┌───────────▼─────────────────────▼───────────────────▼───────────────▼────────┐
│                     EXPRESS BACKEND & RBAC MIDDLEWARE                        │
│  • Auth & Role Guard (Patient / Doctor / Lab Tech / Gov Admin)               │
│  • Hospital Accreditation Validator (Blocks revoked facilities)              │
│  • OTP Generator & Verification Engine (Profile Code -> Phone SMS OTP)       │
│  • Automatic Audit Trail Logger (Captures Actor, Role, Hospital, Action)     │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────────────┐
│                 PERSISTENT LOCAL DATABASE (Disk-Backed Store)                │
│  [Users & Staff]  [Hospitals]  [Patients & Medical Records]  [Audit Logs]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Hospitals (`Hospital`)**: `id`, `name`, `registrationNumber`, `location`, `type` (`Teaching Hospital`, `General Hospital`, `Diagnostic Center`), `status` (`APPROVED` | `REVOKED` | `PENDING`), `accreditedAt`.
- **Healthcare Users (`User`)**: `id`, `name`, `email`, `role` (`PATIENT` | `DOCTOR` | `LAB_TECH` | `GOV_ADMIN`), `hospitalId` (for clinicians), `specialty` / `licenseNumber`, `status` (`ACTIVE` | `SUSPENDED`), `patientId` (if role is `PATIENT`).
- **Patient Record (`PatientRecord`)**:
  - Core Identity: `patientId` (e.g., `PAT-2026-0891`), `fullName`, `dateOfBirth`, `gender`, `bloodGroup`, `genotype`, `phoneNumber`, `emergencyContact`, `profileCode` (e.g., `PRF-8841`).
  - Pending OTP Session: `activeOtp` (`code`, `requestedByUserId`, `requestedByName`, `requestedByRole`, `hospitalName`, `phoneNumber`, `expiresAt`).
  - Clinical Arrays:
    - `allergies`: `id`, `substance`, `severity` (`Mild` | `Moderate` | `Severe`), `reaction`, `recordedBy`.
    - `consultations` (Diagnoses, Clinical Notes & Hospital Visits): `id`, `date`, `hospitalName`, `doctorName`, `specialty`, `diagnosis`, `icdCode`, `clinicalNotes`, `treatmentPlan`, `vitalSigns` (`bp`, `heartRate`, `temp`).
    - `prescriptions`: `id`, `date`, `medicationName`, `dosage`, `frequency`, `duration`, `prescribedBy`, `hospitalName`, `status` (`Active` | `Completed`).
    - `labResults`: `id`, `date`, `testName`, `category` (`Hematology`, `Biochemistry`, `Microbiology`, `Imaging`), `parameters` (array of `name`, `value`, `unit`, `referenceRange`, `flag`: `Normal` | `High` | `Low`), `summaryReport`, `uploadedBy`, `laboratoryName`, `status` (`Completed` | `Pending`).
- **Audit Trail (`AuditLog`)**: `id`, `timestamp`, `actorId`, `actorName`, `actorRole`, `hospitalName`, `patientId`, `patientName`, `actionType` (`OTP_REQUESTED`, `RECORD_ACCESSED`, `DIAGNOSIS_ADDED`, `PRESCRIPTION_ADDED`, `LAB_RESULT_UPLOADED`, `PROFILE_CODE_ROTATED`, `HOSPITAL_STATUS_CHANGED`, `USER_STATUS_CHANGED`), `details`.

### Interactive Component & State Mapping

- **Portal Landing & Role Switcher**:
  - Renders 4 instant-login persona cards + a `"Register New Patient"` modal form (`fullName`, `dateOfBirth`, `gender`, `bloodGroup`, `phoneNumber`, `allergies`).
  - Persistent top demo switcher updates `currentUser` and immediately fetches the latest synchronized server state.
- **Patient Dashboard**:
  - **Access & Security Panel**: Displays `patientId`, registered `phoneNumber` (editable), and current `profileCode` with a **"Generate New Profile Code"** button (`POST /api/patients/:id/rotate-code`) that invalidates previous codes and logs the rotation.
  - **Active OTP Alert Banner**: When a doctor or lab tech inputs the patient's Profile Code, an interactive alert shows the 6-digit OTP sent to their phone, who requested it, and which hospital they belong to.
  - **Medical Record Tabs**: Interactive segmented controls for *Overview & Visits*, *Diagnoses & Clinical Notes*, *Prescriptions*, *Laboratory Results*, and *Access & Audit Log* (`Who Accessed My Record`).
- **Doctor Clinical Workspace**:
  - **Patient Lookup & Authorization**: Input field for **Patient Profile Code** (or Patient ID) + quick-fill demo button. Submitting calls `POST /api/access/request-otp`, which validates that the Doctor's hospital is `APPROVED`, generates a 6-digit OTP for the patient's registered phone number, triggers the simulated SMS toast, and transitions the UI to the **Enter 6-Digit SMS OTP** step.
  - **OTP Verification**: Submitting the 6-digit OTP (`POST /api/access/verify-otp`) unlocks the patient's full medical record and appends a `RECORD_ACCESSED` audit entry.
  - **Add Consultation & Prescription Form**: Validated form allowing the Doctor to add a diagnosis, ICD-10 code, vitals, clinical notes, treatment plan, and optional prescription medication(s) in a single or separate submission (`POST /api/patients/:id/consultations`). Also allows adding a new documented allergy.
- **Laboratory Technician Workspace**:
  - **Patient Authorization**: Uses the same Profile Code -> SMS OTP verification flow (or selects from active authorized patients in the current session) to unlock the patient's record.
  - **Upload Lab Result Form**: Structured form (`POST /api/patients/:id/lab-results`) to upload a new test report (with quick templates like *Complete Blood Count*, *Comprehensive Metabolic Panel*, or *Malaria Parasite & Widal* plus custom parameter rows) or update an existing pending investigation to `Completed`.
- **Government Administrator Console**:
  - **Hospitals & Facilities Directory**: Filterable table of hospitals with one-click **Approve** / **Revoke Access** actions (`PATCH /api/admin/hospitals/:id`) and an **"Add New Facility"** modal.
  - **Authorized Professionals Registry**: Manage doctors and lab technicians, toggle their authorization status (`Active` / `Suspended`), or register a new practitioner.
  - **National Audit & Oversight Log**: Real-time searchable table of every access request, OTP verification, record update, and administrative action across the platform.
