import React, { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Bed,
  CheckCircle,
  X,
  Heart,
  Thermometer,
  Printer,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient, BloodGroup, PatientStatus, Gender } from '../../types/hms';

interface PatientsViewProps {
  onOpenAdmitModal: (patientId?: string) => void;
  onPrintPatient: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onOpenAdmitModal,
  onPrintPatient,
}) => {
  const {
    patients,
    addPatient,
    dischargePatient,
    recordVitals,
    addClinicalNote,
    doctors,
    prescriptions,
    labTests,
    invoices,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus>('All');
  const [bloodFilter, setBloodFilter] = useState<string>('All');

  // Modals state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isLogVitalsOpen, setIsLogVitalsOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 30,
    dob: '1996-01-01',
    gender: 'Male' as Gender,
    bloodGroup: 'O+' as BloodGroup,
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceProvider: 'Self-Pay / None',
    insurancePolicyNumber: '',
    allergies: '',
    chronicConditions: '',
    status: 'Outpatient' as PatientStatus,
    bp: '120/80',
    hr: 72,
    temp: 98.6,
    spo2: 99,
  });

  // Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '120/80',
    heartRate: 75,
    temperature: 98.6,
    spO2: 98,
    respiratoryRate: 16,
    recordedBy: 'Attending Nurse',
  });

  // Note form state
  const [noteForm, setNoteForm] = useState({
    doctorName: doctors[0]?.name || 'Attending Physician',
    role: 'Attending Physician',
    diagnosis: '',
    noteText: '',
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.insurancePolicyNumber.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesBlood = bloodFilter === 'All' || p.bloodGroup === bloodFilter;

    return matchesSearch && matchesStatus && matchesBlood;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const created = addPatient({
      name: newPatientForm.name.trim(),
      age: Number(newPatientForm.age),
      dob: newPatientForm.dob,
      gender: newPatientForm.gender,
      bloodGroup: newPatientForm.bloodGroup,
      phone: newPatientForm.phone || '+1 (555) 000-0000',
      email: newPatientForm.email || 'patient@example.com',
      address: newPatientForm.address || 'Address on file',
      emergencyContactName: newPatientForm.emergencyContactName || 'None listed',
      emergencyContactPhone: newPatientForm.emergencyContactPhone || '+1 (555) 000-0000',
      insuranceProvider: newPatientForm.insuranceProvider || 'Self Pay',
      insurancePolicyNumber: newPatientForm.insurancePolicyNumber || 'N/A',
      allergies: newPatientForm.allergies
        ? newPatientForm.allergies.split(',').map((s) => s.trim())
        : ['None reported'],
      chronicConditions: newPatientForm.chronicConditions
        ? newPatientForm.chronicConditions.split(',').map((s) => s.trim())
        : ['None reported'],
      status: newPatientForm.status,
      vitals: {
        bloodPressure: newPatientForm.bp,
        heartRate: Number(newPatientForm.hr),
        temperature: Number(newPatientForm.temp),
        spO2: Number(newPatientForm.spo2),
        respiratoryRate: 16,
      },
    });

    setIsAddPatientOpen(false);
    setSelectedPatientId(created.id);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    recordVitals(selectedPatientId, {
      bloodPressure: vitalsForm.bloodPressure,
      heartRate: Number(vitalsForm.heartRate),
      temperature: Number(vitalsForm.temperature),
      spO2: Number(vitalsForm.spO2),
      respiratoryRate: Number(vitalsForm.respiratoryRate),
      recordedBy: vitalsForm.recordedBy,
    });
    setIsLogVitalsOpen(false);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !noteForm.noteText.trim()) return;
    addClinicalNote(selectedPatientId, {
      doctorName: noteForm.doctorName,
      role: noteForm.role,
      diagnosis: noteForm.diagnosis.trim() || undefined,
      noteText: noteForm.noteText.trim(),
    });
    setNoteForm({
      doctorName: doctors[0]?.name || 'Attending Physician',
      role: 'Attending Physician',
      diagnosis: '',
      noteText: '',
    });
    setIsAddNoteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patient Electronic Health Records (EHR)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Master patient registry, triage vitals, clinical progress notes, and inpatient admissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddPatientOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name, MRN, Phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end overflow-x-auto">
          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {(['All', 'Admitted', 'Outpatient', 'Discharged'] as const).map((status) => (
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

          {/* Blood group select */}
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
          >
            <option value="All">All Blood Types</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">MRN</th>
                <th className="py-3 px-4 font-semibold">Patient Name</th>
                <th className="py-3 px-4 font-semibold">Age / Sex</th>
                <th className="py-3 px-4 font-semibold">Blood</th>
                <th className="py-3 px-4 font-semibold">Clinical Status</th>
                <th className="py-3 px-4 font-semibold">Bed / Ward</th>
                <th className="py-3 px-4 font-semibold">Attending Doctor</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching patient records found in registry.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const isAdmitted = patient.status === 'Admitted';
                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {patient.mrn}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {patient.name}
                        <div className="text-[11px] text-slate-400 font-normal">
                          {patient.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {patient.age}y / {patient.gender[0]}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">
                        {patient.bloodGroup}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            isAdmitted
                              ? 'bg-teal-50 text-teal-700'
                              : patient.status === 'Discharged'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {patient.bedNumber ? (
                          <div className="font-mono text-slate-900 font-medium">
                            {patient.bedNumber}
                            <div className="text-[10px] text-slate-500 font-sans">
                              {patient.wardName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {patient.admittingDoctorName || 'Outpatient Clinic'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatientId(patient.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Chart</span>
                          </button>

                          {!isAdmitted && patient.status !== 'Discharged' && (
                            <button
                              onClick={() => onOpenAdmitModal(patient.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              title="Admit to Ward Bed"
                            >
                              <Bed className="w-3 h-3 inline mr-0.5" />
                              <span>Admit</span>
                            </button>
                          )}

                          {isAdmitted && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Authorize official discharge for ${patient.name}?`
                                  )
                                ) {
                                  dischargePatient(patient.id);
                                }
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                              title="Authorize Discharge"
                            >
                              <CheckCircle className="w-3 h-3 inline mr-0.5" />
                              <span>Discharge</span>
                            </button>
                          )}

                          <button
                            onClick={() => onPrintPatient(patient)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
                            title="Print Clinical Summary"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
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

      {/* Patient Medical Chart (EHR) Modal / Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedPatient.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedPatient.name}
                    </h2>
                    <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedPatient.mrn}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-teal-50 text-teal-700">
                      {selectedPatient.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>
                      {selectedPatient.age} yrs ({selectedPatient.dob})
                    </span>
                    <span>·</span>
                    <span>{selectedPatient.gender}</span>
                    <span>·</span>
                    <span>{selectedPatient.phone}</span>
                    <span>·</span>
                    <span>Policy: {selectedPatient.insurancePolicyNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintPatient(selectedPatient)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Chart</span>
                </button>
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Clinical summary grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Allergies
                  </span>
                  <div className="mt-1 text-slate-800 font-medium">
                    {selectedPatient.allergies.join(', ') || 'No known allergies'}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Chronic Conditions
                  </span>
                  <div className="mt-1 text-slate-800 font-medium">
                    {selectedPatient.chronicConditions.join(', ') || 'None recorded'}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Emergency Contact
                  </span>
                  <div className="mt-1 text-slate-800 font-medium">
                    {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone})
                  </div>
                </div>
              </div>

              {/* Vitals Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Vital Signs Telemetry
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsLogVitalsOpen(true)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    + Record Vitals
                  </button>
                </div>

                {selectedPatient.vitals.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                    No vitals recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="p-2.5">Timestamp</th>
                          <th className="p-2.5">BP (mmHg)</th>
                          <th className="p-2.5">Pulse (bpm)</th>
                          <th className="p-2.5">Temp (°F)</th>
                          <th className="p-2.5">SpO2 (%)</th>
                          <th className="p-2.5">Resp Rate</th>
                          <th className="p-2.5">Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                        {selectedPatient.vitals.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">{v.timestamp}</td>
                            <td className="p-2.5 font-bold text-slate-900">{v.bloodPressure}</td>
                            <td className="p-2.5">{v.heartRate}</td>
                            <td className="p-2.5">{v.temperature}°F</td>
                            <td className="p-2.5 text-teal-700 font-semibold">{v.spO2}%</td>
                            <td className="p-2.5">{v.respiratoryRate}/min</td>
                            <td className="p-2.5 font-sans text-slate-500">{v.recordedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Doctor Clinical Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Doctor Clinical Notes & Diagnoses
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddNoteOpen(true)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    + Add Progress Note
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedPatient.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {note.doctorName}{' '}
                          <span className="font-normal text-slate-500">({note.role})</span>
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {note.timestamp}
                        </span>
                      </div>
                      {note.diagnosis && (
                        <div className="text-xs font-semibold text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded border border-teal-100">
                          Diagnosis: {note.diagnosis}
                        </div>
                      )}
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        {note.noteText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Prescriptions & Labs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Prescriptions */}
                <div className="p-4 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Prescriptions on File
                  </span>
                  {prescriptions.filter((rx) => rx.patientId === selectedPatient.id).length === 0 ? (
                    <p className="text-slate-400 text-xs">No active pharmacy prescriptions.</p>
                  ) : (
                    prescriptions
                      .filter((rx) => rx.patientId === selectedPatient.id)
                      .map((rx) => (
                        <div key={rx.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{rx.prescriptionNumber}</span>
                            <span className="font-mono text-[11px] text-teal-700">{rx.status}</span>
                          </div>
                          <div className="text-slate-600 mt-1">
                            {rx.medications.map((m) => m.name).join(', ')}
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Lab orders */}
                <div className="p-4 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Laboratory Diagnostics
                  </span>
                  {labTests.filter((lab) => lab.patientId === selectedPatient.id).length === 0 ? (
                    <p className="text-slate-400 text-xs">No laboratory orders recorded.</p>
                  ) : (
                    labTests
                      .filter((lab) => lab.patientId === selectedPatient.id)
                      .map((lab) => (
                        <div key={lab.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{lab.testName}</span>
                            <span className="font-mono text-[11px] text-slate-600">{lab.status}</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">Sample: {lab.sampleId}</div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {selectedPatient.status === 'Admitted' ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`Authorize discharge for ${selectedPatient.name}?`)) {
                        dischargePatient(selectedPatient.id);
                        setSelectedPatientId(null);
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
                  >
                    Authorize Patient Discharge
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenAdmitModal(selectedPatient.id);
                      setSelectedPatientId(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer"
                  >
                    Admit to Inpatient Ward
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Vitals Sub-Modal */}
      {isLogVitalsOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveVitals}
            className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-xl p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Record Patient Vital Signs</h3>
              <button
                type="button"
                onClick={() => setIsLogVitalsOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  value={vitalsForm.bloodPressure}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })
                  }
                  required
                  placeholder="120/80"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  value={vitalsForm.heartRate}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, heartRate: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Body Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalsForm.temperature}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, temperature: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  SpO2 Saturation (%)
                </label>
                <input
                  type="number"
                  value={vitalsForm.spO2}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, spO2: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Respiratory Rate
                </label>
                <input
                  type="number"
                  value={vitalsForm.respiratoryRate}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, respiratoryRate: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Recorded By
                </label>
                <input
                  type="text"
                  value={vitalsForm.recordedBy}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, recordedBy: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogVitalsOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer font-semibold"
              >
                Save Vitals
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Clinical Note Sub-Modal */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNote}
            className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Add Clinical Consultation Note</h3>
              <button
                type="button"
                onClick={() => setIsAddNoteOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Physician
                  </label>
                  <select
                    value={noteForm.doctorName}
                    onChange={(e) => setNoteForm({ ...noteForm, doctorName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
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
                    Role / Service
                  </label>
                  <input
                    type="text"
                    value={noteForm.role}
                    onChange={(e) => setNoteForm({ ...noteForm, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute Coronary Syndrome, Type 2 DM"
                  value={noteForm.diagnosis}
                  onChange={(e) => setNoteForm({ ...noteForm, diagnosis: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Progress Note & Plan
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Document subjective assessment, objective exam findings, response to interventions, and ongoing care plan..."
                  value={noteForm.noteText}
                  onChange={(e) => setNoteForm({ ...noteForm, noteText: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddNoteOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer font-semibold"
              >
                Sign & Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Register New Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePatient}
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-xl flex flex-col text-xs"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                Register New Hospital Patient
              </h2>
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={newPatientForm.name}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={newPatientForm.dob}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, dob: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newPatientForm.age}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, age: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        gender: e.target.value as Gender,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        bloodGroup: e.target.value as BloodGroup,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={newPatientForm.phone}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={newPatientForm.email}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, email: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Health Ave, City, State"
                    value={newPatientForm.address}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, address: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="Next of kin"
                    value={newPatientForm.emergencyContactName}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        emergencyContactName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 111-2222"
                    value={newPatientForm.emergencyContactPhone}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    placeholder="Blue Cross, Aetna, Medicare"
                    value={newPatientForm.insuranceProvider}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        insuranceProvider: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Insurance Policy Number
                  </label>
                  <input
                    type="text"
                    placeholder="POL-88219"
                    value={newPatientForm.insurancePolicyNumber}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        insurancePolicyNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Known Drug & Environmental Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Penicillin, Sulfa, Latex..."
                    value={newPatientForm.allergies}
                    onChange={(e) =>
                      setNewPatientForm({ ...newPatientForm, allergies: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer font-semibold shadow-xs"
              >
                Register Patient Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
