/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Patient, Medicine, Appointment, Prescription, Bill, ClinicSettings, OpdEntry } from './types';
import {
  INITIAL_MEDICINES,
  INITIAL_PATIENTS,
  getInitialAppointments,
  getInitialPrescriptions,
  getInitialBills,
  DEFAULT_SETTINGS
} from './initialData';

const CL_PREFIX = 'healdesk_';

export const KEYS = {
  PATIENTS: `${CL_PREFIX}patients`,
  MEDICINES: `${CL_PREFIX}medicines`,
  APPOINTMENTS: `${CL_PREFIX}appointments`,
  PRESCRIPTIONS: `${CL_PREFIX}prescriptions`,
  BILLS: `${CL_PREFIX}billing`,
  SETTINGS: `${CL_PREFIX}settings`,
  OPD_QUEUE: `${CL_PREFIX}opd_queue`,
  DARK_MODE: `${CL_PREFIX}dark_mode`
};

export function getRelativeDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function initializeLocalStorage(force = false) {
  if (!force && localStorage.getItem(KEYS.SETTINGS)) {
    return; // Already initialized
  }

  localStorage.setItem(KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
  localStorage.setItem(KEYS.MEDICINES, JSON.stringify(INITIAL_MEDICINES));
  localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(getInitialAppointments()));
  localStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(getInitialPrescriptions()));
  localStorage.setItem(KEYS.BILLS, JSON.stringify(getInitialBills()));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(KEYS.OPD_QUEUE, JSON.stringify([]));
  localStorage.setItem(KEYS.DARK_MODE, JSON.stringify('light'));
}

export function getData<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error loading localStorage key: ${key}`, e);
    return fallback;
  }
}

export function saveData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generate unique ID
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format currency
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Date helpers
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// WhatsApp Reminders
export function sendWhatsappReminder(phone: string, message: string) {
  // Clean phone number (add +91 if 10 digit, remove dashes)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
}

// Toast utility helper (custom state triggers)
export function triggerToast(
  message: string,
  type: 'success' | 'info' | 'warning' = 'success',
  setToasts: React.Dispatch<React.SetStateAction<{ id: string; msg: string; type: string }[]>>
) {
  const id = generateId('toast');
  setToasts((prev) => [...prev, { id, msg: message, type }]);
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3500);
}
