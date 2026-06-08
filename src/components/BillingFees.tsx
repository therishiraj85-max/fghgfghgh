/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  IndianRupee, 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Wallet,
  Coins,
  QrCode,
  FileCheck
} from 'lucide-react';
import { Patient, Bill, BillService, ClinicSettings } from '../types';
import { formatDate, generateId, formatCurrency, getRelativeDateString } from '../utils';

interface BillingFeesProps {
  patients: Patient[];
  bills: Bill[];
  settings: ClinicSettings;
  onAddBill: (bill: Bill) => void;
  onUpdateBillStatus: (id: string, status: Bill['status']) => void;
}

export default function BillingFees({
  patients,
  bills,
  settings,
  onAddBill,
  onUpdateBillStatus
}: BillingFeesProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Bill Generation States
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatDropdownOpen, setIsPatDropdownOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [billStatus, setBillStatus] = useState<Bill['status']>('Paid');

  // Dynamic services list
  const [services, setServices] = useState<BillService[]>([
    { name: 'OPD Consultation Fee', amount: settings.opdFee }
  ]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceAmount, setCustomServiceAmount] = useState('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleServiceTypeChange = (feeType: 'opd' | 'new' | 'followup' | 'emergency') => {
    let amt = settings.opdFee;
    let label = 'OPD Consultation Fee';
    if(feeType === 'new') { amt = settings.newPatientFee; label = 'New Case Registration Consultation'; }
    if(feeType === 'followup') { amt = settings.followUpFee; label = 'Follow-up Consultation Review'; }
    if(feeType === 'emergency') { amt = settings.emergencyFee; label = 'Emergency Consultation Critical Care'; }

    setServices([{ name: label, amount: amt }]);
  };

  const addCustomService = () => {
    if (!customServiceName.trim() || !customServiceAmount || isNaN(Number(customServiceAmount))) {
      return;
    }
    setServices([...services, { name: customServiceName.trim(), amount: Number(customServiceAmount) }]);
    setCustomServiceName('');
    setCustomServiceAmount('');
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const totalBillAmount = services.reduce((sum, s) => sum + s.amount, 0);

  const handleSubmitBill = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!selectedPatientId) {
      errors.patient = 'Pehle patient select karein (पहले मरीज चुनिए)';
    }

    if (services.length === 0) {
      errors.services = 'Settle karne ke liye kam se kam ek service add krein (शुल्क जोड़ें)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId)!;

    const newBill: Bill = {
      id: generateId('bill'),
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      date: getRelativeDateString(0),
      services,
      totalAmount: totalBillAmount,
      paymentMode,
      status: billStatus
    };

    onAddBill(newBill);
    setSelectedBill(newBill);
    setViewMode('list');

    // Reset Form
    setSelectedPatientId('');
    setPatientSearch('');
    setServices([{ name: 'OPD Consultation Fee', amount: settings.opdFee }]);
    setFormErrors({});
  };

  const handlePrintSettleSlip = (bill: Bill) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Settle Slip - ${bill.id.toUpperCase()}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #444; line-height: 1.5; }
            .letterhead { border-bottom: 2px solid #1A6BB5; pb-15px; margin-bottom: 20px; text-align: center; }
            .invoice-head { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
            .billing-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .billing-table th, .billing-table td { border-bottom: 1px solid #E2E8F0; padding: 12px 10px; text-align: left; font-size: 13px; }
            .billing-table th { background: #EDF2F7; font-weight: bold; color: #2D3748; }
            .totals { text-align: right; margin-top: 25px; font-size: 14px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            .badge-paid { background: #DEF7EC; color: #03543F; }
            .badge-unpaid { background: #FDE8E8; color: #9B1C1C; }
            .seal-box { border-top: 1px solid #EEE; margin-top: 55px; pt-15px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <h1 style="margin:0; color:#1A6BB5; font-size:22px;">${settings.clinicName}</h1>
            <p style="margin:5px 0; font-size:12px; color:#666;">${settings.doctorName} &bull; Reg No: ${settings.regNo}</p>
            <p style="margin:2px 0; font-size:11px; color:#999;">${settings.address}</p>
          </div>

          <h3 style="text-align:center; text-transform:uppercase; margin-top:0; letter-spacing:1px; font-size:15px; border-bottom:1px solid #EEE; pb-5px;">RECEIPT INVOICE</h3>

          <div class="invoice-head">
            <div>
              <strong>PATIENT DETAILS:</strong><br/>
              Name: ${bill.patientName}<br/>
              Phone: +91 ${bill.patientPhone || '-'}<br/>
              MID Reference: ${bill.patientId}
            </div>
            <div style="text-align: right;">
              <strong>INVOICE DETAILS:</strong><br/>
              Invoice No: ${bill.id.toUpperCase().split('-')[2] || bill.id}<br/>
              Date: ${formatDate(bill.date)}<br/>
              Settle Mode: ${bill.paymentMode}<br/>
              Status: <span class="badge ${bill.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${bill.status}</span>
            </div>
          </div>

          <table class="billing-table">
            <thead>
              <tr>
                <th>Service Settle Description</th>
                <th style="text-align: right;">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${bill.services.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td style="text-align: right;">₹${s.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold; font-size: 14px; background: #FAF9F6;">
                <td>NET TOTAL RECIEVED</td>
                <td style="text-align: right; color: #1A6BB5;">₹${bill.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <p>Net Amount in words: <strong>Rupees ${bill.totalAmount} Only</strong></p>
          </div>

          ${bill.paymentMode === 'UPI' && settings.upiId ? `
            <div style="background:#F7FAFC; border:1px solid #EDF2F7; padding:15px; border-radius:5px; margin-top:20px; font-size:11px;">
              <strong>UPI Payment details:</strong> Scan the UPI dynamically or transfer to Virtual Private address: <strong>${settings.upiId}</strong>
            </div>
          ` : ''}

          <div class="seal-box">
            <p>For ${settings.clinicName}</p>
            <div style="height:45px;"></div>
            <p style="border-top:1px solid #DDD; display:inline-block; padding-top:5px; width:150px;">Authorized Signature</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  // Filter bills
  const filteredBills = bills.filter(b => {
    const q = searchQuery.toLowerCase();
    return b.patientName.toLowerCase().includes(q) || b.id.includes(q);
  });

  // Calculate stats
  const todayPaidRevenue = bills
    .filter(b => b.date === getRelativeDateString(0) && b.status === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalPaidRevenueAllTime = bills
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingUnpaidSum = bills
    .filter(b => b.status === 'Unpaid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6" id="billing-fees-container">
      {/* Metrics Row at top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="billing-metrics-panel">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center shadow-2xs">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mr-4">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Collected Today</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(todayPaidRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center shadow-2xs">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Total Net Revenue</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalPaidRevenueAllTime)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center shadow-2xs">
          <div className="p-3 rounded-xl bg-red-50 text-red-650 mr-4 animate-pulse">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Outstanding Unpaid</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(pendingUnpaidSum)}</h3>
          </div>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6" id="billing-list-view">
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-100 rounded-2xl p-4 gap-3">
            <div className="bg-white border border-gray-105 rounded-xl p-2.5 flex items-center space-x-2 text-xs w-full sm:max-w-md">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Patient ka naam se search krein... (नाम से ढूंढिए)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent font-semibold outline-none w-full"
              />
            </div>

            <button
              id="btn-billing-create-start"
              onClick={() => setViewMode('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-sm flex items-center justify-center space-x-1 cursor-pointer transition-all w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Settle Naya Bill</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5" id="billing-list-panel">
            {filteredBills.length === 0 ? (
              <div className="text-center py-20" id="billing-table-empty">
                <span className="text-5xl">🧾</span>
                <p className="font-bold text-gray-700 mt-3 text-lg">Koi invoice data nahi hai!</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Generate bills in seconds using "Settle Naya Bill" setup above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" id="billing-table-container">
                <table className="w-full text-left border-collapse font-sans font-medium" id="billing-ledger-table">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/40">
                      <th className="py-2.5 pl-4">Date</th>
                      <th className="py-2.5">Invoice-No</th>
                      <th className="py-2.5">Patient Details</th>
                      <th className="py-2.5">Services Settle Ledger</th>
                      <th className="py-2.5">Mode</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5">Settle Amount</th>
                      <th className="py-2.5 text-right pr-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map(bill => (
                      <tr key={bill.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all text-sm">
                        <td className="py-3.5 pl-4 font-bold text-gray-650">
                          {formatDate(bill.date)}
                        </td>
                        <td className="py-3.5 text-xs font-mono text-gray-450 uppercase">
                          {bill.id.split('-')[2]?.toUpperCase() || bill.id}
                        </td>
                        <td className="py-3.5 font-bold text-gray-900">
                          {bill.patientName}
                        </td>
                        <td className="py-3.5 text-xs text-gray-600 max-w-[170px] truncate">
                          {bill.services.map(s => s.name).join(', ')}
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs">
                            {bill.paymentMode === 'UPI' ? <QrCode className="h-3.5 w-3.5 text-blue-500" /> : bill.paymentMode === 'Card' ? <CreditCard className="h-3.5 w-3.5 text-purple-500" /> : <Coins className="h-3.5 w-3.5 text-amber-500" />}
                            {bill.paymentMode}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-extrabold ${
                            bill.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : bill.status === 'Waived' 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-gray-950 font-mono">
                          {formatCurrency(bill.totalAmount)}
                        </td>
                        <td className="py-3.5 text-right pr-4">
                          <div className="flex items-center justify-end space-x-1.5">
                            {bill.status === 'Unpaid' && (
                              <button
                                id={`btn-pay-${bill.id}`}
                                onClick={() => onUpdateBillStatus(bill.id, 'Paid')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-bold text-xs py-1 px-2.5 rounded-lg border border-emerald-200 cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              id={`btn-print-bill-${bill.id}`}
                              onClick={() => handlePrintSettleSlip(bill)}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-md cursor-pointer"
                              title="Print Invoice Receipt"
                            >
                              <Printer className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CREATE FEE BILL VIEW */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6" id="billing-create-panel">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3" id="billing-create-header">
            <button
              onClick={() => setViewMode('list')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center space-x-1 cursor-pointer bg-gray-50 p-1.5 px-3 rounded-lg"
            >
              <span>&larr; Back to list</span>
            </button>
            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded font-bold border border-purple-100">Invoice compiler</span>
          </div>

          <form onSubmit={handleSubmitBill} className="space-y-6" id="fee-billing-compiler-form">
            
            {/* Patient selector search */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-1">Search Patient <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Patient ka naam enter krein... (नाम दर्ज करें)"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setIsPatDropdownOpen(true);
                    setSelectedPatientId('');
                  }}
                  onFocus={() => setIsPatDropdownOpen(true)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>

              {isPatDropdownOpen && (
                <div className="absolute left-0 right-0 top-16 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-44 overflow-y-auto z-40">
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
              {formErrors.patient && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.patient}</p>}
            </div>

            {/* Fees selection quick loaders */}
            <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Quick load Consultation rates</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('opd')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 p-2.5 text-xs text-left rounded-xl transition-all font-semibold font-sans text-gray-800 cursor-pointer"
                >
                  <span>OPD Consultation OPD</span>
                  <span className="block text-blue-700 font-bold mt-0.5">₹{settings.opdFee}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('new')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 p-2.5 text-xs text-left rounded-xl transition-all font-semibold font-sans text-gray-800 cursor-pointer"
                >
                  <span>New Case OPD</span>
                  <span className="block text-blue-700 font-bold mt-0.5">₹{settings.newPatientFee}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('followup')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 p-2.5 text-xs text-left rounded-xl transition-all font-semibold font-sans text-gray-800 cursor-pointer"
                >
                  <span>Follow-Up Review</span>
                  <span className="block text-blue-700 font-bold mt-0.5">₹{settings.followUpFee}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('emergency')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 p-2.5 text-xs text-left rounded-xl transition-all font-semibold font-sans text-gray-800 cursor-pointer"
                >
                  <span>Emergency Care</span>
                  <span className="block text-blue-700 font-bold mt-0.5">₹{settings.emergencyFee}</span>
                </button>
              </div>
            </div>

            {/* compiling bill services */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">Compiled Billing Ledger (कुल शुल्क सूचि)</label>
              
              {formErrors.services && <p className="text-red-500 text-xs font-bold">{formErrors.services}</p>}

              <div className="space-y-2" id="bill-compiling-rows">
                {services.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{item.name}</span>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-gray-900">₹{item.amount}</span>
                      <button 
                        type="button" 
                        onClick={() => removeService(idx)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom service */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-3 p-3 bg-gray-50 rounded-xl">
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    placeholder="Custom Service description, e.g. Nebulizer Extra Charge"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    placeholder="Charge ₹"
                    value={customServiceAmount}
                    onChange={(e) => setCustomServiceAmount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={addCustomService}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold py-1.5 px-3 w-full cursor-pointer"
                  >
                    + Jodein
                  </button>
                </div>
              </div>
            </div>

            {/* Settle Modes & settlement Status checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Mode options selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Payment Settle Mode (भुगतान तरीका)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'UPI', 'Card'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`p-2.5 border rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        paymentMode === mode 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' 
                          : 'border-gray-250 bg-gray-50/50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {mode === 'Cash' ? <Coins className="h-5 w-5 mb-1" /> : mode === 'UPI' ? <QrCode className="h-5 w-5 mb-1" /> : <CreditCard className="h-5 w-5 mb-1" />}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settlement status check */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Bill Status (भुगतान स्तिथि)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Paid', 'Unpaid', 'Waived'] as const).map(stat => (
                    <button
                      key={stat}
                      type="button"
                      onClick={() => setBillStatus(stat)}
                      className={`p-2.5 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        billStatus === stat 
                          ? stat === 'Unpaid' 
                            ? 'border-red-600 bg-red-50 text-red-700 shadow-2xs' 
                            : stat === 'Waived' 
                              ? 'border-gray-400 bg-gray-100 text-gray-600 shadow-2xs' 
                              : 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                          : 'border-gray-250 bg-gray-50/50 text-gray-500'
                      }`}
                    >
                      {stat === 'Paid' ? 'Paid (जमा है)' : stat === 'Unpaid' ? 'Unpaid (उधार है)' : 'Waived (छूट दी)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* QR UPI instructions code area */}
            {paymentMode === 'UPI' && settings.upiId && (
              <div className="bg-blue-50/50 border border-blue-105 p-4 rounded-xl flex items-center space-x-4 animate-fadeIn" id="upi-display-holder">
                <QrCode className="h-10 w-10 text-blue-600 stroke-1" />
                <div className="text-xs">
                  <span className="font-bold text-blue-900 block uppercase tracking-wide">Doctor UPI QR Active</span>
                  <p className="text-gray-600 mt-1 leading-relaxed">Let patient scan the UPI dynamically. Registered address: <strong className="font-mono text-gray-900 select-all">{settings.upiId}</strong></p>
                </div>
              </div>
            )}

            {/* bottom billing totals submit card */}
            <div className="bg-gray-50 -mx-6 -mb-6 p-5 rounded-b-2xl border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Total Net sum</span>
                <span className="text-xl font-bold text-gray-900 font-mono">₹{totalBillAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-billing-submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm & generate Receipt
                </button>
              </div>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
