import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransferRequest } from '../models/transaction.model';
import { ApiResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/transactions';

  getMyTransactions(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(this.API);
  }

  getAccountTransactions(accountNumber: string): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.API}/account/${accountNumber}`);
  }

  transfer(req: TransferRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API}/transfer`, req);
  }
}
