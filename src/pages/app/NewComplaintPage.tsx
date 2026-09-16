import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  IndianRupee,
  Link2,
  Loader2,
  Send,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useCase } from "../../context/CaseContext";

const FRAUD_TYPES = [
  "UPI Fraud",
  "Bank Account Fraud",
  "Credit Card Fraud",
  "Debit Card Fraud",
  "Internet Banking Fraud",
  "OTP Fraud",
  "Phishing",
  "Vishing",
  "Identity Theft",
  "Investment Fraud",
  "Loan Fraud",
  "Job Fraud",
  "Online Shopping Fraud",
  "Digital Payment Fraud",
  "SIM Swap Fraud",
  "Cryptocurrency Fraud",
  "Social Media Fraud",
  "Cyber Extortion",
  "Other",
];

const COMPLAINT_STATUSES = [
  "UNDER_INVESTIGATION",
  "REGISTERED",
  "CLOSED",
];

interface NewComplaintPageProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const NewComplaintPage: React.FC<NewComplaintPageProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { createCase } = useCase();

  const [fraudType, setFraudType] = useState("");
  const [reportedAmount, setReportedAmount] = useState("");
  const [victimAccountId, setVictimAccountId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [beneficiaryAccountId, setBeneficiaryAccountId] = useState("");
  const [beneficiaryUpiId, setBeneficiaryUpiId] = useState("");
  const [complaintStatus, setComplaintStatus] =
    useState("UNDER_INVESTIGATION");
  const [linkedFraudAccount, setLinkedFraudAccount] = useState("No");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = (field: string) =>
    `w-full rounded-xl border ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
    } bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-4`;

  const clearError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fraudType) {
      newErrors.fraudType = "Please select a fraud type.";
    }

    if (!reportedAmount) {
      newErrors.reportedAmount = "Please enter the reported amount.";
    } else {
      const amount = Number(reportedAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        newErrors.reportedAmount = "Amount must be greater than 0.";
      } else if (amount > 9999999999999.99) {
        newErrors.reportedAmount = "Amount exceeds the allowed limit.";
      }
    }

    if (!victimAccountId.trim()) {
      newErrors.victimAccountId = "Please enter the victim account ID.";
    }

    if (!transactionId.trim()) {
      newErrors.transactionId = "Please enter the transaction ID.";
    }

    if (!beneficiaryAccountId.trim()) {
      newErrors.beneficiaryAccountId =
        "Please enter the beneficiary account ID.";
    }

    if (beneficiaryUpiId.length > 100) {
      newErrors.beneficiaryUpiId =
        "Beneficiary UPI ID cannot exceed 100 characters.";
    }

    if (!complaintStatus) {
      newErrors.complaintStatus = "Please select a complaint status.";
    }

    if (!linkedFraudAccount) {
      newErrors.linkedFraudAccount =
        "Please select whether the account is linked to fraud.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintPayload = {
        fraud_type: fraudType,
        reported_amount: Number(reportedAmount),
        victim_account_id: victimAccountId.trim(),
        transaction_id: transactionId.trim(),
        beneficiary_account_id: beneficiaryAccountId.trim(),
        beneficiary_upi_id: beneficiaryUpiId.trim() || null,
        complaint_status: complaintStatus,
        linked_fraud_account: linkedFraudAccount === "Yes",
      };

      await createCase(complaintPayload);

      setSuccessMessage("Complaint registered successfully.");

      setFraudType("");
      setReportedAmount("");
      setVictimAccountId("");
      setTransactionId("");
      setBeneficiaryAccountId("");
      setBeneficiaryUpiId("");
      setComplaintStatus("UNDER_INVESTIGATION");
      setLinkedFraudAccount("No");
      setErrors({});

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error("Complaint submission failed:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to register complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                New Complaint
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Register a new cyber fraud complaint
              </p>
            </div>
          </div>
        </div>

        {/* Complaint Form */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Section Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FileText size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Complaint Details
                  </h2>

                  <p className="text-xs text-slate-500">
                    Enter the information required to register the complaint
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Fraud Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fraud Type <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={fraudType}
                      onChange={(e) => {
                        setFraudType(e.target.value);
                        clearError("fraudType");
                      }}
                      className={`${inputClass(
                        "fraudType"
                      )} appearance-none pr-10`}
                    >
                      <option value="">Select fraud type</option>

                      {FRAUD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  {errors.fraudType && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.fraudType}
                    </p>
                  )}
                </div>

                {/* Reported Amount */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reported Amount <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      min="0.01"
                      max="9999999999999.99"
                      step="0.01"
                      value={reportedAmount}
                      onChange={(e) => {
                        setReportedAmount(e.target.value);
                        clearError("reportedAmount");
                      }}
                      placeholder="Enter amount"
                      className={`${inputClass(
                        "reportedAmount"
                      )} pl-11`}
                    />
                  </div>

                  {errors.reportedAmount && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.reportedAmount}
                    </p>
                  )}
                </div>

                {/* Victim Account ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Victim Account ID{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      maxLength={100}
                      value={victimAccountId}
                      onChange={(e) => {
                        setVictimAccountId(e.target.value);
                        clearError("victimAccountId");
                      }}
                      placeholder="Enter victim account ID"
                      className={`${inputClass(
                        "victimAccountId"
                      )} pl-11`}
                    />
                  </div>

                  {errors.victimAccountId && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.victimAccountId}
                    </p>
                  )}
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Transaction ID{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Wallet
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      maxLength={100}
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        clearError("transactionId");
                      }}
                      placeholder="Enter transaction ID"
                      className={`${inputClass(
                        "transactionId"
                      )} pl-11`}
                    />
                  </div>

                  {errors.transactionId && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.transactionId}
                    </p>
                  )}
                </div>

                {/* Beneficiary Account ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Beneficiary Account ID{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Wallet
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      maxLength={100}
                      value={beneficiaryAccountId}
                      onChange={(e) => {
                        setBeneficiaryAccountId(e.target.value);
                        clearError("beneficiaryAccountId");
                      }}
                      placeholder="Enter beneficiary account ID"
                      className={`${inputClass(
                        "beneficiaryAccountId"
                      )} pl-11`}
                    />
                  </div>

                  {errors.beneficiaryAccountId && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.beneficiaryAccountId}
                    </p>
                  )}
                </div>

                {/* Beneficiary UPI ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Beneficiary UPI ID{" "}
                    <span className="text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">
                    <Link2
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      maxLength={100}
                      value={beneficiaryUpiId}
                      onChange={(e) => {
                        setBeneficiaryUpiId(e.target.value);
                        clearError("beneficiaryUpiId");
                      }}
                      placeholder="example@upi"
                      className={`${inputClass(
                        "beneficiaryUpiId"
                      )} pl-11`}
                    />
                  </div>

                  {errors.beneficiaryUpiId && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.beneficiaryUpiId}
                    </p>
                  )}
                </div>

                {/* Complaint Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Complaint Status{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={complaintStatus}
                      onChange={(e) => {
                        setComplaintStatus(e.target.value);
                        clearError("complaintStatus");
                      }}
                      className={`${inputClass(
                        "complaintStatus"
                      )} appearance-none pr-10`}
                    >
                      {COMPLAINT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  {errors.complaintStatus && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.complaintStatus}
                    </p>
                  )}
                </div>

                {/* Linked Fraud Account */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Linked Fraud Account{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      value={linkedFraudAccount}
                      onChange={(e) => {
                        setLinkedFraudAccount(e.target.value);
                        clearError("linkedFraudAccount");
                      }}
                      className={`${inputClass(
                        "linkedFraudAccount"
                      )} appearance-none pr-10`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  {errors.linkedFraudAccount && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={13} />
                      {errors.linkedFraudAccount}
                    </p>
                  )}
                </div>
              </div>

              {/* Backend Generated Fields */}
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <FileText
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Automatic Information
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Complaint ID and complaint date are generated
                      automatically by the backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 size={19} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">

              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Registering...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Register Complaint
                  </>
                )}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaintPage;