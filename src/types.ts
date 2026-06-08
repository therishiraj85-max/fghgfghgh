/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  knownConditions: string[];
}

export interface OpdEntry {
  id: string;
  token: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  chiefComplaint: string;
  status: 'Waiting' | 'In Consultation' | 'Done';
  checkInTime: string; // ISO string
  consultStartTime?: string; // ISO string
  consultEndTime?: string; // ISO string
  date: string; // YYYY-MM-DD
}

export interface Medicine {
  id: string;
  name: string;
  salt: string;
  category: string;
  commonDose: string;
}

export interface PrescriptionMedicine {
  medicineName: string;
  dose: string;
  duration: string;
  instructions: 'Before food' | 'After food' | 'Empty stomach';
  quantity: string;
}

export interface PrescriptionVitals {
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  temp: string;
  weight: string;
  spo2: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  date: string; // YYYY-MM-DD
  vitals?: PrescriptionVitals;
  chiefComplaint: string;
  diagnosis: string;
  advice: string;
  medicines: PrescriptionMedicine[];
  testsAdvised: string[];
  customTest?: string;
  followUpDate: string; // YYYY-MM-DD
  followUpReminder: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00 AM", "09:30 AM", etc.
  type: 'New' | 'Follow-up' | 'Emergency';
  status: 'Pending' | 'Done' | 'Cancelled' | 'No-show';
  notes?: string;
}

export interface BillService {
  name: string;
  amount: number;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  date: string; // YYYY-MM-DD
  services: BillService[];
  totalAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card';
  status: 'Paid' | 'Unpaid' | 'Waived';
}

export interface ClinicSettings {
  doctorName: string;
  qualification: string;
  specialization: string;
  regNo: string;
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  timings: string;
  logoBase64?: string;
  opdFee: number;
  newPatientFee: number;
  followUpFee: number;
  emergencyFee: number;
  prescriptionHeaderStyle: 'Simple' | 'Detailed';
  showVitalsOnPrescription: boolean;
  customFooterText: string;
  notificationPreferenceWhatsApp: boolean;
  upiId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
