import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, LoanApplicationRequest } from '../models/loan.model';
import { ApiResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/loans';

  getMyLoans(): Observable<ApiResponse<Loan[]>> {
    return this.http.get<ApiResponse<Loan[]>>(this.API);
  }

  getLoanById(id: number): Observable<ApiResponse<Loan>> {
    return this.http.get<ApiResponse<Loan>>(`${this.API}/${id}`);
  }

  applyForLoan(req: LoanApplicationRequest): Observable<ApiResponse<Loan>> {
    return this.http.post<ApiResponse<Loan>>(`${this.API}/apply`, req);
  }

  payEmi(loanId: number, accountId: number, amount: number): Observable<ApiResponse<Loan>> {
    return this.http.post<ApiResponse<Loan>>(`${this.API}/${loanId}/pay-emi`, { accountId, amount });
  }
}
