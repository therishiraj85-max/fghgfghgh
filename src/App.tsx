/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  initializeLocalStorage, 
  getData, 
  saveData, 
  KEYS, 
  generateId, 
  formatDate,
  triggerToast,
  getRelativeDateString
} from './utils';
import { 
  Patient, 
  Medicine, 
  Appointment, 
  Prescription, 
  Bill, 
  ClinicSettings, 
  OpdEntry 
} from './types';

// Page Components
import Dashboard from './components/Dashboard';
import OpdQueue from './components/OpdQueue';
import PatientRecords from './components/PatientRecords';
import Prescriptions from './components/Prescriptions';
import Appointments from './components/Appointments';
import MedicinesDatabase from './components/MedicinesDatabase';
import ReportsAnalytics from './components/ReportsAnalytics';
import BillingFees from './components/BillingFees';
import AiAssistant from './components/AiAssistant';
import SettingsPage from './components/SettingsPage';

// Icon library
import { 
  LayoutDashboard, 
  Users, 
  FolderHeart, 
  FileHeart, 
  Calendar, 
  Pill, 
  BarChart2, 
  IndianRupee, 
  Bot, 
  Settings, 
  Menu, 
  X, 
  Heart, 
  AlertTriangle,
  History
} from 'lucide-react';

export default function App() {
  // Ensure default data is initialized on first boot
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  // Shared Global States loaded safely from utils
  const [patients, setPatients] = useState<Patient[]>(() => getData(KEYS.PATIENTS, []));
  const [medicines, setMedicines] = useState<Medicine[]>(() => getData(KEYS.MEDICINES, []));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getData(KEYS.APPOINTMENTS, []));
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => getData(KEYS.PRESCRIPTIONS, []));
  const [bills, setBills] = useState<Bill[]>(() => getData(KEYS.BILLS, []));
  const [settings, setSettings] = useState<ClinicSettings>(() => getData(KEYS.SETTINGS, {
    doctorName: 'Dr. Vivek Dev',
    qualification: 'MBBS, MD (General Medicine)',
    specialization: 'Physician & Diabetologist',
    regNo: 'MCI-98745',
    clinicName: 'Sanjeevani Health Clinic',
    address: 'Saket Metro Station Road, Sector 4, New Delhi',
    phone: '9876543210',
    email: 'contact@sanjeevani.com',
    timings: 'Mor: 9am-1pm, Eve: 5pm-8pm',
    opdFee: 300,
    newPatientFee: 500,
    followUpFee: 200,
    emergencyFee: 1000,
    prescriptionHeaderStyle: 'Detailed',
    showVitalsOnPrescription: true,
    customFooterText: 'Please review prescriptions within 3 days.',
    notificationPreferenceWhatsApp: true,
    upiId: 'sanjeevani@okaxis'
  }));
  const [opdQueue, setOpdQueue] = useState<OpdEntry[]>(() => getData(KEYS.OPD_QUEUE, []));

  // Visual/Routing states
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('healdesk_is_pro') === 'true';
  });

  const checkProAction = (): boolean => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const handleUpgradeToPro = () => {
    localStorage.setItem('healdesk_is_pro', 'true');
    setIsPro(true);
    setShowUpgradeModal(false);
    alert('🎉 Badhaai Ho! You have successfully upgraded to Healdesk Pro! All modification limits have been resolved.');
  };

  // Emergency Modal inputs
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [emergComplaint, setEmergComplaint] = useState('');
  const [emgGender, setEmgGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [emgAge, setEmgAge] = useState('');

  // Senders/State Synchronization updates to localStorage
  const updatePatients = (updated: Patient[]) => {
    setPatients(updated);
    saveData(KEYS.PATIENTS, updated);
  };

  const updateMedicines = (updated: Medicine[]) => {
    setMedicines(updated);
    saveData(KEYS.MEDICINES, updated);
  };

  const updateAppointments = (updated: Appointment[]) => {
    setAppointments(updated);
    saveData(KEYS.APPOINTMENTS, updated);
  };

  const updatePrescriptions = (updated: Prescription[]) => {
    setPrescriptions(updated);
    saveData(KEYS.PRESCRIPTIONS, updated);
  };

  const updateBills = (updated: Bill[]) => {
    setBills(updated);
    saveData(KEYS.BILLS, updated);
  };

  const updateSettings = (updated: ClinicSettings) => {
    setSettings(updated);
    saveData(KEYS.SETTINGS, updated);
  };

  const updateOpdQueue = (updated: OpdEntry[]) => {
    setOpdQueue(updated);
    saveData(KEYS.OPD_QUEUE, updated);
  };

  // --- BUSINESS LOGIC TRIGGERS ---

  // Book Appointment
  const handleAddNewAppointment = (newAppt: Appointment) => {
    if (!checkProAction()) return;
    updateAppointments([...appointments, newAppt]);
    
    // Auto populate patient index if not registered yet
    if (!patients.some(p => p.id === newAppt.patientId)) {
      const fallbackPatient: Patient = {
        id: newAppt.patientId,
        name: newAppt.patientName,
        age: 35,
        dob: '1991-01-01',
        gender: 'Male',
        bloodGroup: 'B+',
        phone: newAppt.patientPhone,
        address: 'Delhi NCR',
        emergencyContact: '',
        allergies: ['None'],
        knownConditions: []
      };
      updatePatients([...patients, fallbackPatient]);
    }
    alert(`Appointment token booked successfully for ${newAppt.patientName} (समय: ${newAppt.timeSlot})`);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    if (!checkProAction()) return;
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        return { ...appt, status };
      }
      return appt;
    });
    updateAppointments(updated);
  };

  // Medicines add handler
  const handleAddNewMedicine = (newMed: Medicine) => {
    if (!checkProAction()) return;
    updateMedicines([...medicines, newMed]);
    alert(`Dawai formulation "${newMed.name}" safe save ho gayi hai.`);
  };

  // Billings compilation
  const handleAddNewBill = (newBill: Bill) => {
    if (!checkProAction()) return;
    updateBills([...bills, newBill]);
    alert(`Invoice bill receipt [ID: ${newBill.id.toUpperCase().split('-')[2] || 'BILL'}] update ho gaya hai.`);
  };

  const handleUpdateBillStatus = (id: string, status: Bill['status']) => {
    if (!checkProAction()) return;
    const updated = bills.map(b => b.id === id ? { ...b, status } : b);
    updateBills(updated);
  };

  // OPD Actions
  const handleAddPatientToOPD = (patientData: {
    patientId: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
    chiefComplaint: string;
  }) => {
    if (!checkProAction()) return;
    // Generate token string
    const todayYmd = getRelativeDateString(0);
    const dayOpdEntries = opdQueue.filter(entry => entry.date === todayYmd);
    const tokenNum = dayOpdEntries.length + 1;
    const tokenStr = `T-${String(tokenNum).padStart(3, '0')}`;

    const newOpdEntry: OpdEntry = {
      id: generateId('opd'),
      token: tokenStr,
      patientId: patientData.patientId,
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      phone: patientData.phone,
      chiefComplaint: patientData.chiefComplaint,
      status: 'Waiting',
      checkInTime: new Date().toISOString(),
      date: todayYmd
    };

    updateOpdQueue([...opdQueue, newOpdEntry]);

    // Check if new patient record needs to be captured index
    if (!patients.some(p => p.id === patientData.patientId)) {
      const rawPat: Patient = {
        id: patientData.patientId,
        name: patientData.name,
        age: patientData.age,
        dob: '',
        gender: patientData.gender,
        bloodGroup: 'B+',
        phone: patientData.phone,
        address: 'Delhi NCR Region',
        emergencyContact: '',
        allergies: ['None'],
        knownConditions: []
      };
      updatePatients([...patients, rawPat]);
    }
  };

  // Trigger Instant Red Emergency modal submit
  const handleTriggerEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkProAction()) {
      setShowEmergencyModal(false);
      return;
    }
    if (!emergName.trim() || !emergPhone.trim()) {
      alert('Kripya name aur contact number details fill karein (नाम और संपर्क नंबर आवश्यक है)');
      return;
    }

    const patientId = generateId('pat');
    const todayYmd = getRelativeDateString(0);
    
    // Build OPD Entry
    const dayOpdEntries = opdQueue.filter(entry => entry.date === todayYmd);
    const tokenNum = dayOpdEntries.length + 1;
    const tokenStr = `EMG-${String(tokenNum).padStart(2, '0')}`;

    const emergencyOpd: OpdEntry = {
      id: generateId('opd'),
      token: tokenStr,
      patientId: patientId,
      name: emergName.trim(),
      age: Number(emgAge) || 40,
      gender: emgGender,
      phone: emergPhone.trim(),
      chiefComplaint: emergComplaint.trim() || 'ACUTE EMERGENCY CARE',
      status: 'In Consultation', // Sent directly to consultation!
      checkInTime: new Date().toISOString(),
      consultStartTime: new Date().toISOString(),
      date: todayYmd
    };

    // Auto load in bills
    const emergencyBill: Bill = {
      id: generateId('bill'),
      patientId: patientId,
      patientName: emergName.trim(),
      patientPhone: emergPhone.trim(),
      date: todayYmd,
      services: [{ name: 'Emergency Consultation & Triage Fee', amount: settings.emergencyFee }],
      totalAmount: settings.emergencyFee,
      paymentMode: 'Cash',
      status: 'Unpaid'
    };

    updateOpdQueue([...opdQueue, emergencyOpd]);
    updateBills([...bills, emergencyBill]);
    setShowEmergencyModal(false);

    // Reset fields
    setEmergName('');
    setEmergPhone('');
    setEmergComplaint('');
    setEmgAge('');

    alert(`Emergency patient "${emergencyOpd.name}" ko primary cabin consultation slot assign kiya hai. Settle bills inside Fees ledger panel.`);
    setActiveTab('OPD Queue'); // Redirect to focus on queue!
  };

  // Full clinical DB exporters
  const handleAllDataExports = () => {
    const backupObj = {
      patients,
      appointments,
      prescriptions,
      bills,
      settings,
      opdQueue,
      medicines,
      exportDate: new Date().toISOString()
    };

    const str = JSON.stringify(backupObj, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
    const exportFileDefaultName = `Healdesk_Backup_${getRelativeDateString(0)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportBackupObj = (imported: any): boolean => {
    if (!checkProAction()) return false;
    if (!imported || typeof imported !== 'object') return false;
    
    // Basic verification on patients/prescriptions
    if (Array.isArray(imported.patients)) {
      updatePatients(imported.patients);
    }
    if (Array.isArray(imported.appointments)) {
      updateAppointments(imported.appointments);
    }
    if (Array.isArray(imported.prescriptions)) {
      updatePrescriptions(imported.prescriptions);
    }
    if (Array.isArray(imported.bills)) {
      updateBills(imported.bills);
    }
    if (imported.settings) {
      updateSettings(imported.settings);
    }
    if (Array.isArray(imported.opdQueue)) {
      updateOpdQueue(imported.opdQueue);
    }
    if (Array.isArray(imported.medicines)) {
      updateMedicines(imported.medicines);
    }

    return true;
  };

  const handleResetRestoreDefaults = () => {
    if (!checkProAction()) return;
    initializeLocalStorage(true);
    alert('Database resetted completely. Reloading sandbox clinical datasets...');
    window.location.reload();
  };

  // Helper date text for upper top-bar
  const getTopBarDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const waitingQueueCount = opdQueue.filter(
    entry => entry.date === getRelativeDateString(0) && entry.status === 'Waiting'
  ).length;

  const handleCallNext = () => {
    if (!checkProAction()) return;
    const todayYmd = getRelativeDateString(0);
    const todayWaiting = opdQueue.filter(
      entry => entry.date === todayYmd && entry.status === 'Waiting'
    );
    if (todayWaiting.length === 0) {
      alert('Intezar karne wala koi patient nahi hai. (No waiting patients today!)');
      return;
    }
    const firstJoined = todayWaiting[0];
    const updated = opdQueue.map(entry => {
      if (entry.id === firstJoined.id) {
        return {
          ...entry,
          status: 'In Consultation' as const,
          consultStartTime: new Date().toISOString()
        };
      }
      return entry;
    });
    updateOpdQueue(updated);
    alert(`${firstJoined.name} ko cabin mein bulaya gaya (Token: ${firstJoined.token})`);
  };

  const handleMarkDone = (id: string) => {
    if (!checkProAction()) return;
    const updated = opdQueue.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          status: 'Done' as const,
          consultEndTime: new Date().toISOString()
        };
      }
      return entry;
    });
    updateOpdQueue(updated);
    alert('Patient check-up successfully completed!');
  };

  const handleRemoveFromQueue = (id: string) => {
    if (!checkProAction()) return;
    if (window.confirm('Kya aap is patient ko Aaj ki OPD queue se hatana chahte hain?')) {
      const updated = opdQueue.filter(entry => entry.id !== id);
      updateOpdQueue(updated);
    }
  };

  const handleResetQueue = () => {
    if (!checkProAction()) return;
    if (window.confirm('Kripya dhyan dein: Isse Aaj ki puri OPD list clear ho jayegi. Kya aap aage badhna chahte hain?')) {
      const todayYmd = getRelativeDateString(0);
      const updated = opdQueue.filter(entry => entry.date !== todayYmd);
      updateOpdQueue(updated);
    }
  };

  const handleAddPatientRecord = (patientData: Omit<Patient, 'id'>) => {
    if (!checkProAction()) return;
    const newPatient: Patient = {
      ...patientData,
      id: generateId('pat')
    };
    updatePatients([newPatient, ...patients]);
    alert(`Patient "${newPatient.name}" ka fresh record catalog save ho gaya hai.`);
  };

  const handleUpdatePatientRecord = (updatedPatient: Patient) => {
    if (!checkProAction()) return;
    const updated = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
    updatePatients(updated);
    alert(`Patient "${updatedPatient.name}" ke details update ho gaye hain.`);
  };

  // Render proper subpage navigation tab selection
  const renderSubpageContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <Dashboard 
            patients={patients}
            opdQueue={opdQueue}
            bills={bills}
            onNavigate={(tab) => setActiveTab(tab)}
            onCallNext={handleCallNext}
            onMarkDone={handleMarkDone}
            onOpenQuickPatient={() => setShowEmergencyModal(true)}
          />
        );
      case 'OPD Queue':
        return (
          <OpdQueue 
            patients={patients}
            opdQueue={opdQueue}
            onAddPatientToQueue={handleAddPatientToOPD}
            onCallNext={handleCallNext}
            onMarkDone={handleMarkDone}
            onRemoveFromQueue={handleRemoveFromQueue}
            onResetQueue={handleResetQueue}
          />
        );
      case 'Patient Records':
        return (
          <PatientRecords 
            patients={patients}
            prescriptions={prescriptions}
            bills={bills}
            onAddPatient={handleAddPatientRecord}
            onUpdatePatient={handleUpdatePatientRecord}
          />
        );
      case 'Prescriptions':
        return (
          <Prescriptions 
            patients={patients}
            medicines={medicines}
            prescriptions={prescriptions}
            settings={settings}
            onAddPrescription={(newPres) => {
              if (!checkProAction()) return;
              updatePrescriptions([...prescriptions, newPres]);
              
              // Automatically resolve status in Today's OPD queue if active
              const todayYmd = getRelativeDateString(0);
              const queueMatch = opdQueue.find(entry => entry.patientId === newPres.patientId && entry.date === todayYmd && entry.status !== 'Done');
              if (queueMatch) {
                const updatedQueue = opdQueue.map(q => q.id === queueMatch.id ? { ...q, status: 'Done' as const, consultEndTime: new Date().toISOString() } : q);
                updateOpdQueue(updatedQueue);
              }

              alert(`Parchi Prescription generated successfully for ${newPres.patientName}! Ready for printing.`);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'Appointments':
        return (
          <Appointments 
            patients={patients}
            appointments={appointments}
            settings={settings}
            onBookAppointment={handleAddNewAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
          />
        );
      case 'Medicines':
        return (
          <MedicinesDatabase 
            medicines={medicines}
            onAddMedicine={handleAddNewMedicine}
          />
        );
      case 'Reports & Analytics':
        return (
          <ReportsAnalytics 
            patients={patients}
            prescriptions={prescriptions}
            bills={bills}
          />
        );
      case 'Billing & Fees':
        return (
          <BillingFees 
            patients={patients}
            bills={bills}
            settings={settings}
            onAddBill={handleAddNewBill}
            onUpdateBillStatus={handleUpdateBillStatus}
          />
        );
      case 'AI Assistant':
        return (
          <AiAssistant 
            patients={patients}
            opdQueue={opdQueue}
            prescriptions={prescriptions}
            bills={bills}
            appointments={appointments}
          />
        );
      case 'Settings':
        return (
          <SettingsPage 
            settings={settings}
            onUpdateSettings={updateSettings}
            onExportBackup={handleAllDataExports}
            onImportBackup={handleImportBackupObj}
            onResetDatabase={handleResetRestoreDefaults}
          />
        );
      default:
        return <div className="text-gray-500 py-10">Undetermined Tab Index</div>;
    }
  };

  // Nav menu templates list definitions
  const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'OPD Queue', icon: Users, badge: waitingQueueCount > 0 ? waitingQueueCount : undefined },
    { name: 'Patient Records', icon: FolderHeart },
    { name: 'Prescriptions', icon: FileHeart },
    { name: 'Appointments', icon: Calendar },
    { name: 'Medicines', icon: Pill },
    { name: 'Reports & Analytics', icon: BarChart2 },
    { name: 'Billing & Fees', icon: IndianRupee },
    { name: 'AI Assistant', icon: Bot },
    { name: 'Settings', icon: Settings }
  ];

  const getBreadcrumbTranslation = () => {
    switch(activeTab) {
      case 'Dashboard': return 'मुख्य पटल';
      case 'OPD Queue': return 'आज के मरीज';
      case 'Patient Records': return 'मरीजों का इतिहास';
      case 'Prescriptions': return 'डिजिटल पर्ची';
      case 'Appointments': return 'अपॉइंटमेंट बुकिंग';
      case 'Medicines': return 'दवाई सूचि';
      case 'Reports & Analytics': return 'अनालिटिक्स रिपोर्ट';
      case 'Billing & Fees': return 'फीस और पेमेंट रसीद';
      case 'AI Assistant': return 'संजू एआई सहायक';
      case 'Settings': return 'क्लिनिक प्रोफाइल सेटिंग्स';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex font-sans" id="clinic-saathi-app">
      
      {/* SIDEBAR NAVIGATION PANEL (Visible in Desktop Viewports) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1A6BB5] text-white fixed top-0 bottom-0 left-0 shadow-xl justify-between border-r border-[#155A9A] z-40 shrink-0" id="desktop-sidebar">
        <div>
          {/* Logo Brand Header block */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md shrink-0">
                <svg className="w-7 h-7 text-[#1A6BB5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                </svg>
              </div>
              <div className="leading-none">
                <h1 className="text-white font-extrabold text-lg tracking-tight">Healdesk</h1>
                <span className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">हीलडेस्क</span>
              </div>
            </div>
            <p className="text-blue-100 text-[10px] italic border-t border-white/10 pt-2 mt-2">"Aapka Clinic, Aapki Marzi"</p>
          </div>

          {/* Connected doctor display profile */}
          <div className="m-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-blue-400/20 border-2 border-white/20 flex items-center justify-center text-white font-bold shrink-0">
                {settings.doctorName ? settings.doctorName.replace(/Dr\.\s+/i, '').substring(0, 2).toUpperCase() : 'DR'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-blue-200 leading-none">Namaste,</p>
                <p className="text-xs font-bold text-white mt-1 uppercase tracking-tight truncate">{settings.doctorName}</p>
                <p className="text-[9px] text-blue-100/80 truncate mt-0.5">{settings.specialization}</p>
              </div>
            </div>
          </div>

          <div className="text-blue-200/50 text-[10px] font-bold px-6 pt-2 pb-1.5 uppercase tracking-widest">Main Menu</div>

          {/* Scrollable menu slots links */}
          <nav className="px-4 space-y-1" id="desktop-sidebar-nav">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  id={`nav-tab-${item.name.replace(/\s+/g, '-')}`}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between py-2.5 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-white/10 text-white font-semibold' 
                      : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4.5 w-4.5 shrink-0 opacity-80" />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white text-[#1A6BB5]' : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Pro Status Widget in Sidebar */}
          {!isPro ? (
            <div className="mx-4 my-3 p-4 bg-gradient-to-br from-amber-500/15 to-yellow-500/5 rounded-xl border border-amber-500/30 text-xs shadow-inner animate-pulse">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <span className="p-0.5 px-1.5 bg-amber-500 text-slate-900 rounded text-[9px] font-black leading-none shrink-0">FREE PLAN</span>
                <span className="text-amber-400 font-bold uppercase tracking-widest text-[9px]">Read Only</span>
              </div>
              <p className="font-bold text-white text-xs leading-snug">Become Pro for ₹199</p>
              <p className="text-blue-200 text-[10px] mt-1 leading-snug">Unable to modify records. Unlock unlimited Patient Files, digital prescriptions, OPD token actions, and bill generation.</p>
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-amber-500/10 flex items-center justify-center space-x-1"
              >
                <span>Upgrade Now</span>
              </button>
            </div>
          ) : (
            <div className="mx-4 my-3 p-4 bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 rounded-xl border border-emerald-500/20 text-xs shadow-inner">
              <div className="flex items-center space-x-1.5 mb-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="font-extrabold uppercase tracking-widest text-[9px]">Pro Plan Activated</span>
              </div>
              <p className="font-bold text-white text-xs leading-none">👑 Premium Member</p>
              <p className="text-blue-100 text-[10px] mt-1 border-t border-white/5 pt-1">All modification states, queue, settings, and prescriptions are fully unlocked.</p>
            </div>
          )}
        </div>

        {/* Footer Credit Line panel */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-[10px] text-blue-200/70 font-medium bg-[#145398]/30">
          <span className="flex items-center gap-1">Made with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> in India</span>
          <span className="font-mono opacity-80">v1.1</span>
        </div>
      </aside>

      {/* MOBILE LAYOUT DRAWER DRAWER SIDEBAR */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden" id="mobile-sidebar-overlay">
          <div className="w-64 bg-[#1A6BB5] text-white h-full shadow-2xl flex flex-col justify-between animate-slideRight relative text-xs" id="mobile-sidebar-drawer">
            <div>
              {/* Drawer header close info */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#155A96]">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center shrink-0">
                    <svg className="w-5.5 h-5.5 text-[#1A6BB5]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                    </svg>
                  </div>
                  <span className="font-extrabold text-white tracking-widest text-[11px]">Healdesk</span>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white hover:text-red-200 p-1 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu items slots */}
              <nav className="p-4 space-y-1" id="mobile-sidebar-nav">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center py-2.5 px-4 rounded-lg text-xs font-bold cursor-pointer hover:bg-white/5 ${
                        isActive ? 'bg-white/10 text-white' : 'text-blue-100 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 mr-3 shrink-0 opacity-80" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
              
              {/* Pro Status Widget in Mobile Sidebar */}
              <div className="px-4 pb-2">
                {!isPro ? (
                  <div className="p-3 bg-gradient-to-br from-amber-500/15 to-yellow-500/5 rounded-xl border border-amber-500/25 text-xs">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <span className="p-0.5 px-1.5 bg-amber-500 text-slate-900 rounded text-[8px] font-black leading-none uppercase shrink-0">FREE</span>
                      <p className="font-bold text-white text-xs">Upgrade to Pro @ ₹199</p>
                    </div>
                    <p className="text-[10px] text-blue-200 leading-snug">Become Pro to modify clinic parameters and register patients.</p>
                    <button 
                      onClick={() => {
                        setIsMobileSidebarOpen(false);
                        setShowUpgradeModal(true);
                      }}
                      className="w-full mt-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-1.5 rounded-lg text-[10px] uppercase tracking-wider text-center cursor-pointer transition-all active:scale-95"
                    >
                      Instant Upgrade
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/25 text-xs text-emerald-350 flex items-center gap-1.5 font-bold">
                    <span>👑</span>
                    <span>Healdesk Pro Activated</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/10 text-[10px] text-blue-200/80 text-center">
              "Aapka Clinic, Aapki Marzi"
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT WRAPPER BODY (Offset on Left for Desktop Sidebar wide layout) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen overflow-hidden" id="main-scroller">
        
        {/* UPPER TOP-BAR PANEL BOARD */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs" id="main-top-bar">
          
          <div className="flex items-center space-x-3">
            {/* Hamburger trigger menu on smaller devices */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
              id="btn-mobile-sidebar-toggle"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Breadcrumb pathing */}
            <div className="hidden sm:flex items-center space-x-2 text-slate-500 text-xs font-sans animate-fadeIn" id="top-bar-breadcrumbs">
              <span className="font-medium text-slate-400">Healdesk</span>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-[#1A6BB5] font-semibold">{activeTab}</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-slate-400 tracking-wide font-medium italic">{getBreadcrumbTranslation()}</span>
            </div>
          </div>

          {/* Operations tools triggers */}
          <div className="flex items-center space-x-5" id="top-bar-operational-tools">
            
            <div className="hidden md:flex items-center space-x-5">
              {/* Today's Date representation */}
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Aaj ki Taarik</p>
                <p className="text-xs font-bold text-slate-700 mt-1">{getTopBarDate()}</p>
              </div>

              <div className="h-8 w-[1px] bg-slate-200"></div>

              {/* Displaying Live queuing indicators counts */}
              <div className="flex flex-col items-end text-xs font-sans text-right" id="top-bar-queue-indicator">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Pending Queue</span>
                <span className="text-sm font-black text-[#0F9B6E] mt-1">{waitingQueueCount} Patients</span>
              </div>
            </div>

            {/* PRO TOP BAR STATUS / ACTION */}
            {!isPro ? (
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 rounded-lg py-2 px-3.5 shadow-md shadow-amber-200 font-extrabold text-xs tracking-wide flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap border border-amber-400 animate-pulse shrink-0"
                id="btn-topbar-upgrade-to-pro"
              >
                <span>✨</span>
                <span>Upgrade to Pro (₹199)</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500/10 to-indigo-500/5 px-3 py-2 rounded-lg border border-emerald-500/15 text-xs text-emerald-700 font-black whitespace-nowrap shrink-0">
                <span>👑</span>
                <span className="uppercase text-[9px] font-extrabold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded leading-none shrink-0">Pro Active</span>
              </div>
            )}

            {/* RED COMPLEMENTARY EMERGENCY TRIGGER BUTTON */}
            <button
              id="btn-trigger-emergency-direct"
              onClick={() => setShowEmergencyModal(true)}
              className="bg-[#ff0000] hover:bg-red-700 text-white rounded-lg py-2 px-4 shadow-md shadow-red-200 font-bold text-xs tracking-wider flex items-center space-x-2 transition-all cursor-pointer border border-red-510 animate-bounce"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shrink-0"></span>
              <span>EMERGENCY (आपातकालीन)</span>
            </button>
          </div>

        </header>

        {/* CONTAINER CONTENT SECTION */}
        <main className="flex-1 p-5 lg:p-7 max-w-7xl mx-auto w-full space-y-6" id="main-content-canvas-area">
          {renderSubpageContent()}
        </main>

      </div>

      {/* EMERGENCY PATIENT COMPILATION MODAL POPUP */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-gray-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs animate-fadeIn" id="emergency-modal-overlay">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl w-full max-w-md overflow-hidden" id="emergency-modal-panel">
            
            <div className="p-4 bg-red-600 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">Emergency OPD Entry (इमरजेंसी रजिस्ट्रेशन)</h3>
              </div>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="text-white/80 hover:text-white font-bold text-sm cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerEmergencySubmit} className="p-5 space-y-4" id="emergency-forms">
              
              <div className="bg-red-50 p-3.5 rounded-xl border border-red-100 flex items-start gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>यह फॉर्म मरीज को सीधे डॉक्टर के पास 'In Consultation' (केबिन में) डाल देगा और इमरजेंसी बिल भी जारी करेगा।</span>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 uppercase">Emergency Patient Name (मरीज का नाम) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra, Asha Devi"
                  value={emergName}
                  onChange={(e) => setEmergName(e.target.value)}
                  className="w-full bg-gray-55 border border-gray-250 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1.5 uppercase">Age (उम्र)</label>
                  <input
                    type="number"
                    placeholder="Years"
                    value={emgAge}
                    onChange={(e) => setEmgAge(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-250 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1.5 uppercase">Gender (लिंग)</label>
                  <select
                    value={emgGender}
                    onChange={(e) => setEmgGender(e.target.value as any)}
                    className="w-full bg-gray-55 border border-gray-250 rounded-xl px-3 py-2.5 font-semibold text-gray-800 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 uppercase">Patient Contact Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={emergPhone}
                  onChange={(e) => setEmergPhone(e.target.value)}
                  maxLength={13}
                  className="w-full bg-gray-55 border border-gray-250 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 uppercase">Critical Complaint Details (कारण/बीमारी)</label>
                <input
                  type="text"
                  placeholder="e.g. Acute chest discomfort, Severe dyspnea, High trauma"
                  value={emergComplaint}
                  onChange={(e) => setEmergComplaint(e.target.value)}
                  className="w-full bg-gray-55 border border-gray-250 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 outline-none"
                />
              </div>

              {/* Action buttons triggers */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-105">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="py-2.5 px-4 bg-gray-150 hover:bg-gray-205 text-gray-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-emergency-submit"
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Add Active Emergency Patient +
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAILED PREMIUM PRO UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 text-xs animate-fadeIn font-sans" id="upgrade-modal-overlay">
          <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp flex flex-col" id="upgrade-modal-panel">
            
            {/* Header Banner */}
            <div className="p-6 bg-gradient-to-br from-[#102A43] to-[#1A6BB5] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">👑</span>
                  <div>
                    <span className="uppercase text-[9px] font-black tracking-widest bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full font-sans leading-none">PREMIUM PLAN</span>
                    <h3 className="font-extrabold text-lg mt-1 tracking-tight text-white leading-tight">Healdesk Pro (₹199 Only)</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-blue-100/90 text-[11px] mt-2 leading-relaxed">
                Unlock full active clinic write-operations! Currently you are on the <strong className="text-amber-400 font-bold">Free View-Only plan</strong>. Upgrade to access full database capabilities.
              </p>
            </div>

            {/* Modal Body with Detailed Benefits Comparison */}
            <div className="p-6 space-y-5 flex-1 max-h-[70vh] overflow-y-auto">
              
              {/* Special Promotion Box */}
              <div className="bg-amber-500/10 border border-amber-300/35 p-4 rounded-2xl flex items-start gap-3.5 text-slate-800">
                <span className="text-xl shrink-0">✨</span>
                <div>
                  <h4 className="font-black text-amber-800 text-xs">Sandbox Session Promo Activation</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                    Test the complete premium workflow instantly! Clicking the button below auto-activates Pro mode on this sandbox today for test drives. Real payment gateways can be configured in the future.
                  </p>
                </div>
              </div>

              {/* Feature comparison checkmark list */}
              <div>
                <h4 className="text-slate-400 font-extrabold uppercase tracking-widest text-[9.5px] mb-3">What is included in Healdesk Pro?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-slate-800">Unlimited Patient Files</p>
                      <p className="text-slate-400 text-[10px]">Overcome view-only limits</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-slate-800">Active OPD Queue Check-in</p>
                      <p className="text-slate-400 text-[10px]">Call Next & Mark Done</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-slate-800">Full EHR Prescription</p>
                      <p className="text-slate-400 text-[10px]">Dose, vitals & print layouts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-slate-800">Custom Billings & Invoices</p>
                      <p className="text-slate-400 text-[10px]">UPI payments receipt logs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-slate-800">Direct WhatsApp Alerts</p>
                      <p className="text-slate-400 text-[10px]">Direct notification prompts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-emerald-500 font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-slate-800">Qualification & Reg Settings</p>
                      <p className="text-slate-400 text-[10px]">Full brand customization</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">LIFETIME SUBSCRIPTION PRICE</p>
                  <p className="text-slate-500 text-[10px] sm:text-xs">No recurring fees or hide charges</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 line-through text-xs mr-1.5">₹499</span>
                  <span className="text-2xl font-black text-[#1A6BB5] tracking-tight">₹199</span>
                </div>
              </div>

            </div>

            {/* Action Buttons Footer */}
            <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Go Back (Read Only)
              </button>
              <button
                type="button"
                onClick={handleUpgradeToPro}
                id="btn-modal-upgrade-confirm-action"
                className="py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 rounded-xl font-black shadow-md shadow-amber-500/10 cursor-pointer transition-all flex items-center space-x-1.5 animate-bounce"
              >
                <span>👑</span>
                <span>Activate Pro Mode Today</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
