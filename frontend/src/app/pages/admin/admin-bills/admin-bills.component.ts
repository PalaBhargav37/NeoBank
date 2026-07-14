import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-admin-bills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">🧾 Bills Overview</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">All bill payment transactions across customers</p>
        </div>
        <div class="summary-badges">
          <div class="sum-badge teal">
            <span class="sb-val">{{ bills().length }}</span>
            <span class="sb-lbl">Total Bill Payments</span>
          </div>
          <div class="sum-badge purple">
            <span class="sb-val">₹{{ totalAmount() | number:'1.0-0' }}</span>
            <span class="sb-lbl">Total Paid</span>
          </div>
        </div>
      </div>

      <!-- Category Stats -->
      <div class="cat-row">
        @for (c of categoryStats(); track c.name) {
          <div class="cat-card">
            <span class="cat-icon">{{ c.icon }}</span>
            <div class="cat-name">{{ c.name }}</div>
            <div class="cat-count">{{ c.count }} txns</div>
            <div class="cat-amt">₹{{ c.total | number:'1.0-0' }}</div>
          </div>
        }
      </div>

      <div class="card" style="padding:1rem 1.25rem;margin-bottom:1.25rem">
        <input class="form-control" [ngModel]="search()" (ngModelChange)="search.set($event)"
          placeholder="🔍 Search by description or account..."
          style="max-width:380px" />
      </div>

      @if (loading()) {
        <div class="card" style="padding:3rem;text-align:center">
          <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto"></div>
        </div>
      } @else if (!filtered().length) {
        <div class="card" style="padding:3rem;text-align:center;color:var(--text-muted)">
          <div style="font-size:3rem">🧾</div>
          <div style="margin-top:0.75rem;font-weight:600">No bill payments found</div>
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
                  <td>{{ t.fromAccountNumber || t.toAccountNumber || '—' }}</td>
                  <td><span class="amount-bill">₹{{ t.amount | number:'1.2-2' }}</span></td>
                  <td>{{ t.description || 'Bill Payment' }}</td>
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
    .sum-badge.teal   { border-left:3px solid #06b6d4; }
    .sum-badge.purple { border-left:3px solid #8b5cf6; }
    .sb-val { font-size:1.2rem; font-weight:700; color:#1e293b; }
    .sb-lbl { font-size:0.72rem; color:#64748b; }
    .cat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:0.75rem; margin-bottom:1.25rem; }
    .cat-card { background:#fff; border-radius:12px; padding:0.9rem; box-shadow:0 1px 6px rgba(0,0,0,0.07); text-align:center; }
    .cat-icon { font-size:1.5rem; }
    .cat-name { font-size:0.78rem; font-weight:600; color:#1e293b; margin:0.3rem 0 0.15rem; }
    .cat-count { font-size:0.72rem; color:#64748b; }
    .cat-amt { font-size:0.88rem; font-weight:700; color:#3949ab; margin-top:0.2rem; }
    .amount-bill { color:#8b5cf6; font-weight:600; }
    .mono { font-family:monospace; font-size:0.85rem; color:#64748b; }
    .badge { padding:0.2rem 0.7rem; border-radius:20px; font-size:0.75rem; font-weight:600; }
    .badge.completed,.badge.success { background:#dcfce7; color:#15803d; }
    .badge.pending  { background:#fef9c3; color:#92400e; }
    .badge.failed   { background:#fee2e2; color:#b91c1c; }
  `]
})
export class AdminBillsComponent implements OnInit {
  private adminSvc = inject(AdminService);

  loading = signal(true);
  all     = signal<Transaction[]>([]);
  search  = signal('');

  bills       = computed(() => this.all().filter(t => t.type === 'BILL_PAYMENT'));
  totalAmount = computed(() => this.bills().reduce((s, t) => s + (t.amount || 0), 0));
  filtered    = computed(() => {
    const q = this.search().toLowerCase();
    return this.bills().filter(t =>
      !q ||
      String(t.id).includes(q) ||
      t.transactionId.toLowerCase().includes(q) ||
      (t.fromAccountNumber || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  categoryStats = computed(() => {
    const catMap: Record<string, { icon:string; count:number; total:number }> = {
      'Electricity': { icon:'💡', count:0, total:0 },
      'Water':       { icon:'💧', count:0, total:0 },
      'Internet':    { icon:'🌐', count:0, total:0 },
      'Mobile':      { icon:'📱', count:0, total:0 },
      'Other':       { icon:'📦', count:0, total:0 },
    };
    this.bills().forEach(t => {      const desc = (t.description || '').toLowerCase();
      let key = 'Other';
      if (desc.includes('electric') || desc.includes('power')) key = 'Electricity';
      else if (desc.includes('water')) key = 'Water';
      else if (desc.includes('internet') || desc.includes('broadband')) key = 'Internet';
      else if (desc.includes('mobile') || desc.includes('recharge') || desc.includes('phone')) key = 'Mobile';
      catMap[key].count++;
      catMap[key].total += t.amount || 0;
    });
    return Object.entries(catMap).map(([name, v]) => ({ name, ...v }));
  });

  statusClass(s: string) {
    if (!s) return '';
    const v = s.toLowerCase();
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
