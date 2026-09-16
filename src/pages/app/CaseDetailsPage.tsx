import React, { useMemo, useState } from 'react';
import {
  FileText,
  CreditCard,
  GitFork,
  BrainCircuit,
  MapPin,
  Building2,
  FolderArchive,
  FileCheck2,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Send,
  Sparkles,
  Printer,
  ArrowRight,
  Clock,
  UserRound,
  Landmark,
  WalletCards,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { InteractiveIndiaMap } from '../../components/common/InteractiveIndiaMap';
import { AtmCandidate } from '../../types';

export const CaseDetailsPage: React.FC<{
  initialTab?: string;
  onNavigate?: (route: string) => void;
}> = ({ initialTab = 'overview', onNavigate }) => {
  const {
    selectedCase,
    updateCaseStatus,
    recordCaseAnalysis,
    assignInvestigator,
  } = useCase();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedAtm, setSelectedAtm] = useState<AtmCandidate | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /*
   * The current backend is Complaint-based. It provides:
   * complaint_id, complaint_date, fraud_type, reported_amount,
   * victim_account_id, transaction_id, beneficiary_account_id,
   * beneficiary_upi_id, complaint_status and linked_fraud_account.
   *
   * The previous Case Details page expected many legacy/demo fields
   * such as victim.name, incidentLocation, moneyTrail,
   * predictedCashoutRegion and atmCandidates. Those fields are not
   * guaranteed by the Complaint API and were causing the black screen.
   *
   * This page therefore reads the real fields safely and only renders
   * intelligence sections when real data actually exists.
   */

  const caseData = selectedCase as any;

  const getString = (value: unknown, fallback = '—') =>
    typeof value === 'string' && value.trim() ? value : fallback;

  const getNumber = (value: unknown, fallback = 0) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const caseId = getString(
    caseData?.caseNumber ?? caseData?.complaintId ?? caseData?.id,
  );

  const fraudType = getString(caseData?.fraudType);
  const status = getString(caseData?.status ?? caseData?.complaintStatus);
  const transactionId = getString(
    caseData?.transactionId ?? caseData?.initialTransactionId,
  );
  const victimAccountId = getString(
    caseData?.victimAccountId ?? caseData?.victim?.accountId,
  );
  const beneficiaryAccountId = getString(caseData?.beneficiaryAccountId);
  const beneficiaryUpiId = getString(caseData?.beneficiaryUpiId);
  const reportedAmount = getNumber(
    caseData?.reportedAmount ?? caseData?.reportedFraudAmount,
  );
  const complaintDate = getString(
    caseData?.createdAt ?? caseData?.complaintDate ?? caseData?.incidentDate,
  );

  const linkedFraudAccount = Boolean(caseData?.linkedFraudAccount);

  const moneyTrail = Array.isArray(caseData?.moneyTrail)
    ? caseData.moneyTrail
    : [];

  const evidenceFiles = Array.isArray(caseData?.evidenceFiles)
    ? caseData.evidenceFiles
    : [];

  const atmCandidates: AtmCandidate[] = Array.isArray(caseData?.atmCandidates)
    ? caseData.atmCandidates
    : [];

  const hasLocationData = Boolean(
    caseData?.incidentLocation &&
      typeof caseData.incidentLocation === 'object',
  );

  const hasCashoutData = Boolean(
    caseData?.predictedCashoutRegion &&
      typeof caseData.predictedCashoutRegion === 'object',
  );

  const hasAiData = Boolean(
    caseData?.aiAnalysis &&
      typeof caseData.aiAnalysis === 'object',
  );

  const investigatorName = getString(
    caseData?.assignedOfficer ?? user?.name,
    'Not assigned',
  );

  const investigatorId = getString(
    caseData?.investigatorId ??
      caseData?.investigatorBadge ??
      user?.badgeNumber ??
      user?.badgeId,
  );

  const title =
    getString(caseData?.title, '') !== '—'
      ? getString(caseData?.title)
      : `${fraudType} Complaint`;

  const availableTabs = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: FileText, enabled: true },
      { id: 'transactions', label: 'Transactions', icon: CreditCard, enabled: true },
      {
        id: 'money-trail',
        label: 'Money Trail',
        icon: GitFork,
        enabled: moneyTrail.length > 0,
      },
      {
        id: 'ai-intelligence',
        label: 'AI Analysis',
        icon: BrainCircuit,
        enabled: true,
      },
      {
        id: 'location',
        label: 'Location Map',
        icon: MapPin,
        enabled: true,
      },
      {
        id: 'atm-candidates',
        label: 'ATM Targets',
        icon: Building2,
        enabled: atmCandidates.length > 0,
      },
      {
        id: 'evidence',
        label: 'Evidence',
        icon: FolderArchive,
        enabled: evidenceFiles.length > 0,
      },
      { id: 'report', label: 'Report & Notice', icon: FileCheck2, enabled: true },
    ],
    [moneyTrail.length, atmCandidates.length, evidenceFiles.length],
  );

  const tabs = availableTabs.filter((tab) => tab.enabled);

  if (!selectedCase) {
    return (
      <div className="p-12 text-center space-y-4 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <FileText className="w-6 h-6 text-slate-400" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
          No Case Selected
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Please select an investigation from the Case Repository.
        </p>

        <button
          onClick={() => onNavigate?.('cases')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 text-xs font-bold font-['Space_Grotesk'] shadow-sm cursor-pointer"
        >
          Go to Case Repository
        </button>
      </div>
    );
  }

  const handleStatusUpdate = async (nextStatus: string) => {
    setStatusMessage(null);

    try {
      await updateCaseStatus(caseData.id, nextStatus);
      setStatusMessage(`Status update requested: ${nextStatus}`);
    } catch (error) {
      console.error('Case status update failed:', error);
      setStatusMessage(
        'Status could not be updated because the current Complaint API does not expose an update endpoint.',
      );
    }
  };

  const handleAssignToMe = async () => {
    if (!user) return;

    try {
      await assignInvestigator(caseData.id, {
        name: user.name,
        id: user.badgeNumber || user.badgeId || user.id,
        badgeId: user.badgeNumber || user.badgeId,
        role: user.role,
        department: user.department,
        station: user.station,
        email: user.email,
        avatar: user.registeredPhoto || user.avatar,
      });

      setStatusMessage('Investigator assignment saved locally for this session.');
    } catch (error) {
      console.error('Investigator assignment failed:', error);
      setStatusMessage('Investigator assignment could not be updated.');
    }
  };

  const handleAskGemini = async () => {
    const prompt = aiPrompt.trim();

    if (!prompt) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const invId =
        user?.badgeNumber || user?.badgeId || user?.id || 'INVESTIGATOR';

      const invName =
        user?.name || investigatorName || 'Cyber Crime Investigator';

      const invRole =
        user?.role || 'CYBERCRIME_INVESTIGATOR';

      const invBadge =
        user?.badgeNumber || user?.badgeId || 'INVESTIGATOR';

      const token = localStorage.getItem('relic_access_token');

      const res = await fetch('/api/intelligence/analyze-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          caseId: caseData.id,
          complaintId: caseData.complaintId ?? caseData.id,
          prompt,
          investigatorId: invId,
          investigatorName: invName,
          investigatorBadge: invBadge,
          investigatorRole: invRole,
          complaint: {
            complaint_id: caseData.complaintId ?? caseData.id,
            complaint_date: complaintDate,
            fraud_type: fraudType,
            reported_amount: reportedAmount,
            victim_account_id: victimAccountId,
            transaction_id: transactionId,
            beneficiary_account_id: beneficiaryAccountId,
            beneficiary_upi_id:
              beneficiaryUpiId === '—' ? null : beneficiaryUpiId,
            complaint_status: status,
            linked_fraud_account: linkedFraudAccount,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`AI analysis request failed with ${res.status}`);
      }

      const data = await res.json();
      const responseText =
        data?.aiResponse ??
        data?.response ??
        data?.message ??
        'No AI response was returned by the server.';

      setAiResponse(String(responseText));

      if (user) {
        await recordCaseAnalysis(
          caseData.id,
          {
            name: user.name,
            id: user.badgeNumber || user.badgeId || user.id,
            badgeId: user.badgeNumber || user.badgeId,
            role: user.role,
            department: user.department,
            station: user.station,
            email: user.email,
          },
          String(responseText),
        );
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiResponse(
        'AI analysis is not available from the current backend endpoint. No demo result has been generated.',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const exportCaseJSON = () => {
    const payload = {
      complaint_id: caseData.complaintId ?? caseData.id,
      complaint_date: complaintDate,
      fraud_type: fraudType,
      reported_amount: reportedAmount,
      victim_account_id: victimAccountId,
      transaction_id: transactionId,
      beneficiary_account_id: beneficiaryAccountId,
      beneficiary_upi_id:
        beneficiaryUpiId === '—' ? null : beneficiaryUpiId,
      complaint_status: status,
      linked_fraud_account: linkedFraudAccount,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${caseId.replace(/\s+/g, '_')}_Complaint.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderUnavailable = (
    titleText: string,
    description: string,
    icon: React.ReactNode = <AlertTriangle className="w-5 h-5" />,
  ) => (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          {icon}
        </div>

        <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
          {titleText}
        </h3>

        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>

        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
          RELIC does not generate placeholder investigation data.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      {/* Case identity */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                CASE: {caseId}
              </span>

              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-950 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-800 font-semibold">
                {status}
              </span>

              {linkedFraudAccount && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold">
                  LINKED FRAUD ACCOUNT
                </span>
              )}
            </div>

            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Complaint date: {complaintDate}
              {' • '}
              Fraud type: <strong className="text-slate-900 dark:text-slate-200">{fraudType}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-right">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                REPORTED LOSS
              </span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-cyan-700 dark:text-cyan-300">
                ₹{reportedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                COMPLAINT STATUS
              </span>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-amber-700 dark:text-amber-400">
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-['Space_Grotesk'] transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white dark:bg-cyan-400 dark:text-slate-950 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="px-4 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300">
          {statusMessage}
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Complaint Summary
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                This case is loaded directly from the RELIC Complaint API. Investigation intelligence will appear here when the backend provides the corresponding data.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <InfoCard
                  icon={<FileText className="w-4 h-4" />}
                  label="FRAUD CATEGORY"
                  value={fraudType}
                />

                <InfoCard
                  icon={<WalletCards className="w-4 h-4" />}
                  label="REPORTED AMOUNT"
                  value={`₹${reportedAmount.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}`}
                />

                <InfoCard
                  icon={<CreditCard className="w-4 h-4" />}
                  label="TRANSACTION ID"
                  value={transactionId}
                  mono
                />

                <InfoCard
                  icon={<UserRound className="w-4 h-4" />}
                  label="VICTIM ACCOUNT ID"
                  value={victimAccountId}
                  mono
                />

                <InfoCard
                  icon={<Landmark className="w-4 h-4" />}
                  label="BENEFICIARY ACCOUNT ID"
                  value={beneficiaryAccountId}
                  mono
                />

                <InfoCard
                  icon={<WalletCards className="w-4 h-4" />}
                  label="BENEFICIARY UPI ID"
                  value={beneficiaryUpiId}
                  mono
                />

                <InfoCard
                  icon={<Clock className="w-4 h-4" />}
                  label="COMPLAINT DATE"
                  value={complaintDate}
                />

                <InfoCard
                  icon={<Shield className="w-4 h-4" />}
                  label="LINKED FRAUD ACCOUNT"
                  value={linkedFraudAccount ? 'YES' : 'NO'}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserRound className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Investigator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">
                    Assigned Investigator
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {investigatorName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">
                    Investigator ID
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {investigatorId}
                  </span>
                </div>
              </div>

              {user?.name && investigatorName !== user.name && (
                <button
                  onClick={handleAssignToMe}
                  className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  [Assign to Me]
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold uppercase">
                  Investigation Intelligence
                </span>
              </div>

              {hasCashoutData ? (
                <div className="space-y-2 text-xs">
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    {getString(caseData.predictedCashoutRegion?.city)}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {getString(caseData.predictedCashoutRegion?.state)}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-mono">
                    {getNumber(
                      caseData.predictedCashoutRegion?.confidencePercentage,
                    )}
                    % confidence
                  </div>

                  <button
                    onClick={() => setActiveTab('atm-candidates')}
                    className="w-full mt-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white dark:bg-amber-500 dark:text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    VIEW ATM CANDIDATES
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  No cash-out forecast is available for this complaint yet. This value must come from a real investigation-intelligence backend response.
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <h4 className="font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                Status Actions
              </h4>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleStatusUpdate('ACTIVE')}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-mono text-center cursor-pointer font-medium"
                >
                  Set ACTIVE
                </button>

                <button
                  onClick={() => handleStatusUpdate('CLOSED')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-center cursor-pointer"
                >
                  Set CLOSED
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                Transaction Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Information supplied by the Complaint API.
              </p>
            </div>

            <CreditCard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <InfoCard label="TRANSACTION ID / UTR" value={transactionId} mono />
            <InfoCard label="VICTIM ACCOUNT ID" value={victimAccountId} mono />
            <InfoCard
              label="BENEFICIARY ACCOUNT ID"
              value={beneficiaryAccountId}
              mono
            />
            <InfoCard
              label="BENEFICIARY UPI ID"
              value={beneficiaryUpiId}
              mono
            />
            <InfoCard
              label="TRANSACTION AMOUNT"
              value={`₹${reportedAmount.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
              })}`}
            />
            <InfoCard label="FRAUD TYPE" value={fraudType} />
          </div>

          {moneyTrail.length === 0 &&
            renderUnavailable(
              'Transaction chain not available',
              'The current Complaint model contains the initial transaction reference and beneficiary details, but it does not provide a multi-hop transaction ledger. No transaction hops are being fabricated.',
              <CreditCard className="w-5 h-5" />,
            )}
        </div>
      )}

      {/* MONEY TRAIL */}
      {activeTab === 'money-trail' && (
        <div className="space-y-6">
          {moneyTrail.length === 0 ? (
            renderUnavailable(
              'Money Trail data not available',
              'No real money-trail records were returned for this complaint. Connect a backend money-trail endpoint before displaying financial hops.',
              <GitFork className="w-5 h-5" />,
            )
          ) : (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                Money Dispersion Flow
              </h3>

              <div className="space-y-4">
                {moneyTrail.map((hop: any, index: number) => (
                  <div key={hop?.hopNumber ?? index}>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold block">
                          {getString(hop?.hopType, `HOP ${index + 1}`)}
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {getString(hop?.receiverName)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                          {getString(hop?.receiverBank)} | Acc:{' '}
                          {getString(hop?.receiverAccount)}
                        </div>
                      </div>

                      <div className="text-xs font-mono">
                        <div>
                          Amount:{' '}
                          <strong>
                            ₹{getNumber(hop?.amount).toLocaleString('en-IN')}
                          </strong>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 mt-1">
                          {getString(hop?.locationCity)}, {getString(hop?.locationState)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          REMAINING
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{getNumber(hop?.remainingBalance).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {index < moneyTrail.length - 1 && (
                      <div className="h-5 flex items-center justify-center text-cyan-600">
                        ↓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI ANALYSIS */}
      {activeTab === 'ai-intelligence' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-5">
              {hasAiData ? (
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    Existing AI Analysis
                  </h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {getString(caseData.aiAnalysis?.summary)}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard
                      label="VELOCITY SCORE"
                      value={`${getNumber(caseData.aiAnalysis?.velocityScore)} / 100`}
                    />
                    <InfoCard
                      label="MULE RISK"
                      value={`${getNumber(caseData.aiAnalysis?.muleNetworkRisk)} / 100`}
                    />
                  </div>
                </div>
              ) : (
                renderUnavailable(
                  'AI investigation data not available',
                  'This complaint does not currently contain stored AI-analysis data. You can request analysis below if your backend exposes the configured AI endpoint.',
                  <BrainCircuit className="w-5 h-5" />,
                )
              )}
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white dark:bg-slate-900/90 border border-cyan-200 dark:border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    AI Forensic Assistant
                  </h3>

                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 font-semibold">
                    GEMINI
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask an investigation question about this complaint..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                />

                <button
                  onClick={handleAskGemini}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {aiLoading ? 'Analyzing...' : 'RUN ANALYSIS'}
                  {!aiLoading && <Send className="w-3.5 h-3.5" />}
                </button>

                {aiResponse && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-200 dark:border-cyan-500/30 text-xs space-y-2">
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold uppercase">
                      AI ANALYSIS OUTPUT
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          {hasLocationData ? (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                  Location Radar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Real location intelligence attached to this case.
                </p>
              </div>

              <InteractiveIndiaMap
                currentCase={selectedCase}
                selectedAtm={selectedAtm}
                onSelectAtm={(atm) => setSelectedAtm(atm)}
                heightClass="h-[520px]"
              />
            </div>
          ) : (
            renderUnavailable(
              'Location intelligence not available',
              'The current Complaint API does not return latitude, longitude, incident address, or other geospatial intelligence. The map is therefore not populated with invented case coordinates.',
              <MapPin className="w-5 h-5" />,
            )
          )}
        </div>
      )}

      {/* ATM TARGETS */}
      {activeTab === 'atm-candidates' && (
        <div className="space-y-6">
          {atmCandidates.length === 0 ? (
            renderUnavailable(
              'ATM targets not available',
              'No real ATM candidate records are attached to this complaint. ATM targets must be supplied by a backend location-intelligence service.',
              <Building2 className="w-5 h-5" />,
            )
          ) : (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                  ATM Candidates
                </h3>

                <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  {atmCandidates.length} CANDIDATES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {atmCandidates.map((atm) => {
                  const isSelected = selectedAtm?.id === atm.id;

                  return (
                    <div
                      key={atm.id}
                      onClick={() => setSelectedAtm(atm)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                        isSelected
                          ? 'bg-emerald-50/50 dark:bg-slate-950 border-emerald-500 shadow-md'
                          : 'bg-slate-50/60 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">
                          RANK #{atm.rank}
                        </span>

                        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                          {atm.withdrawalLikelihood}% Match
                        </span>
                      </div>

                      <h4 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                        {atm.name}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bank: {atm.bank}
                      </p>

                      <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        <div>Address: {atm.address}</div>
                        <div>Distance: {atm.distanceKm} km</div>
                        <div>Surveillance: {atm.surveillanceStatus}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {evidenceFiles.length === 0 ? (
            renderUnavailable(
              'No evidence files attached',
              'No evidence records are currently returned by the Complaint API. Evidence storage/upload should be connected to a real backend endpoint before files are shown here.',
              <FolderArchive className="w-5 h-5" />,
            )
          ) : (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                Evidence Files
              </h3>

              <div className="space-y-3">
                {evidenceFiles.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {getString(ev.fileName)}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {getString(ev.category)}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                      {getString(ev.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                  Complaint Dossier
                </h3>
                <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-medium mt-1">
                  CASE: {caseId}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportCaseJSON}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  EXPORT
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  PRINT
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-6 text-slate-800 dark:text-slate-300 text-xs leading-relaxed">
              <div className="text-center space-y-1 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="text-base font-bold text-slate-900 dark:text-white font-['Space_Grotesk']">
                  RELIC • CYBER CRIME COMPLAINT REPORT
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Complaint record generated from backend data
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReportField label="Case Ref" value={caseId} />
                <ReportField label="Complaint Date" value={complaintDate} />
                <ReportField label="Fraud Type" value={fraudType} />
                <ReportField
                  label="Reported Loss"
                  value={`₹${reportedAmount.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}`}
                />
                <ReportField
                  label="Victim Account ID"
                  value={victimAccountId}
                />
                <ReportField
                  label="Transaction ID"
                  value={transactionId}
                />
                <ReportField
                  label="Beneficiary Account ID"
                  value={beneficiaryAccountId}
                />
                <ReportField
                  label="Beneficiary UPI ID"
                  value={beneficiaryUpiId}
                />
                <ReportField
                  label="Complaint Status"
                  value={status}
                />
                <ReportField
                  label="Linked Fraud Account"
                  value={linkedFraudAccount ? 'YES' : 'NO'}
                />
              </div>

              <div className="space-y-2">
                <strong className="text-slate-900 dark:text-white block font-['Space_Grotesk'] text-sm">
                  Complaint Summary
                </strong>
                <p>
                  This dossier contains only information currently returned by
                  the RELIC Complaint backend. Additional investigation findings,
                  transaction hops, locations, ATM targets and AI findings are
                  intentionally omitted until supplied by their respective real
                  backend services.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This report does not invent intelligence or target information
                  that is absent from the complaint record.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}> = ({ label, value, icon, mono = false }) => (
  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-2">
      {icon && <span className="text-cyan-600 dark:text-cyan-400">{icon}</span>}
      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
        {label}
      </span>
    </div>
    <span
      className={`font-semibold text-slate-900 dark:text-white block mt-1 break-all ${
        mono ? 'font-mono text-xs' : 'text-sm'
      }`}
    >
      {value}
    </span>
  </div>
);

const ReportField: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div>
    <strong className="text-slate-900 dark:text-white">{label}:</strong>{' '}
    <span className="break-all">{value}</span>
  </div>
);

export default CaseDetailsPage;
