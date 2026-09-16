import React, { useMemo, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  CreditCard,
  UserRound,
  WalletCards,
  Link2,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const AiAnalysisPage: React.FC = () => {
  const { selectedCase, cases, selectCaseById, recordCaseAnalysis } = useCase();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const caseData = selectedCase as any;

  const getString = (value: unknown, fallback = '—') =>
    typeof value === 'string' && value.trim() ? value : fallback;

  const getNumber = (value: unknown, fallback = 0) => {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const complaint = useMemo(() => {
    if (!caseData) return null;

    return {
      complaint_id: caseData.complaintId ?? caseData.id,
      complaint_date:
        caseData.complaintDate ??
        caseData.createdAt ??
        caseData.incidentDate ??
        null,
      fraud_type: caseData.fraudType ?? null,
      reported_amount: getNumber(
        caseData.reportedAmount ?? caseData.reportedFraudAmount,
      ),
      victim_account_id:
        caseData.victimAccountId ??
        caseData.victim?.accountId ??
        null,
      transaction_id:
        caseData.transactionId ??
        caseData.initialTransactionId ??
        null,
      beneficiary_account_id: caseData.beneficiaryAccountId ?? null,
      beneficiary_upi_id: caseData.beneficiaryUpiId ?? null,
      complaint_status:
        caseData.status ??
        caseData.complaintStatus ??
        null,
      linked_fraud_account: Boolean(caseData.linkedFraudAccount),
    };
  }, [caseData]);

  const selectedCaseId = caseData?.id ? String(caseData.id) : '';

  const handleCaseChange = (id: string) => {
    if (!id) return;

    selectCaseById(id);
    setAiResult(null);
    setErrorMessage(null);
  };

  const handleRunAi = async () => {
    if (!selectedCase || !complaint) return;

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setErrorMessage('Please enter a question or analysis request.');
      return;
    }

    if (!API_BASE_URL) {
      setErrorMessage(
        'VITE_API_URL is not configured. Add your deployed backend URL to the frontend .env file.',
      );
      return;
    }

    setLoading(true);
    setAiResult(null);
    setErrorMessage(null);

    try {
      const invId =
        user?.badgeNumber ||
        user?.badgeId ||
        user?.id ||
        'INVESTIGATOR';

      const invName =
        user?.name ||
        caseData?.assignedOfficer ||
        'Cyber Crime Investigator';

      const invRole =
        user?.role ||
        caseData?.assignedOfficerRole ||
        'CYBERCRIME_INVESTIGATOR';

      const invBadge =
        user?.badgeNumber ||
        user?.badgeId ||
        'INVESTIGATOR';

      const token = localStorage.getItem('relic_access_token');

      const response = await fetch(
        `${API_BASE_URL}/api/intelligence/analyze-gemini`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            caseId: selectedCase.id,
            complaintId: complaint.complaint_id,
            prompt: cleanPrompt,

            investigatorId: invId,
            investigatorName: invName,
            investigatorBadge: invBadge,
            investigatorRole: invRole,

            user: user
              ? {
                  id: invId,
                  name: invName,
                  role: invRole,
                  badgeId: invBadge,
                  badgeNumber: user.badgeNumber,
                  department: user.department,
                  station: user.station,
                  email: user.email,
                }
              : undefined,

            complaint,
          }),
        },
      );

      if (!response.ok) {
        let detail = '';

        try {
          const errorData = await response.json();
          detail =
            errorData?.detail ||
            errorData?.message ||
            errorData?.error ||
            '';
        } catch {
          // Response may not contain JSON.
        }

        throw new Error(
          detail ||
            `AI analysis request failed with HTTP ${response.status}.`,
        );
      }

      const data = await response.json();

      const responseText =
        data?.aiResponse ??
        data?.response ??
        data?.result ??
        data?.message;

      if (!responseText) {
        throw new Error('The backend returned no AI analysis result.');
      }

      const resultText = String(responseText);
      setAiResult(resultText);

      if (user) {
        try {
          await recordCaseAnalysis(
            selectedCase.id,
            {
              name: user.name,
              id: user.badgeNumber || user.badgeId || user.id,
              badgeId: user.badgeNumber || user.badgeId,
              role: user.role,
              department: user.department,
              station: user.station,
              email: user.email,
            },
            resultText,
          );
        } catch (recordError) {
          console.warn(
            'AI result was received, but recording the analysis failed:',
            recordError,
          );
        }
      }
    } catch (error) {
      console.error('AI analysis failed:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'AI analysis could not be completed.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) {
    return (
      <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm text-center">
          <BrainCircuit className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-4" />

          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
            No Case Selected
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Select a case from Case Repository or Active Cases before running AI analysis.
          </p>
        </div>
      </div>
    );
  }

  const fraudType = getString(caseData?.fraudType);
  const transactionId = getString(
    caseData?.transactionId ?? caseData?.initialTransactionId,
  );
  const victimAccountId = getString(
    caseData?.victimAccountId ?? caseData?.victim?.accountId,
  );
  const beneficiaryAccountId = getString(caseData?.beneficiaryAccountId);
  const beneficiaryUpiId = getString(caseData?.beneficiaryUpiId);
  const status = getString(
    caseData?.status ?? caseData?.complaintStatus,
  );
  const amount = getNumber(
    caseData?.reportedAmount ?? caseData?.reportedFraudAmount,
  );

  const hasStoredAiAnalysis = Boolean(
    caseData?.aiAnalysis &&
      typeof caseData.aiAnalysis === 'object',
  );

  const velocityScore = getNumber(
    caseData?.aiAnalysis?.velocityScore,
    0,
  );

  const muleNetworkRisk = getNumber(
    caseData?.aiAnalysis?.muleNetworkRisk,
    0,
  );

  const recommendedActions = Array.isArray(
    caseData?.aiAnalysis?.recommendedActionPlan,
  )
    ? caseData.aiAnalysis.recommendedActionPlan
    : [];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />

            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Analysis
            </h1>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            AI analysis for the selected backend complaint
          </p>
        </div>

        <select
          value={selectedCaseId}
          onChange={(e) => handleCaseChange(e.target.value)}
          className="min-w-[240px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-cyan-800 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          {cases.length === 0 ? (
            <option value="">No cases available</option>
          ) : (
            cases.map((caseItem: any) => {
              const caseAmount = getNumber(
                caseItem?.reportedAmount ?? caseItem?.reportedFraudAmount,
              );

              return (
                <option key={caseItem.id} value={caseItem.id}>
                  {getString(
                    caseItem?.caseNumber ??
                      caseItem?.complaintId ??
                      caseItem?.id,
                  )}{' '}
                  — ₹
                  {caseAmount.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </option>
              );
            })
          )}
        </select>
      </div>

      {/* Real complaint context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ContextCard
          icon={<FileText className="w-4 h-4" />}
          label="FRAUD TYPE"
          value={fraudType}
        />

        <ContextCard
          icon={<WalletCards className="w-4 h-4" />}
          label="REPORTED AMOUNT"
          value={`₹${amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
          })}`}
        />

        <ContextCard
          icon={<CreditCard className="w-4 h-4" />}
          label="TRANSACTION ID"
          value={transactionId}
        />

        <ContextCard
          icon={<ShieldAlert className="w-4 h-4" />}
          label="STATUS"
          value={status}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                Complaint Intelligence
              </h3>

              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                LIVE CASE DATA
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <DataRow label="Victim Account ID" value={victimAccountId} />
              <DataRow
                label="Beneficiary Account ID"
                value={beneficiaryAccountId}
              />
              <DataRow
                label="Beneficiary UPI ID"
                value={beneficiaryUpiId}
              />
              <DataRow
                label="Linked Fraud Account"
                value={caseData?.linkedFraudAccount ? 'YES' : 'NO'}
              />
            </div>
          </div>

          {hasStoredAiAnalysis ? (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                Stored AI Risk Metrics
              </h3>

              <MetricBar
                label="DISPERSAL VELOCITY"
                value={velocityScore}
                textClass="text-red-600 dark:text-red-400"
                barClass="bg-red-500"
              />

              <MetricBar
                label="MULE NETWORK RISK"
                value={muleNetworkRisk}
                textClass="text-amber-600 dark:text-amber-400"
                barClass="bg-amber-500"
              />

              {recommendedActions.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold">
                    RECOMMENDED ACTION PLAN
                  </span>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {recommendedActions.map(
                      (action: unknown, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            {String(action)}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                    No Stored AI Metrics
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    This complaint does not currently contain stored AI risk
                    metrics. Run an analysis using the assistant to request
                    intelligence from the backend.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Console */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900/90 border border-cyan-200 dark:border-cyan-500/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  AI Assistant
                </h3>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Ask about this complaint using its real backend data.
                </p>
              </div>

              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 font-semibold">
                GEMINI
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">
                    CASE
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold break-all">
                    {getString(
                      caseData?.caseNumber ??
                        caseData?.complaintId ??
                        caseData?.id,
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">
                    TRANSACTION
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold break-all">
                    {transactionId}
                  </span>
                </div>
              </div>
            </div>

            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Ask a question about this complaint, for example: Summarize the fraud indicators and suggest investigation steps based only on the complaint data."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleRunAi}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Evaluating...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>RUN AI ANALYSIS</span>
                </>
              )}
            </button>

            {aiResult && (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-200 dark:border-cyan-500/40 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold uppercase mb-3">
                  EVALUATION REPORT
                </div>

                {aiResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContextCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
      {icon}
      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
        {label}
      </span>
    </div>

    <div className="mt-2 text-xs font-semibold text-slate-900 dark:text-white break-all">
      {value}
    </div>
  </div>
);

const DataRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="font-mono font-semibold text-slate-900 dark:text-white text-right break-all">
      {value}
    </span>
  </div>
);

const MetricBar: React.FC<{
  label: string;
  value: number;
  textClass: string;
  barClass: string;
}> = ({ label, value, textClass, barClass }) => {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-600 dark:text-slate-400 font-medium">
          {label}
        </span>

        <span className={`${textClass} font-bold`}>
          {safeValue}%
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
        <div
          className={`${barClass} h-full rounded-full transition-all`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
};

export default AiAnalysisPage;
