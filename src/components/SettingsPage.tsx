/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  IndianRupee, 
  FileText, 
  Bell, 
  Database,
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  QrCode,
  Heart
} from 'lucide-react';
import { ClinicSettings } from '../types';

interface SettingsPageProps {
  settings: ClinicSettings;
  onUpdateSettings: (newSettings: ClinicSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (importedData: any) => boolean;
  onResetDatabase: () => void;
}

export default function SettingsPage({
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetDatabase
}: SettingsPageProps) {
  // Local form state cloned from settings
  const [doctorName, setDoctorName] = useState(settings.doctorName);
  const [qualification, setQualification] = useState(settings.qualification);
  const [specialization, setSpecialization] = useState(settings.specialization);
  const [regNo, setRegNo] = useState(settings.regNo);
  const [clinicName, setClinicName] = useState(settings.clinicName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [timings, setTimings] = useState(settings.timings);
  const [upiId, setUpiId] = useState(settings.upiId || '');

  // Fees
  const [opdFee, setOpdFee] = useState(settings.opdFee.toString());
  const [newPatientFee, setNewPatientFee] = useState(settings.newPatientFee.toString());
  const [followUpFee, setFollowUpFee] = useState(settings.followUpFee.toString());
  const [emergencyFee, setEmergencyFee] = useState(settings.emergencyFee.toString());

  // Prescriptions
  const [headerStyle, setHeaderStyle] = useState<ClinicSettings['prescriptionHeaderStyle']>(settings.prescriptionHeaderStyle);
  const [showVitals, setShowVitals] = useState(settings.showVitalsOnPrescription);
  const [footerText, setFooterText] = useState(settings.customFooterText);

  // Notifications
  const [waNotify, setWaNotify] = useState(settings.notificationPreferenceWhatsApp);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = onImportBackup(json);
        if (success) {
          alert('Database restored successfully from backup! App will reload now.');
          window.location.reload();
        } else {
          alert('Invalid backup file. Re-check the JSON integrity.');
        }
      } catch (err) {
        alert('File read failed. Re-check formatting of the JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: ClinicSettings = {
      doctorName,
      qualification,
      specialization,
      regNo,
      clinicName,
      address,
      phone,
      email,
      timings,
      opdFee: Number(opdFee) || 300,
      newPatientFee: Number(newPatientFee) || 500,
      followUpFee: Number(followUpFee) || 200,
      emergencyFee: Number(emergencyFee) || 850,
      prescriptionHeaderStyle: headerStyle,
      showVitalsOnPrescription: showVitals,
      customFooterText: footerText,
      notificationPreferenceWhatsApp: waNotify,
      upiId: upiId
    };

    onUpdateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-component">
      {/* Save indicators toasts */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white p-3.5 px-6 rounded-xl shadow-lg z-50 flex items-center space-x-2 animate-fadeIn" id="toast-settings-success">
          <CheckCircle className="h-5 w-5" />
          <span className="text-xs font-bold font-sans">Settings updated and saved successfully!</span>
        </div>
      )}

      {/* Header index banner */}
      <div className="flex items-center space-x-3.5 bg-white border border-gray-100 rounded-2xl p-5" id="settings-hdr-pane">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Clinic Settings (क्लिनिक सेटिंग्स)</h2>
          <p className="text-xs text-gray-400 mt-1">Configure clinical coordinates, billing tiers, drug database, and backups</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6" id="settings-main-form">
        
        {/* Module A: Doctor coordinates */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4" id="settings-doctor-section">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-gray-100">
            <User className="h-4.5 w-4.5 text-blue-600" />
            1. Doctor & Clinic Profile (प्रोफाइल विवरण)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Doctor's Professional Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Academic Qualifications <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Clinical Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Registration Council Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Clinic Brand Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Clinic Address Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Patient Contact Timing Schedule</label>
              <input
                type="text"
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Official Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Doctor Contact Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase flex items-center gap-1">
                <QrCode className="h-4 w-4 text-blue-500" />
                <span>UPI ID for QR generator</span>
              </label>
              <input
                type="text"
                placeholder="e.g. name@okaxis, upi-string@ybl"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none placeholder-gray-405 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Module B: Consultation Fees Tiers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4" id="settings-fees-section">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-gray-100">
            <IndianRupee className="h-4.5 w-4.5 text-blue-600" />
            2. Consultation Fees Structure (परामर्श शुल्क)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase text-[10px]">OPD Consulting Fee</label>
              <input
                type="number"
                value={opdFee}
                onChange={(e) => setOpdFee(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase text-[10px]">New Patient Premium Fee</label>
              <input
                type="number"
                value={newPatientFee}
                onChange={(e) => setNewPatientFee(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase text-[10px]">Follow-Up review Fee</label>
              <input
                type="number"
                value={followUpFee}
                onChange={(e) => setFollowUpFee(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase text-[10px]">Emergency Visit Fee</label>
              <input
                type="number"
                value={emergencyFee}
                onChange={(e) => setEmergencyFee(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-bold outline-none text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Module C: Prescription printing preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4" id="settings-rx-section">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-gray-100">
            <FileText className="h-4.5 w-4.5 text-blue-600" />
            3. Prescription Pad Design Preferences (पर्चा प्रिंट सेटिंग)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Prescription Header Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHeaderStyle('Detailed')}
                    className={`p-2.5 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      headerStyle === 'Detailed' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    Detailed (Print full letterhead)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeaderStyle('Simple')}
                    className={`p-2.5 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      headerStyle === 'Simple' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    Simple (Minimal header margin)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs">
                  <span className="font-bold text-gray-800 block">Show Patient Vitals on Rx</span>
                  <p className="text-[10px] text-gray-400">Print BP, Temp & oxygen row directly inside Rx slip</p>
                </div>
                <input
                  type="checkbox"
                  checked={showVitals}
                  onChange={(e) => setShowVitals(e.target.checked)}
                  className="h-4.5 w-4.5 text-blue-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase font-sans">Disclaimer / Custom Prescription Footer Disclaimer</label>
              <textarea
                rows={4}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Module D: Whatsapp remind toggling settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4" id="settings-notifications-section">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-gray-100">
            <Bell className="h-4.5 w-4.5 text-blue-600" />
            4. Notifications & Communication (व्हाट्सएप संदेश)
          </h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-150">
            <div className="text-xs">
              <span className="font-extrabold text-blue-900 block uppercase">Enable WhatsApp Patient Notifications</span>
              <p className="text-gray-450 font-medium mt-0.5">Launches a prefilled chat message link on consultation completes and appointment reminders</p>
            </div>
            <input
              type="checkbox"
              checked={waNotify}
              onChange={(e) => setWaNotify(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Save button trigger */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="btn-settings-submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-8 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Save All Profile Settings (जानकारी सुरक्षित करें)
          </button>
        </div>

      </form>

      {/* Module E: Data backups json resets (Danger zone) */}
      <div className="bg-red-50/20 border border-red-100/60 rounded-2xl p-6 space-y-4" id="settings-backups-section">
        <h3 className="text-sm font-bold text-red-900 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-red-100">
          <Database className="h-4.5 w-4.5 text-red-700 animate-pulse" />
          5. Database backup & restore (बैकअप & डेटा नियंत्रण)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON backup button */}
          <button
            id="btn-settings-export-bkup"
            onClick={onExportBackup}
            className="bg-white border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-700 rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-3xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-500" />
            <span>Download full backup file</span>
          </button>

          {/* Import JSON backup upload button input */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              id="settings-import-input"
              onChange={handleBackupUpload}
              className="hidden"
            />
            <label
              htmlFor="settings-import-input"
              className="bg-white border border-gray-200 hover:border-blue-200 text-gray-700 hover:text-blue-700 rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-3xs cursor-pointer text-center"
            >
              <Upload className="h-4 w-4 text-emerald-500" />
              <span>Restore backup from file</span>
            </label>
          </div>

          {/* Full application reset */}
          <button
            id="btn-settings-reset-db"
            onClick={() => {
              if (window.confirm('🚨 चेतावनी: क्या आप क्लिनिक का सारा डेटा डिलीट करना चाहते हैं? सारा डेटा हमेशा के लिए साफ हो जाएगा। (Are you absolutely sure you want to reset all data back to factory defaults?)')) {
                onResetDatabase();
              }
            }}
            className="bg-white border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-650 text-red-650 rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-3xs cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset clinic Database completely</span>
          </button>
        </div>
      </div>

    </div>
  );
}
