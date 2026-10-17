import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  X,
  PackagePlus,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { MedicineItem, Prescription } from '../../types/hms';

interface PharmacyViewProps {
  onPrintPrescription: (prescription: Prescription) => void;
}

export const PharmacyView: React.FC<PharmacyViewProps> = ({ onPrintPrescription }) => {
  const {
    medicines,
    prescriptions,
    patients,
    doctors,
    dispensePrescription,
    addMedication,
    restockMedication,
    addPrescription,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'inventory' | 'prescriptions'>('prescriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [isAddDrugOpen, setIsAddDrugOpen] = useState(false);
  const [isNewRxOpen, setIsNewRxOpen] = useState(false);

  // Add drug form
  const [drugForm, setDrugForm] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    dosage: '500mg Tablet',
    stock: 100,
    minStockAlert: 30,
    unitPrice: 3.50,
    batchNumber: `BT-${Math.floor(10000 + Math.random() * 90000)}`,
    expiryDate: '2027-12-31',
  });

  // New Rx Form
  const [rxForm, setRxForm] = useState({
    patientId: patients[0]?.id || '',
    doctorName: doctors[0]?.name || 'Attending Physician',
    diagnosis: '',
    medicationName: medicines[0]?.name || '',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '7 days',
    instructions: 'Take with food and full glass of water.',
  });

  const categories = ['All', ...Array.from(new Set(medicines.map((m) => m.category)))];

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || med.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const pendingRx = prescriptions.filter((p) => p.status === 'Pending');
  const dispensedRx = prescriptions.filter((p) => p.status === 'Dispensed');
  const lowStockCount = medicines.filter((m) => m.stock <= m.minStockAlert).length;

  const handleAddDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugForm.name.trim()) return;
    addMedication({
      name: drugForm.name.trim(),
      genericName: drugForm.genericName.trim() || drugForm.name.trim(),
      category: drugForm.category,
      dosage: drugForm.dosage,
      stock: Number(drugForm.stock),
      minStockAlert: Number(drugForm.minStockAlert),
      unitPrice: Number(drugForm.unitPrice),
      batchNumber: drugForm.batchNumber,
      expiryDate: drugForm.expiryDate,
    });
    setIsAddDrugOpen(false);
  };

  const handleCreateRx = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === rxForm.patientId);
    if (!patient) return;

    const matchedMed = medicines.find((m) => m.name === rxForm.medicationName) || medicines[0];

    addPrescription({
      patientId: patient.id,
      patientName: patient.name,
      doctorName: rxForm.doctorName,
      date: new Date().toISOString().split('T')[0],
      diagnosis: rxForm.diagnosis || 'Clinical evaluation treatment',
      medications: [
        {
          medicineId: matchedMed.id,
          name: `${rxForm.medicationName} ${rxForm.dosage}`,
          dosage: rxForm.dosage,
          frequency: rxForm.frequency,
          duration: rxForm.duration,
          instructions: rxForm.instructions,
          dispensed: false,
        },
      ],
    });

    setIsNewRxOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Pharmacy & Dispensary</h1>
          <p className="text-xs text-slate-500 mt-1">
            Prescription verification, automated inventory decrementing, and pharmaceutical supply monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewRxOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Prescription</span>
          </button>
          <button
            onClick={() => setIsAddDrugOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Add Medication Item</span>
          </button>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900">
                Low Inventory Warning: {lowStockCount} pharmaceutical item(s) below reorder threshold.
              </span>
              <p className="text-amber-700 mt-0.5">
                Review inventory levels below to restock medications before supply disruptions occur.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('inventory');
            }}
            className="px-3 py-1.5 font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg shrink-0 cursor-pointer"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'prescriptions'
                ? 'text-teal-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Doctor Prescriptions Queue</span>
            {pendingRx.length > 0 && (
              <span className="ml-2 font-mono text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded-full">
                {pendingRx.length}
              </span>
            )}
            {activeTab === 'prescriptions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs font-bold transition-colors cursor-pointer relative ${
              activeTab === 'inventory'
                ? 'text-teal-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pharmaceutical Drug Inventory ({medicines.length} Items)</span>
            {activeTab === 'inventory' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PRESCRIPTIONS QUEUE */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          {/* Pending Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pending Dispensary Orders
                </h2>
                <p className="text-xs text-slate-500">
                  Doctor-signed inpatient & outpatient prescriptions awaiting pharmacy fulfillment.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                {pendingRx.length} Pending
              </span>
            </div>

            {pendingRx.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
                No prescriptions waiting for fulfillment. All orders up to date!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRx.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {rx.prescriptionNumber}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {rx.patientName}
                        </span>
                        <span>·</span>
                        <span className="text-xs text-slate-500">{rx.doctorName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPrintPrescription(rx)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                          title="Print official prescription slip"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          onClick={() => dispensePrescription(rx.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dispense Medications</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-700">
                        Diagnosis: <span className="font-normal text-slate-600">{rx.diagnosis}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {rx.medications.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{med.name}</span>
                              <div className="text-[11px] text-slate-500">
                                {med.frequency} · {med.duration} · {med.instructions}
                              </div>
                            </div>
                            <span className="font-mono text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                              Awaiting Dispense
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Dispensed Archive */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Fulfilled Prescriptions History</h2>
            <div className="space-y-2">
              {dispensedRx.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-slate-700">
                        {rx.prescriptionNumber}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-slate-900">{rx.patientName}</span>
                      <span>·</span>
                      <span className="text-slate-500">{rx.doctorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {rx.medications.map((m) => m.name).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dispensed</span>
                    </span>
                    <button
                      onClick={() => onPrintPrescription(rx)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY CATALOG */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medication, generic, batch..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Medication Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Dosage Form</th>
                    <th className="py-3 px-4 font-semibold">Batch No.</th>
                    <th className="py-3 px-4 font-semibold">Expiry</th>
                    <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                    <th className="py-3 px-4 font-semibold text-center">In Stock</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMedicines.map((med) => {
                    const isLow = med.stock <= med.minStockAlert;
                    return (
                      <tr key={med.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {med.name}
                          <div className="text-[11px] text-slate-400 font-normal">
                            {med.genericName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{med.category}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{med.dosage}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {med.batchNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{med.expiryDate}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                          ${med.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono tabular-nums font-bold px-2 py-0.5 rounded ${
                              isLow
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'text-slate-900'
                            }`}
                          >
                            {med.stock} units
                          </span>
                          {isLow && (
                            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                              Below Min ({med.minStockAlert})
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => restockMedication(med.id, 50)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition-colors cursor-pointer"
                            title="Add 50 units to inventory"
                          >
                            +50 Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add New Drug Modal */}
      {isAddDrugOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDrug}
            className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Add Pharmaceutical Product</h2>
              <button
                type="button"
                onClick={() => setIsAddDrugOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Brand / Trade Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lipitor, Augmentin"
                  value={drugForm.name}
                  onChange={(e) => setDrugForm({ ...drugForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Generic Compound
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atorvastatin"
                  value={drugForm.genericName}
                  onChange={(e) => setDrugForm({ ...drugForm, genericName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={drugForm.category}
                  onChange={(e) => setDrugForm({ ...drugForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                >
                  {[
                    'Antibiotics',
                    'Cardiovascular',
                    'Intravenous Fluids',
                    'Antiemetic',
                    'Respiratory',
                    'Endocrinology',
                    'Analgesics',
                    'Anesthesia',
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Dosage & Form
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500mg Tablet, 100mL IV"
                  value={drugForm.dosage}
                  onChange={(e) => setDrugForm({ ...drugForm, dosage: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Initial Stock Count
                </label>
                <input
                  type="number"
                  value={drugForm.stock}
                  onChange={(e) => setDrugForm({ ...drugForm, stock: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reorder Alert Threshold
                </label>
                <input
                  type="number"
                  value={drugForm.minStockAlert}
                  onChange={(e) =>
                    setDrugForm({ ...drugForm, minStockAlert: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={drugForm.unitPrice}
                  onChange={(e) =>
                    setDrugForm({ ...drugForm, unitPrice: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={drugForm.batchNumber}
                  onChange={(e) => setDrugForm({ ...drugForm, batchNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={drugForm.expiryDate}
                  onChange={(e) => setDrugForm({ ...drugForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddDrugOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs"
              >
                Add to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Write Prescription Modal */}
      {isNewRxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRx}
            className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Issue Medical Prescription</h2>
              <button
                type="button"
                onClick={() => setIsNewRxOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Patient *
                </label>
                <select
                  value={rxForm.patientId}
                  onChange={(e) => setRxForm({ ...rxForm, patientId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) · {p.age}y
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Prescribing Physician *
                </label>
                <select
                  value={rxForm.doctorName}
                  onChange={(e) => setRxForm({ ...rxForm, doctorName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Clinical Indication / Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension stage 2, Acute Sinusitis"
                  value={rxForm.diagnosis}
                  onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Drug from Formulary
                  </label>
                  <select
                    value={rxForm.medicationName}
                    onChange={(e) =>
                      setRxForm({ ...rxForm, medicationName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.dosage}) — In Stock: {m.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={rxForm.dosage}
                    onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={rxForm.frequency}
                    onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={rxForm.duration}
                    onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={rxForm.instructions}
                    onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewRxOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs"
              >
                Issue Prescription Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
