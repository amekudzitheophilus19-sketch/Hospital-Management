import React, { useState } from 'react';
import {
  Bed as BedIcon,
  CheckCircle,
  Sparkles,
  ArrowRightLeft,
  UserPlus,
  X,
  Building,
  UserCheck,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Bed, BedStatus } from '../../types/hms';

interface WardsViewProps {
  onOpenAdmitModal: (patientId?: string, wardId?: string, bedNumber?: string) => void;
}

export const WardsView: React.FC<WardsViewProps> = ({ onOpenAdmitModal }) => {
  const { wards, updateBedStatus, transferBed, dischargePatient } = useHospital();

  const [activeWardId, setActiveWardId] = useState<string>('all');
  const [transferModalBed, setTransferModalBed] = useState<Bed | null>(null);
  const [targetTransferWard, setTargetTransferWard] = useState<string>('');
  const [targetTransferBedNum, setTargetTransferBedNum] = useState<string>('');

  // Bed stats
  const totalBeds = wards.reduce((acc, w) => acc + w.totalBeds, 0);
  const occupiedBeds = wards.reduce(
    (acc, w) => acc + w.beds.filter((b) => b.status === 'Occupied').length,
    0
  );
  const availableBeds = wards.reduce(
    (acc, w) => acc + w.beds.filter((b) => b.status === 'Available').length,
    0
  );
  const cleaningBeds = wards.reduce(
    (acc, w) => acc + w.beds.filter((b) => b.status === 'Cleaning').length,
    0
  );
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const displayWards =
    activeWardId === 'all' ? wards : wards.filter((w) => w.id === activeWardId);

  // Available beds for transfer
  const availableTargetBeds = wards
    .find((w) => w.id === targetTransferWard)
    ?.beds.filter((b) => b.status === 'Available') || [];

  const handleOpenTransfer = (bed: Bed) => {
    setTransferModalBed(bed);
    // Find first ward with an available bed
    const wardWithAvail = wards.find((w) => w.beds.some((b) => b.status === 'Available'));
    if (wardWithAvail) {
      setTargetTransferWard(wardWithAvail.id);
      const firstAvail = wardWithAvail.beds.find((b) => b.status === 'Available');
      setTargetTransferBedNum(firstAvail ? firstAvail.bedNumber : '');
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalBed || !transferModalBed.patientId || !targetTransferBedNum) return;

    transferBed(
      transferModalBed.patientId,
      transferModalBed.wardId,
      transferModalBed.bedNumber,
      targetTransferWard,
      targetTransferBedNum
    );
    setTransferModalBed(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inpatient Wards & Bed Allocation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry of critical care units, recovery rooms, and departmental bed sanitization.
          </p>
        </div>

        <button
          onClick={() => onOpenAdmitModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Admit Patient to Bed</span>
        </button>
      </div>

      {/* Ward Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Hospital Capacity</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalBeds} Beds
          </div>
          <div className="text-xs text-slate-400 mt-1">{wards.length} Operational Units</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Occupied Beds</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {occupiedBeds}{' '}
            <span className="text-xs font-sans text-teal-700 font-semibold">
              ({occupancyRate}%)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Active admitted inpatients</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Available Immediately</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-700">
            {availableBeds} Beds
          </div>
          <div className="text-xs text-slate-400 mt-1">Sanitized & ready for intake</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Sanitization / Cleaning</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            {cleaningBeds} Beds
          </div>
          <div className="text-xs text-slate-400 mt-1">Housekeeping in progress</div>
        </div>
      </div>

      {/* Ward Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveWardId('all')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeWardId === 'all'
              ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Wards ({totalBeds} Beds)
        </button>

        {wards.map((ward) => {
          const occ = ward.beds.filter((b) => b.status === 'Occupied').length;
          return (
            <button
              key={ward.id}
              onClick={() => setActiveWardId(ward.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeWardId === ward.id
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ward.name}{' '}
              <span className="font-mono text-[11px] text-slate-400 ml-1">
                ({occ}/{ward.totalBeds})
              </span>
            </button>
          );
        })}
      </div>

      {/* Ward Section Display */}
      <div className="space-y-6">
        {displayWards.map((ward) => {
          const occCount = ward.beds.filter((b) => b.status === 'Occupied').length;
          const availCount = ward.beds.filter((b) => b.status === 'Available').length;
          const cleanCount = ward.beds.filter((b) => b.status === 'Cleaning').length;

          return (
            <div
              key={ward.id}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
            >
              {/* Ward Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{ward.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{ward.department}</span>
                      <span>·</span>
                      <span>{ward.floor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-teal-700 font-semibold font-mono">
                    {availCount} Available
                  </span>
                  <span>·</span>
                  <span className="text-slate-700 font-medium font-mono">
                    {occCount} Occupied
                  </span>
                  <span>·</span>
                  <span className="text-amber-700 font-mono">{cleanCount} Sanitizing</span>
                </div>
              </div>

              {/* Beds Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ward.beds.map((bed) => {
                  const isOccupied = bed.status === 'Occupied';
                  const isAvailable = bed.status === 'Available';
                  const isCleaning = bed.status === 'Cleaning';

                  return (
                    <div
                      key={bed.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isOccupied
                          ? 'bg-slate-50/70 border-slate-200'
                          : isAvailable
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-amber-50/30 border-amber-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {bed.bedNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isOccupied
                                ? 'bg-slate-200 text-slate-800'
                                : isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bed.status}
                          </span>
                        </div>

                        {isOccupied ? (
                          <div className="space-y-1 text-xs">
                            <div className="font-bold text-slate-900 text-sm">
                              {bed.patientName}
                            </div>
                            <div className="font-mono text-slate-500 text-[11px]">
                              {bed.patientMrn}
                            </div>
                            <div className="text-[11px] text-slate-500 pt-1">
                              Admitted: <span className="font-mono">{bed.admissionDate}</span>
                            </div>
                          </div>
                        ) : isAvailable ? (
                          <div className="py-2 text-xs text-emerald-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Sterilized & Ready for Patient</span>
                          </div>
                        ) : (
                          <div className="py-2 text-xs text-amber-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Housekeeping & Disinfection</span>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center gap-2">
                        {isOccupied && (
                          <>
                            <button
                              onClick={() => handleOpenTransfer(bed)}
                              className="flex-1 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1"
                              title="Transfer patient to another bed"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Transfer</span>
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  bed.patientId &&
                                  window.confirm(
                                    `Discharge ${bed.patientName} from ${bed.bedNumber}?`
                                  )
                                ) {
                                  dischargePatient(bed.patientId);
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                              title="Discharge Patient"
                            >
                              Discharge
                            </button>
                          </>
                        )}

                        {isAvailable && (
                          <button
                            onClick={() =>
                              onOpenAdmitModal(undefined, ward.id, bed.bedNumber)
                            }
                            className="w-full py-1 text-xs font-semibold text-teal-700 bg-white border border-teal-200 rounded hover:bg-teal-50 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Assign Patient</span>
                          </button>
                        )}

                        {isCleaning && (
                          <button
                            onClick={() =>
                              updateBedStatus(ward.id, bed.bedNumber, 'Available')
                            }
                            className="w-full py-1 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 rounded hover:bg-emerald-50 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Mark Ready</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Transfer Modal */}
      {transferModalBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteTransfer}
            className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-xl p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Inpatient Bed Transfer Order
              </h2>
              <button
                type="button"
                onClick={() => setTransferModalBed(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase">
                  Patient
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {transferModalBed.patientName} ({transferModalBed.patientMrn})
                </div>
                <div className="text-xs text-slate-600">
                  Current Bed: <span className="font-mono font-bold">{transferModalBed.bedNumber}</span> ({transferModalBed.wardName})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Destination Ward *
                </label>
                <select
                  value={targetTransferWard}
                  onChange={(e) => {
                    const newWardId = e.target.value;
                    setTargetTransferWard(newWardId);
                    const wardObj = wards.find((w) => w.id === newWardId);
                    const firstAvail = wardObj?.beds.find((b) => b.status === 'Available');
                    setTargetTransferBedNum(firstAvail ? firstAvail.bedNumber : '');
                  }}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.beds.filter((b) => b.status === 'Available').length} Available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Destination Bed *
                </label>
                {availableTargetBeds.length === 0 ? (
                  <div className="p-2 text-rose-600 bg-rose-50 rounded border border-rose-100 text-xs">
                    No available beds in selected ward. Choose another ward.
                  </div>
                ) : (
                  <select
                    value={targetTransferBedNum}
                    onChange={(e) => setTargetTransferBedNum(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-medium"
                  >
                    {availableTargetBeds.map((b) => (
                      <option key={b.id} value={b.bedNumber}>
                        {b.bedNumber} (Clean & Ready)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setTransferModalBed(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={availableTargetBeds.length === 0}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer disabled:opacity-50"
              >
                Execute Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
