import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  InvestigationCase,
  RiskZone,
  EvidenceFile,
  UserRole,
} from "../types";

const API_BASE_URL = "/api";

const COMPLAINTS_ENDPOINT = `${API_BASE_URL}/complaints`;

const LOCAL_CASES_STORAGE_KEY =
  "relic_created_complaints";

interface ComplaintUpdatePayload {
  fraudType?: string;
  reportedAmount?: number;
  victimAccountId?: string;
  transactionId?: string;
  beneficiaryAccountId?: string;
  beneficiaryUpiId?: string | null;
  status?: string;
  linkedFraudAccount?: boolean;
}

interface CaseContextType {
  cases: InvestigationCase[];
  selectedCase: InvestigationCase | null;
  riskZones: RiskZone[];
  loading: boolean;
  error: string | null;

  selectCaseById: (id: string) => void;

  createCase: (
    caseData: any
  ) => Promise<InvestigationCase>;

  updateCase: (
    caseId: string,
    updates: ComplaintUpdatePayload
  ) => Promise<InvestigationCase>;

  assignInvestigator: (
    caseId: string,
    officer: {
      name: string;
      id?: string;
      badgeId?: string;
      role?: UserRole;
      department?: string;
      station?: string;
      email?: string;
      photo?: string;
    }
  ) => Promise<InvestigationCase>;

  recordCaseAnalysis: (
    caseId: string,
    investigator: {
      name: string;
      id?: string;
      badgeId?: string;
      role?: UserRole;
      department?: string;
      station?: string;
      email?: string;
    },
    analysisSummary?: string
  ) => Promise<InvestigationCase>;

  addEvidenceToCase: (
    caseId: string,
    file: EvidenceFile
  ) => void;

  deleteEvidence: (
    caseId: string,
    evidenceId: string
  ) => void;

  updateCaseStatus: (
    caseId: string,
    status: InvestigationCase["status"]
  ) => void;

  refreshCases: () => Promise<void>;
}

const CaseContext =
  createContext<CaseContextType | undefined>(
    undefined
  );

const mapComplaintToCase = (
  complaint: any
): InvestigationCase => {
  const complaintId = String(
    complaint?.complaint_id ?? ""
  );

  const reportedAmount = Number(
    complaint?.reported_amount ?? 0
  );

  const complaintStatus =
    complaint?.complaint_status ||
    "UNDER_INVESTIGATION";

  const mappedCase: any = {
    ...complaint,

    id: complaintId,

    caseNumber: complaintId
      ? `COMPLAINT-${complaintId}`
      : undefined,

    title: complaint?.fraud_type
      ? `${complaint.fraud_type} Complaint`
      : "Cyber Fraud Complaint",

    createdAt:
      complaint?.complaint_date ||
      undefined,

    updatedAt:
      complaint?.complaint_date ||
      undefined,

    status: complaintStatus,

    fraudType:
      complaint?.fraud_type ||
      undefined,

    reportedAmount,

    reportedFraudAmount:
      reportedAmount,

    victimAccountId:
      complaint?.victim_account_id ||
      undefined,

    transactionId:
      complaint?.transaction_id ||
      undefined,

    beneficiaryAccountId:
      complaint?.beneficiary_account_id ||
      undefined,

    beneficiaryUpiId:
      complaint?.beneficiary_upi_id ||
      undefined,

    linkedFraudAccount:
      Boolean(
        complaint?.linked_fraud_account
      ),

    evidenceFiles:
      Array.isArray(
        complaint?.evidenceFiles
      )
        ? complaint.evidenceFiles
        : [],

    /*
     * These fields are intentionally undefined.
     * They are not provided by the current
     * Complaint backend model.
     */
    riskScore: undefined,
    riskLevel: undefined,
    aiAnalysis: undefined,
    moneyTrail: undefined,
    atmCandidates: undefined,
  };

  return mappedCase as InvestigationCase;
};

