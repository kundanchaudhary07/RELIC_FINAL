import React, { useMemo, useState } from 'react';
import {
  FolderArchive,
  FileText,
  FileCheck2,
  Download,
  Search,
  ShieldCheck,
  Database,
  Video,
  BrainCircuit,
  ReceiptText,
  PackageCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';

interface EvidenceItem {
  id: string;
  fileName: string;
  category?: string;
  fileSize?: number;
  uploadedAt?: string;
  status?: string;
  url?: string;
  caseNumber: string;
  caseTitle: string;
  caseId: string;
}

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return 'Size unavailable';

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getStatusClasses = (status?: string) => {
  const value = (status || '').toUpperCase();

  if (
    value.includes('VERIFIED') ||
    value.includes('VALID') ||
    value.includes('COMPLETE') ||
    value.includes('READY')
  ) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  }

  if (
    value.includes('PENDING') ||
    value.includes('PROCESS')
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  }

  if (
    value.includes('ERROR') ||
    value.includes('FAILED') ||
    value.includes('REJECT')
  ) {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
  }

  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
};

export const EvidencePage: React.FC = () => {
  const { cases, selectedCase, selectCaseById } = useCase();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceItem | null>(null);

  const allEvidence = useMemo<EvidenceItem[]>(() => {
    return cases.flatMap((caseItem) => {
      const rawEvidence = Array.isArray(
        (caseItem as any).evidenceFiles
      )
        ? (caseItem as any).evidenceFiles
        : [];

      return rawEvidence.map((ev: any) => ({
        id: String(ev.id ?? ev.evidenceId ?? ''),
        fileName: String(
          ev.fileName ?? ev.name ?? 'Unnamed evidence'
        ),
        category: ev.category
          ? String(ev.category)
          : 'Evidence',
        fileSize:
          typeof ev.fileSize === 'number'
            ? ev.fileSize
            : undefined,
        uploadedAt: ev.uploadedAt
          ? String(ev.uploadedAt)
          : undefined,
        status: ev.status
          ? String(ev.status)
          : 'AVAILABLE',
        url: ev.url
          ? String(ev.url)
          : ev.fileUrl
            ? String(ev.fileUrl)
            : undefined,
        caseNumber: String(
          (caseItem as any).caseNumber ??
            (caseItem as any).complaintId ??
            caseItem.id
        ),
        caseTitle: String(
          (caseItem as any).title ??
            (caseItem as any).fraudType ??
            'Investigation Case'
        ),
        caseId: String(caseItem.id),
      }));
    });
  }, [cases]);

  const filteredEvidence = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return allEvidence;
    }

    return allEvidence.filter((ev) => {
      return (
        ev.fileName.toLowerCase().includes(query) ||
        ev.caseNumber.toLowerCase().includes(query) ||
        ev.caseTitle.toLowerCase().includes(query) ||
        (ev.category || '').toLowerCase().includes(query)
      );
    });
  }, [allEvidence, searchTerm]);

  const currentCaseEvidence = useMemo(() => {
    if (!selectedCase) {
      return [];
    }

    return allEvidence.filter(
      (ev) => ev.caseId === selectedCase.id
    );
  }, [allEvidence, selectedCase]);

  const currentCase = selectedCase as any;

  const complaintId =
    currentCase?.complaintId ??
    currentCase?.id ??
    '—';

  const transactionId =
    currentCase?.transactionId ??
    currentCase?.initialTransactionId ??
    '—';

  const reportedAmount =
    currentCase?.reportedAmount ??
    currentCase?.reportedFraudAmount;

  const fraudType =
    currentCase?.fraudType ?? '—';

  const status =
    currentCase?.status ??
    currentCase?.complaintStatus ??
    '—';

  const hasCctv = currentCaseEvidence.some((ev) =>
    `${ev.category} ${ev.fileName}`
      .toLowerCase()
      .includes('cctv')
  );

  const hasAiEvidence =
    currentCaseEvidence.some((ev) =>
      `${ev.category} ${ev.fileName}`
        .toLowerCase()
        .includes('ai')
    ) ||
    currentCaseEvidence.some((ev) =>
      `${ev.category} ${ev.fileName}`
        .toLowerCase()
        .includes('analysis')
    );

  const handleDownload = (evidence: EvidenceItem) => {
    if (!evidence.url) {
      return;
    }

    window.open(
      evidence.url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleOpenCase = (caseId: string) => {
    selectCaseById(caseId);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/80">

        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/50">
              <FolderArchive className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">

                <h1 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Evidence Vault
                </h1>

                <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-bold tracking-widest text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-400">
                  DIGITAL EVIDENCE
                </span>

              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                Centralized evidence workspace for investigation
                artifacts associated with registered cases.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/70">
              <div className="text-[9px] font-bold tracking-widest text-slate-400">
                TOTAL FILES
              </div>

              <div className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
                {allEvidence.length}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="text-[9px] font-bold tracking-widest text-emerald-600 dark:text-emerald-500">
                CASE EVIDENCE
              </div>

              <div className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {currentCaseEvidence.length}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CASE SELECTOR */}
      {cases.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

          <div className="mb-3 flex items-center justify-between gap-3">

            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400">
                ACTIVE INVESTIGATION
              </div>

              <div className="mt-1 font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                Select a case to inspect its evidence package
              </div>
            </div>

            <PackageCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />

          </div>

          <select
            value={selectedCase?.id ?? ''}
            onChange={(e) =>
              handleOpenCase(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {cases.map((caseItem) => {
              const item = caseItem as any;

              return (
                <option
                  key={caseItem.id}
                  value={caseItem.id}
                >
                  {item.caseNumber ??
                    item.complaintId ??
                    caseItem.id}{' '}
                  •{' '}
                  {item.fraudType ??
                    'Investigation Case'}
                </option>
              );
            })}
          </select>

        </section>
      )}

      {/* PACKAGE STATUS */}
      {selectedCase && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <PackageStatus
            icon={ReceiptText}
            label="Complaint"
            value={
              complaintId !== '—'
                ? 'IDENTIFIED'
                : 'NOT AVAILABLE'
            }
            ready={complaintId !== '—'}
          />

          <PackageStatus
            icon={Database}
            label="Transaction"
            value={
              transactionId !== '—'
                ? 'IDENTIFIED'
                : 'NOT AVAILABLE'
            }
            ready={transactionId !== '—'}
          />

          <PackageStatus
            icon={Video}
            label="CCTV Evidence"
            value={
              hasCctv
                ? 'ATTACHED'
                : 'NOT ATTACHED'
            }
            ready={hasCctv}
          />

          <PackageStatus
            icon={BrainCircuit}
            label="AI Analysis"
            value={
              hasAiEvidence
                ? 'ATTACHED'
                : 'NOT ATTACHED'
            }
            ready={hasAiEvidence}
          />

        </section>
      )}

      {/* CASE PACKAGE */}
      {selectedCase && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

          <div className="border-b border-slate-200 p-5 dark:border-slate-800">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />

                  <span className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
                    EVIDENCE PACKAGE
                  </span>
                </div>

                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                  {complaintId}
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {fraudType}
                  {transactionId !== '—' &&
                    ` • Transaction ${transactionId}`}
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right dark:border-slate-700 dark:bg-slate-950">

                <div className="text-[9px] font-bold tracking-widest text-slate-400">
                  CASE STATUS
                </div>

                <div className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {String(status).replaceAll('_', ' ')}
                </div>

              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-3 dark:bg-slate-800">

            <PackageInfo
              label="Reported Amount"
              value={
                typeof reportedAmount === 'number'
                  ? `₹${reportedAmount.toLocaleString('en-IN')}`
                  : 'Not available'
              }
            />

            <PackageInfo
              label="Evidence Artifacts"
              value={`${currentCaseEvidence.length} attached`}
            />

            <PackageInfo
              label="Integrity"
              value={
                currentCaseEvidence.length > 0
                  ? 'Source evidence available'
                  : 'Awaiting evidence'
              }
            />

          </div>

        </section>
      )}

      {/* SEARCH */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

        <div className="mb-3 flex items-center justify-between">

          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400">
              EVIDENCE SEARCH
            </div>

            <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Search across available evidence artifacts
            </div>
          </div>

          <Search className="h-4 w-4 text-slate-400" />

        </div>

        <div className="relative">

          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search file name, case ID, category..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

        </div>

      </section>

      {/* EVIDENCE GRID */}
      {filteredEvidence.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          {filteredEvidence.map((ev) => (
            <EvidenceCard
              key={`${ev.caseId}-${ev.id}-${ev.fileName}`}
              evidence={ev}
              selected={
                ev.caseId === selectedCase?.id
              }
              onOpen={() =>
                setSelectedEvidence(ev)
              }
              onDownload={() =>
                handleDownload(ev)
              }
            />
          ))}

        </section>
      ) : (
        <EmptyEvidenceState
          hasSearch={Boolean(searchTerm.trim())}
          hasCases={cases.length > 0}
        />
      )}

      {/* BACKEND STATUS */}
      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>

          <div>

            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Evidence ingestion status
            </h3>

            <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              The current connected FastAPI backend does not expose
              a dedicated evidence upload or evidence-management
              endpoint. This workspace therefore displays only
              evidence already attached to an investigation case
              and does not create placeholder files, hashes, or
              evidence identifiers.
            </p>

          </div>

        </div>

      </section>

      {/* DETAIL MODAL */}
      {selectedEvidence && (
        <EvidenceDetail
          evidence={selectedEvidence}
          onClose={() =>
            setSelectedEvidence(null)
          }
          onDownload={() =>
            handleDownload(selectedEvidence)
          }
          onOpenCase={() =>
            handleOpenCase(
              selectedEvidence.caseId
            )
          }
        />
      )}

    </div>
  );
};

