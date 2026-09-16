import React, { useMemo, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Database,
  MapPin,
  User,
  ReceiptText,
} from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import {
  ZeroFirDocumentModal,
  ZeroFirPackageData,
} from '../../components/app/ZeroFirDocumentModal';

type ReportTab = 'SECTION_91' | 'ZERO_FIR';

type VerificationStatus =
  | 'OFFICER_VERIFIED'
  | 'PENDING_REVIEW'
  | 'REJECTED';

const formatAmount = (value: unknown) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Not available';
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatDate = (value: unknown) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const displayValue = (value: unknown) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return 'Not available';
  }

  return String(value);
};

/*
 * ZeroFirDocumentModal accepts only these three values.
 * Never pass an arbitrary backend string directly to it.
 */
const getVerificationStatus = (
  value: unknown
): VerificationStatus => {
  const status = String(value ?? '').toUpperCase();

  if (status === 'OFFICER_VERIFIED') {
    return 'OFFICER_VERIFIED';
  }

  if (status === 'REJECTED') {
    return 'REJECTED';
  }

  return 'PENDING_REVIEW';
};

export const ReportsPage: React.FC = () => {
  const {
    selectedCase,
    cases,
    selectCaseById,
  } = useCase();

  const { user } = useAuth();

  const [activeReportTab, setActiveReportTab] =
    useState<ReportTab>('SECTION_91');

  const [showZeroFirModal, setShowZeroFirModal] =
    useState(false);

  const currentCase = selectedCase || cases[0];

  const caseData = currentCase as any;

  const reportData = useMemo(() => {
    if (!currentCase) {
      return null;
    }

    return {
      complaintId:
        caseData.complaintId ??
        caseData.caseNumber ??
        currentCase.id,

      complaintDate:
        caseData.complaintDate ??
        caseData.incidentDate ??
        caseData.createdAt,

      fraudType:
        caseData.fraudType,

      reportedAmount:
        caseData.reportedAmount ??
        caseData.reportedFraudAmount,

      victimAccountId:
        caseData.victimAccountId,

      transactionId:
        caseData.transactionId ??
        caseData.initialTransactionId,

      beneficiaryAccountId:
        caseData.beneficiaryAccountId,

      beneficiaryUpiId:
        caseData.beneficiaryUpiId,

      complaintStatus:
        caseData.status ??
        caseData.complaintStatus,

      linkedFraudAccount:
        caseData.linkedFraudAccount,

      victimName:
        caseData.victim?.name ??
        caseData.victimName,

      incidentLocation:
        caseData.incidentLocation,

      assignedOfficer:
        caseData.assignedOfficer ??
        user?.name,

      investigatorBadge:
        caseData.investigatorBadge ??
        caseData.investigatorId ??
        user?.badgeId,

      investigatorDepartment:
        caseData.investigatorDepartment ??
        user?.department,

      investigatorStation:
        caseData.investigatorStation ??
        user?.station,

      evidenceFiles: Array.isArray(
        caseData.evidenceFiles
      )
        ? caseData.evidenceFiles
        : [],
    };
  }, [caseData, currentCase, user]);

  /*
   * Build Zero-FIR data only from fields actually available
   * in the selected investigation case.
   */
  const zeroFirPackageData = useMemo(() => {
    if (!currentCase || !reportData) {
      return null;
    }

    const location = reportData.incidentLocation;

    const atmCandidates = Array.isArray(
      caseData.atmCandidates
    )
      ? caseData.atmCandidates
      : [];

    const atm = atmCandidates[0];

    const packageData: ZeroFirPackageData = {
      caseData: currentCase,

      transactionId: displayValue(
        reportData.transactionId
      ),

      atmId: displayValue(
        atm?.id
      ),

      atmName: displayValue(
        atm?.name
      ),

      atmLocation:
        atm &&
        (
          atm.address ||
          atm.city ||
          atm.state
        )
          ? [
              atm.address,
              atm.city,
              atm.state,
            ]
              .filter(Boolean)
              .join(', ')
          : location &&
              (
                location.address ||
                location.city ||
                location.state
              )
            ? [
                location.address,
                location.city,
                location.state,
              ]
                .filter(Boolean)
                .join(', ')
            : 'Not available',

      cameraId: displayValue(
        caseData.cameraId
      ),

      evidenceId: displayValue(
        caseData.evidenceId
      ),

      recordingDate: displayValue(
        caseData.recordingDate ??
        caseData.incidentDate
      ),

      transactionTime: displayValue(
        caseData.transactionTime ??
        caseData.incidentTime
      ),

      cctvWindowStart: displayValue(
        caseData.cctvWindowStart
      ),

      cctvWindowEnd: displayValue(
        caseData.cctvWindowEnd
      ),

      retrievalTimestamp: displayValue(
        caseData.retrievalTimestamp
      ),

      fileName: displayValue(
        caseData.fileName
      ),

      fileSizeMb:
        typeof caseData.fileSizeMb === 'number'
          ? caseData.fileSizeMb
          : 0,

      hashAlgorithm: displayValue(
        caseData.hashAlgorithm
      ),

      sha256Hash: displayValue(
        caseData.sha256Hash
      ),

      integrityVerified:
        caseData.integrityVerified === true,

      officerName: displayValue(
        reportData.assignedOfficer
      ),

      officerBadge: displayValue(
        reportData.investigatorBadge
      ),

      officerRole: displayValue(
        caseData.assignedOfficerRole
      ),

      officerDepartment: displayValue(
        reportData.investigatorDepartment
      ),

      officerStation: displayValue(
        reportData.investigatorStation
      ),

      /*
       * FIX:
       * Convert the arbitrary backend value into the exact
       * union expected by ZeroFirDocumentModal.
       */
      verificationStatus: getVerificationStatus(
        caseData.verificationStatus
      ),

      verificationTimestamp: displayValue(
        caseData.verificationTimestamp
      ),

      events: Array.isArray(
        caseData.cctvEvents
      )
        ? caseData.cctvEvents
        : [],

      auditHistory: Array.isArray(
        caseData.auditHistory
      )
        ? caseData.auditHistory
        : [],
    };

    return packageData;
  }, [
    caseData,
    currentCase,
    reportData,
  ]);

  const hasZeroFirEvidence =
    Boolean(
      zeroFirPackageData?.evidenceId &&
      zeroFirPackageData.evidenceId !==
        'Not available'
    );

  const hasVerifiedEvidence =
    zeroFirPackageData?.integrityVerified === true;

  const handleOpenZeroFir = () => {
    if (!zeroFirPackageData) {
      return;
    }

    setShowZeroFirModal(true);
  };

  if (!currentCase || !reportData) {
    return (
      <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">

        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>

          <h1 className="mt-5 font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
            No Investigation Case Selected
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">
            Reports and Zero-FIR documents can be generated only
            from a registered complaint available from the backend.
          </p>

        </section>

      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">

      {/* HEADER */}

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/50">
              <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Reports & Case Filings
                </h1>

                <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-bold tracking-widest text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-400">
                  CASE DOCUMENTS
                </span>

              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                Generate investigation reports and review Zero-FIR
                case documentation using registered complaint data.
              </p>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">

              <div className="text-[9px] font-bold tracking-widest text-slate-400">
                CASE
              </div>

              <div className="mt-1 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">
                {displayValue(
                  reportData.complaintId
                )}
              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">

              <div className="text-[9px] font-bold tracking-widest text-slate-400">
                STATUS
              </div>

              <div className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                {displayValue(
                  reportData.complaintStatus
                ).replaceAll('_', ' ')}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* CASE SELECTOR + TABS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950">

            <button
              type="button"
              onClick={() =>
                setActiveReportTab('SECTION_91')
              }
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeReportTab === 'SECTION_91'
                  ? 'bg-white text-cyan-700 shadow-sm dark:bg-slate-800 dark:text-cyan-300'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Section 91 Notice
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveReportTab('ZERO_FIR')
              }
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeReportTab === 'ZERO_FIR'
                  ? 'bg-white text-cyan-700 shadow-sm dark:bg-slate-800 dark:text-cyan-300'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Zero-FIR
            </button>

          </div>

          <select
            value={
              selectedCase?.id ??
              currentCase.id
            }
            onChange={(e) =>
              selectCaseById(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 lg:w-80"
          >
            {cases.map((caseItem) => {
              const item = caseItem as any;

              return (
                <option
                  key={caseItem.id}
                  value={caseItem.id}
                >
                  {displayValue(
                    item.complaintId ??
                    item.caseNumber ??
                    caseItem.id
                  )}
                  {' • '}
                  {displayValue(
                    item.fraudType
                  )}
                </option>
              );
            })}
          </select>

        </div>

      </section>

      {/* SECTION 91 */}

      {activeReportTab === 'SECTION_91' && (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />

                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                  Section 91 Bank Requisition
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Complaint-linked banking information request.
              </p>

            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
            >
              <Printer className="h-4 w-4" />
              Print Notice
            </button>

          </div>

          <div className="p-5 sm:p-8">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 sm:p-8">

              <div className="border-b border-slate-200 pb-5 text-center dark:border-slate-800">

                <h3 className="font-['Space_Grotesk'] text-base font-bold tracking-wide text-slate-900 dark:text-white">
                  NOTICE UNDER SECTION 91
                </h3>

                <p className="mt-1 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
                  CYBER CRIME INVESTIGATION CELL
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  Generated from registered complaint data
                </p>

              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                <ReportField
                  icon={ReceiptText}
                  label="Complaint / Case ID"
                  value={displayValue(
                    reportData.complaintId
                  )}
                />

                <ReportField
                  icon={FileText}
                  label="Complaint Date"
                  value={formatDate(
                    reportData.complaintDate
                  )}
                />

                <ReportField
                  icon={AlertTriangle}
                  label="Fraud Type"
                  value={displayValue(
                    reportData.fraudType
                  )}
                />

                <ReportField
                  icon={Database}
                  label="Reported Amount"
                  value={formatAmount(
                    reportData.reportedAmount
                  )}
                />

                <ReportField
                  icon={User}
                  label="Victim Account"
                  value={displayValue(
                    reportData.victimAccountId
                  )}
                />

                <ReportField
                  icon={Database}
                  label="Transaction ID"
                  value={displayValue(
                    reportData.transactionId
                  )}
                />

                <ReportField
                  icon={Database}
                  label="Beneficiary Account"
                  value={displayValue(
                    reportData.beneficiaryAccountId
                  )}
                />

                <ReportField
                  icon={Database}
                  label="Beneficiary UPI ID"
                  value={displayValue(
                    reportData.beneficiaryUpiId
                  )}
                />

              </div>

              <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900/60 dark:bg-cyan-950/30">

                <div className="flex items-center gap-2">

                  <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />

                  <h3 className="text-xs font-bold text-cyan-950 dark:text-cyan-200">
                    Requisition Purpose
                  </h3>

                </div>

                <p className="mt-2 text-xs leading-6 text-slate-700 dark:text-slate-300">
                  The requested banking information should be
                  furnished in relation to the registered cybercrime
                  complaint identified above. Account and transaction
                  details shown in this notice originate from the
                  selected investigation case.
                </p>

              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Investigation Information
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <InfoRow
                    label="Victim"
                    value={displayValue(
                      reportData.victimName
                    )}
                  />

                  <InfoRow
                    label="Investigator"
                    value={displayValue(
                      reportData.assignedOfficer
                    )}
                  />

                  <InfoRow
                    label="Investigator ID"
                    value={displayValue(
                      reportData.investigatorBadge
                    )}
                  />

                  <InfoRow
                    label="Department"
                    value={displayValue(
                      reportData.investigatorDepartment
                    )}
                  />

                  <InfoRow
                    label="Station"
                    value={displayValue(
                      reportData.investigatorStation
                    )}
                  />

                  <InfoRow
                    label="Linked Fraud Account"
                    value={
                      reportData.linkedFraudAccount === true
                        ? 'Yes'
                        : reportData.linkedFraudAccount === false
                          ? 'No'
                          : 'Not available'
                    }
                  />

                </div>

              </div>

              {reportData.incidentLocation && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                  <div className="flex items-center gap-2">

                    <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Available Location Information
                    </h3>

                  </div>

                  <div className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {[
                      reportData.incidentLocation.address,
                      reportData.incidentLocation.city,
                      reportData.incidentLocation.state,
                    ]
                      .filter(Boolean)
                      .join(', ') ||
                      'Location data not available'}
                  </div>

                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">

                <div className="text-[10px] text-slate-500 dark:text-slate-400">

                  <div>
                    Document generated:{' '}
                    {new Date().toLocaleDateString('en-IN')}
                  </div>

                  <div className="mt-1">
                    This document reflects data available in the
                    connected investigation record.
                  </div>

                </div>

                <div className="text-left sm:text-right">

                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {displayValue(
                      reportData.assignedOfficer
                    )}
                  </div>

                  <div className="mt-1 font-mono text-[10px] text-cyan-700 dark:text-cyan-400">
                    {displayValue(
                      reportData.investigatorBadge
                    )}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    {displayValue(
                      reportData.investigatorDepartment
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* ZERO FIR */}

      {activeReportTab === 'ZERO_FIR' && (
        <section className="space-y-5">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />

                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                    Zero-FIR Digital Case Package
                  </h2>

                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold tracking-widest text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                    CASE DOCUMENT
                  </span>

                </div>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Review the registered complaint and any
                  investigation artifacts that are actually available
                  before opening the Zero-FIR document viewer.
                </p>

              </div>

              <button
                type="button"
                onClick={handleOpenZeroFir}
                disabled={!zeroFirPackageData}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
              >
                <Download className="h-4 w-4" />
                Open Case Package
              </button>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <StatusCard
              icon={ReceiptText}
              label="Complaint"
              value={displayValue(
                reportData.complaintId
              )}
              ready
            />

            <StatusCard
              icon={Database}
              label="Transaction"
              value={displayValue(
                reportData.transactionId
              )}
              ready={
                Boolean(
                  reportData.transactionId
                )
              }
            />

            <StatusCard
              icon={FileText}
              label="Evidence"
              value={
                reportData.evidenceFiles.length > 0
                  ? `${reportData.evidenceFiles.length} attached`
                  : 'Not attached'
              }
              ready={
                reportData.evidenceFiles.length > 0
              }
            />

            <StatusCard
              icon={CheckCircle2}
              label="Integrity"
              value={
                hasVerifiedEvidence
                  ? 'Verified'
                  : hasZeroFirEvidence
                    ? 'Hash available'
                    : 'Not available'
              }
              ready={
                hasVerifiedEvidence ||
                hasZeroFirEvidence
              }
            />

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">

            <div className="border-b border-slate-200 p-5 dark:border-slate-800">

              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                Zero-FIR Package Contents
              </h3>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Availability reflects information currently returned
                by the connected investigation record.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">

              <PackageItem
                label="Complaint Information"
                available={
                  Boolean(
                    reportData.complaintId
                  )
                }
              />

              <PackageItem
                label="Transaction Information"
                available={
                  Boolean(
                    reportData.transactionId
                  )
                }
              />

              <PackageItem
                label="ATM Information"
                available={
                  Boolean(
                    zeroFirPackageData?.atmId &&
                    zeroFirPackageData.atmId !==
                      'Not available'
                  )
                }
              />

              <PackageItem
                label="CCTV Evidence"
                available={
                  Boolean(
                    zeroFirPackageData?.fileName &&
                    zeroFirPackageData.fileName !==
                      'Not available'
                  )
                }
              />

              <PackageItem
                label="AI / Investigation Analysis"
                available={
                  Boolean(
                    caseData.aiAnalysis ||
                    caseData.analysis ||
                    caseData.riskScore
                  )
                }
              />

              <PackageItem
                label="Cryptographic Hash"
                available={
                  Boolean(
                    zeroFirPackageData?.sha256Hash &&
                    zeroFirPackageData.sha256Hash !==
                      'Not available'
                  )
                }
              />

            </div>

          </div>

          {!hasZeroFirEvidence && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">

              <div className="flex items-start gap-3">

                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                <div>

                  <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Evidence package is incomplete
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-amber-800 dark:text-amber-400">
                    No evidence identifier is currently available
                    in the selected case. The application will not
                    manufacture an Evidence ID, CCTV record, hash,
                    timestamp, or verification result.
                  </p>

                </div>

              </div>

            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">

            <div className="flex items-start gap-3">

              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />

              <div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Document generation
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  The viewer uses the selected case as its source.
                  Missing backend fields remain explicitly marked
                  unavailable rather than being replaced with demo
                  information.
                </p>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* ZERO FIR MODAL */}

      {showZeroFirModal &&
        zeroFirPackageData && (
          <ZeroFirDocumentModal
            data={zeroFirPackageData}
            onClose={() =>
              setShowZeroFirModal(false)
            }
          />
        )}

    </div>
  );
};

/* =============================================================
   REPORT FIELD
============================================================= */

const ReportField: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

      <div className="flex items-center gap-2">

        <Icon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />

        <span className="text-[9px] font-bold tracking-widest text-slate-400">
          {label}
        </span>

      </div>

      <div className="mt-2 break-all text-xs font-semibold text-slate-900 dark:text-white">
        {value}
      </div>

    </div>
  );
};

/* =============================================================
   INFO ROW
============================================================= */

const InfoRow: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => {
  return (
    <div>

      <div className="text-[9px] font-bold tracking-widest text-slate-400">
        {label}
      </div>

      <div className="mt-1 break-all text-xs font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </div>

    </div>
  );
};

/* =============================================================
   STATUS CARD
============================================================= */

const StatusCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  ready: boolean;
}> = ({
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
              : 'bg-slate-300 dark:bg-slate-700'
          }`}
        />

      </div>

      <div className="mt-4 text-[9px] font-bold tracking-widest text-slate-400">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-bold text-slate-900 dark:text-white">
        {value}
      </div>

    </div>
  );
};

/* =============================================================
   PACKAGE ITEM
============================================================= */

const PackageItem: React.FC<{
  label: string;
  available: boolean;
}> = ({
  label,
  available,
}) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">

      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>

      {available ? (
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          AVAILABLE
        </span>
      ) : (
        <span className="text-[9px] font-bold text-slate-400">
          NOT AVAILABLE
        </span>
      )}

    </div>
  );
};

export default ReportsPage;
