import React, { useState, useEffect } from 'react';
import { X, Bed, CheckCircle2 } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { EmergencyCase } from '../../types/hms';

interface AdmitPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
  preSelectedWardId?: string;
  preSelectedBedNumber?: string;
  fastTrackErCase?: EmergencyCase | null;
}

export const AdmitPatientModal: React.FC<AdmitPatientModalProps> = ({
  isOpen,
  onClose,
  preSelectedPatientId,
  preSelectedWardId,
  preSelectedBedNumber,
  fastTrackErCase,
}) => {
  const {
    patients,
    wards,
    doctors,
    admitPatientToBed,
    fastTrackEmergencyToInpatient,
  } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    if (preSelectedPatientId) {
      setSelectedPatientId(preSelectedPatientId);
    } else if (patients.length > 0) {
      const firstNonAdmitted = patients.find((p) => p.status !== 'Admitted');
      setSelectedPatientId(firstNonAdmitted ? firstNonAdmitted.id : patients[0].id);
    }

    const defaultWard = preSelectedWardId || wards[0]?.id || '';
    setSelectedWardId(defaultWard);

    const targetWard = wards.find((w) => w.id === defaultWard);
    const availableBed = targetWard?.beds.find((b) => b.status === 'Available');
    setSelectedBedNumber(preSelectedBedNumber || availableBed?.bedNumber || '');

    if (doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [
    preSelectedPatientId,
    preSelectedWardId,
    preSelectedBedNumber,
    isOpen,
    patients,
    wards,
    doctors,
  ]);

  if (!isOpen) return null;

  const currentWard = wards.find((w) => w.id === selectedWardId);
  const availableBeds = currentWard?.beds.filter((b) => b.status === 'Available') || [];

  const handleWardChange = (wardId: string) => {
    setSelectedWardId(wardId);
    const wardObj = wards.find((w) => w.id === wardId);
    const firstAvail = wardObj?.beds.find((b) => b.status === 'Available');
    setSelectedBedNumber(firstAvail ? firstAvail.bedNumber : '');
  };

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (fastTrackErCase) {
      fastTrackEmergencyToInpatient(
        fastTrackErCase.id,
        selectedWardId,
        selectedBedNumber,
        selectedDoctorId
      );
    } else {
      if (!selectedPatientId || !selectedWardId || !selectedBedNumber) return;
      admitPatientToBed(
        selectedPatientId,
        selectedWardId,
        selectedBedNumber,
        selectedDoctorId
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleAdmit}
        className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              {fastTrackErCase ? 'Fast-Track Emergency Admission' : 'Inpatient Ward Bed Allocation'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {fastTrackErCase ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-700">
                Trauma Case Incoming
              </span>
              <div className="font-bold text-sm text-slate-900">
                {fastTrackErCase.patientName} ({fastTrackErCase.age}y / {fastTrackErCase.gender[0]})
              </div>
              <p className="text-xs text-slate-700">{fastTrackErCase.chiefComplaint}</p>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Select Patient to Admit *
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) · {p.status} · {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Destination Inpatient Ward *
            </label>
            <select
              value={selectedWardId}
              onChange={(e) => handleWardChange(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
            >
              {wards.map((w) => {
                const avail = w.beds.filter((b) => b.status === 'Available').length;
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} ({avail} of {w.totalBeds} beds available)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Available Bed Assignment *
            </label>
            {availableBeds.length === 0 ? (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                No sanitized beds available in this ward. Please select a different ward.
              </div>
            ) : (
              <select
                value={selectedBedNumber}
                onChange={(e) => setSelectedBedNumber(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-medium"
              >
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.bedNumber}>
                    {b.bedNumber} (Sanitized & Ready)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Admitting Attending Physician *
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={availableBeds.length === 0}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm Admission & Allocate Bed</span>
          </button>
        </div>
      </form>
    </div>
  );
};
