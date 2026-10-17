/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HospitalProvider } from './context/HospitalContext';
import { Navbar, NavTab } from './components/layout/Navbar';
import { OverviewView } from './components/dashboard/OverviewView';
import { PatientsView } from './components/patients/PatientsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { WardsView } from './components/wards/WardsView';
import { PharmacyView } from './components/pharmacy/PharmacyView';
import { LaboratoryView } from './components/laboratory/LaboratoryView';
import { BillingView } from './components/billing/BillingView';
import { EmergencyView } from './components/emergency/EmergencyView';
import { AdmitPatientModal } from './components/modals/AdmitPatientModal';
import {
  PrintDocumentModal,
  PrintDocType,
} from './components/modals/PrintDocumentModal';
import {
  Patient,
  Prescription,
  Invoice,
  LabTest,
  EmergencyCase,
} from './types/hms';
import { Shield, PhoneCall, Building2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Admit modal state
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitPrePatientId, setAdmitPrePatientId] = useState<string | undefined>();
  const [admitPreWardId, setAdmitPreWardId] = useState<string | undefined>();
  const [admitPreBedNum, setAdmitPreBedNum] = useState<string | undefined>();
  const [admitFastTrackEr, setAdmitFastTrackEr] = useState<EmergencyCase | null>(null);

  // Print modal state
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    type: PrintDocType;
    patient?: Patient | null;
    prescription?: Prescription | null;
    invoice?: Invoice | null;
    lab?: LabTest | null;
  }>({
    isOpen: false,
    type: 'patient',
  });

  const handleOpenAdmitModal = (
    patientId?: string,
    wardId?: string,
    bedNumber?: string
  ) => {
    setAdmitPrePatientId(patientId);
    setAdmitPreWardId(wardId);
    setAdmitPreBedNum(bedNumber);
    setAdmitFastTrackEr(null);
    setIsAdmitModalOpen(true);
  };

  const handleFastTrackEr = (erCase: EmergencyCase) => {
    setAdmitFastTrackEr(erCase);
    setIsAdmitModalOpen(true);
  };

  const handlePrintPatient = (patient: Patient) => {
    setPrintModalState({
      isOpen: true,
      type: 'patient',
      patient,
    });
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    setPrintModalState({
      isOpen: true,
      type: 'prescription',
      prescription,
    });
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setPrintModalState({
      isOpen: true,
      type: 'invoice',
      invoice,
    });
  };

  const handlePrintLab = (lab: LabTest) => {
    setPrintModalState({
      isOpen: true,
      type: 'lab',
      lab,
    });
  };

  return (
    <HospitalProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenAdmitModal={() => handleOpenAdmitModal()}
          onOpenEmergencyModal={() => setCurrentTab('emergency')}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'overview' && (
            <OverviewView
              onNavigate={setCurrentTab}
              onOpenAdmitModal={() => handleOpenAdmitModal()}
              onOpenEmergencyModal={() => setCurrentTab('emergency')}
              onOpenAppointmentModal={() => setCurrentTab('appointments')}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsView
              onOpenAdmitModal={(patientId) => handleOpenAdmitModal(patientId)}
              onPrintPatient={handlePrintPatient}
            />
          )}

          {currentTab === 'appointments' && <AppointmentsView />}

          {currentTab === 'wards' && (
            <WardsView
              onOpenAdmitModal={(patientId, wardId, bedNum) =>
                handleOpenAdmitModal(patientId, wardId, bedNum)
              }
            />
          )}

          {currentTab === 'pharmacy' && (
            <PharmacyView onPrintPrescription={handlePrintPrescription} />
          )}

          {currentTab === 'laboratory' && (
            <LaboratoryView onPrintLab={handlePrintLab} />
          )}

          {currentTab === 'billing' && (
            <BillingView onPrintInvoice={handlePrintInvoice} />
          )}

          {currentTab === 'emergency' && (
            <EmergencyView onFastTrackToBed={handleFastTrackEr} />
          )}
        </main>

        {/* Modals */}
        <AdmitPatientModal
          isOpen={isAdmitModalOpen}
          onClose={() => {
            setIsAdmitModalOpen(false);
            setAdmitFastTrackEr(null);
          }}
          preSelectedPatientId={admitPrePatientId}
          preSelectedWardId={admitPreWardId}
          preSelectedBedNumber={admitPreBedNum}
          fastTrackErCase={admitFastTrackEr}
        />

        <PrintDocumentModal
          isOpen={printModalState.isOpen}
          onClose={() =>
            setPrintModalState((prev) => ({ ...prev, isOpen: false }))
          }
          type={printModalState.type}
          patientData={printModalState.patient}
          prescriptionData={printModalState.prescription}
          invoiceData={printModalState.invoice}
          labData={printModalState.lab}
        />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-6 text-xs text-slate-500 no-print">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">AuraCare Health System</span>
              <span>·</span>
              <span>Central Hospital Operations</span>
              <span>·</span>
              <span>HIPAA Compliant Record Architecture</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold font-mono">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Trauma Hotline: (555) 911-AURA</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Joint Commission Gold Seal Certified</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </HospitalProvider>
  );
}
