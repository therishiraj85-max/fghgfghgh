/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  Calendar, 
  User, 
  Phone, 
  Edit, 
  Printer, 
  ChevronRight, 
  ChevronDown, 
  AlertTriangle, 
  ShieldAlert,
  ClipboardList,
  HeartPulse,
  Mail,
  MapPin
} from 'lucide-react';
import { Patient, Prescription, Bill } from '../types';
import { formatDate } from '../utils';

interface PatientRecordsProps {
  patients: Patient[];
  prescriptions: Prescription[];
  bills: Bill[];
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onUpdatePatient: (patient: Patient) => void;
}

export default function PatientRecords({
  patients,
  prescriptions,
  bills,
  onAddPatient,
  onUpdatePatient
}: PatientRecordsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPatientId, setEditPatientId] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['None']);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['None']);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const allergiesList = ['Penicillin', 'Sulfa', 'Aspirin', 'Latex', 'None'];
  const conditionsList = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'None'];

  const handleAllergiesToggle = (item: string) => {
    if (item === 'None') {
      setSelectedAllergies(['None']);
    } else {
      let filtered = selectedAllergies.filter(x => x !== 'None');
      if (filtered.includes(item)) {
        filtered = filtered.filter(x => x !== item);
        if (filtered.length === 0) filtered = ['None'];
      } else {
        filtered.push(item);
      }
      setSelectedAllergies(filtered);
    }
  };

  const handleConditionsToggle = (item: string) => {
    if (item === 'None') {
      setSelectedConditions(['None']);
    } else {
      let filtered = selectedConditions.filter(x => x !== 'None');
      if (filtered.includes(item)) {
        filtered = filtered.filter(x => x !== item);
        if (filtered.length === 0) filtered = ['None'];
      } else {
        filtered.push(item);
      }
      setSelectedConditions(filtered);
    }
  };

  const openAddModal = () => {
    setName('');
    setAge('');
    setDob('');
    setGender('Male');
    setBloodGroup('O+');
    setPhone('');
    setAddress('');
    setEmergencyContact('');
    setSelectedAllergies(['None']);
    setSelectedConditions(['None']);
    setFormErrors({});
    setIsEditing(false);
    setShowAddModal(true);
  };

  const openEditModal = (p: Patient) => {
    setName(p.name);
    setAge(p.age.toString());
    setDob(p.dob);
    setGender(p.gender);
    setBloodGroup(p.bloodGroup);
    setPhone(p.phone);
    setAddress(p.address);
    setEmergencyContact(p.emergencyContact);
    setSelectedAllergies(p.allergies.length > 0 ? p.allergies : ['None']);
    setSelectedConditions(p.knownConditions.length > 0 ? p.knownConditions : ['None']);
    setFormErrors({});
    setIsEditing(true);
    setEditPatientId(p.id);
    setShowAddModal(true);
  };

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Naam likhna zaroori hai (नाम लिखना आवश्यक है)';
    if (!age || isNaN(Number(age)) || Number(age) <= 0) errs.age = 'Umar sahi likhein (सही उम्र लिखिए)';
    if (!phone || phone.replace(/[^0-9]/g, '').length !== 10) errs.phone = 'Dus anko ka phone number daalein (10 अंकों का फ़ोन नंबर लिखिए)';
    if (!address.trim()) errs.address = 'Pata likhna zaroori hai (पता लिखना आवश्यक है)';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const patientData = {
      name,
      age: Number(age),
      dob: dob || '1990-01-01',
      gender,
      bloodGroup,
      phone,
      address,
      emergencyContact,
      allergies: selectedAllergies,
      knownConditions: selectedConditions
    };

    if (isEditing) {
      onUpdatePatient({ id: editPatientId, ...patientData });
    } else {
      onAddPatient(patientData);
    }

    setShowAddModal(false);
  };

  // Filtered patients list
  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  const handlePrintPatientCard = (p: Patient) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const patientPrescriptions = prescriptions.filter(pr => pr.patientId === p.id);
    const patientBills = bills.filter(b => b.patientId === p.id);

    printWindow.document.write(`
      <html>
        <head>
          <title>${p.name} - Case File</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
            .header { border-bottom: 2px solid #1A6BB5; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .badge { display: inline-block; background-color: #E2E8F0; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: bold; margin-right: 5px; }
            .badge-danger { background-color: #FED7D7; color: #9B2C2C; }
            .badge-warning { background-color: #FEEBC8; color: #9C4221; }
            .section-title { font-size: 16px; font-weight: bold; color: #1A6BB5; background: #EBF8FF; padding: 6px 12px; margin-top: 25px; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #E2E8F0; padding: 8px 10px; text-align: left; }
            th { bg-color: #EDF2F7; }
            .patient-meta { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .meta-group { margin-bottom: 4px; font-size: 13px; }
            .meta-label { font-weight: bold; color: #718096; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; color: #1A6BB5; font-size: 24px;">Healdesk Healthcare</h1>
              <p style="margin: 3px 0 0 0; font-size: 12.5px; color: #666;">Official Patient Electronic Health Record (EHR)</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #AAA;">Printed on: ${new Date().toLocaleDateString('en-IN')}</div>
          </div>

          <h2 style="border-bottom: 1px solid #CCC; padding-bottom: 5px; margin-top: 0; font-size: 18px;">PATIENT IDENTITY CARD</h2>
          
          <div class="patient-meta">
            <div>
              <div class="meta-group"><span class="meta-label">ID Reference:</span> ${p.id}</div>
              <div class="meta-group"><span class="meta-label">Full Name:</span> ${p.name}</div>
              <div class="meta-group"><span class="meta-label">Age / Gender:</span> ${p.age} Yrs / ${p.gender}</div>
              <div class="meta-group"><span class="meta-label">Blood Group:</span> ${p.bloodGroup}</div>
              <div class="meta-group"><span class="meta-label">Date of Birth:</span> ${formatDate(p.dob)}</div>
            </div>
            <div>
              <div class="meta-group"><span class="meta-label">Mobile Number:</span> +91 ${p.phone}</div>
              <div class="meta-group"><span class="meta-label">Home Address:</span> ${p.address}</div>
              <div class="meta-group"><span class="meta-label">Emergency Contact:</span> ${p.emergencyContact}</div>
              <div class="meta-group">
                <span class="meta-label">Known Allergies:</span> 
                ${p.allergies.map(a => `<span class="badge ${a !== 'None' ? 'badge-danger' : ''}">${a}</span>`).join('')}
              </div>
              <div class="meta-group">
                <span class="meta-label">Chronic Illness:</span> 
                ${p.knownConditions.map(c => `<span class="badge ${c !== 'None' ? 'badge-warning' : ''}">${c}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="section-title">PRESCRIPTION CONSULTATION LOGS (${patientPrescriptions.length})</div>
          ${patientPrescriptions.length === 0 ? '<p style="font-size: 12px; color: #777;">No prescriptions stored in database.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chief Complaint & Diagnosis</th>
                  <th>Advised Medicines</th>
                  <th>Tests Recommended</th>
                </tr>
              </thead>
              <tbody>
                ${patientPrescriptions.map(pr => `
                  <tr>
                    <td>${formatDate(pr.date)}</td>
                    <td>
                      <strong>Complaint:</strong> ${pr.chiefComplaint}<br/>
                      <strong>Diagnosis:</strong> ${pr.diagnosis}
                    </td>
                    <td>
                      ${pr.medicines.map(m => `&bull; ${m.medicineName} (${m.dose} x ${m.duration}) - ${m.instructions}`).join('<br/>')}
                    </td>
                    <td>${pr.testsAdvised.join(', ') || 'None'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <div class="section-title">BILLING & SETTLE RECEIPTS (${patientBills.length})</div>
          ${patientBills.length === 0 ? '<p style="font-size: 12px; color: #777;">No invoice records stored in database.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Details / Services</th>
                  <th>Settle Mode</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${patientBills.map(b => `
                  <tr>
                    <td>${b.id.toUpperCase().split('-')[2] || b.id}</td>
                    <td>${formatDate(b.date)}</td>
                    <td>${b.services.map(s => `${s.name} (₹${s.amount})`).join(', ')}</td>
                    <td>${b.paymentMode}</td>
                    <td><strong>₹${b.totalAmount}</strong></td>
                    <td style="font-weight: bold; color: ${b.status === 'Paid' ? '#0F9B6E' : '#C53030'};">${b.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #EEE; padding-top: 15px;">
            This is an electronic summary of health data. Healdesk Software &bull; Aapka Clinic, Aapki Marzi.
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6" id="patient-records-container">
      {/* Header with quick count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100" id="patient-header">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Patient Records Database (मरीज़ का इतिहास)</h2>
            <p className="text-xs text-gray-400 mt-1">Search, modify and print comprehensive medical profiles</p>
          </div>
        </div>

        <button
          id="btn-add-patient-main"
          onClick={openAddModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-sm flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Patient Add Karein</span>
        </button>
      </div>

      {/* Filter search widget */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 flex items-center space-x-2" id="patient-search-holder">
        <Search className="h-5 w-5 text-gray-400 pl-1" />
        <input
          type="text"
          id="inp-patient-search"
          placeholder="Naam ya phone number se search krein... (नाम या फ़ोन नंबर दर्ज करें)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 py-1"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Patient rows loop */}
      <div className="grid grid-cols-1 gap-4" id="patient-records-grid">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100" id="patients-empty-state">
            <span className="text-5xl">🔍</span>
            <h4 className="font-bold text-gray-700 mt-3 text-lg">Koi Patient nahi mila!</h4>
            <p className="text-xs text-gray-400 mt-1">Check spelling or create a new profile card above.</p>
          </div>
        ) : (
          filteredPatients.map(p => {
            const isExpanded = expandedPatientId === p.id;
            const patientPrescriptions = prescriptions.filter(pr => pr.patientId === p.id);
            const patientBills = bills.filter(b => b.patientId === p.id);
            const alertCount = (p.allergies.filter(a => a !== 'None').length) + (p.knownConditions.filter(c => c !== 'None').length);

            return (
              <div 
                key={p.id} 
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-blue-300 shadow-md ring-2 ring-blue-50' : 'border-gray-100 hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Accordion Trigger Head */}
                <div 
                  id={`patient-hdr-${p.id}`}
                  onClick={() => setExpandedPatientId(isExpanded ? null : p.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start space-x-4">
                    <div className="h-11 w-11 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-gray-900 text-base">{p.name}</h3>
                        <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          {p.age} yrs &bull; {p.gender}
                        </span>
                        {alertCount > 0 && (
                          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 flex items-center gap-0.5">
                            <ShieldAlert className="h-3 w-3 inline text-red-500" />
                            {alertCount} Risk
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>+91 {p.phone}</span>
                        <span className="text-gray-300 mx-1">|</span>
                        <HeartPulse className="h-3 w-3 text-gray-400" />
                        <span>Blood: {p.bloodGroup}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Visits Registered</p>
                      <p className="text-sm font-bold text-gray-900">{patientPrescriptions.length} consultations</p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400 hidden sm:block" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/40 animate-fadeIn space-y-6 pt-5" id={`patient-expansion-${p.id}`}>
                    {/* Patient Profile Sub Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-100">
                      <div>
                        <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">Primary Information</h4>
                        <ul className="text-xs space-y-2 text-gray-700">
                          <li><strong>Date of Birth (DOB):</strong> {formatDate(p.dob)}</li>
                          <li><strong>Address:</strong> {p.address}</li>
                          <li><strong>Emergency Contact:</strong> {p.emergencyContact || 'Not Specified'}</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">Allergies & Known Comorbidities</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">ALLERGIES</span>
                            <div className="flex flex-wrap gap-1">
                              {p.allergies.map((al, idx) => (
                                <span 
                                  key={idx} 
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                    al !== 'None' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-650'
                                  }`}
                                >
                                  {al}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">CHRONIC CONDITIONS</span>
                            <div className="flex flex-wrap gap-1">
                              {p.knownConditions.map((cond, idx) => (
                                <span 
                                  key={idx} 
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                    cond !== 'None' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-650'
                                  }`}
                                >
                                  {cond}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visit History Logs */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Consultation Prescriptions ({patientPrescriptions.length})</h4>
                      {patientPrescriptions.length === 0 ? (
                        <p className="text-xs text-gray-500 py-3 text-center border-2 border-dashed border-gray-150 rounded-xl bg-white">Is mariz ka koi past consultation history nahi mila.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {patientPrescriptions.map(pr => (
                            <div key={pr.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3">
                              <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                                <span className="text-xs font-bold text-blue-700">{formatDate(pr.date)}</span>
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-extrabold">{pr.diagnosis}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700">
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Vitals Given</span>
                                  {pr.vitals ? (
                                    <p className="leading-relaxed mt-0.5 font-medium">BP: {pr.vitals.bpSystolic}/{pr.vitals.bpDiastolic} &bull; SpO2: {pr.vitals.spo2}%</p>
                                  ) : "None registered"}
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Medicines Administered</span>
                                  <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                                    {pr.medicines.map((m, idx) => (
                                      <li key={idx} className="font-semibold text-gray-800">
                                        {m.medicineName} ({m.dose}) - <span className="text-gray-500 font-normal">{m.duration} [{m.instructions}]</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* billing History Logs */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Financial Invoices & Billings ({patientBills.length})</h4>
                      {patientBills.length === 0 ? (
                        <p className="text-xs text-gray-500 py-3 text-center border-2 border-dashed border-gray-150 rounded-xl bg-white">Is mariz ka koi billing ledger nahi hai.</p>
                      ) : (
                        <div className="space-y-2">
                          {patientBills.map(b => (
                            <div key={b.id} className="bg-white py-2.5 px-4 rounded-xl border border-gray-100 flex items-center justify-between">
                              <div className="text-xs">
                                <span className="text-[10px] text-gray-400 block font-bold">{formatDate(b.date)} &bull; MID: {b.id.toUpperCase().split('-')[2] || 'BILL'}</span>
                                <span className="font-bold text-gray-800">{b.services.map(s => s.name).join(', ')}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-gray-900 block">₹{b.totalAmount}</span>
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                  b.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Panel Trigger Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        id={`btn-edit-patient-${p.id}`}
                        onClick={() => openEditModal(p)}
                        className="py-1.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-all border border-blue-100 cursor-pointer"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit Details (बदलाव करें)</span>
                      </button>

                      <button
                        id={`btn-print-card-${p.id}`}
                        onClick={() => handlePrintPatientCard(p)}
                        className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print Case File (पर्चा खोलें)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Patient Modal Backdrop Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="patient-modal-backdrop">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" id="patient-modal-card">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-gray-950 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                {isEditing ? 'Change Patient Record (जानकारी सुधारें)' : 'New Patient File Registration (नया मरीज़)'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" id="patient-record-form">
              {/* Primary Identity Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider border-b border-blue-50 pb-1">1. Full Patient Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Patient's Name (पूरा नाम) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="form-pat-name"
                      placeholder="e.g. Anand Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Mobile Number (फ़ोन) <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      id="form-pat-phone"
                      placeholder="10-digit phone"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Age (उम्र) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id="form-pat-age"
                      placeholder="e.g. 32"
                      value={age}
                      onChange={(e) => {
                        setAge(e.target.value);
                        // Approximate DOB
                        if (e.target.value && !isNaN(Number(e.target.value))) {
                          const year = new Date().getFullYear() - Number(e.target.value);
                          setDob(`${year}-01-01`);
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                    {formErrors.age && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Date of Birth (DOB)</label>
                    <input
                      type="date"
                      id="form-pat-dob"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        // Compute age
                        if (e.target.value) {
                          const ageCalc = new Date().getFullYear() - new Date(e.target.value).getFullYear();
                          setAge(ageCalc.toString());
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Blood Group</label>
                    <select
                      id="form-pat-blood"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Home Address (पता) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="form-pat-address"
                      placeholder="e.g. Shop 5, Near Main Market"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                    {formErrors.address && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Gender (लिंग)</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Male', 'Female', 'Other'] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2 px-1 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                            gender === g 
                              ? 'border-blue-600 bg-blue-50 text-blue-700' 
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-105 text-gray-600'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Emergency Contact Info (आपातकालीन संपर्क)</label>
                    <input
                      type="text"
                      id="form-pat-emergency"
                      placeholder="e.g. Sita Devi (Wife) - 9876543209"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Checklist Info */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider border-b border-blue-50 pb-1">2. Medical Context Checklists</h4>
                
                {/* Allergies checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Drug Allergies (दवाइयों से आपत्ति / एलर्जी)</label>
                  <div className="flex flex-wrap gap-2">
                    {allergiesList.map(item => {
                      const isChecked = selectedAllergies.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => handleAllergiesToggle(item)}
                          className={`py-2 px-3.5 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            isChecked
                              ? 'border-red-600 bg-red-50 text-red-800'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chronic conditions */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase font-mono">Chronic History / Comorbidities (पुरानी बीमारी इतिहास)</label>
                  <div className="flex flex-wrap gap-2">
                    {conditionsList.map(item => {
                      const isChecked = selectedConditions.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => handleConditionsToggle(item)}
                          className={`py-2 px-3.5 border rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            isChecked
                              ? 'border-amber-600 bg-amber-50 text-amber-800'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Confirm form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Radd Karein
                </button>
                <button
                  type="submit"
                  id="btn-confirm-submit-patient"
                  className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
                >
                  {isEditing ? 'Update Records' : 'Naya Record Save Karein'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
