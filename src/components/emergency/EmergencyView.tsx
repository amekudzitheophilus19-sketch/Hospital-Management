import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  HeartPulse,
  Activity,
  Bed,
  X,
  UserCheck,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { EmergencyCase, TriageUrgency, Gender } from '../../types/hms';

interface EmergencyViewProps {
  onFastTrackToBed: (erCase: EmergencyCase) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({ onFastTrackToBed }) => {
  const { emergencyCases, doctors, addEmergencyCase, updateEmergencyStatus } = useHospital();

  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Intake Form
  const [caseForm, setCaseForm] = useState({
    patientName: '',
    age: 45,
    gender: 'Male' as Gender,
    triageLevel: 2 as TriageUrgency,
    chiefComplaint: '',
    bp: '125/82',
    hr: 88,
    spo2: 97,
    temp: 98.6,
    assignedDoctor: doctors[1]?.name || 'Dr. Marcus Vance, MD, FACEP',
    bedNumber: 'ER Bay 3',
  });

  const triageLevelsInfo: Record<TriageUrgency, { label: string; desc: string; color: string; bg: string }> = {
    1: {
      label: 'Level 1: Resuscitation / Immediate',
      desc: 'Immediate life-threat (Airway compromise, cardiac arrest, catastrophic trauma). Target physician time: 0 minutes.',
      color: 'text-rose-700 border-rose-300',
      bg: 'bg-rose-50',
    },
    2: {
      label: 'Level 2: Emergent',
      desc: 'High potential for rapid deterioration (Chest pain, acute stroke, severe dyspnea). Target time: < 15 minutes.',
      color: 'text-amber-700 border-amber-300',
      bg: 'bg-amber-50',
    },
    3: {
      label: 'Level 3: Urgent',
      desc: 'Moderate distress with stable vitals (Severe abdominal pain, open fractures). Target time: < 30 minutes.',
      color: 'text-yellow-700 border-yellow-300',
      bg: 'bg-yellow-50',
    },
    4: {
      label: 'Level 4: Less Urgent',
      desc: 'Low acuity conditions (Uncomplicated lacerations, sprains, mild fever). Target time: < 60 minutes.',
      color: 'text-blue-700 border-blue-300',
      bg: 'bg-blue-50',
    },
    5: {
      label: 'Level 5: Non-Urgent',
      desc: 'Minor clinical concerns (Medication refills, minor rash, suture removal). Target time: < 120 minutes.',
      color: 'text-slate-700 border-slate-300',
      bg: 'bg-slate-50',
    },
  };

  const filteredCases = emergencyCases.filter((c) => {
    if (filterLevel === 'all') return true;
    return c.triageLevel.toString() === filterLevel;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.patientName.trim() || !caseForm.chiefComplaint.trim()) return;

    addEmergencyCase({
      patientName: caseForm.patientName.trim(),
      age: Number(caseForm.age),
      gender: caseForm.gender,
      triageLevel: caseForm.triageLevel,
      triageLabel: triageLevelsInfo[caseForm.triageLevel].label,
      chiefComplaint: caseForm.chiefComplaint.trim(),
      vitals: `BP ${caseForm.bp} | HR ${caseForm.hr} | SpO2 ${caseForm.spo2}% | Temp ${caseForm.temp}°F`,
      assignedDoctor: caseForm.assignedDoctor,
      bedNumber: caseForm.bedNumber,
    });

    setIsAddCaseOpen(false);
    setCaseForm({
      patientName: '',
      age: 45,
      gender: 'Male',
      triageLevel: 2,
      chiefComplaint: '',
      bp: '125/82',
      hr: 88,
      spo2: 97,
      temp: 98.6,
      assignedDoctor: doctors[1]?.name || 'Dr. Marcus Vance, MD, FACEP',
      bedNumber: 'ER Bay 3',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-600 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span>TRAUMA BAY TELEMETRY LIVE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Emergency Department (ED) & Triage Whiteboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Emergency Severity Index (ESI) protocol tracking, rapid resuscitations, and inpatient ICU fast-tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddCaseOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Rapid Triage Intake</span>
        </button>
      </div>

      {/* Triage Level Reference Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {([1, 2, 3, 4, 5] as const).map((level) => {
          const info = triageLevelsInfo[level];
          const count = emergencyCases.filter(
            (c) => c.triageLevel === level && c.status !== 'Discharged'
          ).length;

          return (
            <button
              key={level}
              onClick={() =>
                setFilterLevel(filterLevel === level.toString() ? 'all' : level.toString())
              }
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterLevel === level.toString()
                  ? `${info.bg} ring-2 ring-slate-900 border-transparent shadow-xs`
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Level {level}</span>
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                  {count} Active
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-700 mt-1">
                {info.label.split(':')[1]?.trim() || info.label}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{info.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Emergency Whiteboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Active Trauma Bay Whiteboard ({filteredCases.length} Patients)
            </h2>
          </div>

          {filterLevel !== 'all' && (
            <button
              onClick={() => setFilterLevel('all')}
              className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
            >
              Show All Levels
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Triage Level</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Arrival</th>
                <th className="py-3 px-4 font-semibold">Chief Complaint</th>
                <th className="py-3 px-4 font-semibold">Vitals Telemetry</th>
                <th className="py-3 px-4 font-semibold">Bay / Room</th>
                <th className="py-3 px-4 font-semibold">Attending Staff</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No active emergency cases in this triage acuity tier.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const isImmediate = c.triageLevel === 1;
                  const isEmergent = c.triageLevel === 2;

                  return (
                    <tr
                      key={c.id}
                      className={
                        isImmediate
                          ? 'bg-rose-50/40 hover:bg-rose-50/70 transition-colors'
                          : 'hover:bg-slate-50/70 transition-colors'
                      }
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                            isImmediate
                              ? 'bg-rose-600 text-white'
                              : isEmergent
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          Level {c.triageLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {c.patientName}
                        <div className="text-[11px] font-normal text-slate-500 font-mono">
                          {c.age} yrs / {c.gender[0]}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{c.arrivalTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs font-medium text-slate-800">
                        {c.chiefComplaint}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {c.vitals}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-900 font-medium whitespace-nowrap">
                        {c.bedNumber || 'Triage Chair'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {c.assignedDoctor || 'ER Triage Lead'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            c.status === 'Transferred to ICU'
                              ? 'bg-indigo-50 text-indigo-700'
                              : c.status === 'In Triage'
                              ? 'bg-blue-50 text-blue-700'
                              : c.status === 'Discharged'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status !== 'Transferred to ICU' && c.status !== 'Discharged' && (
                            <>
                              <button
                                onClick={() => onFastTrackToBed(c)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Fast-track admit to ICU or Inpatient Ward"
                              >
                                <Bed className="w-3 h-3" />
                                <span>Admit to Ward</span>
                              </button>

                              <button
                                onClick={() => updateEmergencyStatus(c.id, 'Discharged')}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                Discharge
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

      {/* Rapid Triage Intake Modal */}
      {isAddCaseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCase}
            className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Rapid Trauma & ER Intake</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCaseOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (or Jane Doe / Unknown)"
                    value={caseForm.patientName}
                    onChange={(e) => setCaseForm({ ...caseForm, patientName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={caseForm.age}
                    onChange={(e) => setCaseForm({ ...caseForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={caseForm.gender}
                    onChange={(e) =>
                      setCaseForm({ ...caseForm, gender: e.target.value as Gender })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ESI / Manchester Triage Urgency Level *
                </label>
                <select
                  value={caseForm.triageLevel}
                  onChange={(e) =>
                    setCaseForm({
                      ...caseForm,
                      triageLevel: Number(e.target.value) as TriageUrgency,
                    })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value={1}>Level 1: Resuscitation / Immediate Life Threat</option>
                  <option value={2}>Level 2: Emergent (High Risk / Severe Pain / Dyspnea)</option>
                  <option value={3}>Level 3: Urgent (Moderate Distress / Multiple Resources)</option>
                  <option value={4}>Level 4: Less Urgent (Stable / Single Resource)</option>
                  <option value={5}>Level 5: Non-Urgent (Minor Clinical Concern)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chief Complaint / Mechanism of Injury *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Sudden onset crushing substernal chest pain, radiating down left arm, diaphoresis..."
                  value={caseForm.chiefComplaint}
                  onChange={(e) => setCaseForm({ ...caseForm, chiefComplaint: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Triage Vitals */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    BP (mmHg)
                  </label>
                  <input
                    type="text"
                    value={caseForm.bp}
                    onChange={(e) => setCaseForm({ ...caseForm, bp: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Pulse (bpm)
                  </label>
                  <input
                    type="number"
                    value={caseForm.hr}
                    onChange={(e) => setCaseForm({ ...caseForm, hr: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={caseForm.spo2}
                    onChange={(e) => setCaseForm({ ...caseForm, spo2: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Temp (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={caseForm.temp}
                    onChange={(e) => setCaseForm({ ...caseForm, temp: Number(e.target.value) })}
                    className="w-full px-2 py-1 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ER Bay / Trauma Room
                  </label>
                  <input
                    type="text"
                    value={caseForm.bedNumber}
                    onChange={(e) => setCaseForm({ ...caseForm, bedNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Assigned ER Attending
                  </label>
                  <select
                    value={caseForm.assignedDoctor}
                    onChange={(e) => setCaseForm({ ...caseForm, assignedDoctor: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddCaseOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-semibold cursor-pointer shadow-xs"
              >
                Register Trauma Intake
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
