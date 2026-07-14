import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/notification.model';
import { Loan } from '../models/loan.model';
import { Transaction } from '../models/transaction.model';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/admin';

  getDashboardStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API}/dashboard/stats`);
  }

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API}/users`);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API}/users/${id}`);
  }

  getUserAccounts(id: number): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(`${this.API}/users/${id}/accounts`);
  }

  updateUserStatus(id: number, status: string): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API}/users/${id}/status`, { status });
  }

  updateUser(id: number, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API}/users/${id}`, data);
  }

  getAllTransactions(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.API}/transactions`);
  }

  getAllLoans(): Observable<ApiResponse<Loan[]>> {
    return this.http.get<ApiResponse<Loan[]>>(`${this.API}/loans`);
  }

  updateLoanStatus(id: number, status: string, remarks: string): Observable<ApiResponse<Loan>> {
    return this.http.put<ApiResponse<Loan>>(`${this.API}/loans/${id}/status`, { status, remarks });
  }

  // ── Account Management ─────────────────────────────────────────
  getAllAccountRequests(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(`${this.API}/accounts`);
  }

  getPendingAccountRequests(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(`${this.API}/accounts/pending`);
  }

  approveAccount(id: number): Observable<ApiResponse<Account>> {
    return this.http.put<ApiResponse<Account>>(`${this.API}/accounts/${id}/approve`, {});
  }

  rejectAccount(id: number, reason: string): Observable<ApiResponse<Account>> {
    return this.http.put<ApiResponse<Account>>(`${this.API}/accounts/${id}/reject`, { reason });
  }

  // ── Admin Notifications ─────────────────────────────────────────
  getAdminNotifications(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API}/notifications`);
  }

  getAdminUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API}/notifications/unread-count`);
  }

  markAdminNotifRead(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API}/notifications/${id}/read`, {});
  }

  markAllAdminNotifsRead(): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API}/notifications/read-all`, {});
  }
}
