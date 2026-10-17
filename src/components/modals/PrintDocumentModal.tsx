import React from 'react';
import { Printer, X, Activity } from 'lucide-react';
import { Patient, Prescription, Invoice, LabTest } from '../../types/hms';

export type PrintDocType = 'patient' | 'prescription' | 'invoice' | 'lab';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PrintDocType;
  patientData?: Patient | null;
  prescriptionData?: Prescription | null;
  invoiceData?: Invoice | null;
  labData?: LabTest | null;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  type,
  patientData,
  prescriptionData,
  invoiceData,
  labData,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-xl border border-slate-200 shadow-2xl flex flex-col">
        {/* Toolbar (Hidden when printed via .no-print) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-700" />
            <span className="font-bold text-slate-900 text-sm">
              Clinical Document Print Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="printable-area p-8 overflow-y-auto flex-1 bg-white text-slate-900 text-xs">
          {/* Hospital Header Banner */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  AuraCare Central Hospital
                </h1>
                <p className="text-slate-500 text-[11px]">
                  Department of Clinical Health & Inpatient Services · Accredited Tertiary Care Center
                </p>
                <p className="text-slate-400 text-[10px]">
                  402 Metro Health Parkway, Suite 100 · Tel: +1 (555) 234-8000 · License #HOSP-99214
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-600">
              <div>Date: {new Date().toISOString().split('T')[0]}</div>
              <div>System: AuraCare EHR v2.4</div>
            </div>
          </div>

          {/* DOCUMENT 1: PATIENT CLINICAL SUMMARY */}
          {type === 'patient' && patientData && (
            <div className="space-y-6">
              <div className="text-center pb-2">
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                  Electronic Health Record (EHR) Clinical Summary
                </h2>
                <span className="text-slate-500 text-xs">Official Inpatient Medical Record</span>
              </div>

              {/* Patient info box */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                  <span className="font-bold text-sm text-slate-900">{patientData.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">MRN / ID</span>
                  <span className="font-mono font-bold text-slate-900">{patientData.mrn}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Age / Sex / Blood</span>
                  <span className="font-mono">{patientData.age}y · {patientData.gender} · {patientData.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                  <span className="font-semibold text-teal-800">{patientData.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Insurance Payer</span>
                  <span>{patientData.insuranceProvider} ({patientData.insurancePolicyNumber})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Attending Doctor</span>
                  <span>{patientData.admittingDoctorName || 'Outpatient Staff'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Bed Location</span>
                  <span>{patientData.bedNumber ? `${patientData.bedNumber} (${patientData.wardName})` : 'Outpatient'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Allergies</span>
                  <span className="font-bold text-rose-700">{patientData.allergies.join(', ') || 'NKDA'}</span>
                </div>
              </div>

              {/* Vitals Summary */}
              {patientData.vitals.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    Recent Vital Signs Telemetry
                  </h3>
                  <table className="w-full text-left text-xs font-mono tabular-nums">
                    <thead>
                      <tr className="border-b text-slate-500 text-[10px]">
                        <th className="py-1">Timestamp</th>
                        <th className="py-1">BP (mmHg)</th>
                        <th className="py-1">Heart Rate</th>
                        <th className="py-1">Temp</th>
                        <th className="py-1">SpO2</th>
                        <th className="py-1">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientData.vitals.slice(0, 3).map((v) => (
                        <tr key={v.id}>
                          <td className="py-1.5">{v.timestamp}</td>
                          <td className="py-1.5 font-bold">{v.bloodPressure}</td>
                          <td className="py-1.5">{v.heartRate} bpm</td>
                          <td className="py-1.5">{v.temperature}°F</td>
                          <td className="py-1.5">{v.spO2}%</td>
                          <td className="py-1.5 font-sans">{v.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Clinical Notes */}
              <div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Clinical Diagnoses & Attending Doctor Notes
                </h3>
                <div className="space-y-3">
                  {patientData.notes.map((n) => (
                    <div key={n.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{n.doctorName} ({n.role})</span>
                        <span className="font-mono text-slate-500 font-normal">{n.timestamp}</span>
                      </div>
                      {n.diagnosis && (
                        <div className="font-semibold text-teal-800">Diagnosis: {n.diagnosis}</div>
                      )}
                      <p className="text-slate-700 leading-relaxed font-sans">{n.noteText}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature block */}
              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-200">
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Attending Physician Signature</div>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Hospital Medical Director Stamp & Date</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT 2: MEDICAL PRESCRIPTION SLIP */}
          {type === 'prescription' && prescriptionData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    Official Medical Prescription (Rx)
                  </h2>
                  <span className="text-slate-500 text-xs font-mono">
                    Rx Reference: {prescriptionData.prescriptionNumber}
                  </span>
                </div>
                <div className="text-3xl font-serif font-black text-teal-700 italic">
                  ℞
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient</span>
                  <span className="font-bold text-sm text-slate-900">{prescriptionData.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Date Prescribed</span>
                  <span className="font-mono font-medium">{prescriptionData.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Prescribing Physician</span>
                  <span className="font-semibold text-slate-800">{prescriptionData.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Clinical Indication</span>
                  <span className="font-medium text-slate-700">{prescriptionData.diagnosis}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3">
                  Prescribed Pharmaceuticals & Regimen
                </h3>
                <div className="space-y-3">
                  {prescriptionData.medications.map((med, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-white space-y-1">
                      <div className="flex justify-between font-bold text-sm text-slate-900">
                        <span>{med.name}</span>
                        <span className="font-mono text-xs text-slate-500">{med.duration}</span>
                      </div>
                      <div className="text-slate-700 font-medium">Sig: {med.dosage} — {med.frequency}</div>
                      <div className="text-slate-500 text-[11px] italic">Directions: {med.instructions}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-12 grid grid-cols-2 gap-8 border-t border-slate-200">
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Licensed Prescriber Signature & DEA #</div>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Dispensing Pharmacist Verification</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT 3: BILLING STATEMENT / INVOICE */}
          {type === 'invoice' && invoiceData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    Hospital Inpatient & Outpatient Statement
                  </h2>
                  <span className="text-slate-500 text-xs font-mono">
                    Statement No: {invoiceData.invoiceNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs">
                    Status: {invoiceData.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Billed To Patient</span>
                  <span className="font-bold text-sm text-slate-900">{invoiceData.patientName}</span>
                  <div className="font-mono text-slate-500 text-[11px]">MRN: {invoiceData.patientMrn}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Dates</span>
                  <div className="font-mono text-slate-700">Issued: {invoiceData.date}</div>
                  <div className="font-mono text-slate-500">Due: {invoiceData.dueDate}</div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                      <th className="py-2">Category</th>
                      <th className="py-2 font-sans">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {invoiceData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-sans text-teal-800 font-semibold">{item.category}</td>
                        <td className="py-2 font-sans font-medium text-slate-900">{item.description}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 text-right font-bold">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800 text-xs font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-2 text-right font-sans">Subtotal:</td>
                      <td className="py-2 text-right">${invoiceData.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-1 text-right font-sans">Medical Tax (0%):</td>
                      <td className="py-1 text-right">$0.00</td>
                    </tr>
                    <tr className="text-sm text-teal-800">
                      <td colSpan={4} className="py-2 text-right font-sans">Total Balance Due:</td>
                      <td className="py-2 text-right font-bold">${invoiceData.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-3 bg-slate-50 rounded text-[11px] text-slate-500">
                Payment Remittance Terms: Remit payments via hospital portal or bank transfer. For insurance claim questions, contact Patient Financial Services at +1 (555) 234-8050.
              </div>
            </div>
          )}

          {/* DOCUMENT 4: LABORATORY TEST REPORT */}
          {type === 'lab' && labData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    Clinical Laboratory Test Certificate
                  </h2>
                  <span className="text-slate-500 text-xs font-mono">
                    Sample Requisition ID: {labData.sampleId}
                  </span>
                </div>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  Certified Result
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                  <span className="font-bold text-slate-900">{labData.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient MRN</span>
                  <span className="font-mono">{labData.patientMrn}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Test Category</span>
                  <span>{labData.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Ordering Physician</span>
                  <span>{labData.orderedBy}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  {labData.testName} Analyte Panel
                </h3>
                <table className="w-full text-left text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b text-slate-500 text-[10px] uppercase">
                      <th className="py-1.5 font-sans">Analyte Parameter</th>
                      <th className="py-1.5">Measured Result</th>
                      <th className="py-1.5">Reference Range</th>
                      <th className="py-1.5 font-sans">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labData.parameters.map((p, i) => (
                      <tr key={i} className={p.isAbnormal ? 'font-bold text-rose-700 bg-rose-50/50' : ''}>
                        <td className="py-2 font-sans font-medium text-slate-900">{p.parameter}</td>
                        <td className="py-2">{p.value} {p.unit}</td>
                        <td className="py-2 text-slate-500">{p.referenceRange} {p.unit}</td>
                        <td className="py-2 font-sans">
                          {p.isAbnormal ? 'ABNORMAL' : 'Normal'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {labData.technicianNotes && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">Laboratory Director Remarks:</span>
                  <p className="text-slate-700">{labData.technicianNotes}</p>
                </div>
              )}

              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-200">
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Medical Technologist (ASCP) Sign-Off</div>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <div className="text-[11px] text-slate-500 mt-1">Pathology Department Seal</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
