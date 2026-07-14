export type LoanType = 'PERSONAL' | 'HOME' | 'VEHICLE' | 'TWO_WHEELER' | 'EDUCATION' | 'BUSINESS' | 'GOLD' | 'MEDICAL' | 'AGRICULTURE' | 'CONSUMER_DURABLE';

export interface Loan {
  id: number;
  loanType: LoanType;
  requestedAmount: number;
  approvedAmount?: number;
  tenureMonths: number;
  interestRate?: number;
  monthlyEmi?: number;
  purpose?: string;
  remarks?: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CLOSED';
  userId: number;
  userName: string;
  appliedAt: string;
  reviewedAt?: string;
  paidEmis?: number;
  totalPaidAmount?: number;
}

export interface LoanApplicationRequest {
  loanType: LoanType;
  requestedAmount: number;
  tenureMonths: number;
  purpose?: string;
}
