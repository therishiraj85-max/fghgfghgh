/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, Medicine, Appointment, Prescription, Bill, ClinicSettings } from './types';

// Helper to get YYYY-MM-DD date relative to today
export function getRelativeDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const INITIAL_MEDICINES: Medicine[] = [
  { id: 'med-1', name: 'Paracetamol 500mg', salt: 'Paracetamol', category: 'Analgesics / Antipyretics', commonDose: '1-0-1' },
  { id: 'med-2', name: 'Paracetamol 650mg', salt: 'Paracetamol', category: 'Analgesics / Antipyretics', commonDose: '1-1-1' },
  { id: 'med-3', name: 'Amoxicillin 500mg', salt: 'Amoxicillin', category: 'Antibiotics', commonDose: '1-0-1' },
  { id: 'med-4', name: 'Azithromycin 500mg', salt: 'Azithromycin', category: 'Antibiotics', commonDose: '1-0-0' },
  { id: 'med-5', name: 'Cetirizine 10mg', salt: 'Cetirizine Hydrochloride', category: 'Antiallergics / Antihistamines', commonDose: '0-0-1' },
  { id: 'med-6', name: 'Omeprazole 20mg', salt: 'Omeprazole', category: 'Gastroprotectives / Antacids', commonDose: '1-0-0' },
  { id: 'med-7', name: 'Pantoprazole 40mg', salt: 'Pantoprazole Sodium', category: 'Gastroprotectives / Antacids', commonDose: '1-0-0' },
  { id: 'med-8', name: 'Metformin 500mg', salt: 'Metformin Hydrochloride', category: 'Antidiabetics', commonDose: '1-0-1' },
  { id: 'med-9', name: 'Metformin 1000mg', salt: 'Metformin Hydrochloride', category: 'Antidiabetics', commonDose: '1-0-1' },
  { id: 'med-10', name: 'Amlodipine 5mg', salt: 'Amlodipine Besylate', category: 'Antihypertensives', commonDose: '1-0-0' },
  { id: 'med-11', name: 'Atenolol 50mg', salt: 'Atenolol', category: 'Antihypertensives', commonDose: '1-0-0' },
  { id: 'med-12', name: 'Atorvastatin 10mg', salt: 'Atorvastatin Calcium', category: 'Cardioprotectives / Lipid Lowering', commonDose: '0-0-1' },
  { id: 'med-13', name: 'Ibuprofen 400mg', salt: 'Ibuprofen', category: 'Analgesics / NSAIDs', commonDose: '1-0-1' },
  { id: 'med-14', name: 'Diclofenac 50mg', salt: 'Diclofenac Sodium', category: 'Analgesics / NSAIDs', commonDose: '1-0-1' },
  { id: 'med-15', name: 'Montelukast 10mg', salt: 'Montelukast Sodium', category: 'Respiratory / Anti-asthmatics', commonDose: '0-0-1' },
  { id: 'med-16', name: 'Levothyroxine 50mcg', salt: 'Levothyroxine Sodium', category: 'Hormones / Thyroid', commonDose: '1-0-0' },
  { id: 'med-17', name: 'Metronidazole 400mg', salt: 'Metronidazole', category: 'Antiprotozoals / Antibiotics', commonDose: '1-1-1' },
  { id: 'med-18', name: 'Ciprofloxacin 500mg', salt: 'Ciprofloxacin', category: 'Antibiotics', commonDose: '1-0-1' },
  { id: 'med-19', name: 'Doxycycline 100mg', salt: 'Doxycycline', category: 'Antibiotics', commonDose: '1-0-1' },
  { id: 'med-20', name: 'Vitamin D3 60000 IU', salt: 'Cholecalciferol', category: 'Vitamins & Minerals', commonDose: '1-0-0' },
  { id: 'med-21', name: 'Vitamin B12 1500mcg', salt: 'Methylcobalamin', category: 'Vitamins & Minerals', commonDose: '1-0-0' },
  { id: 'med-22', name: 'Iron + Folic Acid', salt: 'Ferrous Ascorbate + Folic Acid', category: 'Vitamins & Minerals', commonDose: '0-1-0' },
  { id: 'med-23', name: 'Calcium + Vitamin D', salt: 'Calcium Carbonate + Cholecalciferol', category: 'Vitamins & Minerals', commonDose: '1-0-1' },
  { id: 'med-24', name: 'ORS Sachet', salt: 'Oral Rehydration Salts', category: 'Rehydration', commonDose: '1-0-1' },
  { id: 'med-25', name: 'Antacid Syrup', salt: 'Magaldrate + Simethicone', category: 'Gastroprotectives / Antacids', commonDose: '1-1-1' },
  { id: 'med-26', name: 'Cough Syrup (Benadryl)', salt: 'Diphenhydramine + Ammonium Chloride', category: 'Cough & Cold', commonDose: '1-1-1' },
  { id: 'med-27', name: 'Salbutamol Inhaler', salt: 'Salbutamol', category: 'Respiratory / Anti-asthmatics', commonDose: '1-0-1' },
  { id: 'med-28', name: 'Betamethasone Cream', salt: 'Betamethasone Valerate', category: 'Topical Steroids', commonDose: '0-0-0' },
  { id: 'med-29', name: 'Clotrimazole Cream', salt: 'Clotrimazole', category: 'Topical Antifungals', commonDose: '0-0-0' },
  { id: 'med-30', name: 'Eye Drops (Moxifloxacin)', salt: 'Moxifloxacin', category: 'Ophthalmic Care', commonDose: '1-1-1' },
  { id: 'med-31', name: 'Telmisartan 40mg', salt: 'Telmisartan', category: 'Antihypertensives', commonDose: '1-0-0' },
  { id: 'med-32', name: 'Losartan 50mg', salt: 'Losartan Potassium', category: 'Antihypertensives', commonDose: '1-0-0' },
  { id: 'med-33', name: 'Glimepiride 2mg', salt: 'Glimepiride', category: 'Antidiabetics', commonDose: '1-0-0' },
  { id: 'med-34', name: 'Vildagliptin 50mg', salt: 'Vildagliptin', category: 'Antidiabetics', commonDose: '1-0-1' },
  { id: 'med-35', name: 'Clopidogrel 75mg', salt: 'Clopidogrel Bisulfate', category: 'Cardioprotectives / Antiplatelets', commonDose: '0-0-1' },
  { id: 'med-36', name: 'Ranitidine 150mg', salt: 'Ranitidine', category: 'Gastroprotectives / Antacids', commonDose: '1-0-1' },
  { id: 'med-37', name: 'Domperidone 10mg', salt: 'Domperidone', category: 'Antiemetics / Gastroprotectives', commonDose: '1-0-1' },
  { id: 'med-38', name: 'Ondansetron 4mg', salt: 'Ondansetron Hydrochloride', category: 'Antiemetics / Gastroprotectives', commonDose: '1-0-1' },
  { id: 'med-39', name: 'Deflazacort 6mg', salt: 'Deflazacort', category: 'Corticosteroids', commonDose: '1-0-0' },
  { id: 'med-40', name: 'Prednisolone 5mg', salt: 'Prednisolone', category: 'Corticosteroids', commonDose: '1-0-1' },
  { id: 'med-41', name: 'Levocetirizine 5mg', salt: 'Levocetirizine Dihydrochloride', category: 'Antiallergics / Antihistamines', commonDose: '0-0-1' },
  { id: 'med-42', name: 'Loratadine 10mg', salt: 'Loratadine', category: 'Antiallergics / Antihistamines', commonDose: '1-0-0' },
  { id: 'med-43', name: 'Ofloxacin 200mg', salt: 'Ofloxacin', category: 'Antibiotics', commonDose: '1-0-1' },
  { id: 'med-44', name: 'Clindamycin 300mg', salt: 'Clindamycin Hydrochloride', category: 'Antibiotics', commonDose: '1-0-1' },
  { id: 'med-45', name: 'Gabapentin 300mg', salt: 'Gabapentin', category: 'Neuropathic Pain', commonDose: '0-0-1' },
  { id: 'med-46', name: 'Pregabalin 75mg', salt: 'Pregabalin', category: 'Neuropathic Pain', commonDose: '0-0-1' },
  { id: 'med-47', name: 'Multivitamin Syp', salt: 'B-Complex with Zinc Syrup', category: 'Vitamins & Minerals', commonDose: '0-0-1' },
  { id: 'med-48', name: 'Limcee 500mg (Vitamin C)', salt: 'Ascorbic Acid', category: 'Vitamins & Minerals', commonDose: '1-0-0' },
  { id: 'med-49', name: 'Diclofenac Gel', salt: 'Diclofenac Diethylamine Gel', category: 'Topical Pain Relief', commonDose: '0-0-0' },
  { id: 'med-50', name: 'Mupirocin Ointment', salt: 'Mupirocin', category: 'Topical Antibiotics', commonDose: '0-0-0' }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-ramesh',
    name: 'Ramesh Kumar',
    age: 52,
    dob: '1974-03-12',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '9876543210',
    address: 'Flat 402, Shiv Shanti Enclave, Lucknow',
    emergencyContact: 'Sita Kumar (+91 9876543211)',
    allergies: ['None'],
    knownConditions: ['Diabetes', 'Hypertension']
  },
  {
    id: 'pat-priya',
    name: 'Priya Sharma',
    age: 34,
    dob: '1992-08-25',
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '9123456789',
    address: 'G-12, Sector 4, Noida',
    emergencyContact: 'Vijay Sharma (+91 9123456780)',
    allergies: ['Penicillin'],
    knownConditions: ['None']
  },
  {
    id: 'pat-akram',
    name: 'Mohd. Akram',
    age: 28,
    dob: '1998-01-05',
    gender: 'Male',
    bloodGroup: 'AB+',
    phone: '9988776655',
    address: '54/228, Aminabad, Lucknow',
    emergencyContact: 'Sana Akram (+91 9988776650)',
    allergies: ['None'],
    knownConditions: ['Asthma']
  }
];

