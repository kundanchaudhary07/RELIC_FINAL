import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Navigation,
  Check,
  MapPin,
  Search,
  Target,
  History,
  ShieldAlert,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { InteractiveIndiaMap } from '../../components/common/InteractiveIndiaMap';
import { AtmCandidate } from '../../types';

export const AtmIntelligencePage: React.FC = () => {
  const { selectedCase, cases, selectCaseById, riskZones } = useCase();

  const [selectedAtm, setSelectedAtm] = useState<AtmCandidate | null>(null);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const caseData = selectedCase as any;

  const atmCandidates: AtmCandidate[] = Array.isArray(caseData?.atmCandidates)
    ? caseData.atmCandidates
    : [];

  const predictedRegion = caseData?.predictedCashoutRegion ?? null;

  const incidentLocation = caseData?.incidentLocation ?? null;

  useEffect(() => {
    setSelectedAtm(atmCandidates[0] ?? null);
    setSearchTerm('');
  }, [selectedCase?.id]);

  const filteredAtms = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return atmCandidates;
    }

    return atmCandidates.filter((atm) => {
      return [
        atm.name,
        atm.bank,
        atm.address,
        atm.nearbyLandmark,
        atm.surveillanceStatus,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [atmCandidates, searchTerm]);

  const handleDispatch = (id: string) => {
    setDispatchedId(id);

    window.setTimeout(() => {
      setDispatchedId(null);
    }, 3000);
  };

  const handleCaseChange = (id: string) => {
    selectCaseById(id);

    const nextCase = cases.find((item) => item.id === id) as any;

    const nextAtms: AtmCandidate[] = Array.isArray(nextCase?.atmCandidates)
      ? nextCase.atmCandidates
      : [];

    setSelectedAtm(nextAtms[0] ?? null);
  };

  const formatAmount = (amount: unknown) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return '—';
    }

    return `₹${numericAmount.toLocaleString('en-IN')}`;
  };

  if (!selectedCase) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <Building2 className="w-10 h-10 mx-auto mb-4 text-slate-400" />

          <h1 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
            ATM Intelligence
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Select a complaint case to view ATM intelligence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white">
              ATM Intelligence
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ATM extraction-point intelligence and surveillance analysis
            </p>
          </div>
        </div>

        <select
          value={selectedCase.id}
          onChange={(e) => handleCaseChange(e.target.value)}
          className="w-full lg:w-auto min-w-[260px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
        >
          {cases.length > 0 ? (
            cases.map((c) => {
              const item = c as any;
              const location =
                item?.predictedCashoutRegion?.city ||
                item?.incidentLocation?.city ||
                'Location unavailable';

              return (
                <option key={c.id} value={c.id}>
                  {item?.caseNumber || c.id} • {location}
                </option>
              );
            })
          ) : (
            <option value={selectedCase.id}>
              {caseData?.caseNumber || selectedCase.id}
            </option>
          )}
        </select>
      </div>

      {/* Case Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Target className="w-4 h-4 text-cyan-500" />
            CASE
          </div>

          <div className="mt-2 text-lg font-bold font-['Space_Grotesk'] text-slate-900 dark:text-white">
            {caseData?.caseNumber || caseData?.complaintId || selectedCase.id}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-500" />
            INCIDENT LOCATION
          </div>

          <div className="mt-2 text-lg font-bold font-['Space_Grotesk'] text-slate-900 dark:text-white">
            {incidentLocation?.city || 'Not available'}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {incidentLocation?.state || 'Location intelligence not provided'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Building2 className="w-4 h-4 text-amber-500" />
            ATM CANDIDATES
          </div>

          <div className="mt-2 text-lg font-bold font-['Space_Grotesk'] text-slate-900 dark:text-white">
            {atmCandidates.length}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Backend-provided candidates
          </p>
        </div>

      </div>

      {/* Target Region */}
      {predictedRegion ? (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-red-500" />

                <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                  PREDICTED EXTRACTION REGION
                </span>
              </div>

              <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white">
                {predictedRegion.city || 'Location unavailable'}
                {predictedRegion.state
                  ? `, ${predictedRegion.state}`
                  : ''}
              </h2>

              {predictedRegion.district && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  District: {predictedRegion.district}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {predictedRegion.estimatedCashoutAmount !== undefined && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    EST. CASHOUT
                  </span>

                  <span className="block mt-1 font-bold font-mono text-amber-600 dark:text-amber-400">
                    {formatAmount(predictedRegion.estimatedCashoutAmount)}
                  </span>
                </div>
              )}

              {predictedRegion.predictedWindowHours !== undefined && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    CASHOUT WINDOW
                  </span>

                  <span className="block mt-1 font-bold font-mono text-red-600 dark:text-red-400">
                    {predictedRegion.predictedWindowHours}
                  </span>
                </div>
              )}

              {predictedRegion.confidencePercentage !== undefined && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    CONFIDENCE
                  </span>

                  <span className="block mt-1 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {predictedRegion.confidencePercentage}%
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5" />

            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-slate-900 dark:text-white">
                ATM prediction data not available
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                The current complaint response does not contain predicted
                cashout-region intelligence. No location or ATM data is being
                fabricated on the frontend.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ATM Radar */}
      <div className="space-y-3">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">

          <div>
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-500" />
              ATM Radar
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Geographic intelligence associated with the selected case
            </p>
          </div>

          {atmCandidates.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <History className="w-4 h-4 text-slate-400" />

              <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                {atmCandidates.length} candidate
                {atmCandidates.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

        </div>

        <InteractiveIndiaMap
          currentCase={selectedCase}
          riskZones={riskZones}
          selectedAtm={selectedAtm}
          onSelectAtm={(atm) => setSelectedAtm(atm)}
          heightClass="h-[520px]"
        />
      </div>

      {/* ATM Search */}
      {atmCandidates.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ATM, bank, address or landmark..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center justify-center">
            Showing {filteredAtms.length} / {atmCandidates.length}
          </div>

        </div>
      )}

      {/* ATM Cards */}
      {filteredAtms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredAtms.map((atm) => {
            const isSelected = selectedAtm?.id === atm.id;

            return (
              <div
                key={atm.id}
                onClick={() => setSelectedAtm(atm)}
                className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-5 space-y-4 shadow-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                }`}
              >

                {/* Card Header */}
                <div className="flex items-center justify-between gap-3">

                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    RANK #{atm.rank ?? '—'}
                  </span>

                  {atm.withdrawalLikelihood !== undefined && (
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {atm.withdrawalLikelihood}% likelihood
                    </span>
                  )}

                </div>

                {/* ATM Name */}
                <div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                    {atm.name || 'ATM'}
                  </h3>

                  {atm.bank && (
                    <div className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-semibold mt-1">
                      {atm.bank}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">

                  {atm.address && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-500">
                        ADDRESS
                      </span>
                      <div className="mt-0.5">{atm.address}</div>
                    </div>
                  )}

                  {Number.isFinite(Number(atm.latitude)) &&
                    Number.isFinite(Number(atm.longitude)) && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-500">
                          GPS
                        </span>
                        <div className="mt-0.5">
                          {Number(atm.latitude).toFixed(4)},{' '}
                          {Number(atm.longitude).toFixed(4)}
                        </div>
                      </div>
                    )}

                  {atm.distanceKm !== undefined && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-500">
                        DISTANCE
                      </span>
                      <div className="mt-0.5">
                        {atm.distanceKm} km
                      </div>
                    </div>
                  )}

                  {atm.surveillanceStatus && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-500">
                        SURVEILLANCE
                      </span>
                      <div className="mt-0.5">
                        {atm.surveillanceStatus}
                      </div>
                    </div>
                  )}

                  {atm.nearbyLandmark && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-500">
                        LANDMARK
                      </span>
                      <div className="mt-0.5">
                        {atm.nearbyLandmark}
                      </div>
                    </div>
                  )}

                </div>

                {/* Dispatch */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDispatch(atm.id);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:text-slate-950 text-emerald-700 dark:text-emerald-400 font-['Space_Grotesk'] font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-emerald-300 dark:border-emerald-500/30"
                >
                  {dispatchedId === atm.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      ALERT DISPATCHED
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      DISPATCH PATROL ALERT
                    </>
                  )}
                </button>

              </div>
            );
          })}

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/80 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center">

          <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-4" />

          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
            No ATM intelligence available
          </h3>

          <p className="max-w-lg mx-auto mt-2 text-sm text-slate-500 dark:text-slate-400">
            The selected complaint does not currently contain ATM candidate
            data from the backend.
            {searchTerm
              ? ' Try changing the search term.'
              : ' ATM candidates will appear here when supplied by the intelligence backend.'}
          </p>

        </div>
      )}

      {/* Selected ATM */}
      {selectedAtm && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
                <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>

              <div>
                <div className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  SELECTED ATM
                </div>

                <h3 className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAtm.name || 'ATM'}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedAtm.bank || 'Bank information unavailable'}
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              {selectedAtm.rank !== undefined && (
                <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] block text-slate-500 font-mono">
                    RANK
                  </span>

                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    #{selectedAtm.rank}
                  </span>
                </div>
              )}

              {selectedAtm.withdrawalLikelihood !== undefined && (
                <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] block text-slate-500 font-mono">
                    LIKELIHOOD
                  </span>

                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedAtm.withdrawalLikelihood}%
                  </span>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AtmIntelligencePage;