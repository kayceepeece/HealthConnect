import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import type { Hospital, LabParameter, PatientRecord, User } from '../types';

interface LabTechViewProps {
  currentLabTech: User;
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
  onDirectSelectAuthorizedPatient: (patient: PatientRecord) => void;
  onUploadLabResult: (
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
  ) => Promise<void>;
  onClosePatientSession: () => void;
}

export const LabTechView: React.FC<LabTechViewProps> = ({
  currentLabTech,
  hospitals,
  allPatients,
  authorizedPatient,
  externalOtpToFill,
  onRequestOtp,
  onVerifyOtp,
  onDirectSelectAuthorizedPatient,
  onUploadLabResult,
  onClosePatientSession,
}) => {
  const primaryPatient = allPatients[0];
  const [codeInput, setCodeInput] = useState(primaryPatient?.profileCode || 'PRF-9042-NG');
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

  // Lab Upload State
  const [selectedExistingLabId, setSelectedExistingLabId] = useState<string>('');
  const [testName, setTestName] = useState('Complete Blood Count (CBC) & Cardiac Troponin-I');
  const [category, setCategory] = useState('Hematology');
  const [specimen, setSpecimen] = useState('Whole Blood (EDTA) + Heparin Plasma');
  const [orderedBy, setOrderedBy] = useState('Dr. Tunde Adeleke');
  const [clinicalInterpretation, setClinicalInterpretation] = useState(
    'Hemoglobin, total leukocyte count, and platelet indices within normal limits. High-sensitivity Cardiac Troponin-I is negative (< 0.01 ng/mL), ruling out acute myocardial injury.'
  );
  const [parameters, setParameters] = useState<LabParameter[]>([
    {
      name: 'Hemoglobin (Hb)',
      value: '13.6',
      unit: 'g/dL',
      referenceRange: '12.0 - 15.5',
      flag: 'Normal',
    },
    {
      name: 'White Blood Cell Count (WBC)',
      value: '6.4',
      unit: '×10³/µL',
      referenceRange: '4.5 - 11.0',
      flag: 'Normal',
    },
    {
      name: 'Platelet Count',
      value: '248',
      unit: '×10³/µL',
      referenceRange: '150 - 400',
      flag: 'Normal',
    },
    {
      name: 'High-Sensitivity Troponin-I',
      value: '0.008',
      unit: 'ng/mL',
      referenceRange: '< 0.040',
      flag: 'Normal',
    },
  ]);

  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [submittingLab, setSubmittingLab] = useState(false);

  useEffect(() => {
    if (externalOtpToFill) {
      setOtpInput(externalOtpToFill);
    }
  }, [externalOtpToFill]);

  useEffect(() => {
    if (authorizedPatient) {
      const pending = authorizedPatient.labResults.find(
        (l) => l.status === 'Pending Investigation'
      );
      if (pending) {
        setSelectedExistingLabId(pending.id);
        setTestName(pending.testName);
        setCategory(pending.category);
        setSpecimen(pending.specimen);
        setOrderedBy(pending.orderedBy);
      } else {
        setSelectedExistingLabId('');
      }
    }
  }, [authorizedPatient]);

  const affiliatedHospital = hospitals.find((h) => h.id === currentLabTech.hospitalId);
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

  const applyLabPreset = (preset: 'cbc' | 'renal' | 'malaria') => {
    if (preset === 'cbc') {
      setTestName('Complete Blood Count (CBC) & Cardiac Troponin-I');
      setCategory('Hematology');
      setSpecimen('Whole Blood (EDTA) + Heparin Plasma');
      setParameters([
        {
          name: 'Hemoglobin (Hb)',
          value: '13.6',
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5',
          flag: 'Normal',
        },
        {
          name: 'White Blood Cell Count (WBC)',
          value: '6.4',
          unit: '×10³/µL',
          referenceRange: '4.5 - 11.0',
          flag: 'Normal',
        },
        {
          name: 'Platelet Count',
          value: '248',
          unit: '×10³/µL',
          referenceRange: '150 - 400',
          flag: 'Normal',
        },
        {
          name: 'High-Sensitivity Troponin-I',
          value: '0.008',
          unit: 'ng/mL',
          referenceRange: '< 0.040',
          flag: 'Normal',
        },
      ]);
      setClinicalInterpretation(
        'Hemoglobin, leukocyte, and platelet parameters within normal range. Cardiac Troponin-I negative (< 0.040 ng/mL).'
      );
    } else if (preset === 'renal') {
      setSelectedExistingLabId('');
      setTestName('Comprehensive Renal & Hepatic Function Panel');
      setCategory('Biochemistry');
      setSpecimen('Lithium Heparin Plasma');
      setParameters([
        {
          name: 'Serum Urea',
          value: '32',
          unit: 'mg/dL',
          referenceRange: '15 - 40',
          flag: 'Normal',
        },
        {
          name: 'Serum Creatinine',
          value: '0.88',
          unit: 'mg/dL',
          referenceRange: '0.60 - 1.10',
          flag: 'Normal',
        },
        {
          name: 'eGFR (CKD-EPI)',
          value: '96',
          unit: 'mL/min/1.73m²',
          referenceRange: '> 90',
          flag: 'Normal',
        },
        {
          name: 'ALT (SGPT)',
          value: '24',
          unit: 'U/L',
          referenceRange: '7 - 56',
          flag: 'Normal',
        },
      ]);
      setClinicalInterpretation(
        'Normal glomerular filtration rate and baseline hepatic transaminases prior to statin therapy.'
      );
    } else {
      setSelectedExistingLabId('');
      setTestName('Glycated Hemoglobin (HbA1c) & Fasting Glucose');
      setCategory('Biochemistry');
      setSpecimen('Whole Blood (EDTA) & Fluoride Oxalate');
      setParameters([
        {
          name: 'HbA1c (IFCC/NGSP)',
          value: '5.8',
          unit: '%',
          referenceRange: '4.0 - 5.6',
          flag: 'High',
        },
        {
          name: 'Fasting Plasma Glucose',
          value: '104',
          unit: 'mg/dL',
          referenceRange: '70 - 99',
          flag: 'High',
        },
      ]);
      setClinicalInterpretation(
        'Mildly elevated HbA1c (5.8%) indicative of borderline impaired glucose tolerance.'
      );
    }
  };

  const handleParameterChange = (index: number, field: keyof LabParameter, value: string) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value as any };
    setParameters(updated);
  };

  const handleAddParameterRow = () => {
    setParameters([
      ...parameters,
      { name: '', value: '', unit: 'mg/dL', referenceRange: '', flag: 'Normal' },
    ]);
  };

  const handleRemoveParameterRow = (index: number) => {
    setParameters(parameters.filter((_, idx) => idx !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizedPatient || !testName.trim()) return;
    setSubmittingLab(true);
    setUploadSuccess(null);
    setAuthError(null);
    try {
      const validParams = parameters.filter((p) => p.name.trim() && p.value.trim());
      await onUploadLabResult(authorizedPatient.patientId, {
        existingLabId: selectedExistingLabId || undefined,
        testName,
        category,
        specimen,
        orderedBy,
        parameters: validParams,
        clinicalInterpretation,
      });

      setUploadSuccess(
        `Uploaded "${testName}" to ${authorizedPatient.fullName}'s central EHR.`
      );
      setSelectedExistingLabId('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to upload laboratory report.');
    } finally {
      setSubmittingLab(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lab Tech Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{currentLabTech.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span className="font-medium text-slate-800">{currentLabTech.hospitalName}</span>
            <span aria-hidden="true">·</span>
            <span>{currentLabTech.specialty}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{currentLabTech.licenseNumber}</span>
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

      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <p className="font-medium">{authError}</p>
        </div>
      )}

      {/* Authorization Step */}
      {!authorizedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Code + OTP Lookup */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Authorize via Profile Code & SMS OTP
              </h2>
            </div>

            <form onSubmit={handleRequestOtpSubmit} className="space-y-3">
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
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Send SMS OTP</span>
                </button>
              </div>
            </form>

            {pendingPatientPreview && (
              <form
                onSubmit={handleVerifyOtpSubmit}
                className="pt-4 border-t border-slate-200 space-y-3"
              >
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-700" />
                    {pendingPatientPreview.fullName} ·{' '}
                    <strong className="font-mono">{pendingPatientPreview.phoneNumber}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(pendingPatientPreview.otpCode)}
                    className="text-teal-700 font-semibold underline cursor-pointer"
                  >
                    Auto-Fill ({pendingPatientPreview.otpCode})
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit SMS OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm font-mono font-bold tracking-widest border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Verify & Open
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Pending Hospital Lab Orders Queue */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Pending Laboratory Queue</h2>
            </div>

            <div className="space-y-3">
              {allPatients.map((p) => {
                const pendingCount = p.labResults.filter(
                  (l) => l.status === 'Pending Investigation'
                ).length;
                return (
                  <div
                    key={p.patientId}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-900">{p.fullName}</p>
                      <p className="font-mono text-slate-500">
                        {p.patientId} · {p.profileCode}
                      </p>
                      <p className="text-amber-800 font-medium">
                        {pendingCount > 0
                          ? `${pendingCount} Pending Investigation`
                          : `${p.labResults.length} Completed`}
                      </p>
                    </div>
                    <button
                      onClick={() => onDirectSelectAuthorizedPatient(p)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Open Record →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Unlocked Lab Upload & Update Console */}
      {authorizedPatient && (
        <div className="space-y-6">
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between text-xs text-green-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                <span className="font-medium">{uploadSuccess}</span>
              </div>
              <button
                onClick={() => setUploadSuccess(null)}
                className="text-green-700 hover:underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Upload / Update Structured Test Report */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Upload or Update Lab Report
                </h2>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyLabPreset('cbc')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md cursor-pointer"
                  >
                    Preset: CBC & Troponin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyLabPreset('renal')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md cursor-pointer"
                  >
                    Preset: Renal/Liver
                  </button>
                  <button
                    type="button"
                    onClick={() => applyLabPreset('malaria')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md cursor-pointer"
                  >
                    Preset: HbA1c
                  </button>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <label className="block font-semibold text-slate-700">Target Record</label>
                  <select
                    value={selectedExistingLabId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedExistingLabId(val);
                      if (val) {
                        const found = authorizedPatient.labResults.find((l) => l.id === val);
                        if (found) {
                          setTestName(found.testName);
                          setCategory(found.category);
                          setSpecimen(found.specimen);
                          setOrderedBy(found.orderedBy);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="">+ Upload New Investigation</option>
                    {authorizedPatient.labResults.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        Update {lab.id}: {lab.testName} ({lab.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Test Name *</label>
                    <input
                      type="text"
                      required
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Hematology">Hematology</option>
                      <option value="Biochemistry">Biochemistry</option>
                      <option value="Microbiology">Microbiology</option>
                      <option value="Immunology">Immunology</option>
                      <option value="Radiology">Radiology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Specimen</label>
                    <input
                      type="text"
                      value={specimen}
                      onChange={(e) => setSpecimen(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ordered By</label>
                    <input
                      type="text"
                      value={orderedBy}
                      onChange={(e) => setOrderedBy(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Parameters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Parameters</span>
                    <button
                      type="button"
                      onClick={handleAddParameterRow}
                      className="text-teal-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600">
                          <th className="py-2 px-2.5">Parameter</th>
                          <th className="py-2 px-2.5">Value</th>
                          <th className="py-2 px-2.5">Unit</th>
                          <th className="py-2 px-2.5">Ref. Range</th>
                          <th className="py-2 px-2.5">Flag</th>
                          <th className="py-2 px-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {parameters.map((param, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5">
                              <input
                                type="text"
                                placeholder="Analyte"
                                value={param.name}
                                onChange={(e) =>
                                  handleParameterChange(idx, 'name', e.target.value)
                                }
                                className="w-full px-2 py-1 border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                placeholder="0.0"
                                value={param.value}
                                onChange={(e) =>
                                  handleParameterChange(idx, 'value', e.target.value)
                                }
                                className="w-20 px-2 py-1 border border-slate-200 rounded font-mono font-bold"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={param.unit}
                                onChange={(e) =>
                                  handleParameterChange(idx, 'unit', e.target.value)
                                }
                                className="w-20 px-2 py-1 border border-slate-200 rounded font-mono"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={param.referenceRange}
                                onChange={(e) =>
                                  handleParameterChange(idx, 'referenceRange', e.target.value)
                                }
                                className="w-24 px-2 py-1 border border-slate-200 rounded font-mono"
                              />
                            </td>
                            <td className="p-1.5">
                              <select
                                value={param.flag}
                                onChange={(e) =>
                                  handleParameterChange(idx, 'flag', e.target.value)
                                }
                                className="px-2 py-1 border border-slate-200 rounded bg-white"
                              >
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Low">Low</option>
                                <option value="Critical">Critical</option>
                              </select>
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveParameterRow(idx)}
                                className="text-slate-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interpretation</label>
                  <textarea
                    rows={2}
                    value={clinicalInterpretation}
                    onChange={(e) => setClinicalInterpretation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLab}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>{submittingLab ? 'Uploading...' : 'Publish Lab Result'}</span>
                </button>
              </form>
            </div>

            {/* Right: Existing Lab Records */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Lab History ({authorizedPatient.labResults.length})
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {authorizedPatient.patientId}
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {authorizedPatient.labResults.map((lab) => (
                  <div
                    key={lab.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500">
                        {lab.id} · {lab.date}
                      </span>
                      <span
                        className={`font-semibold ${
                          lab.status === 'Completed' ? 'text-green-700' : 'text-amber-700'
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{lab.testName}</p>
                    <p className="text-slate-500">
                      {lab.category} · {lab.orderedBy}
                    </p>

                    {lab.parameters.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded p-2.5 space-y-1">
                        {lab.parameters.map((p, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-slate-700">{p.name}</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {p.value} {p.unit}{' '}
                              <span
                                className={
                                  p.flag === 'Normal' ? 'text-green-700' : 'text-amber-700'
                                }
                              >
                                ({p.flag})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-slate-600">{lab.clinicalInterpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
