import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-admin-deposits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">⬇️ Deposits</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">All customer deposit transactions</p>
        </div>
        <div class="summary-badges">
          <div class="sum-badge green">
            <span class="sb-val">{{ deposits().length }}</span>
            <span class="sb-lbl">Total Deposits</span>
          </div>
          <div class="sum-badge blue">
            <span class="sb-val">₹{{ totalAmount() | number:'1.0-0' }}</span>
            <span class="sb-lbl">Total Volume</span>
          </div>
        </div>
      </div>

      <div class="card" style="padding:1rem 1.25rem;margin-bottom:1.25rem">
        <input class="form-control" [ngModel]="search()" (ngModelChange)="search.set($event)"
          placeholder="🔍 Search by account number or transaction ID..."
          style="max-width:380px" />
      </div>

      @if (loading()) {
        <div class="card" style="padding:3rem;text-align:center">
          <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto"></div>
        </div>
      } @else if (!filtered().length) {
        <div class="card" style="padding:3rem;text-align:center;color:var(--text-muted)">
          <div style="font-size:3rem">⬇️</div>
          <div style="margin-top:0.75rem;font-weight:600">No deposit transactions found</div>
        </div>
      } @else {
        <div class="card" style="overflow:hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of filtered(); track t.id) {
                <tr>
                  <td><span class="mono">#{{ t.id }}</span></td>
                  <td>{{ t.toAccountNumber || t.fromAccountNumber || '—' }}</td>
                  <td><span class="amount-credit">+₹{{ t.amount | number:'1.2-2' }}</span></td>
                  <td>{{ t.description || 'Deposit' }}</td>
                  <td>{{ t.createdAt | date:'dd MMM yyyy, hh:mm a' }}</td>
                  <td><span class="badge" [class]="statusClass(t.status)">{{ t.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .summary-badges { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .sum-badge { display:flex; flex-direction:column; align-items:center; padding:0.6rem 1.2rem; border-radius:10px; background:#fff; border:1px solid #e2e8f0; }
    .sum-badge.green { border-left:3px solid #22c55e; }
    .sum-badge.blue  { border-left:3px solid #3b82f6; }
    .sb-val { font-size:1.2rem; font-weight:700; color:#1e293b; }
    .sb-lbl { font-size:0.72rem; color:#64748b; }
    .amount-credit { color:#16a34a; font-weight:600; }
    .mono { font-family:monospace; font-size:0.85rem; color:#64748b; }
    .badge { padding:0.2rem 0.7rem; border-radius:20px; font-size:0.75rem; font-weight:600; }
    .badge.completed,.badge.success { background:#dcfce7; color:#15803d; }
    .badge.pending  { background:#fef9c3; color:#92400e; }
    .badge.failed   { background:#fee2e2; color:#b91c1c; }
  `]
})
export class AdminDepositsComponent implements OnInit {
  private adminSvc = inject(AdminService);

  loading  = signal(true);
  all      = signal<Transaction[]>([]);
  search   = signal('');

  deposits = computed(() => this.all().filter(t => t.type === 'CREDIT'));
  totalAmount = computed(() => this.deposits().reduce((s, t) => s + (t.amount || 0), 0));
  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.deposits().filter(t =>
      !q ||
      String(t.id).includes(q) ||
      t.transactionId.toLowerCase().includes(q) ||
      (t.toAccountNumber   || '').toLowerCase().includes(q) ||
      (t.fromAccountNumber || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  statusClass(s: string) {
    if (!s) return '';
    const v = s.toLowerCase();
    if (v === 'completed' || v === 'success') return 'completed';
    if (v === 'pending')  return 'pending';
    if (v === 'failed')   return 'failed';
    return '';
  }

  ngOnInit() {
    this.adminSvc.getAllTransactions().subscribe({
      next: r => { this.all.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
