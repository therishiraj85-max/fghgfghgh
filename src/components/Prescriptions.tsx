/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  PlusCircle, 
  Printer, 
  ChevronRight, 
  X, 
  CheckCircle, 
  Heart, 
  AlertCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Send
} from 'lucide-react';
import { Patient, Medicine, Prescription, PrescriptionMedicine, ClinicSettings } from '../types';
import { formatDate, sendWhatsappReminder, generateId, getRelativeDateString } from '../utils';

interface PrescriptionsProps {
  patients: Patient[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  settings: ClinicSettings;
  onAddPrescription: (prescription: Prescription) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Prescriptions({
  patients,
  medicines,
  prescriptions,
  settings,
  onAddPrescription,
  onNavigateToTab
}: PrescriptionsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'preview'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  // Search Filtered Prescriptions
  const filteredPrescriptions = prescriptions.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.patientName.toLowerCase().includes(q) || (p.diagnosis && p.diagnosis.toLowerCase().includes(q));
  });

  // --- FORM STATES ---
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearchInForm, setPatientSearchInForm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  // Vitals
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [temp, setTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [spo2, setSpo2] = useState('');

  // Diagnosis Details
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [isDiagnosisSuggestionsOpen, setIsDiagnosisSuggestionsOpen] = useState(false);

  const diagnosisSuggestions = [
    'Viral Fever', 
    'UTI (Urinary Tract Infection)', 
    'Hypertension Essentials', 
    'Diabetes Mellitus Follow-up', 
    'Common Cold / Acute Rhinitis',
    'Acute Gastroenteritis',
    'Pharyngitis / Tonsillitis',
    'Acid Peptic Disease (Gerd)',
    'Bronchitis / Asthmatic Spasm',
    'Neuropathy / Vitamin Deficiency'
  ];

  // Medicines Prescription Rows
  const [rxRows, setRxRows] = useState<PrescriptionMedicine[]>([
    { medicineName: '', dose: '1-0-1', duration: '5 days', instructions: 'After food', quantity: '10' }
  ]);

  // Autocomplete state indexed by row index
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [searchTermRow, setSearchTermRow] = useState('');

  // Investigations advised
  const commonTests = [
    'CBC (Complete Blood Count)', 
    'Blood Sugar (Fasting/PP)', 
    'LFT (Liver Function Test)', 
    'KFT (Kidney Function Test)', 
    'Urine R/M', 
    'X-Ray Chest PA View', 
    'ECG (12 Lead)', 
    'Lipid Profile', 
    'Thyroid Profile (T3 T4 TSH)', 
    'HbA1c Glycated Hemoglobin'
  ];
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTest, setCustomTest] = useState('');

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState(getRelativeDateString(7));
  const [followUpReminder, setFollowUpReminder] = useState(true);

  // Validation
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleTestToggle = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter(t => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const addRxRow = () => {
    setRxRows([...rxRows, { medicineName: '', dose: '1-0-1', duration: '5 days', instructions: 'After food', quantity: '10' }]);
  };

  const removeRxRow = (index: number) => {
    if (rxRows.length === 1) return;
    setRxRows(rxRows.filter((_, i) => i !== index));
  };

  const updateRxRow = (index: number, fields: Partial<PrescriptionMedicine>) => {
    const updated = rxRows.map((row, i) => {
      if (i === index) {
        return { ...row, ...fields };
      }
      return row;
    });
    setRxRows(updated);
  };

  // Allergy safety check during Prescription creation
  const getSelectedPatientAllergies = () => {
    if (!selectedPatientId) return [];
    const p = patients.find(item => item.id === selectedPatientId);
    return p ? p.allergies.filter(a => a !== 'None') : [];
  };

  // Submit Prescription Form
  const triggerCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!selectedPatientId) {
      errors.patient = 'Pehle patient select krein (पहले मरीज़ चुनिए)';
    }
    if (!chiefComplaint.trim()) {
      errors.chiefComplaint = 'Chief complaint likhna zaroori hai (शिकायत लिखिए)';
    }
    if (!diagnosis.trim()) {
      errors.diagnosis = 'Sahi diagnosis likhna zaroori hai (रोग का नाम लिखिए)';
    }

