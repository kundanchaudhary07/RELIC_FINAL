import React, { useState } from "react";
import {
  Radio,
  Clock,
  ShieldAlert,
  ArrowRight,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useCase } from "../../context/CaseContext";

export const ActiveCasesPage: React.FC<{
  onNavigate: (route: string) => void;
}> = ({ onNavigate }) => {
  const { cases, selectCaseById } = useCase();

  const [filterStatus, setFilterStatus] =
    useState<string>("ALL");

  const [searchQuery, setSearchQuery] =
    useState<string>("");

  const filteredCases = cases.filter((c) => {
    if (
      filterStatus !== "ALL" &&
      c.status !== filterStatus
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery
        .toLowerCase()
        .trim();

      return (
        String(c.caseNumber || "")
          .toLowerCase()
          .includes(q) ||
        String(c.title || "")
          .toLowerCase()
          .includes(q) ||
        String(c.fraudType || "")
          .toLowerCase()
          .includes(q) ||
        String(c.victimAccountId || "")
          .toLowerCase()
          .includes(q) ||
        String(c.transactionId || "")
          .toLowerCase()
          .includes(q) ||
        String(c.beneficiaryAccountId || "")
          .toLowerCase()
          .includes(q) ||
        String(c.beneficiaryUpiId || "")
          .toLowerCase()
          .includes(q)
      );
    }

    return true;
  });

  const underInvestigationCount =
    cases.filter(
      (c) =>
        c.status === "UNDER_INVESTIGATION"
    ).length;

  const registeredCount =
    cases.filter(
      (c) => c.status === "REGISTERED"
    ).length;

  const closedCount =
    cases.filter(
      (c) => c.status === "CLOSED"
    ).length;

  const formatDate = (
    dateValue: unknown
  ) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(
      String(dateValue)
    );

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClasses = (
    status: string
  ) => {
    switch (status) {
      case "CLOSED":
        return "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";

      case "REGISTERED":
        return "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";

      case "UNDER_INVESTIGATION":
      default:
        return "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">

        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />

          <div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Active Cases
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live complaints from the case system
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-xs font-mono text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {underInvestigationCount} Under Investigation
            </span>
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">
            {registeredCount} Registered
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
            {closedCount} Closed
          </span>

        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm transition-colors">

        <div className="relative w-full lg:w-96">

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search by complaint ID, fraud type, account, or transaction..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />

        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>

          {[
            "ALL",
            "UNDER_INVESTIGATION",
            "REGISTERED",
            "CLOSED",
          ].map((status) => (
            <button
              key={status}
              onClick={() =>
                setFilterStatus(status)
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                filterStatus === status
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              {status === "UNDER_INVESTIGATION"
                ? "INVESTIGATING"
                : status}
            </button>
          ))}

        </div>
      </div>

      {/* No Cases */}
      {filteredCases.length === 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">

          <ShieldAlert className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />

          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
            {cases.length === 0
              ? "No complaints available"
              : "No matching complaints"}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {cases.length === 0
              ? "Register a new complaint to create a case."
              : "Try changing the search or status filter."}
          </p>

        </div>
      )}

      {/* Case Cards */}
      {filteredCases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >

              <div className="space-y-4">

                {/* Card Top */}
                <div className="flex items-center justify-between gap-2">

                  <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400 truncate">
                    {c.caseNumber || `CASE-${c.id}`}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border whitespace-nowrap ${getStatusClasses(
                      String(c.status || "UNDER_INVESTIGATION")
                    )}`}
                  >
                    {String(
                      c.status ||
                        "UNDER_INVESTIGATION"
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                </div>

                {/* Title */}
                <div>

                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                    {c.title ||
                      "Cyber Fraud Complaint"}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Fraud Type:{" "}
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {c.fraudType ||
                        "Not specified"}
                    </span>
                  </p>

                </div>

                {/* Amount */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">

                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block font-medium">
                    REPORTED LOSS
                  </span>

                  <span className="font-bold text-cyan-700 dark:text-cyan-300 text-lg">
                    ₹
                    {Number(
                      c.reportedAmount ??
                        c.reportedFraudAmount ??
                        0
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

                {/* Complaint Information */}
                <div className="space-y-2">

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                      VICTIM ACCOUNT
                    </span>

                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 break-all">
                      {c.victimAccountId ||
                        "Not provided"}
                    </span>

                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                      TRANSACTION ID
                    </span>

                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 break-all">
                      {c.transactionId ||
                        "Not provided"}
                    </span>

                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                      BENEFICIARY ACCOUNT
                    </span>

                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 break-all">
                      {c.beneficiaryAccountId ||
                        "Not provided"}
                    </span>

                  </div>

                  {c.beneficiaryUpiId && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">

                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                        BENEFICIARY UPI
                      </span>

                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 break-all">
                        {c.beneficiaryUpiId}
                      </span>

                    </div>
                  )}

                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

                  <Clock className="w-3.5 h-3.5" />

                  <span>
                    Registered:{" "}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {formatDate(
                        c.createdAt
                      )}
                    </strong>
                  </span>

                </div>

                {/* Linked Fraud Account */}
                <div className="flex items-center gap-2">

                  {c.linkedFraudAccount ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-red-500" />

                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Linked fraud account
                        flagged
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        No linked fraud account
                        flagged
                      </span>
                    </>
                  )}

                </div>

              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">

                <button
                  onClick={() => {
                    selectCaseById(c.id);
                    onNavigate("case-details");
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span>View Case</span>

                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};