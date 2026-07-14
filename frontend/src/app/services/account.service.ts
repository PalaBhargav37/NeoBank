import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountCreateRequest } from '../models/account.model';
import { ApiResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/accounts';

  getAccounts(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(this.API);
  }

  getAccountById(id: number): Observable<ApiResponse<Account>> {
    return this.http.get<ApiResponse<Account>>(`${this.API}/${id}`);
  }

  createAccount(req: AccountCreateRequest): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(this.API, req);
  }

  deposit(id: number, amount: number, description?: string): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(`${this.API}/${id}/deposit`, { amount });
  }

  withdraw(id: number, amount: number, description?: string): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(`${this.API}/${id}/withdraw`, { amount });
  }
}
