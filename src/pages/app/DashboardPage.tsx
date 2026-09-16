import React from "react";
import {
  ShieldAlert,
  TrendingUp,
  GitFork,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  FolderGit2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { useCase } from "../../context/CaseContext";
import { InteractiveIndiaMap } from "../../components/common/InteractiveIndiaMap";

interface DashboardPageProps {
  onNavigate: (route: string) => void;
  onBack?: () => void;
}

export const DashboardPage: React.FC<
  DashboardPageProps
> = ({ onNavigate }) => {
  const {
    cases,
    selectedCase,
    selectCaseById,
    riskZones,
  } = useCase();

  /*
   * All dashboard values now come from CaseContext.
   * CaseContext gets its data from the real backend.
   */

  const totalFraudTracked = cases.reduce(
    (sum, c) =>
      sum +
      Number(
        (c as any).reportedAmount ??
          (c as any).reportedFraudAmount ??
          0
      ),
    0
  );

  const activeCases = cases.filter(
    (c) =>
      c.status === "ACTIVE" ||
      c.status === "ANALYZED" ||
      c.status === "PROCESSING" ||
      c.status === "UNDER_INVESTIGATION" ||
      c.status === "REGISTERED"
  );

  const criticalCases = cases.filter(
    (c) => c.riskLevel === "CRITICAL"
  );

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(
        amount / 10000000
      ).toFixed(2)} Cr`;
    }

    if (amount >= 100000) {
      return `₹${(
        amount / 100000
      ).toFixed(2)} L`;
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  const getStatusLabel = (
    status: string | undefined
  ) => {
    if (!status) {
      return "UNKNOWN";
    }

    return status.replaceAll("_", " ");
  };

  const getStatusClass = (
    status: string | undefined
  ) => {
    switch (status) {
      case "CLOSED":
      case "INTERCEPTED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";

      case "REGISTERED":
      case "ACTIVE":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";

      case "UNDER_INVESTIGATION":
      case "ANALYZED":
      case "PROCESSING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";

      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs transition-colors">

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Command Center
            </h1>

            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Real-time complaint intake and investigation
            monitoring powered by the connected backend.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">

          <button
            onClick={() =>
              onNavigate("new-complaint")
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Space_Grotesk'] font-bold text-xs shadow-md shadow-amber-500/15 hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Complaint</span>
          </button>

          <button
            onClick={() =>
              onNavigate("cases")
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-['Space_Grotesk'] font-semibold text-xs transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Case Repository</span>
          </button>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* Total Fraud */}
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl space-y-3 shadow-xs hover:border-amber-500/30 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              TOTAL REPORTED LOSS
            </span>

            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatAmount(
                totalFraudTracked
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                {cases.length} REGISTERED
              </span>
              <span>Real backend records</span>
            </div>
          </div>

        </div>

        {/* Active Investigations */}
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl space-y-3 shadow-xs hover:border-sky-500/30 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              ACTIVE COMPLAINTS
            </span>

            <div className="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 tracking-tight">
              {activeCases.length}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold">
                LIVE
              </span>

              <span>
                Under investigation
              </span>
            </div>
          </div>

        </div>

        {/* Critical */}
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl space-y-3 shadow-xs hover:border-rose-500/30 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              CRITICAL CASES
            </span>

            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
              {criticalCases.length}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold">
                RISK
              </span>

              <span>
                Backend risk data
              </span>
            </div>
          </div>

        </div>

        {/* Registered Complaints */}
        <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl space-y-3 shadow-xs hover:border-emerald-500/30 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
              REGISTERED COMPLAINTS
            </span>

            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {cases.length}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                DATABASE
              </span>

              <span>
                Total backend records
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Map */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

            <div className="flex items-center gap-3">

              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-amber-500" />
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Complaint Intelligence Map
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Geographic intelligence for selected
                  complaint data
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                onNavigate(
                  "location-intelligence"
                )
              }
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>
                Full Intelligence Map
              </span>

              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800">

            <InteractiveIndiaMap
              currentCase={selectedCase}
              riskZones={riskZones}
              heightClass="h-[440px]"
            />

          </div>

        </div>

        {/* Selected Complaint */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">

              <div className="flex items-center gap-2">

                <ShieldCheck className="w-4 h-4 text-amber-500" />

                <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                  Complaint Details
                </h2>

              </div>

              <button
                onClick={() =>
                  onNavigate(
                    "case-details"
                  )
                }
                disabled={!selectedCase}
                className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

            {selectedCase ? (

              <div className="space-y-4 pt-3">

                {/* ID and fraud type */}
                <div className="flex items-start justify-between gap-2">

                  <div>

                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {selectedCase.caseNumber}
                    </span>

                    <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedCase.fraudType ||
                        "Cyber Fraud Complaint"}
                    </h3>

                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${getStatusClass(
                      selectedCase.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedCase.status
                    )}
                  </span>

                </div>

                {/* Amount */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200/80 dark:border-slate-800/80">

                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                    REPORTED AMOUNT
                  </span>

                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatAmount(
                      Number(
                        (selectedCase as any)
                          .reportedAmount ??
                          (selectedCase as any)
                            .reportedFraudAmount ??
                          0
                      )
                    )}
                  </span>

                </div>

                {/* Transaction */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200/80 dark:border-slate-800/80">

                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                    TRANSACTION ID
                  </span>

                  <span className="font-semibold text-slate-900 dark:text-white text-xs break-all">
                    {(selectedCase as any)
                      .transactionId ||
                      "Not available"}
                  </span>

                </div>

                {/* Accounts */}
                <div className="space-y-2">

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200/80 dark:border-slate-800/80">

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                      VICTIM ACCOUNT
                    </span>

                    <span className="font-semibold text-slate-900 dark:text-white text-xs break-all">
                      {(selectedCase as any)
                        .victimAccountId ||
                        "Not available"}
                    </span>

                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200/80 dark:border-slate-800/80">

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                      BENEFICIARY ACCOUNT
                    </span>

                    <span className="font-semibold text-slate-900 dark:text-white text-xs break-all">
                      {(selectedCase as any)
                        .beneficiaryAccountId ||
                        "Not available"}
                    </span>

                  </div>

                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">

                  <Clock className="w-3.5 h-3.5" />

                  <span>
                    Registered:{" "}
                    {selectedCase.createdAt
                      ? new Date(
                          selectedCase.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : "Not available"}
                  </span>

                </div>

              </div>

            ) : (

              <div className="py-12 text-center">

                <div className="text-slate-400 dark:text-slate-500 text-xs">
                  No complaints are currently
                  available.
                </div>

                <button
                  onClick={() =>
                    onNavigate(
                      "new-complaint"
                    )
                  }
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Register Complaint
                </button>

              </div>

            )}

          </div>

          {selectedCase && (
            <button
              onClick={() =>
                onNavigate(
                  "case-details"
                )
              }
              className="w-full mt-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-['Space_Grotesk'] font-bold text-xs transition-colors text-center shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                Open Investigation Workspace
              </span>

              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

      {/* Recent Complaints */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xs transition-colors">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
              Recent Complaints
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complaints registered in the backend
            </p>
          </div>

          <button
            onClick={() =>
              onNavigate("cases")
            }
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

        {cases.length === 0 ? (

          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No complaints have been registered yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead>

                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 font-mono text-slate-400 dark:text-slate-500 text-[11px]">

                  <th className="pb-3 px-4 font-semibold">
                    COMPLAINT ID
                  </th>

                  <th className="pb-3 px-4 font-semibold">
                    FRAUD TYPE
                  </th>

                  <th className="pb-3 px-4 font-semibold">
                    REPORTED AMOUNT
                  </th>

                  <th className="pb-3 px-4 font-semibold">
                    TRANSACTION ID
                  </th>

                  <th className="pb-3 px-4 font-semibold">
                    BENEFICIARY ACCOUNT
                  </th>

                  <th className="pb-3 px-4 font-semibold">
                    STATUS
                  </th>

                  <th className="pb-3 px-4 text-right font-semibold">
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">

                {cases.map((c) => {

                  const amount = Number(
                    (c as any)
                      .reportedAmount ??
                      (c as any)
                        .reportedFraudAmount ??
                      0
                  );

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedCase?.id ===
                        c.id
                          ? "bg-amber-500/5 dark:bg-amber-500/10"
                          : ""
                      }`}
                    >

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {c.caseNumber ||
                          c.id}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] font-medium">
                        {c.fraudType ||
                          "Not specified"}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {formatAmount(
                          amount
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] max-w-[180px] truncate">
                        {(c as any)
                          .transactionId ||
                          "Not available"}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] max-w-[180px] truncate">
                        {(c as any)
                          .beneficiaryAccountId ||
                          "Not available"}
                      </td>

                      <td className="py-3.5 px-4">

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusClass(
                            c.status
                          )}`}
                        >
                          {getStatusLabel(
                            c.status
                          )}
                        </span>

                      </td>

                      <td className="py-3.5 px-4 text-right">

                        <button
                          onClick={() => {
                            selectCaseById(
                              c.id
                            );

                            onNavigate(
                              "case-details"
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 text-xs transition-colors cursor-pointer font-semibold font-['Space_Grotesk']"
                        >
                          Inspect
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

    </div>
  );
};