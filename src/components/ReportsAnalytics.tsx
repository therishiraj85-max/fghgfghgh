/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart2, 
  Download, 
  Calendar, 
  Users, 
  Pill, 
  Activity, 
  TrendingUp, 
  X,
  PieChart,
  Grid
} from 'lucide-react';
import { Patient, Prescription, Bill } from '../types';
import { formatDate, getRelativeDateString } from '../utils';

interface ReportsAnalyticsProps {
  patients: Patient[];
  prescriptions: Prescription[];
  bills: Bill[];
}

export default function ReportsAnalytics({
  patients,
  prescriptions,
  bills
}: ReportsAnalyticsProps) {
  const [startDate, setStartDate] = useState(getRelativeDateString(-30));
  const [endDate, setEndDate] = useState(getRelativeDateString(0));

  // Range Check Helper
  const isWithinRange = (dateStr: string) => {
    return dateStr >= startDate && dateStr <= endDate;
  };

  const activeBills = bills.filter(b => isWithinRange(b.date));
  const activePrescriptions = prescriptions.filter(pr => isWithinRange(pr.date));

  // --- REPORT SECTION 1: Patient Stats ---
  const totalPatientsRatio = patients.length;
  const femaleCount = patients.filter(p => p.gender === 'Female').length;
  const maleCount = patients.filter(p => p.gender === 'Male').length;
  const otherGenderCount = patients.filter(p => p.gender === 'Other').length;

  const ageGroups = {
    '0 - 12 (Children)': patients.filter(p => p.age <= 12).length,
    '13 - 19 (Teens)': patients.filter(p => p.age > 12 && p.age <= 19).length,
    '20 - 45 (Adults)': patients.filter(p => p.age > 19 && p.age <= 45).length,
    '46 - 60 (Middle Age)': patients.filter(p => p.age > 45 && p.age <= 60).length,
    '60+ (Seniors)': patients.filter(p => p.age > 60).length
  };

  // --- REPORT SECTION 2: Common Diagnoses --
  const diagnosisCounts: { [key: string]: number } = {};
  activePrescriptions.forEach(pr => {
    if (pr.diagnosis) {
      diagnosisCounts[pr.diagnosis] = (diagnosisCounts[pr.diagnosis] || 0) + 1;
    }
  });
  const sortedDiagnoses = Object.entries(diagnosisCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- REPORT SECTION 3: Common Prescribed Medicines ---
  const medicineCounts: { [key: string]: number } = {};
  activePrescriptions.forEach(pr => {
    pr.medicines.forEach(m => {
      medicineCounts[m.medicineName] = (medicineCounts[m.medicineName] || 0) + 1;
    });
  });
  const sortedMedicines = Object.entries(medicineCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- REPORT SECTION 4: Revenue & Daily Collections ---
  const dailySettleCounts: { [key: string]: number } = {};
  activeBills.filter(b => b.status === 'Paid').forEach(b => {
    dailySettleCounts[b.date] = (dailySettleCounts[b.date] || 0) + b.totalAmount;
  });
  const sortedRevenueDays = Object.entries(dailySettleCounts)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPeriodRevenue = activeBills
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // --- CSV DOWNLOAD UTILITY ---
  const triggerDownloadCsv = (filename: string, header: string[], bodyRows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [header.join(','), ...bodyRows.map(e => e.map(item => `"${item.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPatientCsv = () => {
    const body = patients.map(p => [
      p.id, p.name, p.age.toString(), p.gender, p.bloodGroup, p.phone, p.allergies.join('; '), p.knownConditions.join('; ')
    ]);
    triggerDownloadCsv('patient_analytics_data', ['ID', 'Name', 'Age', 'Gender', 'Blood Group', 'Phone', 'Allergies', 'Chronic Conditions'], body);
  };

  const handleExportDiagnosisCsv = () => {
    const body = sortedDiagnoses.map(d => [d.name, d.count.toString()]);
    triggerDownloadCsv('diagnoses_distribution', ['Diagnosis', 'Occurrence Count'], body);
  };

  const handleExportMedicineCsv = () => {
    const body = sortedMedicines.map(m => [m.name, m.count.toString()]);
    triggerDownloadCsv('frequent_prescribed_drugs', ['Medicine Name', 'Prescription Volume'], body);
  };

  const handleExportRevenueCsv = () => {
    const body = sortedRevenueDays.map(r => [r.date, r.amount.toString()]);
    triggerDownloadCsv('revenue_collection_daily', ['Date', 'Net Paid Amount (INR)'], body);
  };

  const maxDiagCount = Math.max(...sortedDiagnoses.map(d => d.count), 1);
  const maxMedCount = Math.max(...sortedMedicines.map(m => m.count), 1);

  return (
    <div className="space-y-6" id="reports-container">
      {/* KPI Header index panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100" id="reports-header">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 font-sans leading-tight">Reports & Analytics (क्लिनिक रिपोर्ट)</h2>
            <p className="text-xs text-gray-400 mt-1">Audit clinical demographics, epidemiology vectors and collections</p>
          </div>
        </div>

        {/* Date pickers inline */}
        <div className="bg-gray-50 border border-gray-150 rounded-xl p-2.5 flex items-center space-x-2 text-xs" id="date-pickers-block">
          <Calendar className="h-4.5 w-4.5 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent font-bold outline-none text-gray-700 w-28"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent font-bold outline-none text-gray-700 w-28"
          />
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="analytics-master-grid">
        
        {/* Section 1: Clinical Patient Demographics */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between" id="report-demographics-card">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="h-4.5 w-4.5 text-blue-600" />
                1. Patient Demographics & Age
              </h3>
              <button
                id="btn-export-pat-csv"
                onClick={handleExportPatientCsv}
                className="text-blue-600 hover:text-blue-800 p-1 flex items-center text-xs font-bold gap-1 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Gender identity splits stack bar layout */}
            <div className="my-5 space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender Distributions</span>
              <div className="flex h-5 w-full bg-gray-105 rounded-full overflow-hidden" id="gender-stacked-bar">
                {maleCount > 0 && (
                  <div 
                    title={`Male: ${maleCount}`} 
                    style={{ width: `${(maleCount / totalPatientsRatio) * 100}%` }}
                    className="bg-blue-600 text-white text-[9px] font-black flex items-center justify-center"
                  >
                    M ({maleCount})
                  </div>
                )}
                {femaleCount > 0 && (
                  <div 
                    title={`Female: ${femaleCount}`} 
                    style={{ width: `${(femaleCount / totalPatientsRatio) * 100}%` }}
                    className="bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center"
                  >
                    F ({femaleCount})
                  </div>
                )}
                {otherGenderCount > 0 && (
                  <div 
                    title={`Other: ${otherGenderCount}`} 
                    style={{ width: `${(otherGenderCount / totalPatientsRatio) * 100}%` }}
                    className="bg-amber-400 text-black text-[9px] font-black flex items-center justify-center"
                  >
                    O ({otherGenderCount})
                  </div>
                )}
              </div>
            </div>

            {/* Age groups metrics list */}
            <div className="space-y-3" id="age-groups-demographics">
              <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Age Bracket Breakdown</span>
              {Object.entries(ageGroups).map(([group, count]) => {
                const percent = totalPatientsRatio > 0 ? (count / totalPatientsRatio) * 100 : 0;
                
                return (
                  <div key={group} className="text-xs space-y-1">
                    <div className="flex justify-between items-center text-gray-600 font-bold">
                      <span>{group}</span>
                      <span>{count} ({Math.round(percent)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="bg-blue-400 rounded-full h-1.5"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Diseases / Diagnostics Report */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between" id="report-diagnoses-card">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="h-4.5 w-4.5 text-blue-600" />
                2. Top Disease / Diagnoses (रोग)
              </h3>
              <button
                id="btn-export-diag-csv"
                onClick={handleExportDiagnosisCsv}
                className="text-blue-600 hover:text-blue-800 p-1 flex items-center text-xs font-bold gap-1 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {sortedDiagnoses.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-20 border border-dashed border-gray-100 rounded-xl">No diagnoses registered in selected range.</p>
            ) : (
              <div className="space-y-4 pt-2" id="diagnoses-distribution-progress">
                {sortedDiagnoses.map((diag, index) => {
                  const widthPercent = (diag.count / maxDiagCount) * 100;
                  
                  return (
                    <div key={index} className="text-xs space-y-1.5">
                      <div className="flex justify-between font-bold text-gray-700">
                        <span>{diag.name}</span>
                        <span className="text-blue-700 font-mono">{diag.count} prescription{diag.count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-gray-105 rounded-full h-2">
                        <div 
                          style={{ width: `${widthPercent}%` }}
                          className="bg-emerald-500 rounded-full h-2"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Most Prescribed Medicines */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between" id="report-medicines-card">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Pill className="h-4.5 w-4.5 text-blue-600" />
                3. Most Prescribed Medicines
              </h3>
              <button
                id="btn-export-med-csv"
                onClick={handleExportMedicineCsv}
                className="text-blue-600 hover:text-blue-800 p-1 flex items-center text-xs font-bold gap-1 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {sortedMedicines.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-20 border border-dashed border-gray-100 rounded-xl">No medications prescribed in selected range.</p>
            ) : (
              <div className="space-y-4 pt-2" id="meds-distribution-progress">
                {sortedMedicines.map((med, index) => {
                  const widthPercent = (med.count / maxMedCount) * 100;

                  return (
                    <div key={index} className="text-xs space-y-1.5">
                      <div className="flex justify-between font-bold text-gray-700">
                        <span className="font-mono text-gray-900">{med.name}</span>
                        <span className="text-blue-700">{med.count} times</span>
                      </div>
                      <div className="w-full bg-gray-105 rounded-full h-2">
                        <div 
                          style={{ width: `${widthPercent}%` }}
                          className="bg-blue-500 rounded-full h-2"
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Revenue & Daily Collections list ledger */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between" id="report-revenue-card">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                4. Net Revenue: {sortedRevenueDays.length > 0 ? `₹${totalPeriodRevenue.toLocaleString('en-IN')}` : '₹0'}
              </h3>
              <button
                id="btn-export-rev-csv"
                onClick={handleExportRevenueCsv}
                className="text-blue-600 hover:text-blue-800 p-1 flex items-center text-xs font-bold gap-1 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {sortedRevenueDays.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-20 border border-dashed border-gray-100 rounded-xl">No revenue transactions recorded in selected range.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1" id="revenue-ledger-rows">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Collections Log</span>
                {sortedRevenueDays.map((day, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-600">{formatDate(day.date)}</span>
                    <span className="font-bold text-gray-950">₹{day.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