export const getInitialAppointments = (): Appointment[] => [
  {
    id: 'appt-1',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    date: getRelativeDateString(0), // Today
    timeSlot: '10:00 AM',
    type: 'Follow-up',
    status: 'Pending',
    notes: 'Routine check-up for blood sugar levels.'
  },
  {
    id: 'appt-2',
    patientId: 'pat-priya',
    patientName: 'Priya Sharma',
    patientPhone: '9123456789',
    date: getRelativeDateString(0), // Today
    timeSlot: '11:00 AM',
    type: 'New',
    status: 'Pending',
    notes: 'Patient complaints of dynamic fever and joint pain for 3 days.'
  },
  {
    id: 'appt-3',
    patientId: 'pat-akram',
    patientName: 'Mohd. Akram',
    patientPhone: '9988776655',
    date: getRelativeDateString(1), // Tomorrow
    timeSlot: '09:30 AM',
    type: 'Follow-up',
    status: 'Pending',
    notes: 'Review asthma inhaler usage and peak flow chart.'
  }
];

export const getInitialPrescriptions = (): Prescription[] => [
  {
    id: 'pres-1',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientAge: 52,
    patientGender: 'Male',
    patientPhone: '9876543210',
    date: getRelativeDateString(-7), // 7 days ago
    vitals: {
      bpSystolic: '142',
      bpDiastolic: '92',
      pulse: '78',
      temp: '98.4',
      weight: '76',
      spo2: '98'
    },
    chiefComplaint: 'Slightly high fasting blood sugar readings at home (140-150 mg/dL). No symptoms.',
    diagnosis: 'Diabetes Follow-up',
    advice: 'Walk 30 minutes daily. Reduce rice and potato intake.',
    medicines: [
      {
        medicineName: 'Metformin 500mg',
        dose: '1-0-1',
        duration: '1 month',
        instructions: 'After food',
        quantity: '60'
      },
      {
        medicineName: 'Atenolol 50mg',
        dose: '1-0-0',
        duration: '1 month',
        instructions: 'Before food',
        quantity: '30'
      },
      {
        medicineName: 'Vitamin D3 60000 IU',
        dose: 'Once a week',
        duration: '4 weeks',
        instructions: 'After food',
        quantity: '4'
      }
    ],
    testsAdvised: ['HbA1c', 'LFT', 'KFT', 'Urine R/M'],
    followUpDate: getRelativeDateString(0), // Today
    followUpReminder: true
  }
];

