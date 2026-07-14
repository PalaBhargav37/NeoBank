export interface Transaction {
  id: number;
  transactionId: string;
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'BILL_PAYMENT';
  amount: number;
  description?: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  createdAt: string;
}

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}
