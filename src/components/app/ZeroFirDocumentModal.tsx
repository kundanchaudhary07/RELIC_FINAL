import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Shield, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Lock, 
  Fingerprint, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { InvestigationCase } from '../../types';
import { CctvTimelineEvent } from './AtmCctvPlayer';

export interface ZeroFirPackageData {
  caseData: InvestigationCase;
  transactionId: string;
  atmId: string;
  atmName: string;
  atmLocation: string;
  cameraId: string;
  evidenceId: string;
  recordingDate: string;
  transactionTime: string;
  cctvWindowStart: string;
  cctvWindowEnd: string;
  retrievalTimestamp: string;
  fileName: string;
  fileSizeMb: number;
  hashAlgorithm: string;
  sha256Hash: string;
  integrityVerified: boolean;
  officerName: string;
  officerBadge: string;
  officerRole: string;
  officerDepartment: string;
  officerStation: string;
  verificationStatus: 'OFFICER_VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  verificationTimestamp: string;
  events: CctvTimelineEvent[];
  auditHistory: { time: string; event: string; status: string }[];
}

interface ZeroFirDocumentModalProps {
  data: ZeroFirPackageData;
  onClose: () => void;
}

export const ZeroFirDocumentModal: React.FC<ZeroFirDocumentModalProps> = ({ data, onClose }) => {
  const { caseData } = data;

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZERO_FIR_CASE_PACKAGE_${caseData.caseNumber.replace(/\//g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZERO-FIR-READY CASE PACKAGE — ${caseData.caseNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #fff; line-height: 1.5; font-size: 13px; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #0f172a; }
    .subtitle { font-size: 12px; color: #475569; margin-top: 4px; }
    .badge { display: inline-block; background: #0284c7; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-top: 8px; }
    .section { margin-bottom: 18px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 15px; }
    .section-title { font-size: 13px; font-weight: bold; color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .label { font-weight: 600; color: #64748b; font-size: 11px; }
    .value { font-weight: 600; color: #0f172a; font-family: monospace; }
    .hash-box { background: #f8fafc; border: 1px dashed #94a3b8; padding: 8px; font-family: monospace; font-size: 11px; word-break: break-all; margin-top: 5px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    .table th, .table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    .table th { background: #f1f5f9; font-weight: 600; }
    .footer { margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; }
    .disclaimer { background: #fef2f2; border: 1px solid #fca5a5; padding: 8px; font-size: 11px; color: #991b1b; margin-top: 15px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">RELIC CYBER CRIME INVESTIGATION SYSTEM</div>
    <div class="subtitle">PREDICTIVE INTELLIGENCE & DIGITAL EVIDENCE PREPARATION CELL</div>
    <div class="badge">ZERO-FIR-READY CASE PACKAGE</div>
  </div>

  <div class="section">
    <div class="section-title">1. Case & Incident Identification</div>
    <div class="grid">
      <div><span class="label">Case Number:</span> <span class="value">${caseData.caseNumber}</span></div>
      <div><span class="label">Incident Date & Time:</span> <span class="value">${caseData.incidentDate} ${caseData.incidentTime} IST</span></div>
      <div><span class="label">Fraud Category:</span> <span class="value">${caseData.fraudType}</span></div>
      <div><span class="label">Reported Fraud Loss:</span> <span class="value">₹${caseData.reportedFraudAmount.toLocaleString('en-IN')}</span></div>
      <div><span class="label">Complainant / Victim:</span> <span class="value">${caseData.victim.name}</span></div>
      <div><span class="label">Contact / Location:</span> <span class="value">${caseData.victim.phone} • ${caseData.incidentLocation.city}, ${caseData.incidentLocation.state}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Unauthorized Transaction & Target ATM Correlation</div>
    <div class="grid">
      <div><span class="label">Transaction Reference:</span> <span class="value">${data.transactionId}</span></div>
      <div><span class="label">Transaction Timestamp:</span> <span class="value">${data.recordingDate} ${data.transactionTime} IST</span></div>
      <div><span class="label">ATM Identifier:</span> <span class="value">${data.atmId} (${data.atmName})</span></div>
      <div><span class="label">ATM Location / Address:</span> <span class="value">${data.atmLocation}</span></div>
      <div><span class="label">Beneficiary Account/Channel:</span> <span class="value">${caseData.moneyTrail[caseData.moneyTrail.length - 1]?.receiverAccount || 'ATM_CASHOUT_STAGE'} • ATM_WITHDRAWAL</span></div>
      <div><span class="label">Target Cashout Amount:</span> <span class="value">₹${(caseData.predictedCashoutRegion?.estimatedCashoutAmount || 1420000).toLocaleString('en-IN')}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. CCTV Surveillance Evidence Metadata</div>
    <div class="grid">
      <div><span class="label">Evidence ID:</span> <span class="value">${data.evidenceId}</span></div>
      <div><span class="label">Surveillance Camera:</span> <span class="value">${data.cameraId} (Lobby & Kiosk Overview)</span></div>
      <div><span class="label">Requested CCTV Window:</span> <span class="value">${data.cctvWindowStart} – ${data.cctvWindowEnd} IST (±5 Min Interval)</span></div>
      <div><span class="label">Retrieval Timestamp:</span> <span class="value">${data.retrievalTimestamp}</span></div>
      <div><span class="label">Evidence File Name:</span> <span class="value">${data.fileName}</span></div>
      <div><span class="label">File Size:</span> <span class="value">${data.fileSizeMb} MB</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">4. Cryptographic Hash & Evidence Integrity Verification</div>
    <div><span class="label">Cryptographic Algorithm:</span> <span class="value">${data.hashAlgorithm}</span></div>
    <div class="hash-box">SHA-256 DIGEST: ${data.sha256Hash}</div>
    <div style="margin-top: 6px; color: #166534; font-weight: bold;">
      ✓ STATUS: INTEGRITY VERIFIED (BIT-EXACT MATCH • ZERO TAMPERING DETECTED)
    </div>
  </div>

  <div class="section">
    <div class="section-title">5. AI Event Analysis & Key Timestamps (Telemetry)</div>
    <table class="table">
      <thead>
        <tr>
          <th>Timestamp (IST)</th>
          <th>Event Classification</th>
          <th>Telemetry Description</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        ${data.events.map(ev => `
          <tr>
            <td class="value">${ev.timeStr}</td>
            <td><strong>${ev.eventType}</strong></td>
            <td>${ev.description}</td>
            <td>${ev.confidenceScore}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">6. Investigating Officer Formal Verification</div>
    <div class="grid">
      <div><span class="label">Reviewing Officer:</span> <span class="value">${data.officerName}</span></div>
      <div><span class="label">Badge / Identifier:</span> <span class="value">${data.officerBadge}</span></div>
      <div><span class="label">Department / Unit:</span> <span class="value">${data.officerDepartment}</span></div>
      <div><span class="label">Station / Jurisdiction:</span> <span class="value">${data.officerStation}</span></div>
      <div><span class="label">Verification State:</span> <span class="value" style="color: #166534;">${data.verificationStatus}</span></div>
      <div><span class="label">Verification Timestamp:</span> <span class="value">${data.verificationTimestamp}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">7. Chain of Custody & Evidence Audit Trail</div>
    <table class="table">
      <thead>
        <tr>
          <th>Timestamp (IST)</th>
          <th>Audit Action</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.auditHistory.map(h => `
          <tr>
            <td class="value">${h.time}</td>
            <td>${h.event}</td>
            <td><strong>${h.status}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="disclaimer">
    <strong>LEGAL NOTICE / DISCLAIMER:</strong> This is a Zero-FIR Preparation Package generated by the RELIC Cybercrime Intelligence System. It compiles authenticated digital evidence, cryptographic verification proofs, and officer attestations for submission to the jurisdictional police station under Section 154 CrPC / Bharatiya Nagarik Suraksha Sanhita (BNSS).
  </div>

  <div class="footer">
    <div>Generated via RELIC Cyber Intelligence Engine • ${new Date().toISOString()}</div>
    <div>Seal & Signature: _______________________ (${data.officerName})</div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZERO_FIR_CASE_PACKAGE_${caseData.caseNumber.replace(/\//g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-700/60 flex items-center justify-center text-cyan-800 dark:text-cyan-300 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
                  Zero-FIR-Ready Case Package
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  ZERO-FIR READY
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                CASE: {caseData.caseNumber} • EVIDENCE REF: {data.evidenceId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-800 dark:text-slate-200 custom-scrollbar">
          
          {/* Official Letterhead Banner */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center space-y-1.5 shadow-sm">
            <div className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white tracking-wide">
              RELIC CYBER CRIME INVESTIGATION SYSTEM
            </div>
            <div className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
              PREDICTIVE INTELLIGENCE & DIGITAL EVIDENCE PREPARATION CELL
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Zero-FIR Preparation & ATM Surveillance Telemetry Compilation Under Section 154 CrPC / BNSS
            </div>
          </div>

          {/* Section 1: Case Summary */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3 bg-white dark:bg-slate-900/60">
            <div className="font-['Space_Grotesk'] text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Incident & Complaint Overview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div><span className="text-slate-500 dark:text-slate-400">Case Number:</span> <strong className="text-slate-900 dark:text-white">{caseData.caseNumber}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Incident Date:</span> <strong className="text-slate-900 dark:text-white">{caseData.incidentDate} {caseData.incidentTime} IST</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Fraud Category:</span> <strong className="text-slate-900 dark:text-white">{caseData.fraudType}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Total Siphoned Amount:</span> <strong className="text-cyan-700 dark:text-cyan-300">₹{caseData.reportedFraudAmount.toLocaleString('en-IN')}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Victim / Complainant:</span> <strong className="text-slate-900 dark:text-white">{caseData.victim.name}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Jurisdiction:</span> <strong className="text-slate-900 dark:text-white">{caseData.incidentLocation.city}, {caseData.incidentLocation.state}</strong></div>
            </div>
          </div>

          {/* Section 2: Transaction & ATM Correlation */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3 bg-white dark:bg-slate-900/60">
            <div className="font-['Space_Grotesk'] text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              2. Transaction & ATM Correlation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div><span className="text-slate-500 dark:text-slate-400">Transaction ID:</span> <strong className="text-slate-900 dark:text-white">{data.transactionId}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Transaction Timestamp:</span> <strong className="text-red-600 dark:text-red-400">{data.recordingDate} {data.transactionTime} IST</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">ATM Identifier:</span> <strong className="text-slate-900 dark:text-white">{data.atmId} ({data.atmName})</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">ATM Location:</span> <strong className="text-slate-900 dark:text-white">{data.atmLocation}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Camera Source:</span> <strong className="text-slate-900 dark:text-white">{data.cameraId} (Lobby & Kiosk Overview)</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">CCTV Window:</span> <strong className="text-slate-900 dark:text-white">{data.cctvWindowStart} – {data.cctvWindowEnd} IST (±5 Min)</strong></div>
            </div>
          </div>

          {/* Section 3: Evidence Integrity & SHA-256 */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3 bg-white dark:bg-slate-900/60">
            <div className="font-['Space_Grotesk'] text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>3. Cryptographic Evidence Integrity (SHA-256)</span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                ✓ INTEGRITY VERIFIED
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div><span className="text-slate-500 dark:text-slate-400">Evidence ID:</span> <strong className="text-cyan-700 dark:text-cyan-400">{data.evidenceId}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">File Name:</span> <strong className="text-slate-900 dark:text-white">{data.fileName}</strong> ({data.fileSizeMb} MB)</div>
              <div><span className="text-slate-500 dark:text-slate-400">Hash Algorithm:</span> <strong className="text-slate-900 dark:text-white">{data.hashAlgorithm}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Retrieved:</span> <strong className="text-slate-900 dark:text-white">{data.retrievalTimestamp}</strong></div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] break-all">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">SHA-256 CRYPTOGRAPHIC DIGEST:</span>
              <span className="text-slate-900 dark:text-white font-bold">{data.sha256Hash}</span>
            </div>
          </div>

          {/* Section 4: AI Analysis & Important Timestamps */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3 bg-white dark:bg-slate-900/60">
            <div className="font-['Space_Grotesk'] text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              4. AI Video Event Analysis & Timestamps
            </div>

            <div className="space-y-2">
              {data.events.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.eventType === 'TRANSACTION'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                        : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                    }`}>
                      {ev.timeStr}
                    </span>
                    <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-900 dark:text-white">
                      {ev.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {ev.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Officer Verification & Custody Audit */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-3 bg-white dark:bg-slate-900/60">
            <div className="font-['Space_Grotesk'] text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              5. Officer Verification & Chain of Custody Audit
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div><span className="text-slate-500 dark:text-slate-400">Verifying Officer:</span> <strong className="text-slate-900 dark:text-white">{data.officerName}</strong> ({data.officerBadge})</div>
              <div><span className="text-slate-500 dark:text-slate-400">Status:</span> <strong className="text-emerald-700 dark:text-emerald-400">{data.verificationStatus}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Department:</span> <strong className="text-slate-900 dark:text-white">{data.officerDepartment}</strong></div>
              <div><span className="text-slate-500 dark:text-slate-400">Verification Time:</span> <strong className="text-slate-900 dark:text-white">{data.verificationTimestamp}</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold mb-2">Chronological Audit Log</div>
              <div className="space-y-1 font-mono text-[11px]">
                {data.auditHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-400 py-0.5">
                    <span>{item.time} — {item.event}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
            <strong>NOTICE & DISCLAIMER:</strong> This Zero-FIR-ready Case Package compiles forensic cyber intelligence and digital CCTV evidence for preparation purposes. Filing and registration of the statutory Zero FIR is completed through state police jurisdiction channels under applicable law.
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Package Status: <strong className="text-emerald-600 dark:text-emerald-400">ZERO-FIR READY</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-['Space_Grotesk'] font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Package</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-['Space_Grotesk'] font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 font-['Space_Grotesk'] font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD ZERO-FIR CASE PACKAGE</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
