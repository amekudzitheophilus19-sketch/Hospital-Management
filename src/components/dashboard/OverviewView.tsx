import React from 'react';
import {
  Bed,
  Users,
  Calendar,
  AlertTriangle,
  FlaskConical,
  Pill,
  ArrowRight,
  Clock,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { NavTab } from '../layout/Navbar';

interface OverviewViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAdmitModal: () => void;
  onOpenEmergencyModal: () => void;
  onOpenAppointmentModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenAdmitModal,
  onOpenEmergencyModal,
  onOpenAppointmentModal,
}) => {
  const {
    patients,
    wards,
    appointments,
    emergencyCases,
    labTests,
    medicines,
    doctors,
    updateAppointmentStatus,
  } = useHospital();

  // Metrics calculation
  const totalBeds = wards.reduce((acc, w) => acc + w.totalBeds, 0);
  const occupiedBeds = wards.reduce(
    (acc, w) => acc + w.beds.filter((b) => b.status === 'Occupied').length,
    0
  );
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const admittedPatients = patients.filter((p) => p.status === 'Admitted');
  const todayAppointments = appointments.filter((a) => a.date === '2026-10-17');
  const activeErCases = emergencyCases.filter((c) => c.status !== 'Discharged');
  const pendingLabs = labTests.filter((t) => t.status !== 'Completed');
  const lowStockDrugs = medicines.filter((m) => m.stock <= m.minStockAlert);
  const onDutyDoctors = doctors.filter((d) => d.onDuty);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner / Hospital Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Hospital Operations Command</span>
            <span>·</span>
            <span>Saturday, October 17, 2026</span>
            <span>·</span>
            <span>09:00 AM Shift</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clinical Overview & Patient Flow
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time telemetry across {wards.length} clinical wards, active trauma intake, and specialist consultations.
          </p>
        </div>

        {/* Quick Action Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenEmergencyModal}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Intake</span>
          </button>
          <button
            onClick={onOpenAdmitModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Admit Inpatient</span>
          </button>
          <button
            onClick={onOpenAppointmentModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Bed Capacity */}
        <div
          onClick={() => onNavigate('wards')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Bed Occupancy</span>
            <Bed className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {occupancyRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {occupiedBeds} of {totalBeds} beds occupied
          </div>
        </div>

        {/* Admitted Inpatients */}
        <div
          onClick={() => onNavigate('patients')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Inpatients</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {admittedPatients.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {patients.length} total active records
          </div>
        </div>

        {/* ER Cases */}
        <div
          onClick={() => onNavigate('emergency')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>ER Triage</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {activeErCases.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {activeErCases.filter((c) => c.triageLevel === 1).length} Resuscitation alert
          </div>
        </div>

        {/* Consultations */}
        <div
          onClick={() => onNavigate('appointments')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Appointments</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {todayAppointments.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {todayAppointments.filter((a) => a.status === 'Completed').length} completed today
          </div>
        </div>

        {/* Lab Orders */}
        <div
          onClick={() => onNavigate('laboratory')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Pending Labs</span>
            <FlaskConical className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {pendingLabs.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {labTests.length} tests tracked
          </div>
        </div>

        {/* Pharmacy Stock Alert */}
        <div
          onClick={() => onNavigate('pharmacy')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Drug Alerts</span>
            <Pill className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${lowStockDrugs.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockDrugs.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {lowStockDrugs.length > 0 ? 'Reorder threshold reached' : 'Stock levels nominal'}
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Wards & ER Whiteboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Bed Status */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ward Occupancy & Bed Distribution</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status across critical and general inpatient units</p>
            </div>
            <button
              onClick={() => onNavigate('wards')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Beds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {wards.map((ward) => {
              const occCount = ward.beds.filter((b) => b.status === 'Occupied').length;
              const cleanCount = ward.beds.filter((b) => b.status === 'Cleaning').length;
              const availCount = ward.beds.filter((b) => b.status === 'Available').length;
              const pct = Math.round((occCount / ward.totalBeds) * 100);

              return (
                <div key={ward.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{ward.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({ward.floor})</span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-700 font-medium">
                      {occCount}/{ward.totalBeds} Beds ({pct}%)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(occCount / ward.totalBeds) * 100}%` }}
                      className="bg-teal-600 h-full"
                    />
                    <div
                      style={{ width: `${(cleanCount / ward.totalBeds) * 100}%` }}
                      className="bg-amber-400 h-full"
                    />
                  </div>

                  {/* Bed Breakdown Tags */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-600 mt-2">
                    <span>
                      <strong className="font-mono tabular-nums text-teal-700">{availCount}</strong> Available
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="font-mono tabular-nums text-slate-800">{occCount}</strong> Occupied
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="font-mono tabular-nums text-amber-700">{cleanCount}</strong> Sanitizing
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Triage Whiteboard */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <h2 className="text-base font-bold text-slate-900">Emergency Triage Queue</h2>
            </div>
            <button
              onClick={() => onNavigate('emergency')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Full Board
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Manchester / ESI acuity triage classification for incoming trauma cases.
          </p>

          <div className="space-y-3">
            {activeErCases.slice(0, 4).map((c) => {
              const isImmediate = c.triageLevel === 1;
              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                    isImmediate
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {c.patientName} ({c.age}y/{c.gender[0]})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isImmediate
                          ? 'bg-rose-600 text-white'
                          : c.triageLevel === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      Level {c.triageLevel}
                    </span>
                  </div>
                  <p className="text-slate-700 line-clamp-1">{c.chiefComplaint}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                    <span className="font-mono tabular-nums">Arrived: {c.arrivalTime}</span>
                    <span className="font-medium text-slate-800">{c.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onOpenEmergencyModal}
            className="w-full py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
          >
            + Register ER Patient
          </button>
        </div>
      </div>

      {/* Secondary Grid: Consultations & On-Duty Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Consultations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Consultation Schedule</h2>
              <p className="text-xs text-slate-500 mt-0.5">Specialist clinics and inpatient bedside reviews</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs font-mono tabular-nums font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded text-center">
                    {apt.time}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {apt.patientName}
                      <span className="text-xs font-mono text-slate-500 ml-2">({apt.patientMrn})</span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <span>{apt.doctorName}</span>
                      <span>·</span>
                      <span className="text-slate-500">{apt.specialty}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      apt.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : apt.status === 'In Consultation'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {apt.status}
                  </span>

                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'In Consultation')}
                      className="px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded cursor-pointer"
                    >
                      Call In
                    </button>
                  )}
                  {apt.status === 'In Consultation' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                      className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* On-Duty Medical Specialists */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">On-Duty Specialists</h2>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {onDutyDoctors.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {doctors.slice(0, 4).map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                {doc.avatar ? (
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{doc.name}</div>
                  <div className="text-[11px] text-slate-500">{doc.specialty}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{doc.room}</div>
                </div>
                <div className="text-[11px] font-semibold">
                  {doc.onDuty ? (
                    <span className="text-emerald-600">On Duty</span>
                  ) : (
                    <span className="text-slate-400">Off Shift</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('appointments')}
            className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Manage Roster & Specialties
          </button>
        </div>
      </div>
    </div>
  );
};
