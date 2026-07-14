export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Dashboard {
  totalBalance: number;
  totalAccounts: number;
  totalTransactions: number;
  pendingLoans: number;
  unreadNotifications: number;
  accounts: any[];
  recentTransactions: any[];
}
