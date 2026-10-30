# HealthConnect — Centralized Electronic Health Record (EHR) Platform

[![Live App](https://img.shields.io/badge/Live%20Application-medgov--central--ehr.ai.studio-0284c7?style=for-the-badge&logo=google-cloud)](https://medgov-central-ehr.ai.studio)
[![Platform](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Express-teal?style=for-the-badge)](https://medgov-central-ehr.ai.studio)
[![Governance](https://img.shields.io/badge/Oversight-Federal%20Ministry%20of%20Health-navy?style=for-the-badge)](https://medgov-central-ehr.ai.studio)

> **Published URL:** [https://medgov-central-ehr.ai.studio](https://medgov-central-ehr.ai.studio)  
> **Development Environment:** Port 3000 (`tsx server.ts` + Vite Express Middleware)

---

## Executive Overview

**HealthConnect** is a government-governed national healthcare platform designed to eliminate isolated hospital silos by consolidating medical histories into a single, patient-owned Electronic Health Record (EHR).

Each registered citizen holds a unique **Patient ID** and a dynamic, revocable **Profile Access Code**. When presenting at any participating or accredited hospital, healthcare professionals request access using this code, triggering a secure **SMS One-Time Password (OTP)** to the patient’s registered mobile device. No medical records can be viewed or appended without cryptographic, verified patient consent.

---

## Live Demo Credentials

All test roles are pre-configured with autofill buttons available directly on the landing page and authentication modal:

| Role | Demo Email | Password | Associated Organization / Facility |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@gdg.com` | `123456` | Citizen (Amara Okafor · Patient ID: `HC-PAT-2024-001`) |
| **Doctor** | `doctor@gdg.com` | `123456` | National Hospital Abuja (Cardiology) |
| **Lab Technician** | `lab@gdg.com` | `123456` | Synlab Diagnostics Center (Biochemistry) |
| **Government Admin** | `admin@gdg.com` | `123456` | Federal Ministry of Health & Social Welfare |

> **Note on Navigation & Security:** Clicking any role tab in the top navigation bar requires authentication with the respective role credentials, demonstrating role separation and access control.

---

## 8-Step Complete Patient Journey

HealthConnect demonstrates a complete, uninterrupted patient journey:

1. **Patient Login & Identity Verification**
   - Patient logs in with `patient@gdg.com` / `123456`.
   - Views their unified medical passport, clinical timeline, active prescriptions, recorded allergies, and dynamic **Profile Access Code** (`PRF-9042-NG`).
2. **Access Code Delegation**
   - When arriving at a medical facility, the patient shares their **Profile Access Code** with the attending physician.
3. **Provider Access Request & SMS OTP Dispatch**
   - Attending physician logs in with `doctor@gdg.com` / `123456`.
   - Doctor inputs the patient's Profile Code (`PRF-9042-NG`) or Patient ID.
   - The platform verifies hospital accreditation and clinician status, and generates a time-limited 6-digit SMS OTP sent to the patient's phone (`+234 803 555 0192`).
4. **Patient Consent Verification**
   - The patient receives the OTP (visible on screen in the **Simulated SMS Drawer** in the bottom-right corner).
   - The doctor inputs the 6-digit OTP to unlock patient record access.
5. **Clinical Encounter & Consultation Note**
   - The doctor reviews previous medical history, diagnoses, and allergies.
   - Doctor adds a new clinical note, diagnosis (e.g., *Essential Hypertension Stage 1*), and digital prescription with dosage instructions.
6. **Laboratory Investigation & Result Upload**
   - Diagnostic technician logs in with `lab@gdg.com` / `123456`.
   - Technician authorizes via the patient's code and uploads certified laboratory findings (e.g., Comprehensive Metabolic Panel, HbA1c, or Lipid Panel) with reference ranges and notes.
7. **Patient Real-Time Transparency & Access Logs**
   - Patient returns to their dashboard to instantly see the new diagnosis, prescription, and lab report.
   - Patient inspects the **Access Log** showing exact timestamps, practitioner identity, facility name, and action performed.
8. **Government Oversight & Audit Trail**
   - Ministry administrator logs in with `admin@gdg.com` / `123456`.
   - Administrator oversees hospital accreditations (can approve, suspend, or reactivate facilities in real-time).
   - Administrator reviews platform-wide tamper-evident audit logs and practitioner licenses.

---

## Core System Architecture

### 1. Dual-Mode Persistence Architecture
- **Express Backend:** Persistent disk storage via `data/ehr-database.json` managing users, hospitals, patients, consultations, lab investigations, and audit trails.
- **Client Fallback:** Embedded client-side `localStorage` data engine (`src/seedData.ts`) ensuring 100% resilience across static deploy links, container recycles, or cross-domain instances.

### 2. Zero-Trust Security & Patient Ownership
- **2-Factor Authorization:** Patient Profile Code + SMS One-Time Password prevents unauthorized record snooping.
- **Role-Based Access Control (RBAC):** Strict boundaries ensure only licensed physicians can write clinical notes and only accredited lab technicians can record diagnostic findings.
- **Real-Time Audit Trail:** Every single record query, consultation addition, lab upload, and admin intervention is recorded in an immutable audit ledger.

### 3. Design Philosophy
- **Healthcare-Optimized UX:** High contrast, legible typography (`Plus Jakarta Sans` and `JetBrains Mono`), clear priority hierarchies, and zero UI fluff.
- **Layout-Driven Communication:** Adheres to the core rule: *"Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining."*

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons
- **Backend:** Node.js, Express, TSX runner
- **Persistence:** Local JSON disk database (`data/ehr-database.json`) + client-side `localStorage` state sync
- **Branding:** Official HealthConnect gradient emblem and two-tone wordmark assets

---

## Local Development & Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### Installation & Run

```bash
# Clone or open repository
cd applet

# Install dependencies
npm install

# Start development server (serves backend + frontend on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build for Production

```bash
# Compile and verify types
npm run build

# Start production server
npm start
```

---

## Platform Summary

| Metric | Detail |
| :--- | :--- |
| **System Name** | HealthConnect (MedGov Central EHR) |
| **Production URL** | [https://medgov-central-ehr.ai.studio](https://medgov-central-ehr.ai.studio) |
| **Supported Roles** | Patient, Doctor, Laboratory Technician, Government Administrator |
| **Consent Mechanism** | Profile Access Code + 6-Digit SMS OTP |
| **Data Sovereignty** | Unified Government Health Database with Patient Ownership |
