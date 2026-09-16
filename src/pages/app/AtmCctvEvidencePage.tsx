import React, { useMemo, useState } from 'react';
import {
  Video,
  ShieldCheck,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Layers,
  Camera,
  Search,
  FileCheck2,
  Calendar,
  Building2,
  MapPin,
  Database,
  LockKeyhole,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';

interface AtmCctvEvidencePageProps {
  onNavigate?: (route: string) => void;
  onBack?: () => void;
}

type ReviewChecks = {
  footageReviewed: boolean;
  timestampConfirmed: boolean;
  atmLocationConfirmed: boolean;
  eventsReviewed: boolean;
  metadataVerified: boolean;
};

export const AtmCctvEvidencePage: React.FC<AtmCctvEvidencePageProps> = ({
  onNavigate,
}) => {
  const { selectedCase, cases, selectCaseById } = useCase();
  const { user } = useAuth();

  const [windowOption, setWindowOption] = useState<'1' | '5' | '10' | '15'>(
    '5'
  );
  const [selectedCamera, setSelectedCamera] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [reviewChecks, setReviewChecks] = useState<ReviewChecks>({
    footageReviewed: false,
    timestampConfirmed: false,
    atmLocationConfirmed: false,
    eventsReviewed: false,
    metadataVerified: false,
  });

  const [verificationStatus, setVerificationStatus] = useState<
    'PENDING_REVIEW' | 'OFFICER_VERIFIED' | 'REJECTED'
  >('PENDING_REVIEW');

  const [requestMessage, setRequestMessage] = useState('');

  const currentCase = selectedCase as any;

  const complaintId = currentCase?.complaintId ?? currentCase?.id ?? '—';

  const caseNumber =
    currentCase?.caseNumber ??
    currentCase?.complaintId ??
    currentCase?.id ??
    '—';

  const fraudType = currentCase?.fraudType ?? '—';

  const transactionId =
    currentCase?.transactionId ??
    currentCase?.initialTransactionId ??
    '—';

  const reportedAmount =
    currentCase?.reportedAmount ??
    currentCase?.reportedFraudAmount ??
    null;

  const victimAccountId =
    currentCase?.victimAccountId ??
    currentCase?.victim?.accountId ??
    null;

  const beneficiaryAccountId =
    currentCase?.beneficiaryAccountId ??
    currentCase?.beneficiary?.accountId ??
    null;

  const beneficiaryUpiId =
    currentCase?.beneficiaryUpiId ??
    currentCase?.beneficiary?.upiId ??
    null;

  const complaintStatus =
    currentCase?.status ??
    currentCase?.complaintStatus ??
    '—';

  const linkedFraudAccount =
    currentCase?.linkedFraudAccount ??
    currentCase?.linked_fraud_account ??
    false;

  const complaintDate =
    currentCase?.complaintDate ??
    currentCase?.incidentDate ??
    currentCase?.createdAt ??
    null;

  const hasCctvEvidence = Boolean(
    currentCase?.cctvEvidence ||
      currentCase?.cctvUrl ||
      currentCase?.evidenceUrl ||
      currentCase?.cctvFootage
  );

  const hasAtmData = Boolean(
    currentCase?.atmId ||
      currentCase?.atmLocation ||
      currentCase?.atmCandidate ||
      currentCase?.atmCandidates
  );

  const hasLocationData = Boolean(
    currentCase?.incidentLocation ||
      currentCase?.location ||
      currentCase?.city ||
      currentCase?.state
  );

  const availableCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return cases;
    }

    return cases.filter((item) => {
      const data = item as any;

      return [
        data?.caseNumber,
        data?.complaintId,
        data?.transactionId,
        data?.fraudType,
        data?.victimAccountId,
        data?.beneficiaryAccountId,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [cases, searchTerm]);

  const formatAmount = (amount: unknown) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return '—';
    }

    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateValue: unknown) => {
    if (!dateValue) {
      return '—';
    }

    const date = new Date(String(dateValue));

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getWindowText = () => {
    return `±${windowOption} minute${
      windowOption === '1' ? '' : 's'
    }`;
  };

  const allReviewChecksComplete =
    Object.values(reviewChecks).every(Boolean);

  const handleCaseChange = (id: string) => {
    selectCaseById(id);

    setVerificationStatus('PENDING_REVIEW');

    setReviewChecks({
      footageReviewed: false,
      timestampConfirmed: false,
      atmLocationConfirmed: false,
      eventsReviewed: false,
      metadataVerified: false,
    });

    setRequestMessage('');
    setSelectedCamera('');
  };

  const handleRequestCctv = () => {
    setRequestMessage(
      'CCTV retrieval is not connected to a backend endpoint yet. No simulated footage or evidence has been created.'
    );
  };

  const handleVerification = (
    status: 'OFFICER_VERIFIED' | 'REJECTED'
  ) => {
    if (status === 'OFFICER_VERIFIED' && !allReviewChecksComplete) {
      setRequestMessage(
        'Complete all evidence review checks before verifying CCTV evidence.'
      );
      return;
    }

    if (!hasCctvEvidence) {
      setRequestMessage(
        'Officer verification is unavailable because no real CCTV evidence is attached to this case.'
      );
      return;
    }

    setVerificationStatus(status);
  };

  if (!selectedCase) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">
          <Video className="w-10 h-10 mx-auto mb-4 text-slate-400" />

          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
            CCTV Evidence
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Select a complaint case to access CCTV evidence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800">
            <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white">
                CCTV Evidence
              </h1>

              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                EVIDENCE OPERATIONS
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transaction-linked CCTV evidence management
            </p>
          </div>

        </div>

        {/* Case Selector */}
        <div className="flex flex-col sm:flex-row gap-2">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cases..."
              className="w-full sm:w-48 pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedCase.id}
            onChange={(e) => handleCaseChange(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {availableCases.length > 0 ? (
              availableCases.map((item) => {
                const data = item as any;

                return (
                  <option key={item.id} value={item.id}>
                    {data?.caseNumber || data?.complaintId || item.id}
                    {' • '}
                    {data?.transactionId || 'Transaction unavailable'}
                  </option>
                );
              })
            ) : (
              <option value={selectedCase.id}>
                {caseNumber}
              </option>
            )}
          </select>

        </div>
      </div>

      {/* Evidence Availability Banner */}
      <div
        className={`rounded-2xl border p-5 ${
          hasCctvEvidence
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
        }`}
      >
        <div className="flex items-start gap-3">

          {hasCctvEvidence ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}

          <div>
            <h2 className="font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
              {hasCctvEvidence
                ? 'CCTV evidence available'
                : 'CCTV evidence not available'}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {hasCctvEvidence
                ? 'CCTV evidence data is attached to the selected case and can be processed by the evidence workflow.'
                : 'The current backend response does not contain a CCTV evidence file or retrieval record. The frontend will not generate simulated footage.'}
            </p>
          </div>

        </div>
      </div>

      {/* Complaint / Transaction Correlation */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />

            <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
              Complaint & Transaction Correlation
            </h2>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            {complaintStatus}
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <InfoCard
            label="CASE ID"
            value={String(caseNumber)}
          />

          <InfoCard
            label="COMPLAINT ID"
            value={String(complaintId)}
          />

          <InfoCard
            label="TRANSACTION ID"
            value={String(transactionId)}
            accent
          />

          <InfoCard
            label="FRAUD TYPE"
            value={String(fraudType)}
          />

          <InfoCard
            label="REPORTED AMOUNT"
            value={formatAmount(reportedAmount)}
            accent
          />

          <InfoCard
            label="COMPLAINT DATE"
            value={formatDate(complaintDate)}
          />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-slate-400" />

              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                VICTIM ACCOUNT
              </span>
            </div>

            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all">
              {victimAccountId || 'Not available'}
            </div>

          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-slate-400" />

              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                BENEFICIARY ACCOUNT
              </span>
            </div>

            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all">
              {beneficiaryAccountId || 'Not available'}
            </div>

          </div>

        </div>

        {beneficiaryUpiId && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
              BENEFICIARY UPI ID
            </span>

            <div className="mt-1 font-mono text-sm font-bold text-cyan-700 dark:text-cyan-400">
              {beneficiaryUpiId}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              linkedFraudAccount
                ? 'bg-red-500'
                : 'bg-slate-400'
            }`}
          />

          <span className="text-slate-600 dark:text-slate-300">
            Linked fraud account:{' '}
            <strong>
              {linkedFraudAccount ? 'YES' : 'NO'}
            </strong>
          </span>
        </div>

      </div>

      {/* CCTV Request Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <Camera className="w-4 h-4 text-cyan-500" />

            <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
              CCTV Retrieval Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-2">
                RETRIEVAL WINDOW
              </label>

              <div className="grid grid-cols-4 gap-2">
                {(['1', '5', '10', '15'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setWindowOption(option)}
                    className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                      windowOption === option
                        ? 'bg-cyan-600 text-white border-cyan-600 dark:bg-cyan-400 dark:text-slate-950 dark:border-cyan-400'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500'
                    }`}
                  >
                    ±{option}m
                  </button>
                ))}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />

                  <span className="text-xs font-mono text-cyan-800 dark:text-cyan-300">
                    Requested window: {getWindowText()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-2">
                CAMERA SOURCE
              </label>

              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">
                  Camera not specified by backend
                </option>
                <option value="CAM-ATM-01">
                  CAM-ATM-01
                </option>
                <option value="CAM-ATM-02">
                  CAM-ATM-02
                </option>
                <option value="CAM-ATM-03">
                  CAM-ATM-03
                </option>
              </select>

              <p className="text-[10px] text-slate-400 mt-2">
                Camera identifiers become authoritative only when supplied by
                the CCTV backend.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleRequestCctv}
            className="w-full mt-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Video className="w-4 h-4" />
            REQUEST CCTV FOOTAGE
          </button>

          {requestMessage && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              {requestMessage}
            </div>
          )}

        </div>

        {/* Data Sources */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <FileCheck2 className="w-4 h-4 text-emerald-500" />

            <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
              Evidence Sources
            </h2>
          </div>

          <div className="space-y-3">

            <SourceStatus
              label="Complaint record"
              available={Boolean(selectedCase)}
            />

            <SourceStatus
              label="Transaction reference"
              available={transactionId !== '—'}
            />

            <SourceStatus
              label="ATM intelligence"
              available={hasAtmData}
            />

            <SourceStatus
              label="Location intelligence"
              available={hasLocationData}
            />

            <SourceStatus
              label="CCTV evidence"
              available={hasCctvEvidence}
            />

          </div>

        </div>

      </div>

      {/* Evidence Viewer */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">

          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-500" />

            <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
              CCTV Evidence Viewer
            </h2>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            CASE: {caseNumber}
          </span>

        </div>

        <div className="min-h-[360px] rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-8">

          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-5">
            {hasCctvEvidence ? (
              <Video className="w-7 h-7 text-cyan-400" />
            ) : (
              <LockKeyhole className="w-7 h-7 text-slate-500" />
            )}
          </div>

          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
            {hasCctvEvidence
              ? 'CCTV evidence ready for integration'
              : 'No CCTV footage attached'}
          </h3>

          <p className="max-w-xl text-sm text-slate-400 mt-2 leading-relaxed">
            {hasCctvEvidence
              ? 'The selected case contains CCTV evidence metadata. A dedicated evidence viewer can be connected when the backend exposes the corresponding media endpoint.'
              : 'No real CCTV media URL, evidence file, or retrieval record is currently provided by the backend for this complaint.'}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-5">

            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
              TRANSACTION: {transactionId}
            </span>

            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
              WINDOW: {getWindowText()}
            </span>

          </div>

        </div>

      </div>

      {/* Evidence Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <Fingerprint className="w-4 h-4 text-cyan-500" />

            <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
              Evidence Integrity
            </h2>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

            <div className="flex items-center gap-2 mb-3">
              <LockKeyhole className="w-4 h-4 text-slate-400" />

              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                SHA-256 STATUS
              </span>
            </div>

            <div className="text-lg font-bold font-['Space_Grotesk'] text-slate-900 dark:text-white">
              {hasCctvEvidence
                ? 'Awaiting backend evidence hash'
                : 'Not available'}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              A cryptographic hash is only marked verified when calculated from
              the actual evidence file or supplied by the trusted evidence
              backend. The frontend does not generate a fake evidence hash.
            </p>

          </div>

        </div>

        {/* Officer Review */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />

              <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                Officer Review
              </h2>
            </div>

            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                verificationStatus === 'OFFICER_VERIFIED'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : verificationStatus === 'REJECTED'
                    ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
            >
              {verificationStatus}
            </span>

          </div>

          <div className="space-y-2">

            {[
              {
                key: 'footageReviewed',
                label: 'CCTV footage reviewed',
              },
              {
                key: 'timestampConfirmed',
                label: 'Transaction timestamp confirmed',
              },
              {
                key: 'atmLocationConfirmed',
                label: 'ATM location confirmed',
              },
              {
                key: 'eventsReviewed',
                label: 'Relevant events reviewed',
              },
              {
                key: 'metadataVerified',
                label: 'Evidence metadata verified',
              },
            ].map((item) => {
              const key = item.key as keyof ReviewChecks;

              return (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={reviewChecks[key]}
                    onChange={(e) =>
                      setReviewChecks((previous) => ({
                        ...previous,
                        [key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-cyan-600"
                  />

                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                </label>
              );
            })}

          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-5">

            <button
              type="button"
              onClick={() => handleVerification('REJECTED')}
              disabled={!hasCctvEvidence}
              className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-['Space_Grotesk'] font-bold text-xs"
            >
              REJECT
            </button>

            <button
              type="button"
              onClick={() => handleVerification('OFFICER_VERIFIED')}
              disabled={!hasCctvEvidence || !allReviewChecksComplete}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              VERIFY EVIDENCE
            </button>

          </div>

          {user && (
            <div className="mt-4 text-[10px] font-mono text-slate-400">
              Review session: {user.name || user.badgeId || 'Authenticated officer'}
            </div>
          )}

        </div>

      </div>

      {/* Case Evidence Summary */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <Layers className="w-4 h-4 text-cyan-500" />

          <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
            Evidence Case Summary
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <SummaryCard
            icon={<FileCheck2 className="w-4 h-4" />}
            label="COMPLAINT"
            value={String(complaintId)}
          />

          <SummaryCard
            icon={<Database className="w-4 h-4" />}
            label="TRANSACTION"
            value={String(transactionId)}
          />

          <SummaryCard
            icon={<Calendar className="w-4 h-4" />}
            label="DATE"
            value={formatDate(complaintDate)}
          />

          <SummaryCard
            icon={<MapPin className="w-4 h-4" />}
            label="LOCATION"
            value={
              hasLocationData
                ? 'Available'
                : 'Not available'
            }
          />

        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />

            <span>
              Evidence status:{' '}
              <strong className="text-slate-900 dark:text-white">
                {hasCctvEvidence ? 'AVAILABLE' : 'NOT ATTACHED'}
              </strong>
            </span>
          </div>

          <button
            type="button"
            disabled={!hasCctvEvidence}
            onClick={() => onNavigate?.('evidence-vault')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4" />
            OPEN EVIDENCE VAULT
          </button>

        </div>

      </div>

    </div>
  );
};

interface InfoCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  accent = false,
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

      <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 block">
        {label}
      </span>

      <strong
        className={`block mt-1 text-sm font-mono break-all ${
          accent
            ? 'text-cyan-700 dark:text-cyan-400'
            : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </strong>

    </div>
  );
};

interface SourceStatusProps {
  label: string;
  available: boolean;
}

const SourceStatus: React.FC<SourceStatusProps> = ({
  label,
  available,
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

      <span className="text-xs text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <span
        className={`flex items-center gap-1.5 text-[10px] font-mono font-bold ${
          available
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            available ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />

        {available ? 'AVAILABLE' : 'NOT AVAILABLE'}
      </span>

    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[9px] font-mono font-bold">
          {label}
        </span>
      </div>

      <div className="mt-2 text-sm font-mono font-bold text-slate-900 dark:text-white truncate">
        {value}
      </div>

    </div>
  );
};

export default AtmCctvEvidencePage;