/* =============================================================
   PACKAGE STATUS
============================================================= */

interface PackageStatusProps {
  icon: React.ElementType;
  label: string;
  value: string;
  ready: boolean;
}

const PackageStatus: React.FC<PackageStatusProps> = ({
  icon: Icon,
  label,
  value,
  ready,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Icon
            className={`h-4 w-4 ${
              ready
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          />
        </div>

        <span
          className={`h-2 w-2 rounded-full ${
            ready
              ? 'bg-emerald-500'
              : 'bg-slate-300 dark:bg-slate-600'
          }`}
        />

      </div>

      <div className="mt-4 text-[9px] font-bold tracking-widest text-slate-400">
        {label}
      </div>

      <div
        className={`mt-1 text-xs font-bold ${
          ready
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {value}
      </div>

    </div>
  );
};

/* =============================================================
   PACKAGE INFO
============================================================= */

const PackageInfo: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="bg-white p-5 dark:bg-slate-900/80">

      <div className="text-[9px] font-bold tracking-widest text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </div>

    </div>
  );
};

/* =============================================================
   EVIDENCE CARD
============================================================= */

const EvidenceCard: React.FC<{
  evidence: EvidenceItem;
  selected: boolean;
  onOpen: () => void;
  onDownload: () => void;
}> = ({
  evidence,
  selected,
  onOpen,
  onDownload,
}) => {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/80 ${
        selected
          ? 'border-cyan-400/70 dark:border-cyan-500/60'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >

      <div className="p-5">

        <div className="flex items-center justify-between gap-3">

          <span className="max-w-[70%] truncate font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
            {evidence.caseNumber}
          </span>

          <span
            className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${getStatusClasses(
              evidence.status
            )}`}
          >
            {(evidence.status || 'AVAILABLE').replaceAll(
              '_',
              ' '
            )}
          </span>

        </div>

        <div className="mt-5 flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
            <FileCheck2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <div className="min-w-0">

            <h3 className="truncate font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
              {evidence.fileName}
            </h3>

            <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
              {evidence.category || 'Evidence'}
            </p>

          </div>

        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">

            <div className="text-[8px] font-bold tracking-widest text-slate-400">
              SIZE
            </div>

            <div className="mt-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              {formatBytes(evidence.fileSize)}
            </div>

          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">

            <div className="text-[8px] font-bold tracking-widest text-slate-400">
              LOGGED
            </div>

            <div className="mt-1 truncate text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              {evidence.uploadedAt || 'Unavailable'}
            </div>

          </div>

        </div>

      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">

        <button
          onClick={onOpen}
          className="flex cursor-pointer items-center gap-1.5 text-[10px] font-bold text-slate-600 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
        >
          Inspect
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {evidence.url ? (
          <button
            onClick={onDownload}
            className="flex cursor-pointer items-center gap-1.5 text-[10px] font-bold text-cyan-600 transition hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        ) : (
          <span className="text-[9px] font-medium text-slate-400">
            Source unavailable
          </span>
        )}

      </div>

    </article>
  );
};

/* =============================================================
   EMPTY STATE
============================================================= */

const EmptyEvidenceState: React.FC<{
  hasSearch: boolean;
  hasCases: boolean;
}> = ({
  hasSearch,
  hasCases,
}) => {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/60">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <FolderArchive className="h-7 w-7 text-slate-400" />
      </div>

      <h2 className="mt-5 font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
        {hasSearch
          ? 'No matching evidence found'
          : hasCases
            ? 'No evidence attached to this investigation'
            : 'No investigation evidence available'}
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">
        {hasSearch
          ? 'Try another file name, case identifier, or evidence category.'
          : 'Evidence will appear here when actual investigation artifacts are associated with a case.'}
      </p>

    </section>
  );
};

/* =============================================================
   EVIDENCE DETAIL
============================================================= */

const EvidenceDetail: React.FC<{
  evidence: EvidenceItem;
  onClose: () => void;
  onDownload: () => void;
  onOpenCase: () => void;
}> = ({
  evidence,
  onClose,
  onDownload,
  onOpenCase,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/50">
              <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>

            <div>

              <div className="text-[9px] font-bold tracking-widest text-slate-400">
                EVIDENCE ARTIFACT
              </div>

              <h2 className="mt-1 max-w-[280px] truncate font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white sm:max-w-md">
                {evidence.fileName}
              </h2>

            </div>

          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        <div className="space-y-5 overflow-y-auto p-5">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <DetailField
              label="Case"
              value={evidence.caseNumber}
            />

            <DetailField
              label="Category"
              value={evidence.category || 'Evidence'}
            />

            <DetailField
              label="Status"
              value={
                evidence.status || 'AVAILABLE'
              }
            />

            <DetailField
              label="File Size"
              value={formatBytes(evidence.fileSize)}
            />

            <DetailField
              label="Logged At"
              value={
                evidence.uploadedAt ||
                'Unavailable'
              }
            />

            <DetailField
              label="Evidence ID"
              value={
                evidence.id || 'Not provided'
              }
            />

          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">

            <div className="flex items-center gap-2">

              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Integrity information
              </span>

            </div>

            <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              No cryptographic hash is displayed unless the
              connected backend provides one for this evidence
              artifact.
            </p>

          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              onClick={onOpenCase}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-cyan-400"
            >
              Open Investigation
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

            {evidence.url && (
              <button
                onClick={onDownload}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-cyan-700"
              >
                <Download className="h-3.5 w-3.5" />
                Download Evidence
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

/* =============================================================
   DETAIL FIELD
============================================================= */

const DetailField: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">

      <div className="text-[8px] font-bold tracking-widest text-slate-400">
        {label}
      </div>

      <div className="mt-1 break-all text-xs font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </div>

    </div>
  );
};

export default EvidencePage;