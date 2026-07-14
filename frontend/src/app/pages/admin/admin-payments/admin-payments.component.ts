import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">💳 Payments</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">All transfer and bill payment records</p>
        </div>
        <div class="summary-badges">
          @for (s of stats(); track s.label) {
            <div class="sum-badge" [class]="s.cls">
              <span class="sb-val">{{ s.value }}</span>
              <span class="sb-lbl">{{ s.label }}</span>
            </div>
          }
        </div>
      </div>

      <div class="card" style="padding:1rem 1.25rem;margin-bottom:1.25rem">
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
          <input class="form-control" [ngModel]="search()" (ngModelChange)="search.set($event)"
            placeholder="🔍 Search payments..."
            style="max-width:300px" />
          <div class="type-tabs">
            <button class="tab-btn" [class.active]="typeFilter()==='ALL'"       (click)="typeFilter.set('ALL')">All</button>
            <button class="tab-btn" [class.active]="typeFilter()==='TRANSFER'"     (click)="typeFilter.set('TRANSFER')">↔ Transfers</button>
            <button class="tab-btn" [class.active]="typeFilter()==='BILL_PAYMENT'" (click)="typeFilter.set('BILL_PAYMENT')">🧾 Bills</button>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="card" style="padding:3rem;text-align:center">
          <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto"></div>
        </div>
      } @else if (!filtered().length) {
        <div class="card" style="padding:3rem;text-align:center;color:var(--text-muted)">
          <div style="font-size:3rem">💳</div>
          <div style="margin-top:0.75rem;font-weight:600">No payment records found</div>
        </div>
      } @else {
        <div class="card" style="overflow:hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of filtered(); track t.id) {
                <tr>
                  <td><span class="mono">{{ t.transactionId }}</span></td>
                  <td><span class="type-chip" [class]="typeChipClass(t.type)">{{ t.type }}</span></td>
                  <td class="acc-cell">{{ t.fromAccountNumber || '—' }}</td>
                  <td class="acc-cell">{{ t.toAccountNumber  || '—' }}</td>
                  <td><span class="amount">₹{{ t.amount | number:'1.2-2' }}</span></td>
                  <td>{{ t.description || '—' }}</td>
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
    .sum-badge.blue   { border-left:3px solid #3b82f6; }
    .sum-badge.purple { border-left:3px solid #8b5cf6; }
    .sum-badge.green  { border-left:3px solid #22c55e; }
    .sb-val { font-size:1.2rem; font-weight:700; color:#1e293b; }
    .sb-lbl { font-size:0.72rem; color:#64748b; }
    .type-tabs { display:flex; gap:0.4rem; }
    .tab-btn { padding:0.4rem 0.9rem; border:1.5px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; font-size:0.82rem; }
    .tab-btn.active { background:#3949ab; color:#fff; border-color:#3949ab; }
    .type-chip { padding:0.15rem 0.6rem; border-radius:20px; font-size:0.72rem; font-weight:600; }
    .type-chip.TRANSFER    { background:#eff6ff; color:#1d4ed8; }
    .type-chip.BILL_PAYMENT{ background:#faf5ff; color:#7c3aed; }
    .acc-cell { font-family:monospace; font-size:0.82rem; color:#475569; }
    .amount { font-weight:600; color:#1e293b; }
    .mono { font-family:monospace; font-size:0.78rem; color:#64748b; }
    .badge { padding:0.2rem 0.7rem; border-radius:20px; font-size:0.75rem; font-weight:600; }
    .badge.completed,.badge.success { background:#dcfce7; color:#15803d; }
    .badge.pending  { background:#fef9c3; color:#92400e; }
    .badge.failed   { background:#fee2e2; color:#b91c1c; }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  private adminSvc = inject(AdminService);

  loading    = signal(true);
  all        = signal<Transaction[]>([]);
  search     = signal('');
  typeFilter = signal<'ALL' | 'TRANSFER' | 'BILL_PAYMENT'>('ALL');

  payments = computed(() => this.all().filter(t => t.type === 'TRANSFER' || t.type === 'BILL_PAYMENT'));

  stats = computed(() => {
    const p = this.payments();
    return [
      { label:'Total Payments',    value: p.length,                                                  cls:'blue'   },
      { label:'Transfers',         value: p.filter(t => t.type === 'TRANSFER').length,               cls:'purple' },
      { label:'Bill Payments',     value: p.filter(t => t.type === 'BILL_PAYMENT').length,           cls:'green'  },
    ];
  });

  filtered = computed(() => {
    const q   = this.search().toLowerCase();
    const typ = this.typeFilter();
    return this.payments().filter(t =>
      (typ === 'ALL' || t.type === typ) &&
      (!q ||
        t.transactionId.toLowerCase().includes(q) ||
        (t.fromAccountNumber || '').toLowerCase().includes(q) ||
        (t.toAccountNumber   || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      )
    );
  });

  typeChipClass(type: string) { return type; }

  statusClass(s: string) {
    const v = (s || '').toLowerCase();
    if (v === 'completed' || v === 'success') return 'completed';
    if (v === 'pending') return 'pending';
    if (v === 'failed')  return 'failed';
    return '';
  }

  ngOnInit() {
    this.adminSvc.getAllTransactions().subscribe({
      next: r => { this.all.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
