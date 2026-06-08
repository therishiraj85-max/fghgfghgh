/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  IndianRupee, 
  Activity, 
  PlusCircle, 
  FilePlus, 
  CalendarPlus,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Patient, OpdEntry, Bill } from '../types';
import { getRelativeDateString, formatCurrency } from '../utils';

interface DashboardProps {
  patients: Patient[];
  opdQueue: OpdEntry[];
  bills: Bill[];
  onNavigate: (tab: string) => void;
  onCallNext: () => void;
  onMarkDone: (id: string) => void;
  onOpenQuickPatient: () => void;
}

export default function Dashboard({
  patients,
  opdQueue,
  bills,
  onNavigate,
  onCallNext,
  onMarkDone,
  onOpenQuickPatient
}: DashboardProps) {
  const todayStr = getRelativeDateString(0);

  // Stats calculation
  const todayOpdTotal = opdQueue.length;
  const pendingInQueue = opdQueue.filter(p => p.status === 'Waiting' || p.status === 'In Consultation').length;
  const totalPatientsCount = patients.length;
  
  const todayPaidRevenue = bills
    .filter(b => b.date === todayStr && b.status === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Generate last 7 days data for SVG Bar Chart
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const dateYmd = date.toISOString().split('T')[0];

    // Count patients in opd or billed on this day
    // Let's check both OPD and bills to get active visits
    const dayBillCount = bills.filter(b => b.date === dateYmd).length;
    const dayOpdCount = opdQueue.filter(q => q.date === dateYmd).length;
    const count = Math.max(dayBillCount, dayOpdCount, dateYmd === todayStr ? todayOpdTotal : 0);

    return {
      day: dayName,
      date: dateYmd,
      count: count || (i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0) // dynamic fallback for empty sandboxes
    };
  });

  const maxCount = Math.max(...last7DaysData.map(d => d.count), 4); // Min ceiling of 4 for spacing

  // Live Queue (Waiting and In Consultation)
  const activeQueue = opdQueue.filter(p => p.status !== 'Done');

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-cards-grid">
        
        {/* Card 1: Aaj ke Patients */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100" id="kpi-today-patients">
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1.5 tracking-wider">Aaj ke Patients</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{todayOpdTotal}</h3>
            <span className="text-[#0F9B6E] bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold">Actively Booked</span>
          </div>
        </div>

        {/* Card 2: Pending in Queue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-pulse" id="kpi-pending-queue">
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1.5 tracking-wider">Pending in Queue</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-[#1A6BB5] tracking-tight">{pendingInQueue}</h3>
            <div className="flex -space-x-1.5 pb-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 border border-white text-[8px] font-bold flex items-center justify-center text-blue-700">W</span>
              <span className="w-5 h-5 rounded-full bg-amber-100 border border-white text-[8px] font-bold flex items-center justify-center text-amber-700">C</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 border border-white text-[8px] font-bold flex items-center justify-center text-emerald-700">D</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Patients */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100" id="kpi-total-patients">
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1.5 tracking-wider">Total Patients</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totalPatientsCount}</h3>
            <span className="text-slate-400 text-[10px] font-bold uppercase italic self-center">Sada Bahar</span>
          </div>
        </div>

        {/* Card 4: Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-[#0F9B6E]" id="kpi-todays-revenue">
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1.5 tracking-wider">Today's Revenue ({formatCurrency(todayPaidRevenue).split(' ')[0] || '₹'})</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-[#0F9B6E] tracking-tight">{formatCurrency(todayPaidRevenue)}</h3>
            <svg className="w-6 h-6 text-slate-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>

      </div>

      {/* Main 12 Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="dashboard-content-grid">
        
        {/* Live OPD Queue Container (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[440px] justify-between overflow-hidden" id="dashboard-queue-pane">
          <div>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-slate-700 flex items-center space-x-2 text-sm">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shrink-0"></span>
                <span>Live Today's OPD Queue (आज के मरीज़)</span>
              </h4>
              {activeQueue.length > 0 && (
                <button 
                  id="btn-dashboard-call-next"
                  onClick={onCallNext}
                  className="text-[#1A6BB5] hover:text-[#155A98] text-xs font-bold border border-blue-100 px-3.5 py-1.5 rounded-full hover:bg-blue-50 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Call Next</span>
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto max-h-[300px]">
              {activeQueue.length === 0 ? (
                <div className="py-16 text-center text-gray-500" id="dashboard-queue-empty">
                  <span className="text-4xl">😴</span>
                  <p className="font-semibold text-slate-600 mt-2">Koyi bheed nahi hai (OPD Queue empty!)</p>
                  <p className="text-xs text-slate-400 mt-1">Start by registering patients from the card action below.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Token</th>
                      <th className="px-6 py-3">Patient Name</th>
                      <th className="px-6 py-3">Age/Sex/Wait</th>
                      <th className="px-6 py-3">Complaint</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {activeQueue.map((entry, index) => {
                      const minsInQueue = Math.floor((Date.now() - new Date(entry.checkInTime).getTime()) / 60000);
                      
                      return (
                        <tr 
                          key={entry.id} 
                          className={`hover:bg-slate-50/70 transition-colors ${
                            entry.status === 'In Consultation' ? 'bg-blue-50 hover:bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-6 py-3.5 font-bold text-[#1A6BB5]">
                            {entry.token}
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-slate-800">
                            {entry.name}
                            {entry.token.startsWith('EMG-') && (
                              <span className="ml-2 text-[8px] bg-red-100 text-red-650 px-1 rounded uppercase font-black">Emerg</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-slate-500">
                            {entry.age} {entry.gender.charAt(0)} &bull; {minsInQueue > 0 ? `${minsInQueue} min wait` : 'Just In'}
                          </td>
                          <td className="px-6 py-3.5 text-slate-550 max-w-[140px] truncate">
                            {entry.chiefComplaint || "Check-up"}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {entry.status === 'In Consultation' ? (
                              <button
                                id={`btn-done-${entry.id}`}
                                onClick={() => onMarkDone(entry.id)}
                                className="bg-[#0F9B6E] hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Done</span>
                              </button>
                            ) : index === 0 ? (
                              <button
                                id={`btn-call-${entry.id}`}
                                onClick={onCallNext}
                                className="bg-[#1A6BB5] hover:bg-[#155A98] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Play className="h-3 w-3 fill-current" />
                                <span>Call Next</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Waiting...</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Average Consultation Speed: <span className="text-[#1A6BB5] font-black">~14 Mins</span></span>
            <button 
              id="btn-view-all-queue"
              onClick={() => onNavigate('opd')}
              className="text-[#1A6BB5] hover:underline"
            >
              Open Queue Screen &rarr;
            </button>
          </div>
        </div>

        {/* Charts & Bento Grid Actions (5 Columns) */}
        <div className="lg:col-span-5 space-y-6" id="dashboard-right-pane">
          
          {/* Bar Chart Container */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-[220px] flex flex-col justify-between" id="dashboard-charts-pane">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-slate-700 text-sm">Hafte ke Patients (Weekly Volume)</h4>
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Last 7 Days</span>
            </div>
            
            <div className="flex-1 flex items-end justify-between px-2 pb-2 relative">
              {/* Chart Grid Lines */}
              <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
                <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
                <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
              </div>

              {last7DaysData.map((d, index) => {
                const heightPercent = maxCount > 0 ? (d.count / maxCount) * 85 : 0;
                const isToday = d.date === todayStr;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group z-10">
                    {/* Visual Bar element with beautiful rounded-t styles and brand color */}
                    <div className="w-5 sm:w-6 bg-slate-100/80 rounded-t h-28 flex items-end relative">
                      <div 
                        style={{ height: `${Math.max(heightPercent, 10)}%` }}
                        className={`w-full rounded-t transition-all duration-700 ease-out ${
                          isToday ? 'bg-[#1A6BB5]' : 'bg-slate-350 hover:bg-[#1A6BB5]/70'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-[9px] font-black mt-2 ${isToday ? 'text-[#1A6BB5]' : 'text-slate-400'}`}>
                      {d.day.substring(0, 1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Bento Buttons Row */}
          <div className="grid grid-cols-2 gap-4">
            
            <button 
              id="btn-quick-new-patient"
              onClick={onOpenQuickPatient}
              className="h-36 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center space-y-3 hover:border-[#1A6BB5] hover:bg-blue-50 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-115 transition-transform shrink-0">
                <svg className="w-6 h-6 text-[#1A6BB5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div className="text-center leading-normal">
                <p className="font-extrabold text-sm text-slate-700">Naya Patient</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">New Entry</p>
              </div>
            </button>

            <button 
              id="btn-quick-new-prescription"
              onClick={() => onNavigate('prescriptions')}
              className="h-36 bg-[#1A6BB5] rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-lg shadow-blue-100 hover:brightness-110 transition-all cursor-pointer text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <div className="text-center leading-normal">
                <p className="font-extrabold text-sm">New Rx (लिखें)</p>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mt-0.5">Digital Parchi</p>
              </div>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
