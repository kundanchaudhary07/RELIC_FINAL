export type UserRole = 'CYBERCRIME_INVESTIGATOR' | 'POLICE_OFFICER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeId: string;
  station: string;
  jurisdiction: string;
  avatar?: string;
  registeredPhoto?: string;
  department?: string;
  badgeNumber?: string;
  phoneNumber?: string;
  password?: string;
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'ACTIVE' | 'PROCESSING' | 'ANALYZED' | 'INTERCEPTED' | 'CLOSED';

export type FraudType = 
  | 'Digital Arrest Scam'
  | 'Investment / Task Scam'
  | 'Part-Time Job Fraud'
  | 'Loan App Extortion'
  | 'UPI Phishing / QR Swap'
  | 'SIM Swap / OTP Hijack'
  | 'Crypto Arbitrage Scam'
  | 'Impersonation / Sextortion';

export interface VictimInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface TransactionHop {
  hopNumber: number;
  hopType: 'VICTIM' | 'LAYER_1_MULE' | 'LAYER_2_MULE' | 'LAYER_3_MULE' | 'PREDICTED_CASHOUT';
  senderName: string;
  senderAccount: string;
  senderBank: string;
  senderIfsc: string;
  receiverName: string;
  receiverAccount: string;
  receiverBank: string;
  receiverIfsc: string;
  transactionId: string;
  amount: number;
  remainingBalance: number;
  timestamp: string;
  channel: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI' | 'ATM_PREDICTED';
  locationCity: string;
  locationState: string;
  notes?: string;
}

export interface AtmCandidate {
  id: string;
  rank: number;
  name: string;
  bank: string;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  withdrawalLikelihood: number; // percentage
  riskLevel: RiskLevel;
  predictionConfidence: number; // percentage
  latitude: number;
  longitude: number;
  operationalHours: string;
  surveillanceStatus?: string;
  nearbyLandmark?: string;
  historicalCaseId?: string;
  historicalCaseNumber?: string;
  historicalFraudType?: string;
  historicalLossAmount?: number;
  historicalDate?: string;
  historicalInterceptionStatus?: 'INTERCEPTED' | 'CASHOUT_CONFIRMED' | 'FLAGGED_PREVENTED' | 'ACTIVE_SURVEILLANCE';
}

export interface HistoricalScamAtm {
  id: string;
  name: string;
  bank: string;
  address: string;
  city: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  caseNumber: string;
  fraudType: FraudType | string;
  predictedLossAmount: number;
  interceptionStatus: 'INTERCEPTED' | 'CASHOUT_CONFIRMED' | 'FLAGGED_PREVENTED' | 'ACTIVE_SURVEILLANCE';
  predictedDate: string;
  withdrawalLikelihood: number;
  riskLevel: RiskLevel;
  syndicateName?: string;
  notes?: string;
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  uploadedBy: string;
  uploadedAt: string;
  caseId: string;
  status: 'VERIFIED' | 'PENDING' | 'ANALYZED';
  url?: string;
  category: 'FIR' | 'BANK_STATEMENT' | 'CHAT_SCREENSHOT' | 'TRANSACTION_RECEIPT' | 'AUDIO_LOG' | 'IDENTITY_PROOF';
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  assignedOfficer: string;
  assignedOfficerRole: UserRole;
  investigatorId?: string;
  investigatorBadge?: string;
  investigatorDepartment?: string;
  investigatorStation?: string;
  investigatorEmail?: string;
  investigatorPhoto?: string;
  analyzedBy?: {
    userId: string;
    name: string;
    badgeId?: string;
    role?: UserRole;
    department?: string;
    station?: string;
    email?: string;
    photo?: string;
    analyzedAt?: string;
  };
  
  // Victim & Fraud Details
  victim: VictimInfo;
  fraudType: FraudType;
  reportedFraudAmount: number; // Authoritative starting amount
  incidentDate: string;
  incidentTime: string;
  transactionMode: string;
  
  // Primary Transaction
  initialTransactionId: string;
  initialSenderBank: string;
  initialReceiverBank: string;
  initialIfsc: string;
  initialUpiId?: string;
  
  // Geospatial Information
  incidentLocation: {
    address: string;
    city: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  
  // Predictive Cash-Out Intelligence
  predictedCashoutRegion: {
    city: string;
    district: string;
    state: string;
    confidencePercentage: number;
    predictedWindowHours: string;
    estimatedCashoutAmount: number;
    keySignals: string[];
    reasoning: string;
  };
  
  // Multi-hop Money Trail
  moneyTrail: TransactionHop[];
  
  // Potential ATM Candidates
  atmCandidates: AtmCandidate[];
  
  // AI Insights
  aiAnalysis: {
    summary: string;
    velocityScore: number; // 0 - 100
    muleNetworkRisk: number; // 0 - 100
    behavioralAnomalies: string[];
    geoDiscrepancies: string[];
    recommendedActionPlan: string[];
  };
  
  // Evidence
  evidenceFiles: EvidenceFile[];
  investigatorNotes: string;
}

export interface RiskZone {
  id: string;
  state: string;
  district: string;
  riskLevel: RiskLevel;
  totalComplaints: number;
  activeMoneyTrails: number;
  predictedCashoutHotspot: boolean;
  latitude: number;
  longitude: number;
  fraudTypes: string[];
}