export const getInitialBills = (): Bill[] => [
  {
    id: 'bill-1',
    patientId: 'pat-ramesh',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    date: getRelativeDateString(-7),
    services: [
      { name: 'OPD Consultation Fee', amount: 300 },
      { name: 'Blood Sugar Monitoring Extra', amount: 50 }
    ],
    totalAmount: 350,
    paymentMode: 'Cash',
    status: 'Paid'
  },
  {
    id: 'bill-2',
    patientId: 'pat-priya',
    patientName: 'Priya Sharma',
    patientPhone: '9123456789',
    date: getRelativeDateString(-1),
    services: [
      { name: 'New Case OPD Consultation', amount: 500 }
    ],
    totalAmount: 500,
    paymentMode: 'UPI',
    status: 'Paid'
  },
  {
    id: 'bill-3',
    patientId: 'pat-akram',
    patientName: 'Mohd. Akram',
    patientPhone: '9988776655',
    date: getRelativeDateString(0),
    services: [
      { name: 'OPD Consultation Fee', amount: 300 }
    ],
    totalAmount: 300,
    paymentMode: 'UPI',
    status: 'Unpaid'
  }
];

export const DEFAULT_SETTINGS: ClinicSettings = {
  doctorName: 'Dr. Vivek Dev, MD',
  qualification: 'MBBS (KGMC), MD (Internal Medicine, AIIMS)',
  specialization: 'General Physician / Cardiometabolic Specialist',
  regNo: 'MCI-18652/UP',
  clinicName: 'Sanjeevani Clinic & Healthcare',
  address: 'Shop 10, Block C, Pragati Plaza, Near Metro Station, Lucknow, UP - 226001',
  phone: '7007123456',
  email: 'vivekdev.aiims@gmail.com',
  timings: 'Mon to Sat: 10:00 AM - 02:00 PM, 05:00 PM - 08:30 PM',
  logoBase64: '', // Empty or default can be handled in-UI with a nice fallback SVG
  opdFee: 300,
  newPatientFee: 500,
  followUpFee: 200,
  emergencyFee: 800,
  prescriptionHeaderStyle: 'Detailed',
  showVitalsOnPrescription: true,
  customFooterText: 'This prescription is valid for 3 days of consultation only. Please review with medical advisor in case of emergency.',
  notificationPreferenceWhatsApp: true,
  upiId: 'vivekdev@okaxis'
};
