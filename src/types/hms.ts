export type Gender = 'Male' | 'Female' | 'Other';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type PatientStatus = 'Admitted' | 'Outpatient' | 'Discharged' | 'Emergency';

export interface VitalRecord {
  id: string;
  timestamp: string;
  bloodPressure: string; // e.g. "120/80"
  heartRate: number; // bpm
  temperature: number; // °F
  spO2: number; // %
  respiratoryRate: number; // breaths/min
  recordedBy: string;
}

export interface ClinicalNote {
  id: string;
  timestamp: string;
  doctorName: string;
  role: string;
  noteText: string;
  diagnosis?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. "MRN-10492"
  name: string;
  age: number;
  dob: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string[];
  chronicConditions: string[];
  status: PatientStatus;
  wardId?: string;
  wardName?: string;
  bedNumber?: string;
  admittingDoctorId?: string;
  admittingDoctorName?: string;
  admissionDate?: string;
  dischargeDate?: string;
  vitals: VitalRecord[];
  notes: ClinicalNote[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  room: string;
  phone: string;
  email: string;
  qualification: string;
  onDuty: boolean;
  avatar: string;
  experienceYears: number;
}

export type AppointmentStatus = 'Scheduled' | 'In Consultation' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning';

export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  patientMrn?: string;
  admissionDate?: string;
}

export interface Ward {
  id: string;
  name: string;
  department: string;
  floor: string;
  totalBeds: number;
  beds: Bed[];
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosage: string;
  stock: number;
  minStockAlert: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
}

export interface PrescriptionMedication {
  medicineId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  dispensed: boolean;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medications: PrescriptionMedication[];
  status: 'Pending' | 'Dispensed';
}

export interface LabParameter {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export type LabTestStatus = 'Pending Sample' | 'In Analysis' | 'Completed';

export interface LabTest {
  id: string;
  sampleId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  testName: string;
  category: string;
  orderedBy: string;
  dateOrdered: string;
  dateCompleted?: string;
  status: LabTestStatus;
  parameters: LabParameter[];
  technicianNotes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Room & Bed' | 'Consultation' | 'Pharmacy' | 'Laboratory' | 'Procedure';
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Insurance Claim';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod?: string;
}

export type TriageUrgency = 1 | 2 | 3 | 4 | 5; // 1: Resuscitation, 2: Emergent, 3: Urgent, 4: Less Urgent, 5: Non-Urgent

export interface EmergencyCase {
  id: string;
  patientName: string;
  age: number;
  gender: Gender;
  triageLevel: TriageUrgency;
  triageLabel: string;
  chiefComplaint: string;
  vitals: string;
  arrivalTime: string;
  status: 'Awaiting Doctor' | 'In Triage' | 'Transferred to ICU' | 'Admitted' | 'Discharged';
  assignedDoctor?: string;
  bedNumber?: string;
}
