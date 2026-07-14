import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillPayment, BillPaymentRequest } from '../models/bill-payment.model';
import { ApiResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class BillPaymentService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:8080/api/bills';

  getMyBills(): Observable<ApiResponse<BillPayment[]>> {
    return this.http.get<ApiResponse<BillPayment[]>>(this.API);
  }

  payBill(req: BillPaymentRequest): Observable<ApiResponse<BillPayment>> {
    return this.http.post<ApiResponse<BillPayment>>(`${this.API}/pay`, req);
  }
}
