import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent)
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent)
  },
  {
    path: 'transfer',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/transfer/transfer.component').then(m => m.TransferComponent)
  },
  {
    path: 'loans',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/loans/loans.component').then(m => m.LoansComponent)
  },
  {
    path: 'bills',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/bills/bills.component').then(m => m.BillsComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'deposit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/deposit/deposit.component').then(m => m.DepositComponent)
  },
  {
    path: 'withdraw',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/withdraw/withdraw.component').then(m => m.WithdrawComponent)
  },
  {
    path: 'make-payment',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/make-payment/make-payment.component').then(m => m.MakePaymentComponent)
  },
  {
    path: 'budget',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/budget/budget.component').then(m => m.BudgetComponent)
  },
  {
    path: 'rewards',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/rewards/rewards.component').then(m => m.RewardsComponent)
  },
  {
    path: 'insights',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/insights/insights.component').then(m => m.InsightsComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'loans',
        loadComponent: () => import('./pages/admin/admin-loans/admin-loans.component').then(m => m.AdminLoansComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/admin/admin-transactions/admin-transactions.component').then(m => m.AdminTransactionsComponent)
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/admin/admin-accounts/admin-accounts.component').then(m => m.AdminAccountsComponent)
      },
      {
        path: 'deposits',
        loadComponent: () => import('./pages/admin/admin-deposits/admin-deposits.component').then(m => m.AdminDepositsComponent)
      },
      {
        path: 'withdrawals',
        loadComponent: () => import('./pages/admin/admin-withdrawals/admin-withdrawals.component').then(m => m.AdminWithdrawalsComponent)
      },
      {
        path: 'bills',
        loadComponent: () => import('./pages/admin/admin-bills/admin-bills.component').then(m => m.AdminBillsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/admin/admin-payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'system-health',
        loadComponent: () => import('./pages/admin/admin-system-health/admin-system-health.component').then(m => m.AdminSystemHealthComponent)
      },
      {
        path: 'audit-log',
        loadComponent: () => import('./pages/admin/admin-audit-log/admin-audit-log.component').then(m => m.AdminAuditLogComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
