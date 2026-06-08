/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  X, 
  CheckCircle, 
  Info, 
  ShieldCheck, 
  Filter,
  Check
} from 'lucide-react';
import { Medicine } from '../types';
import { generateId } from '../utils';

interface MedicinesDatabaseProps {
  medicines: Medicine[];
  onAddMedicine: (medicine: Medicine) => void;
}

export default function MedicinesDatabase({
  medicines,
  onAddMedicine
}: MedicinesDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [salt, setSalt] = useState('');
  const [category, setCategory] = useState('Analgesics / Antipyretics');
  const [commonDose, setCommonDose] = useState('1-0-1');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const CATEGORIES = [
    'All',
    'Analgesics / Antipyretics',
    'Analgesics / NSAIDs',
    'Antibiotics',
    'Antiallergics / Antihistamines',
    'Gastroprotectives / Antacids',
    'Antidiabetics',
    'Antihypertensives',
    'Cardioprotectives / Lipid Lowering',
    'Cough & Cold',
    'Respiratory / Anti-asthmatics',
    'Vitamins & Minerals',
    'Topical Steroids',
    'Topical Antifungals'
  ];

  const DOSE_OPTIONS = [
    '1-0-1',
    '1-1-1',
    '0-0-1',
    '1-0-0',
    '0-1-0',
    'Once a week',
    'Once a month',
    'SOS (If needed)'
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Dawai ka naam likhein (दवा का नाम लिखिए)';
    }

    if (!salt.trim()) {
      newErrors.salt = 'Generic / Salt Formula likhein (साल्ट फ़ॉर्मूला लिखिए)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddMedicine({
      id: generateId('med'),
      name: name.trim(),
      salt: salt.trim(),
      category,
      commonDose
    });

    // Reset Form
    setName('');
    setSalt('');
    setCategory('Analgesics / Antipyretics');
    setCommonDose('1-0-1');
    setErrors({});
    setShowAddForm(false);
  };

  // Filtered medicines
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.salt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="medicines-container">
      {/* Header index panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-100" id="medicines-header">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Medicines (दवाइयों का डेटाबेस)</h2>
            <p className="text-xs text-gray-400 mt-1">Configure pre-loaded formulations or add custom drugs</p>
          </div>
        </div>

        {!showAddForm && (
          <button
            id="btn-add-medicine-toggle"
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-sm flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nayi Dawai Add Karein</span>
          </button>
        )}
      </div>

      {/* Expandable Add Custom Medicine Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm animate-fadeIn relative" id="add-medicine-form">
          <button
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider mb-4">Add Custom Formulation (दवाई का विवरण जोड़ें)</h3>

          <form onSubmit={handleAddSubmit} className="space-y-4" id="med-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Medicine Brand Name (दवाई का नाम) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Crocin 650mg, Augmentin 625 Duo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                />
                {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Generic Salt Composition (साल्ट / फॉर्मूला) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol IP, Amoxicillin Trihydrate"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-blue-500"
                />
                {errors.salt && <p className="text-red-500 text-xs font-bold mt-1">{errors.salt}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Therapeutic Category (वर्ग)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase font-mono">Usual Default Dosage (डिफ़ॉल्ट खुराक)</label>
                <select
                  value={commonDose}
                  onChange={(e) => setCommonDose(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {DOSE_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm cursor-pointer"
              >
                Khaarij Karein
              </button>
              <button
                type="submit"
                id="btn-save-medicine"
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm cursor-pointer"
              >
                Composition Record Save Karein
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Searching & Category filters panel toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="medicines-toolbar">
        {/* Search Input */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-3 flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400 pl-1" />
          <input
            type="text"
            id="inp-med-search"
            placeholder="Search by brand name or chemical salt formula... (नाम या साल्ट दर्ज करें)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 py-1"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-650 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Picker Select */}
        <div className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center justify-between">
          <Filter className="h-4.5 w-4.5 text-gray-400 mr-2" />
          <select
            id="select-med-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'Sabhi Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clinical Drugs Database Grid List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs" id="medicines-db-table">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900">Drug Formula List ({filteredMedicines.length} items matched)</h3>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-extrabold flex items-center gap-0.5 border border-emerald-110">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-605" />
            Allergy Protection Sync Active
          </span>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="py-20 text-center text-gray-400" id="meds-table-empty">
            <span className="text-5xl">💊</span>
            <p className="font-bold text-gray-650 mt-3 text-lg">Koi formulation nahi mila!</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Naya formulary add karne ke liye "Nayi Dawai Add Karein" click karein.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" id="meds-grid-table-container">
            <table className="w-full text-left border-collapse" id="medicines-main-table">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 pl-5">Medicine Item Name</th>
                  <th className="py-3">Chemical Salt / Generic</th>
                  <th className="py-3">Category Group</th>
                  <th className="py-3 pr-5 text-right">Typical Prescription Dose</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all text-sm font-medium">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Pill className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-gray-950 block">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-gray-500 font-mono">
                      {m.salt}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-gray-100 text-gray-650">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-5">
                      <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-105 rounded px-2 py-0.5 inline-block">
                        {m.commonDose}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
