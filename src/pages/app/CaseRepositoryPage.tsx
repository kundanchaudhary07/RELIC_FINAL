import React, { useMemo, useState } from 'react';
import {
  FolderGit2,
  Search,
  Download,
  ArrowRight,
  FileText,
  Eye,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';

export const CaseRepositoryPage: React.FC<{ onNavigate: (route: string) => void }> = ({
  onNavigate,
}) => {
  const { cases, selectCaseById, selectedCase } = useCase();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fraudTypeFilter, setFraudTypeFilter] = useState('ALL');

  /*
   * CaseRepository now works with the real Complaint data mapped by
   * CaseContext. The backend Complaint model does not contain the old
   * demo-only victim/location/prediction fields, so every value below
   * is read safely from the fields that actually exist.
   */
  const getString = (value: unknown, fallback = '—') =>
    typeof value === 'string' && value.trim() ? value : fallback;

  const getAmount = (caseItem: any) => {
    const amount =
      typeof caseItem?.reportedAmount === 'number'
        ? caseItem.reportedAmount
        : Number(caseItem?.reportedAmount ?? caseItem?.reportedFraudAmount ?? 0);

    return Number.isFinite(amount) ? amount : 0;
  };

  const getDate = (caseItem: any) =>
    getString(caseItem?.createdAt ?? caseItem?.complaintDate ?? caseItem?.incidentDate);

  const getCaseId = (caseItem: any) =>
    getString(caseItem?.caseNumber ?? caseItem?.complaintId ?? caseItem?.id);

  const getTransactionId = (caseItem: any) =>
    getString(caseItem?.transactionId ?? caseItem?.initialTransactionId);

  const getVictimAccount = (caseItem: any) =>
    getString(caseItem?.victimAccountId ?? caseItem?.victim?.accountId);

  const getBeneficiary = (caseItem: any) =>
    getString(
      caseItem?.beneficiaryAccountId ??
        caseItem?.beneficiaryUpiId ??
        caseItem?.predictedCashoutRegion?.city,
    );

  const availableFraudTypes = useMemo(() => {
    const values = cases
      .map((caseItem: any) => getString(caseItem?.fraudType, ''))
      .filter(Boolean);

    return Array.from(new Set(values));
  }, [cases]);

  const availableStatuses = useMemo(() => {
    const values = cases
      .map((caseItem: any) => getString(caseItem?.status, ''))
      .filter(Boolean);

    return Array.from(new Set(values));
  }, [cases]);

  const filteredCases = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return cases.filter((caseItem: any) => {
      const status = getString(caseItem?.status, '');
      const fraudType = getString(caseItem?.fraudType, '');

      if (statusFilter !== 'ALL' && status !== statusFilter) return false;
      if (fraudTypeFilter !== 'ALL' && fraudType !== fraudTypeFilter) return false;

      if (!q) return true;

      const searchableValues = [
        getCaseId(caseItem),
        fraudType,
        getVictimAccount(caseItem),
        getTransactionId(caseItem),
        getString(caseItem?.beneficiaryAccountId),
        getString(caseItem?.beneficiaryUpiId),
        getString(caseItem?.victim?.name),
        getString(caseItem?.victim?.phone),
        getString(caseItem?.initialSenderBank),
      ];

      return searchableValues.some((value) => value.toLowerCase().includes(q));
    });
  }, [cases, searchTerm, statusFilter, fraudTypeFilter]);

  const exportCSV = () => {
    const headers = [
      'Case ID',
      'Fraud Type',
      'Reported Amount (INR)',
      'Victim Account ID',
      'Transaction ID',
      'Beneficiary Account ID',
      'Beneficiary UPI ID',
      'Status',
      'Complaint Date',
    ];

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = filteredCases.map((caseItem: any) => [
      getCaseId(caseItem),
      getString(caseItem?.fraudType, ''),
      getAmount(caseItem),
      getString(caseItem?.victimAccountId ?? caseItem?.victim?.accountId, ''),
      getTransactionId(caseItem),
      getString(caseItem?.beneficiaryAccountId, ''),
      getString(caseItem?.beneficiaryUpiId, ''),
      getString(caseItem?.status, ''),
      getDate(caseItem),
    ]);

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `RELIC_Case_Repository_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'CLOSED':
      case 'INTERCEPTED':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';

      case 'ANALYZED':
        return 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800';

      case 'REGISTERED':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';

      case 'UNDER_INVESTIGATION':
      case 'ACTIVE':
      default:
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Case Repository
            </h1>
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {cases.length} complaint{cases.length === 1 ? '' : 's'} loaded from the backend
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredCases.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-xs shadow-sm transition-colors">
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by case ID, account, UTR, beneficiary, or fraud type..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={fraudTypeFilter}
            onChange={(e) => setFraudTypeFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Types</option>
            {availableFraudTypes.map((fraudType) => (
              <option key={fraudType} value={fraudType}>
                {fraudType}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Summary */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing {filteredCases.length} of {cases.length} cases
        </span>

        {(searchTerm || statusFilter !== 'ALL' || fraudTypeFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setFraudTypeFilter('ALL');
            }}
            className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Case Table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        {filteredCases.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />

            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {cases.length === 0 ? 'No complaints found' : 'No matching cases'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {cases.length === 0
                ? 'Register a complaint from New Complaint and it will appear here after the backend saves it.'
                : 'Try changing the search text or filters.'}
            </p>

            {cases.length === 0 && (
              <button
                onClick={() => onNavigate('new-complaint')}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Register New Complaint
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <th className="py-3.5 px-4">CASE ID</th>
                  <th className="py-3.5 px-4">TYPE</th>
                  <th className="py-3.5 px-4">VICTIM ACCOUNT</th>
                  <th className="py-3.5 px-4">AMOUNT</th>
                  <th className="py-3.5 px-4">TXN REF</th>
                  <th className="py-3.5 px-4">BENEFICIARY</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredCases.map((caseItem: any) => {
                  const status = getString(caseItem?.status);
                  const fraudType = getString(caseItem?.fraudType);
                  const amount = getAmount(caseItem);
                  const caseId = getCaseId(caseItem);
                  const transactionId = getTransactionId(caseItem);
                  const victimAccount = getVictimAccount(caseItem);
                  const beneficiaryAccount = getString(caseItem?.beneficiaryAccountId);
                  const beneficiaryUpi = getString(caseItem?.beneficiaryUpiId);
                  const date = getDate(caseItem);

                  return (
                    <tr
                      key={caseItem?.id ?? caseItem?.complaintId ?? caseId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedCase?.id === caseItem?.id
                          ? 'bg-cyan-50/70 dark:bg-cyan-950/25'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {caseId}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date !== '—' ? date.slice(0, 10) : '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] font-medium">
                        {fraudType}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-900 dark:text-white block text-[11px]">
                          {victimAccount}
                        </span>
                        {caseItem?.victim?.name && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
                            {caseItem.victim.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-cyan-700 dark:text-cyan-300 whitespace-nowrap">
                        ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {transactionId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-amber-700 dark:text-amber-400 block text-[11px]">
                          {beneficiaryAccount}
                        </span>
                        {beneficiaryUpi !== '—' && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {beneficiaryUpi}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${getStatusClasses(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            selectCaseById(caseItem.id);
                            onNavigate('case-details');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Repository footer */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-500 px-1">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          Live backend data
        </span>

        <span>
          {filteredCases.length} visible / {cases.length} total
        </span>
      </div>
    </div>
  );
};

export default CaseRepositoryPage;
