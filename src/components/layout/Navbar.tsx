import React from 'react';
import {
  Activity,
  UserPlus,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export type NavTab =
  | 'overview'
  | 'patients'
  | 'appointments'
  | 'wards'
  | 'pharmacy'
  | 'laboratory'
  | 'billing'
  | 'emergency';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAdmitModal: () => void;
  onOpenEmergencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAdmitModal,
  onOpenEmergencyModal,
}) => {
  const { emergencyCases, resetDemoData, exportDataToJson, importDataFromJson } = useHospital();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeErCount = emergencyCases.filter(
    (c) => c.status === 'Awaiting Doctor' || c.status === 'In Triage'
  ).length;

  const handleExport = () => {
    const dataStr = exportDataToJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auracare_hms_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataFromJson(content);
        if (success) {
          alert('Hospital database restored successfully.');
        } else {
          alert('Failed to parse imported JSON file.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Reset all hospital records to default demo data?')) {
      resetDemoData();
    }
  };

  const navItems: { id: NavTab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'patients', label: 'Patients & EHR' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'wards', label: 'Wards & Beds' },
    { id: 'pharmacy', label: 'Pharmacy' },
    { id: 'laboratory', label: 'Laboratory' },
    { id: 'billing', label: 'Billing' },
    { id: 'emergency', label: 'ER Triage', badge: activeErCount > 0 ? activeErCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Utility quick strip */}
      <div className="bg-slate-900 text-slate-300 text-xs px-6 py-1.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-medium text-white tracking-wide">AuraCare Health System</span>
          <span className="text-slate-500">·</span>
          <span>Central General Hospital #402</span>
          <span className="text-slate-500">·</span>
          <span>Inpatient & Emergency Command</span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Import Hospital Database JSON"
          >
            <Upload className="w-3 h-3" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export Hospital Database JSON"
          >
            <Download className="w-3 h-3" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={handleReset}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-400"
            title="Reset system to seed dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Primary Top Bar adhering to Top Bar Contract */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5 max-w-[1600px] mx-auto">
        {/* Zone 1: Brand wordmark */}
        <div
          onClick={() => onTabChange('overview')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              AuraCare HMS
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-rose-500 text-white rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & ER Quick Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenEmergencyModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ER Triage Intake</span>
          </button>

          <button
            onClick={onOpenAdmitModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admit Patient</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center justify-between ${
                currentTab === item.id
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs font-mono font-bold bg-rose-500 text-white rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenEmergencyModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-md flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>ER Triage Intake</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
