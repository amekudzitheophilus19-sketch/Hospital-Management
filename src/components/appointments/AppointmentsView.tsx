import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Stethoscope,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Play,
  X,
  Search,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AppointmentStatus } from '../../types/hms';

export const AppointmentsView: React.FC = () => {
  const {
    doctors,
    appointments,
    patients,
    bookAppointment,
    updateAppointmentStatus,
    toggleDoctorOnDuty,
  } = useHospital();

  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('All');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // New Appointment Form State
  const [bookingForm, setBookingForm] = useState({
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    date: '2026-10-17',
    time: '10:00 AM',
    reason: '',
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    const matchesDoctor = selectedDoctorId === 'All' || apt.doctorId === selectedDoctorId;
    return matchesStatus && matchesDoctor;
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === bookingForm.patientId);
    const doctor = doctors.find((d) => d.id === bookingForm.doctorId);
    if (!patient || !doctor) return;

    bookAppointment({
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: bookingForm.date,
      time: bookingForm.time,
      reason: bookingForm.reason || 'General clinical consultation',
    });

    setIsBookModalOpen(false);
    setBookingForm({
      ...bookingForm,
      reason: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Appointments & Clinical Specialists</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage outpatient appointment queues, doctor duty shifts, and consultation rooms.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Specialist Doctors Roster Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Hospital Medical Staff & Faculty</h2>
          <span className="text-xs text-slate-500">
            {doctors.filter((d) => d.onDuty).length} of {doctors.length} Doctors Currently On Duty
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => {
            const docAptCount = appointments.filter(
              (a) => a.doctorId === doctor.id && a.status !== 'Cancelled'
            ).length;

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    {doctor.avatar ? (
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                        <Stethoscope className="w-7 h-7" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono tabular-nums text-slate-400">
                          {doctor.experienceYears}y exp
                        </span>
                        <button
                          onClick={() => toggleDoctorOnDuty(doctor.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            doctor.onDuty
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {doctor.onDuty ? 'On Duty' : 'Off Duty'}
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {doctor.name}
                      </h3>
                      <div className="text-xs text-teal-700 font-medium">
                        {doctor.specialty}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Room</span>
                      <span className="font-mono text-slate-700 font-medium">{doctor.room}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Credentials</span>
                      <span className="truncate max-w-[180px]">{doctor.qualification}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Scheduled Today</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {docAptCount} Appointments
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBookingForm({
                        ...bookingForm,
                        doctorId: doctor.id,
                      });
                      setIsBookModalOpen(true);
                    }}
                    className="w-full py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Schedule Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Clinical Consultation Schedule</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Scheduled', 'In Consultation', 'Completed', 'Cancelled'] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            {/* Doctor filter dropdown */}
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
            >
              <option value="All">All Specialists</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Slot / Time</th>
                <th className="py-3 px-4 font-semibold">Patient</th>
                <th className="py-3 px-4 font-semibold">Attending Doctor</th>
                <th className="py-3 px-4 font-semibold">Specialty</th>
                <th className="py-3 px-4 font-semibold">Consultation Reason</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      <div>{apt.time}</div>
                      <div className="text-[10px] text-slate-400">{apt.date}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {apt.patientName}
                      <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                        ({apt.patientMrn})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{apt.doctorName}</td>
                    <td className="py-3 px-4 text-teal-700 font-medium">{apt.specialty}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {apt.reason || 'Routine follow-up'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          apt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : apt.status === 'In Consultation'
                            ? 'bg-blue-50 text-blue-700'
                            : apt.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'In Consultation')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition-colors cursor-pointer flex items-center gap-1"
                            title="Call Patient Into Suite"
                          >
                            <Play className="w-3 h-3" />
                            <span>Call In</span>
                          </button>
                        )}

                        {apt.status === 'In Consultation' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer flex items-center gap-1"
                            title="Mark Consultation Complete"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                        )}

                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Cancel Appointment"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleBook}
            className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Schedule Specialist Consultation
              </h2>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Registered Patient *
                </label>
                <select
                  value={bookingForm.patientId}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, patientId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) · {p.age}y {p.gender[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Specialist Doctor *
                </label>
                <select
                  value={bookingForm.doctorId}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, doctorId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty} ({d.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, date: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, time: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  >
                    {[
                      '08:30 AM',
                      '09:00 AM',
                      '09:30 AM',
                      '10:00 AM',
                      '10:30 AM',
                      '11:00 AM',
                      '11:30 AM',
                      '01:00 PM',
                      '01:30 PM',
                      '02:00 PM',
                      '02:30 PM',
                      '03:00 PM',
                      '03:30 PM',
                      '04:00 PM',
                    ].map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reason for Visit / Symptoms
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe patient complaint, requested diagnostic review, or follow-up reason..."
                  value={bookingForm.reason}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, reason: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
