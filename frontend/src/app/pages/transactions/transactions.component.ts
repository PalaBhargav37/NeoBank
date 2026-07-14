import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Transaction History</h1>
          <p class="page-subtitle">All your account activity</p>
        </div>
        <div class="tx-count" *ngIf="!loading()">
          <span class="count-badge">{{ transactions().length }} records</span>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner-dark" style="width:40px;height:40px;border-width:4px"></div>
          <span class="loading-text">Loading transactions…</span>
        </div>
      } @else if (!transactions().length) {
        <div class="card empty-state">
          <span class="empty-icon">📋</span>
          <h3>No transactions yet</h3>
          <p>Your transaction history will appear here</p>
        </div>
      } @else {
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th><th>Type</th><th>Amount</th>
                  <th>From Account</th><th>To Account</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id) {
                  <tr class="tx-row-anim">
                    <td>
                      <span class="mono-text">{{ tx.transactionId | slice:0:14 }}…</span>
                    </td>
                    <td>
                      <div class="tx-type-cell">
                        <span class="tx-dot" [class]="getDotClass(tx.type)"></span>
                        <span class="badge" [class]="getTypeBadge(tx.type)">{{ tx.type }}</span>
                      </div>
                    </td>
                    <td>
                      <strong [class]="tx.type==='CREDIT'?'amt-up':'amt-down'">
                        {{ tx.type==='CREDIT'?'+':'-' }}₹{{ tx.amount | number:'1.2-2' }}
                      </strong>
                    </td>
                    <td class="mono-text">{{ tx.fromAccountNumber || '—' }}</td>
                    <td class="mono-text">{{ tx.toAccountNumber || '—' }}</td>
                    <td><span class="badge" [class]="getStatusBadge(tx.status)">{{ tx.status }}</span></td>
                    <td class="date-cell">{{ tx.createdAt | date:'dd MMM, h:mm a' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tx-count { }
    .count-badge { background:#fff0e8; color:#C84010; font-size:0.8rem; font-weight:700; padding:0.35rem 0.85rem; border-radius:20px; border:1px solid #ffc9aa; }
    .mono-text { font-family:monospace; font-size:0.82rem; color:#475569; }
    .date-cell { font-size:0.82rem; color:#475569; white-space:nowrap; }
    .tx-type-cell { display:flex; align-items:center; gap:0.4rem; }
    .tx-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .dot-credit { background:#059669; }
    .dot-debit  { background:#dc2626; }
    .dot-other  { background:#2563eb; }
    .amt-up   { color:#059669; font-size:0.95rem; }
    .amt-down { color:#dc2626; font-size:0.95rem; }
  `]
})
export class TransactionsComponent implements OnInit {
  private txSvc = inject(TransactionService);
  loading = signal(true);
  transactions = signal<Transaction[]>([]);

  ngOnInit() {
    this.txSvc.getMyTransactions().subscribe({
      next: (res) => { this.loading.set(false); if (res.success) this.transactions.set(res.data); },
      error: () => this.loading.set(false)
    });
  }

  getTypeBadge(type: string) {
    return ({CREDIT:'badge-success',DEBIT:'badge-danger',TRANSFER:'badge-info',BILL_PAYMENT:'badge-warning'} as any)[type] || 'badge-secondary';
  }
  getStatusBadge(s: string) {
    return ({COMPLETED:'badge-success',FAILED:'badge-danger',PENDING:'badge-warning',REVERSED:'badge-secondary'} as any)[s] || 'badge-secondary';
  }
  getDotClass(type: string) {
    return ({CREDIT:'dot-credit',DEBIT:'dot-debit'} as any)[type] || 'dot-other';
  }
}
