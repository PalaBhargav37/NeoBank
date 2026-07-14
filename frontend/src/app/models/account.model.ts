export interface Account {
  id: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  balance: number;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED' | 'FROZEN' | 'CLOSED';
  currency: string;
  userId: number;
  ownerName: string;
  createdAt: string;
  // Bank details — populated after admin approval
  ifscCode?: string;
  micrCode?: string;
  branchName?: string;
  bankName?: string;
  branchCode?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AccountCreateRequest {
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  currency?: string;
}
