/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Play, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  UserCheck, 
  X, 
  RotateCcw,
  Search,
  ChevronDown
} from 'lucide-react';
import { Patient, OpdEntry } from '../types';
import { getRelativeDateString } from '../utils';

interface OpdQueueProps {
  patients: Patient[];
  opdQueue: OpdEntry[];
  onAddPatientToQueue: (patientData: {
    patientId: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    chiefComplaint: string;
  }) => void;
  onCallNext: () => void;
  onMarkDone: (id: string) => void;
  onRemoveFromQueue: (id: string) => void;
  onResetQueue: () => void;
}

export default function OpdQueue({
  patients,
  opdQueue,
  onAddPatientToQueue,
  onCallNext,
  onMarkDone,
  onRemoveFromQueue,
  onResetQueue
}: OpdQueueProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Custom form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Patient quick-select handles
  const handleSelectPatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    
    if (pId === 'new') {
      setName('');
      setAge('');
      setGender('Male');
      setPhone('');
      setErrors({});
    } else {
      const p = patients.find(item => item.id === pId);
      if (p) {
        setName(p.name);
        setAge(p.age.toString());
        setGender(p.gender);
        setPhone(p.phone);
        setErrors({});
      }
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Naam daalna zaroori hai (नाम लिखना आवश्यक है)';
    }

    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      newErrors.age = 'Sahi umar daalo (सही उम्र डालिए)';
    }

    if (!phone || phone.replace(/[^0-9]/g, '').length !== 10) {
      newErrors.phone = 'Sahi 10-digit mobile number daalein (10 अंकों का नंबर डालिए)';
    }

    if (!chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'Main complaint likhein (मुख्य समस्या लिखिए)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call submit
    onAddPatientToQueue({
      patientId: selectedPatientId && selectedPatientId !== 'new' ? selectedPatientId : '',
      name,
      age: Number(age),
      gender,
      phone,
      chiefComplaint
    });

    // Reset Form
    setName('');
    setAge('');
    setGender('Male');
    setPhone('');
    setChiefComplaint('');
    setSelectedPatientId('');
    setErrors({});
    setShowAddForm(false);
  };

  // Compute stats
  const activeEntries = opdQueue.filter(entry => entry.status !== 'Done');
  const doneEntries = opdQueue.filter(entry => entry.status === 'Done');
  const waitingCount = opdQueue.filter(entry => entry.status === 'Waiting').length;
  const activeConsulting = opdQueue.find(entry => entry.status === 'In Consultation');

  // Compute average waiting time (done patients wait from checkInTime to consultStartTime)
  const averageWaitTime = () => {
    const elapsedTimes = opdQueue
      .filter(e => e.status === 'Done' || e.status === 'In Consultation')
      .map(e => {
        const start = new Date(e.checkInTime).getTime();
        const end = e.consultStartTime ? new Date(e.consultStartTime).getTime() : Date.now();
        return Math.floor((end - start) / 60000);
      });
    
    if (elapsedTimes.length === 0) return 15; // fallback baseline wait time
    const sum = elapsedTimes.reduce((s, val) => s + val, 0);
    return Math.max(Math.floor(sum / elapsedTimes.length), 3);
  };

  return (
    <div className="space-y-6" id="opd-queue-container">
      {/* OPD KPI header banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" id="opd-stats-banner">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Today's OPD Queue (आज की कतार)</h2>
            <p className="text-xs text-gray-400 mt-1">
              Token counter & queue manager. Reset daily.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:flex md:items-center" id="opd-banner-metrics">
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-center md:text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Total today</span>
            <span className="text-lg font-bold text-gray-900">{opdQueue.length}</span>
          </div>
          <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl px-4 py-2 text-center md:text-left">
            <span className="text-[10px] text-amber-600 font-bold uppercase block tracking-wider">Waiting</span>
            <span className="text-lg font-bold text-amber-700">{waitingCount}</span>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl px-4 py-2 text-center md:text-left">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block tracking-wider">Avg Wait</span>
            <span className="text-lg font-bold text-emerald-700">{averageWaitTime()}m</span>
          </div>
        </div>
      </div>

      {/* Primary Actions control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4" id="opd-queue-controls">
        <div className="flex items-center space-x-2">
          {!showAddForm && (
            <button 
              id="btn-opd-show-add"
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 font-bold text-sm transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Patient ko Line me Add Karein</span>
            </button>
          )}

          {opdQueue.length > 0 && (
            <button 
              id="btn-opd-reset"
              onClick={() => {
                if(window.confirm('Kya aap pakka pure queue ko reset karna chahte hain? (Naya din = Nayi queue)')) {
                  onResetQueue();
                }
              }}
              className="bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-100 rounded-xl py-2.5 px-3.5 font-bold text-sm transition-all flex items-center space-x-1 cursor-pointer"
              title="Reset today's queue"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset Queue</span>
            </button>
          )}
        </div>

        {waitingCount > 0 && (
          <button 
            id="btn-opd-call-next-main"
            onClick={onCallNext}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-705 text-white rounded-xl py-2.5 px-5 font-bold text-sm transition-all flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Cabin Control: Call Next ({opdQueue.find(e => e.status === 'Waiting')?.token || ''})</span>
          </button>
        )}
      </div>

      {/* Expandable OPD Queue Add Patient Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn relative" id="opd-add-patient-form">
          <button 
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Patient Register in Queue (नाम जोड़ें)
          </h3>

          <form onSubmit={validateAndSubmit} className="space-y-4" id="opd-patient-q-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Select Patient (or Type new)</label>
                <div className="relative">
                  <select
                    id="select-opd-patient"
                    value={selectedPatientId}
                    onChange={handleSelectPatientChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose patient --</option>
                    <option value="new">+ Register Dynamic/Naya Patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Patient's Name (नाम) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="opd-patient-name"
                  placeholder="e.g. Ramesh Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={selectedPatientId !== 'new' && selectedPatientId !== ''}
                  className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                />
                {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Mobile Number (फ़ोन) <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  id="opd-patient-phone"
                  placeholder="10 digit number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={selectedPatientId !== 'new' && selectedPatientId !== ''}
                  className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                />
                {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Age (उम्र) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="opd-patient-age"
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={selectedPatientId !== 'new' && selectedPatientId !== ''}
                  className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                />
                {errors.age && <p className="text-red-500 text-xs font-bold mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Gender (लिंग)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      disabled={selectedPatientId !== 'new' && selectedPatientId !== ''}
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        gender === g 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Chief Complaint (बीमारी / समस्या) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="opd-complaint"
                  placeholder="e.g. Loose motions, Headache for 2 days"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
                />
                {errors.chiefComplaint && <p className="text-red-500 text-xs font-bold mt-1">{errors.chiefComplaint}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Khaarij Karein
              </button>
              <button
                type="submit"
                id="btn-opd-add-confirm"
                className="py-2.5 px-5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm"
              >
                Queue Mein Shamil Karein
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors consultation cabin - Active Spot */}
      {activeConsulting && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn" id="consultation-cabin-active">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="bg-emerald-600 text-white rounded-full p-2.5 animate-pulse">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">In Consultation (कैबिन के अंदर)</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{activeConsulting.name} <span className="text-gray-400 font-normal">({activeConsulting.token})</span></h3>
              <p className="text-xs text-gray-500 mt-0.5">Complaint: {activeConsulting.chiefComplaint} &bull; {activeConsulting.age}Y/{activeConsulting.gender}</p>
            </div>
          </div>
          
          <button 
            id={`btn-cabin-done-${activeConsulting.id}`}
            onClick={() => onMarkDone(activeConsulting.id)}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 px-6 font-bold text-sm shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Consultation Complete (हो गया)</span>
          </button>
        </div>
      )}

      {/* OPD Queue Table Visual */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex flex-col" id="opd-queue-list-table">
        <h3 className="text-base font-bold text-gray-950 mb-3 flex items-center gap-1.5">
          <span>Patients List ({opdQueue.length})</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">Today</span>
        </h3>

        {opdQueue.length === 0 ? (
          <div className="py-20 text-center text-gray-500 border border-gray-100 rounded-xl" id="opd-table-empty">
            <span className="text-5xl">📌</span>
            <h4 className="font-bold text-gray-700 mt-3 text-lg">Koi patient register nahi hai!</h4>
            <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto">Click "Patient ko Line me Add Karein" above or tap quick action triggers to place entries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" id="opd-table-container">
            <table className="w-full text-left border-collapse" id="opd-full-table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Token</th>
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</th>
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Age/Gender</th>
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Chief Complaint</th>
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-2">Control</th>
                </tr>
              </thead>
              <tbody>
                {opdQueue.map((entry) => {
                  const minsInQueue = Math.floor((Date.now() - new Date(entry.checkInTime).getTime()) / 60000);
                  
                  return (
                    <tr 
                      key={entry.id} 
                      className={`border-b border-gray-100 transition-all ${
                        entry.status === 'In Consultation' 
                          ? 'bg-blue-50/30 font-semibold text-blue-950' 
                          : entry.status === 'Done' 
                            ? 'opacity-65 bg-gray-50/50' 
                            : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="py-4 pl-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold ${
                          entry.status === 'In Consultation' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : entry.status === 'Done' 
                              ? 'bg-gray-200 text-gray-600' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {entry.token}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-gray-900 text-sm block">{entry.name}</span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {entry.age} Yrs &bull; {entry.gender}
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-500">
                        {entry.phone}
                      </td>
                      <td className="py-4 text-sm text-gray-600 max-w-[180px] truncate">
                        {entry.chiefComplaint}
                      </td>
                      <td className="py-4">
                        {entry.status === 'In Consultation' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Consultation
                          </span>
                        ) : entry.status === 'Done' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            Check Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                            <Clock className="h-3 w-3" />
                            {minsInQueue > 0 ? `${minsInQueue} min wait` : 'Just In'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end space-x-1.5">
                          {entry.status === 'Waiting' && (
                            <button
                              id={`btn-tbl-call-${entry.id}`}
                              onClick={onCallNext}
                              className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1 rounded-md transition-all cursor-pointer"
                              title="Cabin me bulayein"
                            >
                              <Play className="h-4 w-4 fill-current" />
                            </button>
                          )}
                          {entry.status === 'In Consultation' && (
                            <button
                              id={`btn-tbl-done-${entry.id}`}
                              onClick={() => onMarkDone(entry.id)}
                              className="text-white bg-emerald-600 hover:bg-emerald-700 p-1.5 rounded-md transition-all cursor-pointer"
                              title="Check complete karein"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            id={`btn-tbl-del-${entry.id}`}
                            onClick={() => {
                              if(window.confirm('Kya aap pakka is entry ko delete karna chahte hain?')) {
                                onRemoveFromQueue(entry.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all cursor-pointer"
                            title="Line se hatayein"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
