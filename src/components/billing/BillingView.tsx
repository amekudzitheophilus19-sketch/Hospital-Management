import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  Trash2,
  FileText,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../types/hms';

interface BillingViewProps {
  onPrintInvoice: (invoice: Invoice) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onPrintInvoice }) => {
  const { invoices, patients, createInvoice, updateInvoiceStatus } = useHospital();

  const [statusFilter, setStatusFilter] = useState<'All' | InvoiceStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form
  const [invoicePatientId, setInvoicePatientId] = useState(patients[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState('2026-10-17');
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-11-17');
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('Unpaid');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'total'>[]>([
    {
      category: 'Consultation',
      description: 'Specialist Attending Clinical Evaluation',
      quantity: 1,
      unitPrice: 200.00,
    },
    {
      category: 'Laboratory',
      description: 'Complete Diagnostic Blood & Specimen Workup',
      quantity: 1,
      unitPrice: 150.00,
    },
  ]);

  // Financial calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingInsurance = invoices
    .filter((inv) => inv.status === 'Insurance Claim')
    .reduce((sum, inv) => sum + inv.total, 0);
  const unpaidDirect = invoices
    .filter((inv) => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientMrn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        category: 'Pharmacy',
        description: 'Prescription Medical Supplies',
        quantity: 1,
        unitPrice: 50.00,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === invoicePatientId);
    if (!patient) return;

    const formattedItems: InvoiceItem[] = items.map((item, i) => ({
      ...item,
      id: `item-${Date.now()}-${i}`,
      total: item.quantity * item.unitPrice,
    }));

    createInvoice({
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      date: invoiceDate,
      dueDate: invoiceDueDate,
      items: formattedItems,
      subtotal: calculatedSubtotal,
      tax: 0.00,
      total: calculatedSubtotal,
      status: invoiceStatus,
      paymentMethod: invoiceStatus === 'Paid' ? 'Credit Card (Terminal)' : undefined,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Billing & Invoicing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Itemized clinical ledgers, health insurance claims management, and patient statements.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Hospital Invoice</span>
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Gross Invoiced</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">{invoices.length} bills generated</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Payments Collected</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">Cleared transactions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Insurance Claims In Review</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            ${pendingInsurance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">Pending payer remittance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Unpaid Patient Balance</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            ${unpaidDirect.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">Due within 30 days</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice No., Patient, MRN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['All', 'Paid', 'Unpaid', 'Insurance Claim'] as const).map((status) => (
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
      </div>

      {/* Invoices Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No.</th>
                <th className="py-3 px-4 font-semibold">Patient Name</th>
                <th className="py-3 px-4 font-semibold">Date Issued</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Payment Status</th>
                <th className="py-3 px-4 font-semibold">Method / Carrier</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching hospital billing statements found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.patientName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{inv.patientMrn}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{inv.date}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'Insurance Claim'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {inv.paymentMethod || 'Awaiting Payment'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'Paid', 'Electronic Credit Card')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          View Items
                        </button>

                        <button
                          onClick={() => onPrintInvoice(inv)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                          title="Print Medical Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-xl flex flex-col text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Hospital Statement: {selectedInvoice.invoiceNumber}
                </h2>
                <div className="text-[11px] text-slate-500 font-mono">
                  Patient: {selectedInvoice.patientName} ({selectedInvoice.patientMrn})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Clinical Service / Drug</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-sans font-medium text-teal-800">
                          {item.category}
                        </td>
                        <td className="p-2.5 font-sans text-slate-900 font-medium">
                          {item.description}
                        </td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-slate-50 font-mono tabular-nums font-bold text-slate-900 text-xs">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">
                        Total Amount Due:
                      </td>
                      <td className="p-3 text-right text-sm text-teal-800">
                        ${selectedInvoice.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => onPrintInvoice(selectedInvoice)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice Statement</span>
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 shadow-xl flex flex-col text-xs"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                Generate Itemized Hospital Billing Statement
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Patient *
                  </label>
                  <select
                    value={invoicePatientId}
                    onChange={(e) => setInvoicePatientId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.mrn}) · {p.insuranceProvider}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    <option value="Unpaid">Unpaid / Bill Patient</option>
                    <option value="Insurance Claim">Submit to Insurance Carrier</option>
                    <option value="Paid">Paid in Full at Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Billing Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Line items builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Hospital Line Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    + Add Charge Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-2 items-center"
                    >
                      <select
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        className="w-full md:w-36 px-2 py-1 bg-white border border-slate-200 rounded"
                      >
                        <option value="Room & Bed">Room & Bed</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Procedure">Procedure</option>
                      </select>

                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Service or Medication Description"
                        className="w-full flex-1 px-2 py-1 bg-white border border-slate-200 rounded"
                      />

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', Number(e.target.value))
                          }
                          placeholder="Qty"
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-center"
                        />

                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, 'unitPrice', Number(e.target.value))
                          }
                          placeholder="Price"
                          className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-right"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between font-mono font-bold text-slate-900 text-sm">
                  <span>Total Calculated:</span>
                  <span className="text-teal-800">${calculatedSubtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold cursor-pointer shadow-xs"
              >
                Issue Billing Statement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
