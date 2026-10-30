import React, { useState, useEffect } from 'react';
import {
  Search,
  KeyRound,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  FileText,
  Pill,
  FlaskConical,
  CheckCircle2,
  Building2,
  Lock,
} from 'lucide-react';
import type { Hospital, PatientRecord, User } from '../types';

interface DoctorViewProps {
  currentDoctor: User;
  hospitals: Hospital[];
  allPatients: PatientRecord[];
  authorizedPatient: PatientRecord | null;
  externalOtpToFill: string;
  onRequestOtp: (codeOrId: string) => Promise<{
    patientId: string;
    fullName: string;
    phoneNumber: string;
    profileCode: string;
    otpCode: string;
  } | null>;
  onVerifyOtp: (patientId: string, otpCode: string) => Promise<PatientRecord | null>;
  onAddConsultation: (
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
  ) => Promise<void>;
  onAddAllergy: (
    patientId: string,
    payload: { substance: string; category: string; severity: string; reaction: string }
  ) => Promise<void>;
  onClosePatientSession: () => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  currentDoctor,
  hospitals,
  allPatients,
  authorizedPatient,
  externalOtpToFill,
  onRequestOtp,
  onVerifyOtp,
  onAddConsultation,
  onAddAllergy,
  onClosePatientSession,
}) => {
  const primaryDemoPatient = allPatients[0];
  const [codeInput, setCodeInput] = useState(primaryDemoPatient?.profileCode || 'PRF-9042-NG');
  const [pendingPatientPreview, setPendingPatientPreview] = useState<{
    patientId: string;
    fullName: string;
    phoneNumber: string;
    profileCode: string;
    otpCode: string;
  } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(false);

  // Clinical Consultation Form State
  const [visitType, setVisitType] = useState('Outpatient Consultation');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [bloodPressure, setBloodPressure] = useState('138/88 mmHg');
  const [heartRate, setHeartRate] = useState('76 bpm');
  const [temperature, setTemperature] = useState('36.8 °C');
  const [spO2, setSpO2] = useState('99%');
  const [weight, setWeight] = useState('68.4 kg');

  // Optional Prescription Form State
  const [includePrescription, setIncludePrescription] = useState(true);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  // Allergy Inline Form
  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [allergySubstance, setAllergySubstance] = useState('');
  const [allergyCategory, setAllergyCategory] = useState('Medication');
  const [allergySeverity, setAllergySeverity] = useState('Severe');
  const [allergyReaction, setAllergyReaction] = useState('');

  const [submitSuccessBanner, setSubmitSuccessBanner] = useState<string | null>(null);
  const [submittingRecord, setSubmittingRecord] = useState(false);

  useEffect(() => {
    if (externalOtpToFill) {
      setOtpInput(externalOtpToFill);
    }
  }, [externalOtpToFill]);

  const affiliatedHospital = hospitals.find((h) => h.id === currentDoctor.hospitalId);
  const isHospitalApproved = !affiliatedHospital || affiliatedHospital.status === 'APPROVED';

  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!codeInput.trim()) return;
    setLoadingStep(true);
    try {
      const preview = await onRequestOtp(codeInput.trim());
      if (preview) {
        setPendingPatientPreview(preview);
        setOtpInput('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Unable to request OTP.');
    } finally {
      setLoadingStep(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPatientPreview || !otpInput.trim()) return;
    setAuthError(null);
    setLoadingStep(true);
    try {
      const unlocked = await onVerifyOtp(pendingPatientPreview.patientId, otpInput.trim());
      if (unlocked) {
        setPendingPatientPreview(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP code.');
    } finally {
      setLoadingStep(false);
    }
  };

  const applyClinicalPreset = (presetType: 'cardio' | 'respiratory') => {
    if (presetType === 'cardio') {
      setVisitType('Follow-up Review');
      setChiefComplaint(
        'Follow-up evaluation of Stage 1 Hypertension and borderline elevated LDL cholesterol.'
      );
      setDiagnosis('Hypertensive Heart Disease without Heart Failure & Mixed Hyperlipidemia');
      setIcdCode('I11.9 / E78.2');
      setClinicalNotes(
        'Patient reports improved morning headache frequency on Amlodipine 5mg. Reviewed Abuja Central Diagnostics lipid assay (LDL 136 mg/dL). Checked central allergy registry: avoided beta-lactam and sulfonamide agents. Added low-dose statin therapy and ordered baseline CBC + Troponin-I check.'
      );
      setTreatmentPlan(
        'Continue Amlodipine 5mg OD. Initiate Atorvastatin 10mg nocte. Review CBC & Troponin-I lab results upon upload.'
      );
      setBloodPressure('132/84 mmHg');
      setHeartRate('74 bpm');
      setIncludePrescription(true);
      setMedicationName('Atorvastatin Calcium');
      setDosage('10 mg');
      setFrequency('Once daily at night (Nocte)');
      setDuration('90 Days');
      setInstructions('Take in the evening. Avoid grapefruit juice.');
    } else {
      setVisitType('Outpatient Consultation');
      setChiefComplaint('Productive cough, mild chest tightness, and low-grade fever for 4 days.');
      setDiagnosis('Acute Lower Respiratory Tract Infection (Non-pneumonic)');
      setIcdCode('J20.9');
      setClinicalNotes(
        'Bilateral vesicular breath sounds with scattered rhonchi. SpO2 98% on room air. Due to severe Penicillin allergy on central EHR, prescribed macrolide antibiotic (Azithromycin) instead of Amoxicillin-Clavulanate.'
      );
      setTreatmentPlan('Azithromycin 500mg OD for 3 days + steam inhalation and hydration.');
      setBloodPressure('126/80 mmHg');
      setHeartRate('84 bpm');
      setTemperature('37.6 °C');
      setIncludePrescription(true);
      setMedicationName('Azithromycin Dihydrate');
      setDosage('500 mg');
      setFrequency('Once daily');
      setDuration('3 Days');
      setInstructions('Take 1 hour before or 2 hours after meals.');
    }
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizedPatient || !diagnosis.trim() || !clinicalNotes.trim()) return;
    setSubmittingRecord(true);
    setSubmitSuccessBanner(null);
    try {
      await onAddConsultation(authorizedPatient.patientId, {
        visitType,
        chiefComplaint,
        diagnosis,
        icdCode: icdCode || 'I10',
        clinicalNotes,
        treatmentPlan,
        vitals: {
          bloodPressure,
          heartRate,
          temperature,
          spO2,
          weight,
        },
        prescription:
          includePrescription && medicationName.trim()
            ? {
                medicationName,
                dosage,
                frequency,
                duration,
                instructions,
              }
            : undefined,
      });

      setSubmitSuccessBanner(
        `Saved "${diagnosis}" ${
          includePrescription && medicationName ? `and "${medicationName}" ` : ''
        }to ${authorizedPatient.fullName}'s health record.`
      );
      setChiefComplaint('');
      setDiagnosis('');
      setIcdCode('');
      setClinicalNotes('');
      setTreatmentPlan('');
      setMedicationName('');
      setDosage('');
      setFrequency('');
      setDuration('');
      setInstructions('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to save clinical record.');
    } finally {
      setSubmittingRecord(false);
    }
  };

  const handleAllergySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizedPatient || !allergySubstance.trim()) return;
    await onAddAllergy(authorizedPatient.patientId, {
      substance: allergySubstance,
      category: allergyCategory,
      severity: allergySeverity,
      reaction: allergyReaction,
    });
    setAllergySubstance('');
    setAllergyReaction('');
    setShowAllergyForm(false);
    setSubmitSuccessBanner(`Documented allergy (${allergySubstance}).`);
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{currentDoctor.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span className="font-medium text-slate-800">{currentDoctor.hospitalName}</span>
            <span aria-hidden="true">·</span>
            <span>{currentDoctor.specialty}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{currentDoctor.licenseNumber}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-semibold ${
                isHospitalApproved ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {affiliatedHospital?.status || 'APPROVED'}
            </span>
          </div>
        </div>

        {authorizedPatient && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-green-700 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {authorizedPatient.fullName}
            </span>
            <button
              onClick={onClosePatientSession}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Close Record
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <p className="font-medium">{authError}</p>
        </div>
      )}

      {/* Authorization Step */}
      {!authorizedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step 1: Profile Code */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                01. Enter Patient Profile Code
              </h2>
            </div>

            <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Profile Code or Patient ID"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingStep}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{loadingStep ? 'Sending...' : 'Send SMS OTP'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {allPatients.map((p) => (
                  <button
                    key={p.patientId}
                    type="button"
                    onClick={() => setCodeInput(p.profileCode)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-600 rounded-md text-xs text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="font-semibold">{p.fullName}</span>
                    <span className="font-mono text-teal-700 font-bold">{p.profileCode}</span>
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Step 2: SMS OTP */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">02. Verify 6-Digit SMS OTP</h2>
            </div>

            {!pendingPatientPreview ? (
              <div className="py-8 text-center space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-6">
                <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-500">
                  Awaiting Profile Code submission
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="bg-teal-50/70 border border-teal-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-teal-900">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>
                      {pendingPatientPreview.fullName} ·{' '}
                      <strong className="font-mono">{pendingPatientPreview.phoneNumber}</strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(pendingPatientPreview.otpCode)}
                    className="font-medium text-teal-700 hover:underline cursor-pointer"
                  >
                    Auto-Fill ({pendingPatientPreview.otpCode})
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-base font-mono font-bold tracking-widest border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                  <button
                    type="submit"
                    disabled={loadingStep}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Unlock Record</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Unlocked Patient Record & Clinical Entry */}
      {authorizedPatient && (
        <div className="space-y-6">
          {submitSuccessBanner && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between text-xs text-green-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                <span className="font-medium">{submitSuccessBanner}</span>
              </div>
              <button
                onClick={() => setSubmitSuccessBanner(null)}
                className="text-green-700 hover:underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Patient Summary & Allergies */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{authorizedPatient.fullName}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="font-mono font-semibold text-teal-700">
                    {authorizedPatient.patientId}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>DOB: {authorizedPatient.dateOfBirth}</span>
                  <span aria-hidden="true">·</span>
                  <span>{authorizedPatient.gender}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-900">
                    Blood: {authorizedPatient.bloodGroup} ({authorizedPatient.genotype})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowAllergyForm(!showAllergyForm)}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 self-start cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                <span>+ Add Allergy</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-red-800 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                Allergies ({authorizedPatient.allergies.length}):
              </span>
              {authorizedPatient.allergies.map((alg) => (
                <span
                  key={alg.id}
                  className="bg-red-50 border border-red-200 text-red-900 px-3 py-1 rounded-md"
                >
                  <strong>{alg.substance}</strong> ({alg.severity} — {alg.reaction})
                </span>
              ))}
            </div>

            {showAllergyForm && (
              <form
                onSubmit={handleAllergySubmit}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
              >
                <input
                  type="text"
                  required
                  placeholder="Substance (e.g. Ibuprofen)"
                  value={allergySubstance}
                  onChange={(e) => setAllergySubstance(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <select
                  value={allergySeverity}
                  onChange={(e) => setAllergySeverity(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
                <input
                  type="text"
                  placeholder="Reaction"
                  value={allergyReaction}
                  onChange={(e) => setAllergyReaction(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg cursor-pointer"
                >
                  Save Allergy
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Add Diagnosis, Clinical Note & Prescription */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Add Diagnosis, Note & Prescription
                </h3>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyClinicalPreset('cardio')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Preset: Cardio
                  </button>
                  <button
                    type="button"
                    onClick={() => applyClinicalPreset('respiratory')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Preset: Respiratory
                  </button>
                </div>
              </div>

              <form onSubmit={handleConsultationSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Diagnosis *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hypertensive Heart Disease"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ICD-10</label>
                    <input
                      type="text"
                      placeholder="I11.9"
                      value={icdCode}
                      onChange={(e) => setIcdCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Visit Type</label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Outpatient Consultation">Outpatient Consultation</option>
                      <option value="Follow-up Review">Follow-up Review</option>
                      <option value="Emergency Admission">Emergency Admission</option>
                      <option value="Specialist Referral">Specialist Referral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Chief Complaint
                    </label>
                    <input
                      type="text"
                      placeholder="Presenting symptoms"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                {/* Vitals */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <span className="font-semibold text-slate-700 block">Vital Signs</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">BP</label>
                      <input
                        type="text"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Heart Rate</label>
                      <input
                        type="text"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Temp</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">SpO2</label>
                      <input
                        type="text"
                        value={spO2}
                        onChange={(e) => setSpO2(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Weight</label>
                      <input
                        type="text"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clinical Notes *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Examination findings and clinical assessment..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treatment Plan</label>
                  <input
                    type="text"
                    placeholder="Management and follow-up plan"
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>

                {/* Prescription */}
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePrescription}
                      onChange={(e) => setIncludePrescription(e.target.checked)}
                      className="rounded border-slate-300 text-teal-700"
                    />
                    <span>Add Prescription</span>
                  </label>

                  {includePrescription && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">
                            Medication
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Atorvastatin Calcium"
                            value={medicationName}
                            onChange={(e) => setMedicationName(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Dosage</label>
                          <input
                            type="text"
                            placeholder="10 mg"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Frequency</label>
                          <input
                            type="text"
                            placeholder="Once daily"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Duration</label>
                          <input
                            type="text"
                            placeholder="30 Days"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          placeholder="Take after evening meal"
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingRecord}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{submittingRecord ? 'Saving...' : 'Save to Central EHR'}</span>
                </button>
              </form>
            </div>

            {/* Right: Medical History */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Previous Consultations ({authorizedPatient.consultations.length})
                  </h3>
                </div>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {authorizedPatient.consultations.map((cons) => (
                    <div
                      key={cons.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-mono text-slate-500">{cons.date}</span>
                        <span className="font-medium text-teal-700">{cons.hospitalName}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {cons.diagnosis}{' '}
                        <span className="font-mono font-normal text-xs text-slate-500">
                          ({cons.icdCode})
                        </span>
                      </p>
                      <p className="text-slate-600 leading-relaxed">{cons.clinicalNotes}</p>
                      <div className="pt-1 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                        <span>{cons.doctorName}</span>
                        <span className="font-mono">
                          BP: {cons.vitals.bloodPressure} · HR: {cons.vitals.heartRate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Pill className="w-4 h-4 text-teal-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Prescriptions & Lab Results
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  {authorizedPatient.prescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{rx.medicationName}</span>{' '}
                        <span className="font-mono text-slate-600">({rx.dosage})</span>
                        <p className="text-slate-500">
                          {rx.frequency} · {rx.duration} · {rx.prescribedBy}
                        </p>
                      </div>
                      <span className="font-semibold text-teal-700">{rx.status}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2.5 text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
                    Lab Reports ({authorizedPatient.labResults.length})
                  </span>
                  {authorizedPatient.labResults.map((lab) => (
                    <div
                      key={lab.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{lab.testName}</span>
                        <span
                          className={`font-semibold ${
                            lab.status === 'Completed' ? 'text-green-700' : 'text-amber-700'
                          }`}
                        >
                          {lab.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{lab.clinicalInterpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