    // Verify medicine names entry
    const validRows = rxRows.filter(r => r.medicineName.trim().length > 0);
    if (validRows.length === 0) {
      errors.medicines = 'Kam se kam ek dawai add karein (कम से कम एक दवा लिखिए)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId)!;

    const newPrescription: Prescription = {
      id: generateId('pres'),
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      date: getRelativeDateString(0),
      vitals: bpSystolic || bpDiastolic || pulse || temp || weight || spo2 ? {
        bpSystolic: bpSystolic || '120',
        bpDiastolic: bpDiastolic || '80',
        pulse: pulse || '72',
        temp: temp || '98.4',
        weight: weight || '-',
        spo2: spo2 || '98'
      } : undefined,
      chiefComplaint,
      diagnosis,
      advice,
      medicines: validRows,
      testsAdvised: selectedTests,
      customTest,
      followUpDate,
      followUpReminder
    };

    onAddPrescription(newPrescription);
    
    // Switch preview
    setActivePrescription(newPrescription);
    setViewMode('preview');

    // Trigger WhatsApp Reminder if toggled
    if (followUpReminder) {
      const waMsg = `Namaste ${patient.name} ji, aapka follow-up check-up date ${formatDate(followUpDate)} ko hai. Kripya dhyan rakhein. Healdesk Software - ${settings.doctorName}`;
      sendWhatsappReminder(patient.phone, waMsg);
    }
  };