const readStoredCases =
  (): InvestigationCase[] => {
    try {
      const stored =
        localStorage.getItem(
          LOCAL_CASES_STORAGE_KEY
        );

      if (!stored) {
        return [];
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    } catch (error) {
      console.error(
        "Failed to read stored complaints:",
        error
      );

      return [];
    }
  };

const saveStoredCases = (
  cases: InvestigationCase[]
) => {
  try {
    localStorage.setItem(
      LOCAL_CASES_STORAGE_KEY,
      JSON.stringify(cases)
    );
  } catch (error) {
    console.error(
      "Failed to store complaints locally:",
      error
    );
  }
};

export const CaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  /*
   * Restore successfully created complaints
   * when the application starts.
   */
  const [cases, setCases] =
    useState<InvestigationCase[]>(
      () => readStoredCases()
    );

  const [selectedCase, setSelectedCase] =
    useState<InvestigationCase | null>(
      () => {
        const storedCases =
          readStoredCases();

        return storedCases.length > 0
          ? storedCases[0]
          : null;
      }
    );

  /*
   * There is currently no real risk-zone
   * endpoint being used by this context.
   *
   * Therefore keep this empty instead of
   * loading mock risk-zone data.
   */
  const [riskZones] =
    useState<RiskZone[]>([]);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const getAuthHeaders = (): HeadersInit => {
    const token =
      localStorage.getItem(
        "relic_access_token"
      );

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    return headers;
  };

  const getBackendError = (
    data: any,
    fallback: string
  ): string => {
    if (
      typeof data?.detail === "string"
    ) {
      return data.detail;
    }

    if (
      typeof data?.message === "string"
    ) {
      return data.message;
    }

    if (
      Array.isArray(data?.detail)
    ) {
      return data.detail
        .map(
          (item: any) =>
            item?.msg ||
            String(item)
        )
        .join(", ");
    }

    return fallback;
  };

  /*
   * Merge backend complaints with complaints
   * already created during this frontend session.
   *
   * Backend data takes precedence when the
   * same complaint_id exists.
   */
  const mergeCases = (
    backendCases: InvestigationCase[],
    currentCases: InvestigationCase[]
  ): InvestigationCase[] => {
    const merged = new Map<
      string,
      InvestigationCase
    >();

    currentCases.forEach((item) => {
      if (item.id) {
        merged.set(item.id, item);
      }
    });

    backendCases.forEach((item) => {
      if (item.id) {
        merged.set(item.id, item);
      }
    });

    return Array.from(
      merged.values()
    ).sort((a, b) => {
      const dateA = new Date(
        String(
          a.createdAt || ""
        )
      ).getTime();

      const dateB = new Date(
        String(
          b.createdAt || ""
        )
      ).getTime();

      return dateB - dateA;
    });
  };

  /*
   * Fetch complaints from the backend.
   *
   * IMPORTANT:
   * This function is NOT automatically called
   * when the application starts because the
   * current deployed GET /complaints endpoint
   * is failing due to the backend response/CORS
   * issue.
   *
   * It remains available through refreshCases().
   */
  const fetchCasesFromBackend =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          COMPLAINTS_ENDPOINT,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        let data: any = null;

        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          throw new Error(
            getBackendError(
              data,
              `Failed to fetch complaints from server (${res.status})`
            )
          );
        }

        let backendComplaints: any[] =
          [];

        if (Array.isArray(data)) {
          backendComplaints = data;
        } else if (
          Array.isArray(
            data?.complaints
          )
        ) {
          backendComplaints =
            data.complaints;
        } else if (
          Array.isArray(data?.data)
        ) {
          backendComplaints =
            data.data;
        }

        const backendCases =
          backendComplaints.map(
            mapComplaintToCase
          );

        setCases((currentCases) => {
          const mergedCases =
            mergeCases(
              backendCases,
              currentCases
            );

          saveStoredCases(
            mergedCases
          );

          return mergedCases;
        });

        setSelectedCase(
          (currentSelected) => {
            const allCases =
              mergeCases(
                backendCases,
                readStoredCases()
              );

            if (
              currentSelected
            ) {
              const selected =
                allCases.find(
                  (item) =>
                    item.id ===
                      currentSelected.id ||
                    item.caseNumber ===
                      currentSelected.caseNumber
                );

              if (selected) {
                return selected;
              }
            }

            return allCases.length > 0
              ? allCases[0]
              : null;
          }
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to fetch complaints from the backend.";

        console.error(
          "Backend complaints fetch failed:",
          err
        );

        /*
         * IMPORTANT:
         *
         * Do NOT clear cases here.
         *
         * Existing complaints created through
         * POST /complaints must remain visible.
         */
        setError(message);
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * Load complaints from the backend when the
   * application starts.
   */
  useEffect(() => {
    fetchCasesFromBackend();
  }, [fetchCasesFromBackend]);

  const selectCaseById = (
    id: string
  ) => {
    const found = cases.find(
      (c) =>
        c.id === id ||
        c.caseNumber === id
    );

    if (found) {
      setSelectedCase(found);
    }
  };

  /*
   * CREATE COMPLAINT
   *
   * This is the main working complaint flow.
   *
   * POST /complaints
   *       ↓
   * backend saves complaint
   *       ↓
   * backend returns complaint
   *       ↓
   * mapComplaintToCase()
   *       ↓
   * update React state
   *       ↓
   * persist locally
   */
  const createCase = async (
    caseData: any
  ): Promise<InvestigationCase> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        COMPLAINTS_ENDPOINT,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(
            caseData
          ),
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          getBackendError(
            data,
            `Failed to register complaint (${res.status})`
          )
        );
      }

      /*
       * Support the possible response shapes:
       *
       * {
       *   complaint: {...}
       * }
       *
       * {
       *   data: {...}
       * }
       *
       * or direct complaint object.
       */
      const complaint =
        data?.complaint ||
        data?.data ||
        data;

      if (
        !complaint ||
        typeof complaint !== "object"
      ) {
        throw new Error(
          "Backend returned an empty complaint response."
        );
      }

      const created =
        mapComplaintToCase(
          complaint
        );

      /*
       * Backend should generate complaint_id.
       * Do not create a fake ID on the frontend.
       */
      if (!created.id) {
        throw new Error(
          "Complaint was created but the backend did not return a complaint_id."
        );
      }

      /*
       * Add the newly created complaint
       * immediately to the shared case state.
       */
      setCases((prev) => {
        const withoutDuplicate =
          prev.filter(
            (item) =>
              item.id !== created.id
          );

        const updatedCases = [
          created,
          ...withoutDuplicate,
        ];

        /*
         * Persist only real complaints returned
         * by the backend.
         */
        saveStoredCases(
          updatedCases
        );

        return updatedCases;
      });

      /*
       * Make the newly created complaint
       * the selected case.
       */
      setSelectedCase(created);

      return created;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to register complaint.";

      console.error(
        "Complaint creation failed:",
        err
      );

      setError(message);

      throw err instanceof Error
        ? err
        : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * The current backend router does not expose
   * PUT /complaints/{complaint_id}.
   *
   * Therefore we do not send a fake PUT request.
   */
  const updateCase = async (
    caseId: string,
    _updates: ComplaintUpdatePayload
  ): Promise<InvestigationCase> => {
    const existingCase =
      cases.find(
        (c) =>
          c.id === caseId ||
          c.caseNumber === caseId
      );

    if (!existingCase) {
      const errorMessage =
        "Complaint not found in the current application state.";

      setError(errorMessage);

      throw new Error(
        errorMessage
      );
    }

    const errorMessage =
      "Complaint updates are not available because the current backend does not provide an update endpoint.";

    setError(errorMessage);

    throw new Error(
      errorMessage
    );
  };

  /*
   * Investigator assignment is not stored
   * because the current Complaint backend model
   * does not contain investigator fields.
   */
  const assignInvestigator = async (
    caseId: string,
    _officer: {
      name: string;
      id?: string;
      badgeId?: string;
      role?: UserRole;
      department?: string;
      station?: string;
      email?: string;
      photo?: string;
    }
  ): Promise<InvestigationCase> => {
    const found =
      cases.find(
        (c) =>
          c.id === caseId ||
          c.caseNumber === caseId
      );

    if (!found) {
      throw new Error(
        "The complaint could not be found in the current application state."
      );
    }

    return found;
  };

  /*
   * AI analysis is not stored because the
   * current Complaint backend model does not
   * contain an AI analysis field.
   */
  const recordCaseAnalysis =
    async (
      caseId: string,
      _investigator: {
        name: string;
        id?: string;
        badgeId?: string;
        role?: UserRole;
        department?: string;
        station?: string;
        email?: string;
      },
      _analysisSummary?: string
    ): Promise<InvestigationCase> => {
      const found =
        cases.find(
          (c) =>
            c.id === caseId ||
            c.caseNumber === caseId
        );

      if (!found) {
        throw new Error(
          "The complaint could not be found in the current application state."
        );
      }

      return found;
    };

  /*
   * Evidence currently exists only in frontend
   * state because no evidence API has been
   * provided by the backend.
   */
  const addEvidenceToCase = (
    caseId: string,
    file: EvidenceFile
  ) => {
    setCases((prev) => {
      const updatedCases =
        prev.map((c) => {
          if (c.id !== caseId) {
            return c;
          }

          return {
            ...c,
            evidenceFiles: [
              ...(c.evidenceFiles || []),
              file,
            ],
          };
        });

      saveStoredCases(
        updatedCases
      );

      const updatedSelected =
        updatedCases.find(
          (c) => c.id === caseId
        );

      if (updatedSelected) {
        setSelectedCase(
          updatedSelected
        );
      }

      return updatedCases;
    });
  };

  const deleteEvidence = (
    caseId: string,
    evidenceId: string
  ) => {
    setCases((prev) => {
      const updatedCases =
        prev.map((c) => {
          if (c.id !== caseId) {
            return c;
          }

          return {
            ...c,
            evidenceFiles: (
              c.evidenceFiles || []
            ).filter(
              (e) =>
                e.id !== evidenceId
            ),
          };
        });

      saveStoredCases(
        updatedCases
      );

      const updatedSelected =
        updatedCases.find(
          (c) => c.id === caseId
        );

      if (updatedSelected) {
        setSelectedCase(
          updatedSelected
        );
      }

      return updatedCases;
    });
  };

  /*
   * Do not pretend status changes are persisted
   * because the current backend has no update
   * endpoint.
   */
  const updateCaseStatus = (
    caseId: string,
    _status: InvestigationCase["status"]
  ) => {
    const existingCase =
      cases.find(
        (c) =>
          c.id === caseId ||
          c.caseNumber === caseId
      );

    if (!existingCase) {
      setError(
        "Complaint not found in the current application state."
      );

      return;
    }

    setError(
      "Complaint status cannot be saved because the current backend does not provide an update endpoint."
    );
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        selectedCase,
        riskZones,
        loading,
        error,
        selectCaseById,
        createCase,
        updateCase,
        assignInvestigator,
        recordCaseAnalysis,
        addEvidenceToCase,
        deleteEvidence,
        updateCaseStatus,
        refreshCases:
          fetchCasesFromBackend,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context =
    useContext(CaseContext);

  if (!context) {
    throw new Error(
      "useCase must be used within a CaseProvider"
    );
  }

  return context;
};