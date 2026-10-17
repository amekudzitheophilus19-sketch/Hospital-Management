import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  X,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { LabTest, LabParameter, LabTestStatus } from '../../types/hms';

interface LaboratoryViewProps {
  onPrintLab: (test: LabTest) => void;
}

export const LaboratoryView: React.FC<LaboratoryViewProps> = ({ onPrintLab }) => {
  const { labTests, patients, doctors, orderLabTest, updateLabTestResult } = useHospital();

  const [statusFilter, setStatusFilter] = useState<'All' | LabTestStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isResultEntryOpen, setIsResultEntryOpen] = useState(false);

  // New Lab Order Form
  const [orderForm, setOrderForm] = useState({
    patientId: patients[0]?.id || '',
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    orderedBy: doctors[0]?.name || 'Attending Physician',
  });

  // Result entry form
  const [resultParams, setResultParams] = useState<LabParameter[]>([]);
  const [techNotes, setTechNotes] = useState('');

  const standardTestTemplates: Record<string, { category: string; parameters: LabParameter[] }> = {
    'Complete Blood Count (CBC) with Differential': {
      category: 'Hematology',
      parameters: [
        { parameter: 'White Blood Cell (WBC)', value: '7.4', unit: '10^3/uL', referenceRange: '4.5 - 11.0', isAbnormal: false },
        { parameter: 'Hemoglobin (Hgb)', value: '14.0', unit: 'g/dL', referenceRange: '13.5 - 17.5', isAbnormal: false },
        { parameter: 'Hematocrit (Hct)', value: '41.5', unit: '%', referenceRange: '41.0 - 50.0', isAbnormal: false },
        { parameter: 'Platelet Count', value: '255', unit: '10^3/uL', referenceRange: '150 - 450', isAbnormal: false },
      ],
    },
    'Comprehensive Metabolic Panel (CMP)': {
      category: 'Clinical Biochemistry',
      parameters: [
        { parameter: 'Sodium (Na+)', value: '140', unit: 'mEq/L', referenceRange: '136 - 145', isAbnormal: false },
        { parameter: 'Potassium (K+)', value: '4.2', unit: 'mEq/L', referenceRange: '3.5 - 5.1', isAbnormal: false },
        { parameter: 'Serum Glucose (Fasting)', value: '98', unit: 'mg/dL', referenceRange: '70 - 99', isAbnormal: false },
        { parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', isAbnormal: false },
        { parameter: 'Blood Urea Nitrogen (BUN)', value: '15', unit: 'mg/dL', referenceRange: '7 - 20', isAbnormal: false },
      ],
    },
    'Cardiac Troponin-I Serial Panel': {
      category: 'Clinical Biochemistry',
      parameters: [
        { parameter: 'Troponin-I', value: '0.02', unit: 'ng/mL', referenceRange: '< 0.04', isAbnormal: false },
        { parameter: 'CK-MB Isoenzyme', value: '2.8', unit: 'ng/mL', referenceRange: '0.0 - 5.0', isAbnormal: false },
      ],
    },
    'Coagulation Prothrombin Time / INR': {
      category: 'Hematology',
      parameters: [
        { parameter: 'Prothrombin Time (PT)', value: '12.2', unit: 'seconds', referenceRange: '11.0 - 13.5', isAbnormal: false },
        { parameter: 'INR', value: '1.05', unit: 'ratio', referenceRange: '0.8 - 1.2', isAbnormal: false },
      ],
    },
    'Lipid Panel Profile': {
      category: 'Biochemistry',
      parameters: [
        { parameter: 'Total Cholesterol', value: '185', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: false },
        { parameter: 'Triglycerides', value: '140', unit: 'mg/dL', referenceRange: '< 150', isAbnormal: false },
        { parameter: 'HDL Good Cholesterol', value: '55', unit: 'mg/dL', referenceRange: '> 40', isAbnormal: false },
        { parameter: 'LDL Bad Cholesterol', value: '102', unit: 'mg/dL', referenceRange: '< 100', isAbnormal: true },
      ],
    },
  };

  const filteredTests = labTests.filter((test) => {
    const matchesStatus = statusFilter === 'All' || test.status === statusFilter;
    const matchesSearch =
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === orderForm.patientId);
    if (!patient) return;

    const template = standardTestTemplates[orderForm.testName] || {
      category: 'Diagnostics',
      parameters: [],
    };

    orderLabTest({
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      testName: orderForm.testName,
      category: template.category,
      orderedBy: orderForm.orderedBy,
      dateOrdered: new Date().toISOString().replace('T', ' ').substring(0, 16),
      parameters: template.parameters,
    });

    setIsOrderModalOpen(false);
  };

  const handleOpenResultEntry = (test: LabTest) => {
    setSelectedLabTest(test);
    const initialParams =
      test.parameters.length > 0
        ? test.parameters
        : standardTestTemplates[test.testName]?.parameters || [
            { parameter: 'Primary Value', value: 'Normal', unit: 'N/A', referenceRange: 'Normal', isAbnormal: false },
          ];
    setResultParams(initialParams);
    setTechNotes(test.technicianNotes || 'Specimen processed adhering to standard CLIA quality protocol.');
    setIsResultEntryOpen(true);
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabTest) return;

    updateLabTestResult(selectedLabTest.id, resultParams, techNotes);
    setIsResultEntryOpen(false);
    setSelectedLabTest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clinical Pathology & Diagnostics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Specimen requisition, automated biochemical panels, and certified diagnostic test reporting.
          </p>
        </div>

        <button
          onClick={() => setIsOrderModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Requisition Diagnostic Test</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient, Sample ID, Test Name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['All', 'Pending Sample', 'In Analysis', 'Completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Sample ID</th>
                <th className="py-3 px-4 font-semibold">Test Name</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Ordered By</th>
                <th className="py-3 px-4 font-semibold">Date Ordered</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No diagnostic orders found.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const isCompleted = test.status === 'Completed';
                  const isInAnalysis = test.status === 'In Analysis';
                  const hasAbnormal = test.parameters.some((p) => p.isAbnormal);

                  return (
                    <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {test.sampleId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{test.testName}</div>
                        <div className="text-[10px] text-slate-400">{test.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{test.patientName}</div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {test.patientMrn}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{test.orderedBy}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {test.dateOrdered}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700'
                                : isInAnalysis
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {test.status}
                          </span>
                          {isCompleted && hasAbnormal && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Abnormal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {test.status !== 'Completed' && (
                            <button
                              onClick={() => handleOpenResultEntry(test)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition-colors cursor-pointer"
                            >
                              Enter Results
                            </button>
                          )}

                          {isCompleted && (
                            <>
                              <button
                                onClick={() => setSelectedLabTest(test)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              >
                                View Results
                              </button>
                              <button
                                onClick={() => onPrintLab(test)}
                                className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                                title="Print Lab Report"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order New Lab Test Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOrder}
            className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Diagnostic Test Requisition
              </h2>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Patient *
                </label>
                <select
                  value={orderForm.patientId}
                  onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
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
                  Laboratory Panel / Specimen Test *
                </label>
                <select
                  value={orderForm.testName}
                  onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
                >
                  {Object.keys(standardTestTemplates).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ordering Attending Physician *
                </label>
                <select
                  value={orderForm.orderedBy}
                  onChange={(e) => setOrderForm({ ...orderForm, orderedBy: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs"
              >
                Submit Laboratory Requisition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enter Lab Results Modal */}
      {isResultEntryOpen && selectedLabTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveResults}
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-xl flex flex-col text-xs"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Input Diagnostic Results: {selectedLabTest.testName}
                </h2>
                <div className="text-[11px] text-slate-500 font-mono">
                  Sample: {selectedLabTest.sampleId} · Patient: {selectedLabTest.patientName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResultEntryOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Assay Parameters & Analyte Values
                </div>

                <div className="space-y-2">
                  {resultParams.map((param, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                    >
                      <div className="font-semibold text-slate-900">{param.parameter}</div>
                      <div>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...resultParams];
                            updated[index] = { ...updated[index], value: e.target.value };
                            setResultParams(updated);
                          }}
                          placeholder="Measured Value"
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Ref: {param.referenceRange} {param.unit}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={param.isAbnormal}
                            onChange={(e) => {
                              const updated = [...resultParams];
                              updated[index] = {
                                ...updated[index],
                                isAbnormal: e.target.checked,
                              };
                              setResultParams(updated);
                            }}
                            className="rounded text-rose-600"
                          />
                          <span
                            className={
                              param.isAbnormal ? 'font-bold text-rose-600' : 'text-slate-600'
                            }
                          >
                            Abnormal Flag
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pathologist & Lab Technologist Notes
                </label>
                <textarea
                  rows={3}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-sans"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResultEntryOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs"
              >
                Certify & Release Laboratory Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Results Modal */}
      {selectedLabTest && !isResultEntryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-xl flex flex-col text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedLabTest.testName}
                </h2>
                <div className="text-[11px] text-slate-500 font-mono">
                  Sample: {selectedLabTest.sampleId} · Patient: {selectedLabTest.patientName} (
                  {selectedLabTest.patientMrn})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLabTest(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-2.5">Analyte Parameter</th>
                      <th className="p-2.5">Measured Value</th>
                      <th className="p-2.5">Reference Interval</th>
                      <th className="p-2.5">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                    {selectedLabTest.parameters.map((p, i) => (
                      <tr
                        key={i}
                        className={p.isAbnormal ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}
                      >
                        <td className="p-2.5 font-sans font-medium text-slate-900">
                          {p.parameter}
                        </td>
                        <td
                          className={`p-2.5 font-bold ${
                            p.isAbnormal ? 'text-rose-700' : 'text-slate-900'
                          }`}
                        >
                          {p.value} {p.unit}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {p.referenceRange} {p.unit}
                        </td>
                        <td className="p-2.5">
                          {p.isAbnormal ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                              Abnormal Alert
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700">
                              Within Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedLabTest.technicianNotes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Clinical Lab Notes:
                  </span>
                  <p className="text-slate-600">{selectedLabTest.technicianNotes}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => onPrintLab(selectedLabTest)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Laboratory Certificate</span>
              </button>

              <button
                onClick={() => setSelectedLabTest(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
