import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Radio,
  Shield,
  Target,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { InteractiveIndiaMap } from '../../components/common/InteractiveIndiaMap';

interface LocationIntelligencePageProps {
  onNavigate?: (page: string) => void;
}

const getString = (
  value: unknown,
  fallback = '—'
): string => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const getNumber = (
  value: unknown,
  fallback = 0
): number => {
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

export const LocationIntelligencePage: React.FC<
  LocationIntelligencePageProps
> = ({ onNavigate }) => {
  const {
    selectedCase,
    cases,
    selectCaseById,
    riskZones,
  } = useCase();

  const [selectedAtm, setSelectedAtm] =
    useState<any | null>(null);

  const caseData = selectedCase as any;

  /*
   * Current backend Complaint schema does not necessarily
   * contain location intelligence fields.
   *
   * Therefore every optional intelligence field is checked
   * before being rendered.
   */

  const incidentLocation =
    caseData?.incidentLocation ??
    caseData?.location ??
    null;

  const predictedCashoutRegion =
    caseData?.predictedCashoutRegion ??
    caseData?.predicted_cashout_region ??
    null;

  const atmCandidates = Array.isArray(
    caseData?.atmCandidates
  )
    ? caseData.atmCandidates
    : [];

  const hasIncidentLocation =
    Boolean(incidentLocation) &&
    (
      Boolean(incidentLocation?.city) ||
      Boolean(incidentLocation?.state) ||
      Boolean(incidentLocation?.latitude) ||
      Boolean(incidentLocation?.longitude)
    );

  const hasPredictedCashout =
    Boolean(predictedCashoutRegion) &&
    (
      Boolean(predictedCashoutRegion?.city) ||
      Boolean(predictedCashoutRegion?.state) ||
      Boolean(predictedCashoutRegion?.latitude) ||
      Boolean(predictedCashoutRegion?.longitude)
    );

  const hasAtmCandidates =
    atmCandidates.length > 0;

  const hasLocationIntelligence =
    hasIncidentLocation ||
    hasPredictedCashout ||
    hasAtmCandidates;

  const complaintId = getString(
    caseData?.complaintId ??
      caseData?.caseNumber ??
      caseData?.id,
    'No Case Selected'
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

  const transactionId = getString(
    caseData?.transactionId ??
      caseData?.initialTransactionId
  );

  const complaintDate =
    caseData?.complaintDate ??
    caseData?.createdAt ??
    caseData?.incidentDate;

  const selectedAtmId = selectedAtm?.id;

  const selectedAtmDetails = useMemo(() => {
    if (!selectedAtmId) {
      return null;
    }

    return (
      atmCandidates.find(
        (atm: any) =>
          atm?.id === selectedAtmId
      ) ?? null
    );
  }, [atmCandidates, selectedAtmId]);

  useEffect(() => {
    if (!atmCandidates.length) {
      setSelectedAtm(null);
      return;
    }

    setSelectedAtm(atmCandidates[0]);
  }, [selectedCase?.id]);

  const handleCaseChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const caseId = event.target.value;

    if (!caseId) {
      return;
    }

    selectCaseById(caseId);

    const nextCase = cases.find(
      (item: any) => item.id === caseId
    ) as any;

    const nextAtms = Array.isArray(
      nextCase?.atmCandidates
    )
      ? nextCase.atmCandidates
      : [];

    setSelectedAtm(
      nextAtms.length > 0
        ? nextAtms[0]
        : null
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#020817] dark:text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#07101f]">
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 dark:border-cyan-500/20 dark:bg-cyan-500/10">
                <MapPin className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Location Intelligence
                  </h1>

                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                    Spatial Intel
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Geographic analysis of reported cybercrime activity
                </p>
              </div>
            </div>

            {/* Case selector */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Active Case
              </span>

              <select
                value={selectedCase?.id ?? ''}
                onChange={handleCaseChange}
                className="min-w-[270px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        {/* No case */}
        {!selectedCase ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#07101f]">
            <div className="text-center">
              <MapPin className="mx-auto mb-4 h-14 w-14 text-slate-300 dark:text-slate-700" />

              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                No Case Selected
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a complaint to inspect its location intelligence.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                CASE HEADER
            ================================================== */}

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
                    {complaintId}
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

            {/* =================================================
                STATUS CARDS
            ================================================== */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Incident location */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Incident Location
                    </p>

                    <p
                      className={`mt-3 text-xl font-bold ${
                        hasIncidentLocation
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasIncidentLocation
                        ? 'Available'
                        : 'Unavailable'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-cyan-50 p-2.5 dark:bg-cyan-500/10">
                    <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Backend location information
                </p>
              </div>

              {/* Prediction */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Cash-Out Prediction
                    </p>

                    <p
                      className={`mt-3 text-xl font-bold ${
                        hasPredictedCashout
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasPredictedCashout
                        ? 'Available'
                        : 'Unavailable'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-2.5 dark:bg-amber-500/10">
                    <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  AI predicted cash-out region
                </p>
              </div>

              {/* ATM */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Candidate ATMs
                    </p>

                    <p
                      className={`mt-3 text-2xl font-bold ${
                        hasAtmCandidates
                          ? 'text-violet-600 dark:text-violet-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {atmCandidates.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-2.5 dark:bg-violet-500/10">
                    <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Backend-provided ATM candidates
                </p>
              </div>

              {/* Overall status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Intelligence Status
                    </p>

                    <p
                      className={`mt-3 text-xl font-bold ${
                        hasLocationIntelligence
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasLocationIntelligence
                        ? 'Ready'
                        : 'Awaiting Data'}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-2.5 ${
                      hasLocationIntelligence
                        ? 'bg-emerald-50 dark:bg-emerald-500/10'
                        : 'bg-slate-100 dark:bg-slate-900'
                    }`}
                  >
                    {hasLocationIntelligence ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Location intelligence availability
                </p>
              </div>
            </section>

            {/* =================================================
                DATA UNAVAILABLE
            ================================================== */}

            {!hasLocationIntelligence && (
              <section className="rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-500/20 dark:bg-[#07101f]">
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-slate-800 dark:text-slate-200">
                    Location Intelligence Data Not Available
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    The selected complaint currently contains financial and
                    transaction information, but the backend response does not
                    provide incident coordinates, predicted cash-out
                    coordinates, or ATM candidate data.
                  </p>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs leading-5 text-slate-500">
                      No location, ATM, risk score, confidence value, or
                      geographic prediction is fabricated by the frontend.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                LOCATION INTELLIGENCE WORKSPACE
            ================================================== */}

            {hasLocationIntelligence && (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* MAP */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f] xl:col-span-8">
                  <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-cyan-50 p-2 dark:bg-cyan-500/10">
                        <Navigation className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                          Geographic Intelligence Map
                        </h2>

                        <p className="text-xs text-slate-500">
                          Backend-provided location intelligence
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <Radio className="h-3.5 w-3.5 text-emerald-500" />
                      Live case data
                    </span>
                  </div>

                  <div className="p-4">
                    <InteractiveIndiaMap
                      currentCase={selectedCase}
                      riskZones={riskZones}
                      selectedAtm={selectedAtm}
                      onSelectAtm={(atm: any) =>
                        setSelectedAtm(atm)
                      }
                      heightClass="h-[580px]"
                    />
                  </div>
                </section>

                {/* RIGHT PANEL */}
                <aside className="space-y-6 xl:col-span-4">
                  {/* Movement trajectory */}
                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                    <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-50 p-2 dark:bg-cyan-500/10">
                          <Navigation className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>

                        <div>
                          <h2 className="font-semibold text-slate-900 dark:text-white">
                            Movement Trajectory
                          </h2>

                          <p className="text-xs text-slate-500">
                            Origin and predicted destination
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      {/* Origin */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-cyan-100 p-2 dark:bg-cyan-500/10">
                            <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Incident Origin
                            </p>

                            {hasIncidentLocation ? (
                              <>
                                <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                                  {getString(
                                    incidentLocation?.city
                                  )}

                                  {incidentLocation?.state
                                    ? `, ${incidentLocation.state}`
                                    : ''}
                                </p>

                                {incidentLocation?.address && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {incidentLocation.address}
                                  </p>
                                )}

                                {(incidentLocation?.latitude !==
                                  undefined ||
                                  incidentLocation?.longitude !==
                                    undefined) && (
                                  <p className="mt-2 font-mono text-[10px] text-slate-400">
                                    {getString(
                                      incidentLocation.latitude
                                    )}
                                    {' , '}
                                    {getString(
                                      incidentLocation.longitude
                                    )}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">
                                Location not provided
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Direction */}
                      <div className="flex justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                          <ArrowDown className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Prediction */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-amber-100 p-2 dark:bg-amber-500/10">
                            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Predicted Cash-Out
                            </p>

                            {hasPredictedCashout ? (
                              <>
                                <p className="mt-1 font-semibold text-amber-800 dark:text-amber-300">
                                  {getString(
                                    predictedCashoutRegion?.city
                                  )}

                                  {predictedCashoutRegion?.state
                                    ? `, ${predictedCashoutRegion.state}`
                                    : ''}
                                </p>

                                {predictedCashoutRegion?.district && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    District:{' '}
                                    {predictedCashoutRegion.district}
                                  </p>
                                )}

                                {predictedCashoutRegion?.confidencePercentage !==
                                  undefined && (
                                  <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                                    Confidence:{' '}
                                    {getNumber(
                                      predictedCashoutRegion.confidencePercentage
                                    )}
                                    %
                                  </p>
                                )}

                                {predictedCashoutRegion?.predictedWindowHours && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Estimated window:{' '}
                                    {
                                      predictedCashoutRegion.predictedWindowHours
                                    }
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">
                                Prediction not available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ATM candidates */}
                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                    <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-500/10">
                          <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>

                        <div>
                          <h2 className="font-semibold text-slate-900 dark:text-white">
                            Candidate ATMs
                          </h2>

                          <p className="text-xs text-slate-500">
                            Backend-provided withdrawal locations
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasAtmCandidates ? (
                      <div className="max-h-[420px] space-y-2 overflow-y-auto p-5">
                        {atmCandidates.map(
                          (atm: any) => {
                            const isSelected =
                              selectedAtm?.id === atm?.id;

                            return (
                              <button
                                type="button"
                                key={atm?.id}
                                onClick={() =>
                                  setSelectedAtm(atm)
                                }
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                  isSelected
                                    ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-500/60 dark:bg-cyan-500/[0.06]'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-slate-900">
                                      <Building2 className="h-4 w-4 text-violet-500" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                                        {getString(
                                          atm?.name,
                                          'ATM'
                                        )}
                                      </p>

                                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                                        Rank #
                                        {getNumber(
                                          atm?.rank,
                                          0
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {atm?.withdrawalLikelihood !==
                                    undefined && (
                                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                      {getNumber(
                                        atm.withdrawalLikelihood
                                      )}
                                      %
                                    </span>
                                  )}
                                </div>

                                <p className="mt-3 text-xs leading-5 text-slate-500">
                                  {getString(
                                    atm?.address,
                                    'Address unavailable'
                                  )}
                                </p>
                              </button>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Building2 className="mx-auto mb-3 h-9 w-9 text-slate-300 dark:text-slate-700" />

                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          No ATM candidates available
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          The backend has not supplied candidate ATM data
                          for this complaint.
                        </p>
                      </div>
                    )}
                  </section>
                </aside>
              </div>
            )}

            {/* =================================================
                SELECTED ATM
            ================================================== */}

            {selectedAtmDetails && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-500/10">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">
                        Selected ATM
                      </h2>

                      <p className="text-xs text-slate-500">
                        Detailed information from backend
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      ATM
                    </p>

                    <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                      {getString(
                        selectedAtmDetails.name
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Address
                    </p>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {getString(
                        selectedAtmDetails.address
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Rank
                    </p>

                    <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                      #{getNumber(
                        selectedAtmDetails.rank
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Withdrawal Likelihood
                    </p>

                    <p className="mt-2 font-semibold text-emerald-600 dark:text-emerald-400">
                      {getNumber(
                        selectedAtmDetails.withdrawalLikelihood
                      )}
                      %
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                CASE METADATA
            ================================================== */}

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-900">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-slate-500"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="M3 10h18" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Transaction
                    </p>

                    <p className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-300">
                      {transactionId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Complaint Date
                    </p>

                    <p className="mt-1 text-sm text-slate-800 dark:text-slate-300">
                      {formatDate(complaintDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#07101f]">
                <div className="flex items-center gap-3">
                  <Radio className="h-5 w-5 text-slate-400" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Data Source
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-300">
                      Complaint Backend
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FOOTER
            ================================================== */}

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

export default LocationIntelligencePage;