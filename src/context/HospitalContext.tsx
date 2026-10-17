import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  Ward,
  MedicineItem,
  Prescription,
  LabTest,
  Invoice,
  EmergencyCase,
  VitalRecord,
  ClinicalNote,
  BedStatus,
} from '../types/hms';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_WARDS,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICINES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_TESTS,
  INITIAL_INVOICES,
  INITIAL_EMERGENCY_CASES,
} from '../data/mockData';

interface HospitalContextType {
  patients: Patient[];
  doctors: Doctor[];
  wards: Ward[];
  appointments: Appointment[];
  medicines: MedicineItem[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  invoices: Invoice[];
  emergencyCases: EmergencyCase[];
  // Patient actions
  addPatient: (patient: Omit<Patient, 'id' | 'mrn' | 'vitals' | 'notes'> & { vitals?: Partial<VitalRecord> }) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  dischargePatient: (id: string) => void;
  admitPatientToBed: (patientId: string, wardId: string, bedNumber: string, doctorId: string) => void;
  recordVitals: (patientId: string, vitals: Omit<VitalRecord, 'id' | 'timestamp'>) => void;
  addClinicalNote: (patientId: string, note: Omit<ClinicalNote, 'id' | 'timestamp'>) => void;
  // Appointments
  bookAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  toggleDoctorOnDuty: (doctorId: string) => void;
  // Wards & Beds
  updateBedStatus: (wardId: string, bedNumber: string, status: BedStatus) => void;
  transferBed: (patientId: string, fromWardId: string, fromBedNumber: string, toWardId: string, toBedNumber: string) => void;
  // Pharmacy
  addMedication: (medicine: Omit<MedicineItem, 'id'>) => void;
  restockMedication: (id: string, quantityToAdd: number) => void;
  dispensePrescription: (prescriptionId: string) => void;
  addPrescription: (rx: Omit<Prescription, 'id' | 'prescriptionNumber' | 'status'>) => void;
  // Laboratory
  orderLabTest: (test: Omit<LabTest, 'id' | 'sampleId' | 'status'>) => void;
  updateLabTestResult: (id: string, parameters: LabTest['parameters'], technicianNotes?: string) => void;
  // Billing
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status'], paymentMethod?: string) => void;
  // Emergency
  addEmergencyCase: (erCase: Omit<EmergencyCase, 'id' | 'arrivalTime' | 'status'>) => void;
  updateEmergencyStatus: (id: string, status: EmergencyCase['status'], assignedDoctor?: string) => void;
  fastTrackEmergencyToInpatient: (erId: string, wardId: string, bedNumber: string, doctorId: string) => void;
  // Data management
  resetDemoData: () => void;
  exportDataToJson: () => string;
  importDataFromJson: (jsonData: string) => boolean;
}

const STORAGE_PREFIX = 'auracare_hms_';

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key} from storage`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage`, err);
  }
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => loadStorage('patients', INITIAL_PATIENTS));
  const [doctors, setDoctors] = useState<Doctor[]>(() => loadStorage('doctors', INITIAL_DOCTORS));
  const [wards, setWards] = useState<Ward[]>(() => loadStorage('wards', INITIAL_WARDS));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadStorage('appointments', INITIAL_APPOINTMENTS));
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => loadStorage('medicines', INITIAL_MEDICINES));
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => loadStorage('prescriptions', INITIAL_PRESCRIPTIONS));
  const [labTests, setLabTests] = useState<LabTest[]>(() => loadStorage('lab_tests', INITIAL_LAB_TESTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage('invoices', INITIAL_INVOICES));
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(() => loadStorage('emergency_cases', INITIAL_EMERGENCY_CASES));

  // Sync to localStorage
  useEffect(() => { saveStorage('patients', patients); }, [patients]);
  useEffect(() => { saveStorage('doctors', doctors); }, [doctors]);
  useEffect(() => { saveStorage('wards', wards); }, [wards]);
  useEffect(() => { saveStorage('appointments', appointments); }, [appointments]);
  useEffect(() => { saveStorage('medicines', medicines); }, [medicines]);
  useEffect(() => { saveStorage('prescriptions', prescriptions); }, [prescriptions]);
  useEffect(() => { saveStorage('labTests', labTests); }, [labTests]);
  useEffect(() => { saveStorage('invoices', invoices); }, [invoices]);
  useEffect(() => { saveStorage('emergencyCases', emergencyCases); }, [emergencyCases]);

  // Patients
  const addPatient = (newPatData: Omit<Patient, 'id' | 'mrn' | 'vitals' | 'notes'> & { vitals?: Partial<VitalRecord> }) => {
    const nextNum = Math.floor(10000 + Math.random() * 90000);
    const newMrn = `MRN-${nextNum}`;
    const newId = `pat-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const initialVitals: VitalRecord[] = newPatData.vitals?.bloodPressure ? [{
      id: `vit-${Date.now()}`,
      timestamp: nowStr,
      bloodPressure: newPatData.vitals.bloodPressure || '120/80',
      heartRate: newPatData.vitals.heartRate || 75,
      temperature: newPatData.vitals.temperature || 98.6,
      spO2: newPatData.vitals.spO2 || 98,
      respiratoryRate: newPatData.vitals.respiratoryRate || 16,
      recordedBy: 'Triage / Admission Desk',
    }] : [];

    const newPatient: Patient = {
      ...newPatData,
      id: newId,
      mrn: newMrn,
      vitals: initialVitals,
      notes: [{
        id: `note-${Date.now()}`,
        timestamp: nowStr,
        doctorName: newPatData.admittingDoctorName || 'Admitting Physician',
        role: 'Intake Staff',
        noteText: `Initial registration recorded. Patient status: ${newPatData.status}.`,
      }],
    };

    setPatients(prev => [newPatient, ...prev]);

    // If admitted to a ward bed directly
    if (newPatData.status === 'Admitted' && newPatData.wardId && newPatData.bedNumber) {
      setWards(prev => prev.map(ward => {
        if (ward.id !== newPatData.wardId) return ward;
        return {
          ...ward,
          beds: ward.beds.map(bed => {
            if (bed.bedNumber === newPatData.bedNumber) {
              return {
                ...bed,
                status: 'Occupied',
                patientId: newId,
                patientName: newPatData.name,
                patientMrn: newMrn,
                admissionDate: newPatData.admissionDate || nowStr.split(' ')[0],
              };
            }
            return bed;
          }),
        };
      }));
    }

    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const dischargePatient = (id: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const target = patients.find(p => p.id === id);
    if (!target) return;

    // Update patient status
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'Discharged',
          dischargeDate: nowStr,
          wardId: undefined,
          wardName: undefined,
          bedNumber: undefined,
          notes: [
            ...p.notes,
            {
              id: `note-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              doctorName: p.admittingDoctorName || 'Attending Physician',
              role: 'Attending Doctor',
              noteText: `Official discharge authorized. Patient condition improved/stable. Post-discharge medications and outpatient instructions provided.`,
            },
          ],
        };
      }
      return p;
    }));

    // Free the bed and set it to Cleaning
    if (target.wardId && target.bedNumber) {
      setWards(prev => prev.map(ward => {
        if (ward.id !== target.wardId) return ward;
        return {
          ...ward,
          beds: ward.beds.map(b => {
            if (b.bedNumber === target.bedNumber) {
              return {
                ...b,
                status: 'Cleaning',
                patientId: undefined,
                patientName: undefined,
                patientMrn: undefined,
                admissionDate: undefined,
              };
            }
            return b;
          }),
        };
      }));
    }
  };

  const admitPatientToBed = (patientId: string, wardId: string, bedNumber: string, doctorId: string) => {
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    const ward = wards.find(w => w.id === wardId);
    if (!patient || !ward) return;

    const todayDate = new Date().toISOString().split('T')[0];

    // Vacate any previous bed if patient already had one
    if (patient.wardId && patient.bedNumber) {
      setWards(prev => prev.map(w => {
        if (w.id !== patient.wardId) return w;
        return {
          ...w,
          beds: w.beds.map(b => b.bedNumber === patient.bedNumber ? { ...b, status: 'Cleaning', patientId: undefined, patientName: undefined, patientMrn: undefined } : b),
        };
      }));
    }

    // Allocate new bed
    setWards(prev => prev.map(w => {
      if (w.id !== wardId) return w;
      return {
        ...w,
        beds: w.beds.map(b => {
          if (b.bedNumber === bedNumber) {
            return {
              ...b,
              status: 'Occupied',
              patientId: patient.id,
              patientName: patient.name,
              patientMrn: patient.mrn,
              admissionDate: todayDate,
            };
          }
          return b;
        }),
      };
    }));

    // Update patient
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'Admitted',
          wardId: ward.id,
          wardName: ward.name,
          bedNumber: bedNumber,
          admittingDoctorId: doctor?.id,
          admittingDoctorName: doctor?.name,
          admissionDate: todayDate,
          dischargeDate: undefined,
          notes: [
            ...p.notes,
            {
              id: `note-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              doctorName: doctor?.name || 'Admitting Physician',
              role: 'Attending Physician',
              noteText: `Patient admitted to ${ward.name}, Bed ${bedNumber}. Care plan initiated.`,
            },
          ],
        };
      }
      return p;
    }));
  };

  const recordVitals = (patientId: string, vitalsData: Omit<VitalRecord, 'id' | 'timestamp'>) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: VitalRecord = {
      ...vitalsData,
      id: `vit-${Date.now()}`,
      timestamp: nowStr,
    };
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          vitals: [newRecord, ...p.vitals],
        };
      }
      return p;
    }));
  };

  const addClinicalNote = (patientId: string, noteData: Omit<ClinicalNote, 'id' | 'timestamp'>) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newNote: ClinicalNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      timestamp: nowStr,
    };
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          notes: [newNote, ...p.notes],
        };
      }
      return p;
    }));
  };

  // Appointments
  const bookAppointment = (aptData: Omit<Appointment, 'id' | 'status'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      status: 'Scheduled',
    };
    setAppointments(prev => [newApt, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const toggleDoctorOnDuty = (doctorId: string) => {
    setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, onDuty: !d.onDuty } : d));
  };

  // Wards & Beds
  const updateBedStatus = (wardId: string, bedNumber: string, status: BedStatus) => {
    setWards(prev => prev.map(ward => {
      if (ward.id !== wardId) return ward;
      return {
        ...ward,
        beds: ward.beds.map(bed => {
          if (bed.bedNumber === bedNumber) {
            return {
              ...bed,
              status,
              patientId: status === 'Available' || status === 'Cleaning' ? undefined : bed.patientId,
              patientName: status === 'Available' || status === 'Cleaning' ? undefined : bed.patientName,
              patientMrn: status === 'Available' || status === 'Cleaning' ? undefined : bed.patientMrn,
            };
          }
          return bed;
        }),
      };
    }));
  };

  const transferBed = (patientId: string, fromWardId: string, fromBedNumber: string, toWardId: string, toBedNumber: string) => {
    const patient = patients.find(p => p.id === patientId);
    const targetWard = wards.find(w => w.id === toWardId);
    if (!patient || !targetWard) return;

    // Free old bed
    setWards(prev => prev.map(w => {
      if (w.id === fromWardId) {
        return {
          ...w,
          beds: w.beds.map(b => b.bedNumber === fromBedNumber ? { ...b, status: 'Cleaning', patientId: undefined, patientName: undefined, patientMrn: undefined } : b),
        };
      }
      if (w.id === toWardId) {
        return {
          ...w,
          beds: w.beds.map(b => b.bedNumber === toBedNumber ? {
            ...b,
            status: 'Occupied',
            patientId: patient.id,
            patientName: patient.name,
            patientMrn: patient.mrn,
            admissionDate: patient.admissionDate || new Date().toISOString().split('T')[0],
          } : b),
        };
      }
      return w;
    }));

    // Update patient
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          wardId: targetWard.id,
          wardName: targetWard.name,
          bedNumber: toBedNumber,
          notes: [
            ...p.notes,
            {
              id: `note-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              doctorName: 'Hospital Operations',
              role: 'Charge Nurse',
              noteText: `Internal bed transfer: Transferred from ${fromBedNumber} to ${targetWard.name} (${toBedNumber}).`,
            },
          ],
        };
      }
      return p;
    }));
  };

  // Pharmacy
  const addMedication = (medData: Omit<MedicineItem, 'id'>) => {
    const newMed: MedicineItem = {
      ...medData,
      id: `med-${Date.now()}`,
    };
    setMedicines(prev => [newMed, ...prev]);
  };

  const restockMedication = (id: string, quantityToAdd: number) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, stock: m.stock + quantityToAdd } : m));
  };

  const dispensePrescription = (prescriptionId: string) => {
    const rx = prescriptions.find(p => p.id === prescriptionId);
    if (!rx || rx.status === 'Dispensed') return;

    // Deduct stock for each medication
    setMedicines(prev => prev.map(med => {
      const match = rx.medications.find(m => m.medicineId === med.id);
      if (match) {
        return { ...med, stock: Math.max(0, med.stock - 1) };
      }
      return med;
    }));

    // Update prescription
    setPrescriptions(prev => prev.map(p => {
      if (p.id === prescriptionId) {
        return {
          ...p,
          status: 'Dispensed',
          medications: p.medications.map(m => ({ ...m, dispensed: true })),
        };
      }
      return p;
    }));
  };

  const addPrescription = (rxData: Omit<Prescription, 'id' | 'prescriptionNumber' | 'status'>) => {
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
      prescriptionNumber: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
    };
    setPrescriptions(prev => [newRx, ...prev]);
  };

  // Laboratory
  const orderLabTest = (testData: Omit<LabTest, 'id' | 'sampleId' | 'status'>) => {
    const newTest: LabTest = {
      ...testData,
      id: `lab-${Date.now()}`,
      sampleId: `SMP-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Pending Sample',
      parameters: testData.parameters || [],
    };
    setLabTests(prev => [newTest, ...prev]);
  };

  const updateLabTestResult = (id: string, parameters: LabTest['parameters'], technicianNotes?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setLabTests(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'Completed',
          dateCompleted: nowStr,
          parameters,
          technicianNotes: technicianNotes || t.technicianNotes,
        };
      }
      return t;
    }));
  };

  // Billing
  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setInvoices(prev => [newInv, ...prev]);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status'], paymentMethod?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status,
          paymentMethod: paymentMethod || inv.paymentMethod,
        };
      }
      return inv;
    }));
  };

  // Emergency
  const addEmergencyCase = (erCaseData: Omit<EmergencyCase, 'id' | 'arrivalTime' | 'status'>) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEr: EmergencyCase = {
      ...erCaseData,
      id: `er-${Date.now()}`,
      arrivalTime: nowTime,
      status: 'Awaiting Doctor',
    };
    setEmergencyCases(prev => [newEr, ...prev]);
  };

  const updateEmergencyStatus = (id: string, status: EmergencyCase['status'], assignedDoctor?: string) => {
    setEmergencyCases(prev => prev.map(er => {
      if (er.id === id) {
        return {
          ...er,
          status,
          assignedDoctor: assignedDoctor || er.assignedDoctor,
        };
      }
      return er;
    }));
  };

  const fastTrackEmergencyToInpatient = (erId: string, wardId: string, bedNumber: string, doctorId: string) => {
    const er = emergencyCases.find(e => e.id === erId);
    if (!er) return;

    // Create a new patient record
    const newPat = addPatient({
      name: er.patientName,
      age: er.age,
      dob: `${2026 - er.age}-01-01`,
      gender: er.gender,
      bloodGroup: 'O+',
      phone: '+1 (555) 000-0000',
      email: `${er.patientName.toLowerCase().replace(/\s+/g, '.')}@patient.auracare`,
      address: 'Emergency Admission',
      emergencyContactName: 'Next of Kin',
      emergencyContactPhone: '+1 (555) 000-0001',
      insuranceProvider: 'Pending Verification',
      insurancePolicyNumber: 'EMERGENCY-HOLD',
      allergies: ['Unknown / Pending Triage Survey'],
      chronicConditions: ['Pending Assessment'],
      status: 'Admitted',
      wardId,
      bedNumber,
      admissionDate: new Date().toISOString().split('T')[0],
      vitals: {
        bloodPressure: er.vitals.includes('BP') ? er.vitals.split('|')[0].replace('BP', '').trim() : '120/80',
        heartRate: 90,
        temperature: 98.6,
        spO2: 96,
        respiratoryRate: 18,
      },
    });

    // Allocate the bed
    admitPatientToBed(newPat.id, wardId, bedNumber, doctorId);

    // Update ER status
    updateEmergencyStatus(erId, 'Transferred to ICU', doctors.find(d => d.id === doctorId)?.name);
  };

  const resetDemoData = () => {
    setPatients(INITIAL_PATIENTS);
    setDoctors(INITIAL_DOCTORS);
    setWards(INITIAL_WARDS);
    setAppointments(INITIAL_APPOINTMENTS);
    setMedicines(INITIAL_MEDICINES);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setLabTests(INITIAL_LAB_TESTS);
    setInvoices(INITIAL_INVOICES);
    setEmergencyCases(INITIAL_EMERGENCY_CASES);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  };

  const exportDataToJson = () => {
    const data = {
      patients,
      doctors,
      wards,
      appointments,
      medicines,
      prescriptions,
      labTests,
      invoices,
      emergencyCases,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataFromJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.patients) setPatients(parsed.patients);
      if (parsed.doctors) setDoctors(parsed.doctors);
      if (parsed.wards) setWards(parsed.wards);
      if (parsed.appointments) setAppointments(parsed.appointments);
      if (parsed.medicines) setMedicines(parsed.medicines);
      if (parsed.prescriptions) setPrescriptions(parsed.prescriptions);
      if (parsed.labTests) setLabTests(parsed.labTests);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.emergencyCases) setEmergencyCases(parsed.emergencyCases);
      return true;
    } catch (e) {
      console.error('Invalid JSON import', e);
      return false;
    }
  };

  return (
    <HospitalContext.Provider
      value={{
        patients,
        doctors,
        wards,
        appointments,
        medicines,
        prescriptions,
        labTests,
        invoices,
        emergencyCases,
        addPatient,
        updatePatient,
        dischargePatient,
        admitPatientToBed,
        recordVitals,
        addClinicalNote,
        bookAppointment,
        updateAppointmentStatus,
        toggleDoctorOnDuty,
        updateBedStatus,
        transferBed,
        addMedication,
        restockMedication,
        dispensePrescription,
        addPrescription,
        orderLabTest,
        updateLabTestResult,
        createInvoice,
        updateInvoiceStatus,
        addEmergencyCase,
        updateEmergencyStatus,
        fastTrackEmergencyToInpatient,
        resetDemoData,
        exportDataToJson,
        importDataFromJson,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
