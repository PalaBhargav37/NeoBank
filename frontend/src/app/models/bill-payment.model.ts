export interface BillPayment {
  id: number;
  billType: string;
  provider: string;
  accountReference: string;
  billNumber: string;
  amount: number;
  status: string;
  paidAt: string;
}

export interface BillPaymentRequest {
  billType: string;
  provider: string;
  accountReference: string;
  billNumber: string;
  amount: number;
  fromAccountNumber: string;
}
