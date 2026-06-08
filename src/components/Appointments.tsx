/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  Send, 
  Check, 
  User, 
  Phone, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Info,
  CalendarRange
} from 'lucide-react';
import { Patient, Appointment, ClinicSettings } from '../types';
import { formatDate, sendWhatsappReminder, generateId, getRelativeDateString } from '../utils';

interface AppointmentsProps {
  patients: Patient[];
  appointments: Appointment[];
  settings: ClinicSettings;
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export default function Appointments({
  patients,
  appointments,
  settings,
  onBookAppointment,
  onUpdateStatus
}: AppointmentsProps) {
  // Navigation for weekly offset relative to today
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatDropdownOpen, setIsPatDropdownOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(getRelativeDateString(0));
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [appointmentType, setAppointmentType] = useState<'New' | 'Follow-up' | 'Emergency'>('New');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:35 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
  ];

  // Helper: Get Monday of current calendar week
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
    const monday = getMonday(baseDate);
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const yyyy = day.getFullYear();
      const mm = String(day.getMonth() + 1).padStart(2, '0');
      const dd = String(day.getDate()).padStart(2, '0');
      return {
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayName: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: day.getDate(),
        monthName: day.toLocaleDateString('en-IN', { month: 'short' })
      };
    });
  };

  const weekDays = getWeekDays();

  // Helper to check if a specific slot is booked on a date
  const isSlotBookedOnDate = (dateStr: string, slot: string) => {
    return appointments.some(appt => appt.date === dateStr && appt.timeSlot === slot && appt.status !== 'Cancelled');
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!selectedPatientId) {
      newErrors.patient = 'Pehle patient search karke select karein (मरीज का चुनाव करें)';
    }
    if (!bookingDate) {
      newErrors.date = 'Tariq select karein (तारीख का चयन करें)';
    }
    if (!selectedSlot) {
      newErrors.slot = 'Slot book karne ke liye time select krein (समय चुनें)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId)!;

    const newAppt: Appointment = {
      id: generateId('appt'),
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      date: bookingDate,
      timeSlot: selectedSlot,
      type: appointmentType,
      status: 'Pending',
      notes: notes
    };

    onBookAppointment(newAppt);
    setShowAddModal(false);

    // Reset Form
    setSelectedPatientId('');
    setPatientSearch('');
    setNotes('');
    setErrors({});
  };

  const handleWhatsappTrigger = (appt: Appointment) => {
    const time = appt.timeSlot;
    const msg = `Aapka appointment kal (तारीख ${formatDate(appt.date)}) baje ${time} baje hai. Kripya samay par pahunche. Healdesk — ${settings.doctorName}`;
    sendWhatsappReminder(appt.patientPhone, msg);
  };

  const getTypeStyle = (type: Appointment['type']) => {
    switch (type) {
      case 'Emergency': return 'bg-red-50 hover:bg-red-155 border-red-200 text-red-700';
      case 'Follow-up': return 'bg-amber-50 hover:bg-amber-155 border-amber-250 text-amber-700';
      default: return 'bg-blue-50 hover:bg-blue-155 border-blue-250 text-blue-700';
    }
  };

  return (
    <div className="space-y-6" id="appointments-container">
      {/* KPI Header section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100" id="appointments-header">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarRange className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Appointment Scheduler (पॉइंटमेंट क्रेडेंशियल)</h2>
            <p className="text-xs text-gray-400 mt-1">Book diagnostic consultations and trigger Whatsapp queues</p>
          </div>
        </div>

        <button
          id="btn-book-appointment-start"
          onClick={() => {
            setBookingDate(getRelativeDateString(0));
            setSelectedSlot('10:00 AM');
            setSelectedPatientId('');
            setPatientSearch('');
            setNotes('');
            setErrors({});
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-sm flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Naya Appointment Book Karein</span>
        </button>
      </div>

      {/* Week navigator pagination bar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100" id="week-navigator">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-1 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 cursor-pointer"
        >
          &larr; Pichla hafta
        </button>
        <span className="text-xs font-black text-gray-950 uppercase tracking-widest bg-blue-50 text-blue-700 py-1.5 px-4 rounded-full border border-blue-100">
          Hafta View: {weekDays[0].dayNum} {weekDays[0].monthName} &mdash; {weekDays[6].dayNum} {weekDays[6].monthName}
        </span>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-1 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 cursor-pointer"
        >
          Agle hafta &rarr;
        </button>
      </div>

      {/* DESKTOP CALENDAR GRID (Shown on large screens) */}
      <div className="hidden lg:grid grid-cols-7 gap-3" id="desktop-calendar-grid">
        {weekDays.map(day => {
          const dayAppts = appointments.filter(appt => appt.date === day.dateStr && appt.status !== 'Cancelled');
          const isToday = day.dateStr === getRelativeDateString(0);

          return (
            <div 
              key={day.dateStr} 
              className={`bg-white rounded-2xl border min-h-[380px] flex flex-col justify-between overflow-hidden relative ${
                isToday ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-150'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 text-center border-b border-gray-100 text-xs ${
                isToday ? 'bg-blue-600 text-white font-bold' : 'bg-gray-50 text-gray-800'
              }`}>
                <p className="uppercase tracking-widest font-black text-[10px]">{day.dayName}</p>
                <p className="text-lg font-extrabold mt-0.5">{day.dayNum} <span className="text-[10px] font-normal">{day.monthName}</span></p>
              </div>

              {/* Day Appointments block list */}
              <div className="p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[320px]" id={`calendar-day-box-${day.dateStr}`}>
                {dayAppts.length === 0 ? (
                  <p className="text-[10px] text-gray-400 text-center py-10 italic">No bookings</p>
                ) : (
                  dayAppts.map(appt => (
                    <div 
                      key={appt.id} 
                      className={`p-2.5 rounded-xl border text-xs shadow-3xs flex flex-col justify-between hover:scale-[1.02] transition-all ${getTypeStyle(appt.type)}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold truncate max-w-[85px]">{appt.patientName}</span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${
                            appt.status === 'Done' ? 'bg-emerald-600 text-white' : 'bg-black/5'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-black/50 mt-1 font-mono font-bold flex items-center gap-0.5">
                          <Clock className="h-3 w-3 inline" />
                          <span>{appt.timeSlot}</span>
                        </p>
                      </div>

                      {/* Hover / trigger quick actions */}
                      <div className="flex justify-end gap-1.5 mt-2 pt-2.5 border-t border-black/5">
                        {appt.status === 'Pending' && (
                          <button
                            id={`btn-done-appt-${appt.id}`}
                            onClick={() => onUpdateStatus(appt.id, 'Done')}
                            className="bg-black/10 hover:bg-emerald-700 hover:text-white p-1 rounded-md text-[9px] font-bold"
                            title="Mark Done"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          id={`btn-appt-wa-${appt.id}`}
                          onClick={() => handleWhatsappTrigger(appt)}
                          title="Send Whatsapp Reminder"
                          className="bg-black/10 hover:bg-emerald-600 hover:text-white p-1 rounded-md"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MOBILE COMPACT SECTION (Shown on smaller viewports) */}
      <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-5 space-y-4" id="mobile-appointments-view">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1">
          <Info className="h-4.5 w-4.5 text-blue-500" />
          <span>Daily Appointments Summary</span>
        </h3>
        
        <div className="space-y-4">
          {weekDays.map(day => {
            const dayAppts = appointments.filter(appt => appt.date === day.dateStr && appt.status !== 'Cancelled');
            const isToday = day.dateStr === getRelativeDateString(0);

            return (
              <div 
                key={day.dateStr} 
                className={`p-3 rounded-xl border ${
                  isToday ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-extrabold text-blue-900 uppercase">{day.dayName}, {day.dayNum} {day.monthName}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-bold">{dayAppts.length} appointments</span>
                </div>

                {dayAppts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic pl-1">No appointments registered on this day</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {dayAppts.map(appt => (
                      <div key={appt.id} className="bg-white p-3 border border-gray-150 rounded-xl flex items-center justify-between shadow-3xs">
                        <div>
                          <p className="font-extrabold text-sm text-gray-900">{appt.patientName}</p>
                          <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span>{appt.timeSlot} &bull; <span className="text-blue-700">{appt.type}</span></span>
                          </p>
                        </div>

                        <div className="flex space-x-1">
                          {appt.status === 'Pending' && (
                            <button
                              id={`btn-mob-done-${appt.id}`}
                              onClick={() => {
                                if(window.confirm('Mark this appointment consultation completed?')) {
                                  onUpdateStatus(appt.id, 'Done');
                                }
                              }}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-2 rounded-xl"
                            >
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                          <button
                            id={`btn-mob-wa-${appt.id}`}
                            onClick={() => handleWhatsappTrigger(appt)}
                            className="bg-blue-50 text-blue-700 border border-blue-100 p-2 rounded-xl"
                          >
                            <Send className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Booking Trigger Modal POPUP */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="appt-modal-overlay">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]" id="appt-modal-card">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-gray-950 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Assign New Consultation Slot (बुकिंग करें)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-5 space-y-4" id="appt-book-form">
              {/* Select Patient */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 mb-1">Search Patient <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type patient's name to search..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setIsPatDropdownOpen(true);
                      setSelectedPatientId('');
                    }}
                    onFocus={() => setIsPatDropdownOpen(true)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                  />
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>

                {isPatDropdownOpen && (
                  <div className="absolute left-0 right-0 top-16 bg-white border border-gray-250 rounded-xl shadow-lg mt-1 max-h-44 overflow-y-auto z-40">
                    {patients
                      .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch))
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setPatientSearch(p.name);
                            setIsPatDropdownOpen(false);
                          }}
                          className="p-3 hover:bg-blue-50/50 cursor-pointer text-xs font-semibold text-gray-800 transition-all border-b border-gray-50 flex justify-between items-center"
                        >
                          <span>{p.name} ({p.age} Yrs)</span>
                          <span className="text-[10px] text-gray-400">+91 {p.phone}</span>
                        </div>
                    ))}
                  </div>
                )}
                {errors.patient && <p className="text-red-500 text-xs font-bold mt-1">{errors.patient}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Appointment Date (बुकिंग की तारीख)</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500 text-gray-700"
                />
                {errors.date && <p className="text-red-500 text-xs font-bold mt-1">{errors.date}</p>}
              </div>

              {/* Time Slots grid picker */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Available Time Slots (समय चुनें)</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-gray-150 rounded-xl bg-gray-50/50" id="time-slots-picker-grid">
                  {TIME_SLOTS.map(slot => {
                    const isBooked = isSlotBookedOnDate(bookingDate, slot);
                    const isSelected = selectedSlot === slot;

                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-lg text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                          isBooked 
                            ? 'bg-red-50 text-red-400 border border-red-100 opacity-50 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type Grid */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Consultation Tier (वर्ग)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['New', 'Follow-up', 'Emergency'] as const).map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setAppointmentType(t)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        appointmentType === t 
                          ? t === 'Emergency' 
                            ? 'border-red-600 bg-red-50 text-red-700' 
                            : t === 'Follow-up' 
                              ? 'border-amber-500 bg-amber-50 text-amber-700' 
                              : 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Doctor Remarks / Notes (टिप्पणी)</label>
                <input
                  type="text"
                  placeholder="e.g. Check peak flow, Review previous lab reports"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-105">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Radd Karein
                </button>
                <button
                  type="submit"
                  id="btn-confirm-book-appt"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                >
                  Confirm Appointment Book Karein
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
