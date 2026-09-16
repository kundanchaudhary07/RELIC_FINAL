import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  GitFork,
  ListTree,
  Network,
  Shield,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';

interface MoneyTrailPageProps {
  onNavigate?: (page: string) => void;
}

const getString = (value: unknown, fallback = '—'): string => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const getNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: unknown): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const shortenAccount = (value: string): string => {
  if (!value || value === '—') {
    return '—';
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 9)}••••${value.slice(-6)}`;
};

const getHopFrom = (hop: any): string => {
  return getString(
    hop?.fromAccount ??
      hop?.senderAccount ??
      hop?.sourceAccount ??
      hop?.from ??
      hop?.sender_account_id ??
      hop?.source_account_id
  );
};

const getHopTo = (hop: any): string => {
  return getString(
    hop?.toAccount ??
      hop?.beneficiaryAccount ??
      hop?.destinationAccount ??
      hop?.to ??
      hop?.beneficiary_account_id ??
      hop?.destination_account_id
  );
};

const getHopAmount = (hop: any): number => {
  return getNumber(
    hop?.amount ??
      hop?.transactionAmount ??
      hop?.value ??
      hop?.transaction_amount,
    0
  );
};

const getHopTransactionId = (hop: any): string => {
  return getString(
    hop?.transactionId ??
      hop?.transaction_id
  );
};

const getHopDate = (hop: any): string => {
  return getString(
    hop?.timestamp ??
      hop?.transactionDate ??
      hop?.date ??
      hop?.transaction_date
  );
};

interface FlowNode {
  id: string;
  label: string;
  account: string;
  type: 'source' | 'intermediary' | 'destination';
}

const MoneyFlowGraph: React.FC<{
  sourceAccount: string;
  beneficiaryAccount: string;
  moneyTrail: any[];
  reportedAmount: number;
}> = ({
  sourceAccount,
  beneficiaryAccount,
  moneyTrail,
  reportedAmount,
}) => {
  const nodes: FlowNode[] = [];

  if (sourceAccount !== '—') {
    nodes.push({
      id: 'source',
      label: 'Victim Account',
      account: sourceAccount,
      type: 'source',
    });
  }

  moneyTrail.forEach((hop, index) => {
    const from = getHopFrom(hop);
    const to = getHopTo(hop);

    if (
      index === 0 &&
      from !== '—' &&
      from !== sourceAccount
    ) {
      nodes.push({
        id: `intermediary-from-${index}`,
        label: 'Source Account',
        account: from,
        type: 'source',
      });
    }

    if (to !== '—') {
      nodes.push({
        id: `intermediary-${index}`,
        label:
          index === moneyTrail.length - 1
            ? 'Beneficiary / Destination'
            : `Intermediary ${index + 1}`,
        account: to,
        type:
          index === moneyTrail.length - 1
            ? 'destination'
            : 'intermediary',
      });
    }
  });

  if (
    beneficiaryAccount !== '—' &&
    !nodes.some(
      (node) => node.account === beneficiaryAccount
    )
  ) {
    nodes.push({
      id: 'destination',
      label: 'Beneficiary Account',
      account: beneficiaryAccount,
      type: 'destination',
    });
  }

  if (nodes.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Network className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />

          <p className="font-medium text-slate-700 dark:text-slate-300">
            Money flow cannot be visualized
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
            No account information is available.
          </p>
        </div>
      </div>
    );
  }

  const visibleNodes = nodes.filter(
    (node, index, array) =>
      array.findIndex(
        (item) => item.account === node.account
      ) === index
  );

  const graphWidth = Math.max(
    900,
    visibleNodes.length * 260
  );

  const nodeWidth = 210;
  const centerY = 150;
  const gap = 45;
  const startX = 55;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#07101f]">
      <div
        className="relative min-h-[430px]"
        style={{
          minWidth: `${graphWidth}px`,
        }}
      >
        <svg
          width={graphWidth}
          height="430"
          viewBox={`0 0 ${graphWidth} 430`}
          className="absolute inset-0"
        >
          <defs>
            <linearGradient
              id="moneyFlowGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor="#06b6d4"
              />

              <stop
                offset="100%"
                stopColor="#8b5cf6"
              />
            </linearGradient>

            <filter
              id="flowGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                stdDeviation="3"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="#06b6d4"
              />
            </marker>
          </defs>

          {visibleNodes
            .slice(0, -1)
            .map((_, index) => {
              const x1 =
                startX +
                index * (nodeWidth + gap) +
                nodeWidth;

              const x2 =
                startX +
                (index + 1) *
                  (nodeWidth + gap);

              return (
                <g key={`line-${index}`}>
                  <line
                    x1={x1}
                    y1={centerY}
                    x2={x2 - 12}
                    y2={centerY}
                    stroke="url(#moneyFlowGradient)"
                    strokeWidth="3"
                    strokeDasharray="8 7"
                    markerEnd="url(#arrow)"
                    filter="url(#flowGlow)"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="30"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </line>

                  <circle
                    cx={(x1 + x2) / 2 - 6}
                    cy={centerY}
                    r="5"
                    fill="#06b6d4"
                  >
                    <animate
                      attributeName="cx"
                      from={x1}
                      to={x2 - 15}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
        </svg>

        {visibleNodes.map((node, index) => {
          const left =
            startX +
            index * (nodeWidth + gap);

          const isSource =
            node.type === 'source';

          const isDestination =
            node.type === 'destination';

          return (
            <div
              key={node.id}
              className="absolute top-[75px]"
              style={{
                left: `${left}px`,
                width: `${nodeWidth}px`,
              }}
            >
              <div
                className={`relative rounded-2xl border p-4 shadow-lg backdrop-blur ${
                  isSource
                    ? 'border-cyan-300 bg-cyan-50 dark:border-cyan-500/40 dark:bg-cyan-500/[0.08]'
                    : isDestination
                      ? 'border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/[0.08]'
                      : 'border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isSource
                        ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400'
                        : isDestination
                          ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                          : 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400'
                    }`}
                  >
                    {isSource ? (
                      <Building2 className="h-5 w-5" />
                    ) : isDestination ? (
                      <Wallet className="h-5 w-5" />
                    ) : (
                      <Network className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {node.label}
                    </p>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        isSource
                          ? 'text-cyan-700 dark:text-cyan-300'
                          : isDestination
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-violet-700 dark:text-violet-300'
                      }`}
                    >
                      {isSource
                        ? 'SOURCE'
                        : isDestination
                          ? 'DESTINATION'
                          : 'HOP'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Account
                  </p>

                  <p
                    className="mt-1 truncate font-mono text-sm text-slate-800 dark:text-white"
                    title={node.account}
                  >
                    {shortenAccount(node.account)}
                  </p>
                </div>

                {index <
                  visibleNodes.length - 1 && (
                  <div className="absolute -right-[31px] top-[59px] z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200 bg-white dark:border-cyan-500/30 dark:bg-slate-950">
                    <ChevronRight className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-5 left-6 right-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-emerald-500" />

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Reported Amount
              </p>

              <p className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(reportedAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-500">
                Source
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
              <span className="text-slate-500">
                Intermediary
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="text-slate-500">
                Destination
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MoneyTrailPage: React.FC<
  MoneyTrailPageProps
> = ({ onNavigate }) => {
  const {
    cases,
    selectedCase,
    selectCaseById,
  } = useCase();

  const caseData = selectedCase as any;

  const reportedAmount = getNumber(
    caseData?.reportedAmount ??
      caseData?.reportedFraudAmount,
    0
  );

  const sourceAccount = getString(
    caseData?.victimAccountId ??
      caseData?.victim?.accountId
  );

  const beneficiaryAccount = getString(
    caseData?.beneficiaryAccountId
  );

  const beneficiaryUpi = getString(
    caseData?.beneficiaryUpiId
  );

  const transactionId = getString(
    caseData?.transactionId ??
      caseData?.initialTransactionId
  );

  const fraudType = getString(
    caseData?.fraudType,
    'Unknown Fraud Type'
  );

  const status = getString(
    caseData?.status ??
      caseData?.complaintStatus,
    'UNDER_INVESTIGATION'
  );

  const complaintDate =
    caseData?.complaintDate ??
    caseData?.createdAt ??
    caseData?.incidentDate;

  const linkedFraudAccount = Boolean(
    caseData?.linkedFraudAccount
  );

  const moneyTrail = Array.isArray(
    caseData?.moneyTrail
  )
    ? caseData.moneyTrail
    : [];

  const caseTitle = getString(
    caseData?.caseNumber ??
      caseData?.complaintId ??
      caseData?.id,
    'No Case Selected'
  );

  const handleCaseChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (event.target.value) {
      selectCaseById(event.target.value);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#020817] dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#07101f]">
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 dark:border-cyan-500/20 dark:bg-cyan-500/10">
                <GitFork className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Money Trail
                  </h1>

                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                    Financial Intel
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Trace reported funds from source to beneficiary
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Active Case
              </span>

              <select
                value={selectedCase?.id ?? ''}
                onChange={handleCaseChange}
                className="min-w-[250px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">
                  Select case
                </option>

                {cases.map((item: any) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {getString(
                      item.caseNumber ??
                        item.complaintId ??
                        item.id,
                      item.id
                    )}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        {!selectedCase ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#07101f]">
            <div className="text-center">
              <Network className="mx-auto mb-4 h-14 w-14 text-slate-300 dark:text-slate-700" />

              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                No Case Selected
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a complaint to inspect its money flow.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Case banner */}
            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 dark:bg-slate-900">
                  <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Investigation Case
                  </p>

                  <p className="mt-1 font-mono text-lg font-semibold text-slate-900 dark:text-white">
                    {caseTitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                  {status}
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  {fraudType}
                </span>
              </div>
            </section>

            {/* Metrics */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Reported Amount
                    </p>

                    <p className="mt-3 break-all text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {formatCurrency(reportedAmount)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-cyan-50 p-2.5 dark:bg-cyan-500/10">
                    <CircleDollarSign className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Amount recorded in complaint
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Transaction
                    </p>

                    <p className="mt-3 truncate font-mono text-lg font-semibold text-slate-900 dark:text-white">
                      {transactionId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-2.5 dark:bg-violet-500/10">
                    <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Initial reported transaction
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Recorded Hops
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                      {moneyTrail.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
                    <GitFork className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Additional movements from backend
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Linked Fraud Account
                    </p>

                    <p
                      className={`mt-3 text-xl font-bold ${
                        linkedFraudAccount
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {linkedFraudAccount
                        ? 'Detected'
                        : 'No'}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-2.5 ${
                      linkedFraudAccount
                        ? 'bg-red-50 dark:bg-red-500/10'
                        : 'bg-emerald-50 dark:bg-emerald-500/10'
                    }`}
                  >
                    {linkedFraudAccount ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Backend complaint flag
                </p>
              </div>
            </section>

            {/* Money flow graph */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-50 p-2 dark:bg-cyan-500/10">
                    <Network className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Money Flow Graph
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Visual transaction path for the selected complaint
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Flow direction
                </div>
              </div>

              <div className="p-5">
                <MoneyFlowGraph
                  sourceAccount={sourceAccount}
                  beneficiaryAccount={beneficiaryAccount}
                  moneyTrail={moneyTrail}
                  reportedAmount={reportedAmount}
                />
              </div>

              {moneyTrail.length === 0 && (
                <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      No additional transaction hops recorded
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The graph uses the actual victim and beneficiary
                      accounts supplied by the backend. Additional
                      intermediary accounts will appear automatically when
                      the backend provides them.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Account details */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-50 p-2 dark:bg-cyan-500/10">
                      <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">
                        Source Account
                      </h2>

                      <p className="text-xs text-slate-500">
                        Reported victim account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Account ID
                  </p>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="break-all font-mono text-sm text-cyan-700 dark:text-cyan-300">
                      {sourceAccount}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <ArrowRight className="h-3.5 w-3.5 text-cyan-500" />

                    Reported transaction

                    <span className="font-mono text-slate-700 dark:text-slate-400">
                      {transactionId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-50 p-2 dark:bg-red-500/10">
                      <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">
                        Beneficiary Account
                      </h2>

                      <p className="text-xs text-slate-500">
                        Reported receiving account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Account ID
                  </p>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="break-all font-mono text-sm text-red-700 dark:text-red-300">
                      {beneficiaryAccount}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span>UPI ID:</span>

                    <span className="break-all font-mono text-slate-700 dark:text-slate-400">
                      {beneficiaryUpi}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed transaction trail */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
              <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-500/10">
                    <ListTree className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Transaction Trail
                    </h2>

                    <p className="text-xs text-slate-500">
                      Detailed records returned by the backend
                    </p>
                  </div>
                </div>
              </div>

              {moneyTrail.length === 0 ? (
                <div className="p-10 text-center">
                  <ListTree className="mx-auto mb-3 h-9 w-9 text-slate-300 dark:text-slate-700" />

                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    No additional transactions available
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Only the original complaint transaction is currently
                    available.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {moneyTrail.map(
                    (hop: any, index: number) => {
                      const from = getHopFrom(hop);
                      const to = getHopTo(hop);
                      const amount = getHopAmount(hop);

                      const hopTransactionId =
                        getHopTransactionId(hop);

                      const hopDate =
                        getHopDate(hop);

                      return (
                        <div
                          key={`${hopTransactionId}-${index}`}
                          className="p-6 transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-sm font-bold text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                From
                              </p>

                              <p className="break-all font-mono text-sm text-slate-800 dark:text-slate-200">
                                {from}
                              </p>
                            </div>

                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-5 w-5 text-cyan-500" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                To
                              </p>

                              <p className="break-all font-mono text-sm text-slate-800 dark:text-slate-200">
                                {to}
                              </p>
                            </div>

                            <div className="xl:min-w-[150px]">
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Amount
                              </p>

                              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(amount)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                            <span className="text-slate-500">
                              Transaction ID:{' '}
                              <span className="font-mono text-slate-700 dark:text-slate-400">
                                {hopTransactionId}
                              </span>
                            </span>

                            <span className="text-slate-500">
                              {hopDate}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="flex justify-between border-t border-slate-200 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onNavigate?.('case-details')
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Case Details
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MoneyTrailPage;