  const initiateNewPrescriptionSetup = () => {
    setSelectedPatientId('');
    setPatientSearchInForm('');
    setBpSystolic('');
    setBpDiastolic('');
    setPulse('');
    setTemp('');
    setWeight('');
    setSpo2('');
    setChiefComplaint('');
    setDiagnosis('');
    setAdvice('');
    setRxRows([{ medicineName: '', dose: '1-0-1', duration: '5 days', instructions: 'After food', quantity: '10' }]);
    setSelectedTests([]);
    setCustomTest('');
    setFollowUpDate(getRelativeDateString(7));
    setFollowUpReminder(true);
    setFormErrors({});
    setViewMode('create');
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="prescriptions-container">
      {/* 1. LISTING MODE */}
      {viewMode === 'list' && (
        <div className="space-y-6" id="prescriptions-list-view">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Medical Prescriptions (दवाई की पर्ची)</h2>
                <p className="text-xs text-gray-400 mt-1">Review, write, and reprint official prescription pads</p>
              </div>
            </div>

            <button
              id="btn-new-prescription-start"
              onClick={initiateNewPrescriptionSetup}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-sm flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Naya Prescription Likhein</span>
            </button>
          </div>

          {/* Table index search filter */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center space-x-2" id="prescriptions-search-holder">
            <Search className="h-5 w-5 text-gray-400 pl-1" />
            <input
              type="text"
              id="inp-prescription-search"
              placeholder="Patient ka naam ya diagnosis se search krein... (नाम या बीमारी दर्ज करें)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 py-1"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 font-bold p-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5" id="prescriptions-list-panel">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-20 bg-white" id="prescriptions-empty-panel">
                <span className="text-5xl">📄</span>
                <h4 className="font-bold text-gray-700 mt-3 text-lg">Koi prescription history nahi hai!</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Naya prescription likhne ke liye "Naya Prescription Likhein" check check karein.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" id="prescriptions-table-container">
                <table className="w-full text-left border-collapse" id="prescriptions-summary-table">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">ID Ref</th>
                      <th className="py-2.5">Patient Name</th>
                      <th className="py-2.5">Diagnosis Diagnosis</th>
                      <th className="py-2.5">Medications Details</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.map(pr => (
                      <tr key={pr.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all text-sm">
                        <td className="py-3.5 font-bold text-blue-700 pr-2">
                          {formatDate(pr.date)}
                        </td>
                        <td className="py-3.5 text-xs font-mono text-gray-400">
                          {pr.id.split('-')[1]?.toUpperCase() || pr.id}
                        </td>
                        <td className="py-3.5">
                          <div>
                            <span className="font-bold text-gray-900 block">{pr.patientName}</span>
                            <span className="text-[10px] text-gray-400">{pr.patientAge}Y &bull; {pr.patientGender}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {pr.diagnosis}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs text-gray-600 max-w-[200px] truncate">
                          {pr.medicines.map(m => m.medicineName).join(', ')}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            id={`btn-view-pr-${pr.id}`}
                            onClick={() => {
                              setActivePrescription(pr);
                              setViewMode('preview');
                            }}
                            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 border border-gray-200 hover:border-blue-200 rounded-lg py-1.5 px-3 transition-all cursor-pointer"
                          >
                            <span>Open Receipt</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CREATION PRESCRIPTION CLIENT WORKSTATION */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6" id="prescription-create-workspace">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <button
              onClick={() => setViewMode('list')}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Prescription list par lautein</span>
            </button>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold border border-blue-100">OPD Consultation Form</span>
          </div>

          <form onSubmit={triggerCreatePrescription} className="space-y-6" id="prescription-form">
            {/* Section A: Patient Selection dropdown search */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-4 relative">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Section A &bull; Patient Profile Index
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Search Patient <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type patient's name to search..."
                      value={patientSearchInForm}
                      onChange={(e) => {
                        setPatientSearchInForm(e.target.value);
                        setIsPatientDropdownOpen(true);
                        // Clear selected patient if typing free text
                        setSelectedPatientId('');
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>

                  {isPatientDropdownOpen && (
                    <div className="absolute left-0 right-0 top-16 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto z-40">
                      <div className="p-2 border-b border-gray-100 bg-gray-100/50 flex justify-between items-center text-[10px] font-bold text-gray-450 uppercase">
                        <span>Select a Registered Patient</span>
                        <button type="button" onClick={() => setIsPatientDropdownOpen(false)} className="text-gray-400 hover:text-gray-650 p-1">Close</button>
                      </div>
                      {patients
                        .filter(p => p.name.toLowerCase().includes(patientSearchInForm.toLowerCase()) || p.phone.includes(patientSearchInForm))
                        .map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              setPatientSearchInForm(p.name);
                              setIsPatientDropdownOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50/50 cursor-pointer text-xs font-semibold text-gray-800 transition-all border-b border-gray-50 flex justify-between items-center"
                          >
                            <span>{p.name} ({p.gender === 'Female' ? 'F' : 'M'} - {p.age} Yrs)</span>
                            <span className="text-[10px] text-gray-450 font-mono">+91 {p.phone}</span>
                          </div>
                      ))}
                      {patients.filter(p => p.name.toLowerCase().includes(patientSearchInForm.toLowerCase())).length === 0 && (
                        <div className="p-3 text-center text-xs text-gray-500">
                          No matching Patient found. Create them inside <span className="font-bold text-blue-700 hover:underline cursor-pointer" onClick={() => onNavigateToTab('patients')}>Patient Records</span> first.
                        </div>
                      )}
                    </div>
                  )}
                  {formErrors.patient && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.patient}</p>}
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-150 flex items-center justify-between text-xs text-gray-600">
                  {selectedPatientId ? (
                    (() => {
                      const selPat = patients.find(p => p.id === selectedPatientId)!;
                      return (
                        <div className="space-y-1 w-full relative">
                          <p className="font-bold text-gray-900 flex items-center gap-1 text-sm">{selPat.name} ({selPat.age}Yrs/ {selPat.gender})</p>
                          <p className="text-[11px] text-gray-400 font-medium">Phone: +91 {selPat.phone} | Blood: {selPat.bloodGroup}</p>
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {selPat.allergies.filter(x => x !== 'None').map((a, idx) => (
                              <span key={idx} className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 rounded-md border border-red-100 flex items-center gap-0.5 animate-bounce">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                Allergy: {a}
                              </span>
                            ))}
                            {selPat.knownConditions.filter(x => x !== 'None').map((c, idx) => (
                              <span key={idx} className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 rounded-md">
                                Chronic: {c}
                              </span>
                            ))}
                            {selPat.allergies.includes('None') && selPat.knownConditions.includes('None') && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 rounded-md font-semibold">Clean Clinical Log (कोई एलर्जी नहीं)</span>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-400 italic text-center w-full">Choose a patient to check chronic history and safety flags.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section B: Clinical Vitals entry (BP, Pulse, Temp, Weight, SpO2) */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Section B &bull; Patient Vitals (शारीरिक मापदंड)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">BP (Systolic)</label>
                  <input
                    type="number"
                    placeholder="mmHg"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">BP (Diastolic)</label>
                  <input
                    type="number"
                    placeholder="mmHg"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">Pulse (हृदय की गति)</label>
                  <input
                    type="number"
                    placeholder="BPM"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">Temp (तापमान)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="°F"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">Weight (वजन)</label>
                  <input
                    type="number"
                    placeholder="Kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 font-bold mb-1">Oxygen SpO2</label>
                  <input
                    type="number"
                    placeholder="%"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Chief Complaint & Advice Diagnosis */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Section C &bull; History & Assessment (लक्षण और रोग)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Chief Complaint (बीमारी के लक्षण) <span className="text-red-500">*</span></label>
                  <textarea
                    rows={2}
                    id="form-cc"
                    placeholder="Describe main complaints, e.g. High grade fever with headache for 3 days..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                  {formErrors.chiefComplaint && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.chiefComplaint}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Diagnosis / Assessment (रोग की पहचान) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="form-diag"
                    placeholder="Type or click dropdown for common cases..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    onFocus={() => setIsDiagnosisSuggestionsOpen(true)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                  {formErrors.diagnosis && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.diagnosis}</p>}

                  {isDiagnosisSuggestionsOpen && (
                    <div className="absolute left-0 right-0 top-16 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-52 overflow-y-auto mt-1 border-t-2 border-t-blue-500">
                      <div className="flex justify-between items-center p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                        <span>Select Common Diagnosis</span>
                        <button type="button" onClick={() => setIsDiagnosisSuggestionsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">Close</button>
                      </div>
                      {diagnosisSuggestions.map(sug => (
                        <div
                          key={sug}
                          onClick={() => {
                            setDiagnosis(sug);
                            setIsDiagnosisSuggestionsOpen(false);
                          }}
                          className="p-3 text-xs font-semibold hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 text-gray-700 transition-all"
                        >
                          {sug}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Special Advice / Lifestyle Guidelines (महत्वपूर्ण सलाह)</label>
                <input
                  type="text"
                  id="form-advice"
                  placeholder="e.g. Plenty of oral fluids. High dietary fiber. Complete rest for 2 days."
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Section D: Add Medicines Grid form */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-4">
              <div className="flex justify-between items-center pb-1 border-b border-gray-150">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Section D &bull; Medications Grid (दवाइयाँ लिखें)
                </h3>
                <button
                  type="button"
                  onClick={addRxRow}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Nayi Dawai Row Jodein</span>
                </button>
              </div>

              {formErrors.medicines && <p className="text-red-500 text-xs font-bold">{formErrors.medicines}</p>}

              <div className="space-y-3" id="rx-medicines-rows-container">
                {rxRows.map((row, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-white p-3.5 rounded-xl border border-gray-150 relative">
                    
                    {/* Medicine Autocomplete input column */}
                    <div className="md:col-span-4 relative">
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Medicine Name (दवाई)</label>
                      <input
                        type="text"
                        placeholder="Type medicine name to search..."
                        value={row.medicineName}
                        onChange={(e) => {
                          updateRxRow(index, { medicineName: e.target.value });
                          setSearchTermRow(e.target.value);
                          setFocusedRowIndex(index);
                          
                          // Quick check for penicillin alert
                          const selPatAllergies = getSelectedPatientAllergies();
                          if (selPatAllergies.includes('Penicillin') && e.target.value.toLowerCase().includes('amoxicillin')) {
                            // alert is displayed below
                          }
                        }}
                        onFocus={() => {
                          setFocusedRowIndex(index);
                          setSearchTermRow(row.medicineName);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                      />

                      {/* Penicillin allergy alert popup under input */}
                      {getSelectedPatientAllergies().includes('Penicillin') && row.medicineName.toLowerCase().includes('amoxicillin') && (
                        <div className="bg-red-50 text-red-700 text-[10px] font-bold p-1.5 rounded border border-red-200 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                          <span>ALLERGY SHIELD ACTIVE: Patient is allergic to Penicillin! Amoxicillin may conflict.</span>
                        </div>
                      )}

                      {/* Dropdown list */}
                      {focusedRowIndex === index && (
                        <div className="absolute left-0 right-0 top-14 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto mt-1">
                          <div className="p-1 px-2.5 border-b border-gray-100 bg-gray-50 text-[9px] text-gray-405 font-bold flex justify-between items-center">
                            <span>MEDICINE LIST</span>
                            <button type="button" onClick={() => setFocusedRowIndex(null)} className="text-gray-400">Close</button>
                          </div>
                          {medicines
                            .filter(m => m.name.toLowerCase().includes(searchTermRow.toLowerCase()))
                            .slice(0, 8)
                            .map(m => (
                              <div
                                key={m.id}
                                onClick={() => {
                                  updateRxRow(index, { 
                                    medicineName: m.name,
                                    dose: m.commonDose 
                                  });
                                  setFocusedRowIndex(null);
                                }}
                                className="p-2 border-b border-gray-50 text-xs font-semibold hover:bg-blue-50/50 cursor-pointer text-gray-700 font-mono transition-all flex justify-between"
                              >
                                <span>{m.name}</span>
                                <span className="text-[10px] text-gray-400">{m.category}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Dose selector */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Dose (खुराक)</label>
                      <select
                        value={row.dose}
                        onChange={(e) => updateRxRow(index, { dose: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="1-0-1">1-0-1 (Morning & Night)</option>
                        <option value="1-1-1">1-1-1 (Morning / Noon / Night)</option>
                        <option value="0-0-1">0-0-1 (Night Only)</option>
                        <option value="1-0-0">1-0-0 (Morning Only)</option>
                        <option value="0-1-0">0-1-0 (Afternoon Only)</option>
                        <option value="SOS (If needed)">SOS (ज़रूरत पड़ने पर)</option>
                        <option value="Once a week">Once a week (हफ़्ते में एक)</option>
                        <option value="Once a month">Once a month (महीने में एक)</option>
                      </select>
                    </div>

                    {/* Duration selector */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Duration (कितने दिन)</label>
                      <select
                        value={row.duration}
                        onChange={(e) => updateRxRow(index, { duration: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="3 days">3 Days (३ दिन)</option>
                        <option value="5 days">5 Days (५ दिन)</option>
                        <option value="7 days">7 Days (१ हफ़्ता)</option>
                        <option value="10 days">10 Days (१० दिन)</option>
                        <option value="15 days">15 Days (२ हफ़्ते)</option>
                        <option value="1 month">1 Month (१ महीना)</option>
                        <option value="2 months">2 Months (२ महीने)</option>
                        <option value="Continuous">Continuous (चलने दें)</option>
                      </select>
                    </div>

                    {/* Instructions */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Timing (समय)</label>
                      <select
                        value={row.instructions}
                        onChange={(e) => updateRxRow(index, { instructions: e.target.value as any })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="After food">After food (खाने के बाद)</option>
                        <option value="Before food">Before food (खाने से पहले)</option>
                        <option value="Empty stomach">Empty stomach (खाली पेट)</option>
                      </select>
                    </div>

                    {/* Quantity prompt */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Qty (मात्रा)</label>
                      <input
                        type="text"
                        placeholder="10"
                        value={row.quantity}
                        onChange={(e) => updateRxRow(index, { quantity: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs font-semibold outline-none text-center"
                      />
                    </div>

                    {/* Delete row */}
                    <div className="md:col-span-1 flex items-end justify-center pb-1">
                      <button
                        type="button"
                        onClick={() => removeRxRow(index)}
                        disabled={rxRows.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-40 p-1 rounded-md transition-all cursor-pointer"
                        title="Dawai hatayein"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section E: Diagnostic investigations recommended */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Section E &bull; Investigation Tests (जाँच की सलाह)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2" id="pres-tests-checkboxes-grid">
                {commonTests.map(test => {
                  const isChecked = selectedTests.includes(test);
                  return (
                    <button
                      type="button"
                      key={test}
                      onClick={() => handleTestToggle(test)}
                      className={`p-2 border rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-3xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {test}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mt-2 mb-1">Other Lab / Custom Test (कोई अतिरिक्त जाँच)</label>
                <input
                  type="text"
                  placeholder="e.g. USG Abdomen & Pelvis, Serum Creatinine"
                  value={customTest}
                  onChange={(e) => setCustomTest(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Section F: Follow-up setup */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Section F &bull; Review & WhatsApp Sync (फॉलो-अप तारीख)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Review Follow-Up Date (वापस आने की तारीख)</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500 text-gray-700"
                  />
                </div>

                <div className="flex items-center space-x-3.5 bg-white p-4 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="chk-reminder"
                    checked={followUpReminder}
                    onChange={(e) => setFollowUpReminder(e.target.checked)}
                    className="h-4.5 w-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <label id="lbl-reminder" htmlFor="chk-reminder" className="block text-xs font-bold text-gray-800 cursor-pointer">
                      Send WhatsApp reminder
                    </label>
                    <p className="text-[10px] text-gray-400 font-medium">Automatic chat gateway triggers on complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Submit Bottom panel */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="py-2.5 px-4.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Radd karein
              </button>
              <button
                type="submit"
                id="btn-pres-finish"
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center space-x-1 cursor-pointer"
              >
                <CheckCircle className="h-4.5 w-4.5" />
                <span>GENERATE RX PRESCRIPTION SHEET</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. PRINT PREVIEW PAD RENDERING */}
      {viewMode === 'preview' && activePrescription && (
        <div className="space-y-6" id="prescriptions-pad-preview-view">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 noprint">
            <button
              onClick={() => setViewMode('list')}
              className="text-xs font-bold text-gray-500 hover:text-gray-950 flex items-center gap-1 bg-gray-50 hover:bg-gray-100 p-2 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Prescription dashboard par lautein</span>
            </button>

            <div className="flex space-x-2">
              <button
                id="btn-trigger-print"
                onClick={triggerWindowPrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Rx Slip (विंडो प्रिंट)</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8 relative max-w-4xl mx-auto" id="printable-prescription-paper">
            
            {/* Standard letterhead styling matching detailed settings option */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-5" id="rx-letterhead">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-blue-600 uppercase tracking-tight">{settings.clinicName}</h1>
                <p className="text-sm font-bold text-gray-800">{settings.doctorName}</p>
                <p className="text-xs font-medium text-gray-500 max-w-md leading-relaxed">{settings.qualification} &bull; {settings.specialization}</p>
                <p className="text-xs text-gray-400">Reg: {settings.regNo}</p>
              </div>
              <div className="text-right space-y-1 text-xs text-gray-500">
                <p className="font-bold text-gray-700">Phone: {settings.phone}</p>
                <p className="max-w-[240px] leading-relaxed italic">{settings.address}</p>
                <p className="text-[10px] mt-2 font-mono text-gray-400">{settings.timings}</p>
              </div>
            </div>

            {/* Patient identity row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-gray-100 text-xs text-gray-700 bg-gray-50/50 -mx-8 px-8" id="rx-patient-meta">
              <div>
                <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Patient Name</span>
                <span className="font-bold text-gray-900 text-sm">{activePrescription.patientName}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Age / Gender</span>
                <span className="font-bold text-gray-900">{activePrescription.patientAge} Years / {activePrescription.patientGender}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Date of Consultation</span>
                <span className="font-bold text-blue-800 text-[11px]">{formatDate(activePrescription.date)}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Patient Phone</span>
                <span className="font-bold text-gray-900">+91 {activePrescription.patientPhone}</span>
              </div>
            </div>

            {/* Clinical Vitals strip if enabled */}
            {settings.showVitalsOnPrescription && activePrescription.vitals && (
              <div className="py-2.5 px-4 bg-blue-50/50 border border-blue-100/50 rounded-xl my-4 text-xs grid grid-cols-3 sm:grid-cols-6 gap-2" id="rx-vitals-strip">
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">BP (रक्तचाप)</span>
                  <span className="font-extrabold text-blue-900">{activePrescription.vitals.bpSystolic}/{activePrescription.vitals.bpDiastolic} mmHg</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">Pulse</span>
                  <span className="font-bold">{activePrescription.vitals.pulse} bpm</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">Temp</span>
                  <span className="font-bold">{activePrescription.vitals.temp} °F</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">Weight</span>
                  <span className="font-bold">{activePrescription.vitals.weight} Kg</span>
                </div>
                <div>
                  <span className="text-gray-400 uppercase font-bold text-[9px] block">Oxygen (SpO2)</span>
                  <span className="font-bold">{activePrescription.vitals.spo2}%</span>
                </div>
              </div>
            )}

            {/* Rx Content Main Container Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4" id="rx-workspace">
              {/* Left Column (Complaints / Diagnosis / Investigations) (1/3 Width) */}
              <div className="md:col-span-4 border-r border-gray-150 pr-4 space-y-5" id="rx-left-panel">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Chief Symptoms</h3>
                  <p className="text-xs text-gray-700 italic border-l-2 border-gray-250 pl-2 leading-relaxed">{activePrescription.chiefComplaint}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Primary Assessment</h3>
                  <p className="text-xs font-bold text-gray-900 bg-gray-105 p-2 rounded-lg leading-relaxed">{activePrescription.diagnosis}</p>
                </div>

                {/* Investigations advised */}
                {(activePrescription.testsAdvised.length > 0 || activePrescription.customTest) && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Investigations Advised</h3>
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-0.5">
                      {activePrescription.testsAdvised.map((test, index) => (
                        <li key={index} className="font-medium">{test}</li>
                      ))}
                      {activePrescription.customTest && (
                        <li className="font-medium text-blue-800">{activePrescription.customTest}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column (Rx Symbols / Drugs prescribed) (2/3 Width) */}
              <div className="md:col-span-8 flex flex-col justify-between min-h-[300px]" id="rx-right-panel">
                <div className="space-y-4">
                  {/* Rx medical symbol */}
                  <div className="text-3xl font-serif text-blue-600 italic font-black" id="rx-mark">℞</div>
                  
                  {/* Medicine loop */}
                  <div className="space-y-3" id="rx-drugs-list">
                    {activePrescription.medicines.map((m, index) => (
                      <div key={index} className="border-b border-gray-100 pb-2.5 flex justify-between items-start text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-gray-900 font-mono flex items-center gap-1">
                            <span>{index + 1}.</span> 
                            <span>{m.medicineName}</span>
                          </p>
                          <p className="text-gray-400 text-[11px] font-medium pl-4 uppercase">Timing: {m.instructions}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold bg-blue-50 text-blue-700 border border-blue-105 rounded px-2 py-0.5 uppercase block text-[10px] tracking-wide">{m.dose}</span>
                          <span className="text-[10px] text-gray-400 block mt-1">Duration: {m.duration} (Qty: {m.quantity})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Advice line */}
                  {activePrescription.advice && (
                    <div className="mt-6 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50" id="rx-advice-alert">
                      <span className="text-[10px] text-amber-700 font-extrabold uppercase block tracking-wider">Lifestyle Advice / Doctor Instructions</span>
                      <p className="text-xs text-gray-800 mt-0.5 leading-relaxed">{activePrescription.advice}</p>
                    </div>
                  )}
                </div>

                {/* Return review date and Stamp bounds */}
                <div className="flex justify-between items-end border-t border-gray-150 pt-5 mt-10" id="rx-footer">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block">Follow-up check date</span>
                    <span className="text-sm font-bold text-blue-700 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(activePrescription.followUpDate)}
                    </span>
                  </div>

                  {/* Stamp boundaries */}
                  <div className="text-center w-40 h-20 border border-dashed border-gray-200 rounded flex flex-col justify-between p-1.5 bg-gray-50/50" id="rx-signature-stamp-box">
                    <span className="text-[9px] text-gray-400 italic block">Official Seal / Stamp</span>
                    <span className="text-[10px] font-bold text-blue-600 block border-t border-gray-200 pt-1">Medical practitioner sign</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom footer text banner */}
            <div className="text-center border-t border-gray-100 pt-3.5 mt-8 text-[10px] text-gray-400 tracking-wide font-medium leading-relaxed" id="rx-custom-notefooter">
              {settings.customFooterText}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
