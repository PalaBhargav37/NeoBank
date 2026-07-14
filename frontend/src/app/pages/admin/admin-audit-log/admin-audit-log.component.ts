import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-admin-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">📜 Audit Log</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">Complete transaction audit trail — {{ filtered().length }} records</p>
        </div>
        <button class="export-btn" (click)="exportCsv()">📥 Export CSV</button>
      </div>

      <!-- Filters -->
      <div class="card filter-card">
        <div class="filter-row">
          <input class="form-control" [(ngModel)]="search"
            placeholder="🔍 Search by ID, account, description..."
            style="flex:1;min-width:220px;max-width:360px" />
          <select class="form-control" [(ngModel)]="typeFilter" style="max-width:160px">
            <option value="ALL">All Types</option>
            <option value="CREDIT">CREDIT</option>
            <option value="DEBIT">DEBIT</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="BILL_PAYMENT">BILL PAYMENT</option>
          </select>
          <select class="form-control" [(ngModel)]="statusFilter" style="max-width:150px">
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
          <button class="clear-btn" (click)="clearFilters()">✕ Clear</button>
        </div>
      </div>

      @if (loading()) {
        <div class="card" style="padding:3rem;text-align:center">
          <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto"></div>
        </div>
      } @else if (!filtered().length) {
        <div class="card" style="padding:3rem;text-align:center;color:var(--text-muted)">
          <div style="font-size:3rem">📜</div>
          <div style="margin-top:0.75rem;font-weight:600">No audit records match your filters</div>
        </div>
      } @else {
        <div class="card" style="overflow:hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              @for (t of paginated(); track t.id; let i = $index) {
                <tr>
                  <td class="row-num">{{ (page() - 1) * pageSize + i + 1 }}</td>
                  <td><span class="txn-id">{{ t.transactionId }}</span></td>
                  <td><span class="type-chip" [class]="t.type">{{ t.type }}</span></td>
                  <td class="acc">{{ t.fromAccountNumber || '—' }}</td>
                  <td class="acc">{{ t.toAccountNumber   || '—' }}</td>
                  <td><span class="amt" [class]="amtClass(t.type)">
                    {{ t.type === 'CREDIT' ? '+' : '-' }}₹{{ t.amount | number:'1.2-2' }}
                  </span></td>
                  <td>{{ t.description || '—' }}</td>
                  <td><span class="badge" [class]="statusClass(t.status)">{{ t.status }}</span></td>
                  <td class="ts">{{ t.createdAt | date:'dd MMM yy, hh:mm a' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="pg-btn" [disabled]="page() === 1" (click)="page.update(p => p-1)">‹ Prev</button>
            <span class="pg-info">Page {{ page() }} of {{ totalPages() }}</span>
            <button class="pg-btn" [disabled]="page() === totalPages()" (click)="page.update(p => p+1)">Next ›</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .export-btn { padding:0.5rem 1.1rem; background:#059669; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:600; }
    .filter-card { padding:1rem 1.25rem; margin-bottom:1.25rem; }
    .filter-row { display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; }
    .clear-btn { padding:0.45rem 0.9rem; border:1.5px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; font-size:0.82rem; color:#64748b; }
    .row-num { color:#94a3b8; font-size:0.8rem; }
    .txn-id { font-family:monospace; font-size:0.78rem; color:#64748b; }
    .type-chip { padding:0.15rem 0.55rem; border-radius:20px; font-size:0.7rem; font-weight:700; }
    .type-chip.CREDIT       { background:#dcfce7; color:#15803d; }
    .type-chip.DEBIT        { background:#fee2e2; color:#b91c1c; }
    .type-chip.TRANSFER     { background:#eff6ff; color:#1d4ed8; }
    .type-chip.BILL_PAYMENT { background:#faf5ff; color:#7c3aed; }
    .acc { font-family:monospace; font-size:0.8rem; color:#475569; }
    .amt { font-weight:600; }
    .amt.CREDIT { color:#16a34a; }
    .amt.DEBIT,.amt.TRANSFER,.amt.BILL_PAYMENT { color:#dc2626; }
    .ts { font-size:0.78rem; color:#94a3b8; white-space:nowrap; }
    .badge { padding:0.2rem 0.6rem; border-radius:20px; font-size:0.7rem; font-weight:600; }
    .badge.completed,.badge.success { background:#dcfce7; color:#15803d; }
    .badge.pending  { background:#fef9c3; color:#92400e; }
    .badge.failed   { background:#fee2e2; color:#b91c1c; }
    .pagination { display:flex; justify-content:center; align-items:center; gap:1rem; margin-top:1rem; }
    .pg-btn { padding:0.4rem 1rem; border:1.5px solid #e2e8f0; background:#fff; border-radius:8px; cursor:pointer; font-size:0.85rem; }
    .pg-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .pg-info { font-size:0.85rem; color:#64748b; }
  `]
})
export class AdminAuditLogComponent implements OnInit {
  private adminSvc = inject(AdminService);

  loading      = signal(true);
  all          = signal<Transaction[]>([]);
  search       = '';
  typeFilter   = 'ALL';
  statusFilter = 'ALL';
  page         = signal(1);
  pageSize     = 20;

  filtered = computed(() => {
    const q = this.search.toLowerCase();
    return this.all().filter(t => {
      if (this.typeFilter !== 'ALL'   && t.type   !== this.typeFilter)   return false;
      if (this.statusFilter !== 'ALL' && t.status !== this.statusFilter) return false;
      if (!q) return true;
      return (
        t.transactionId.toLowerCase().includes(q) ||
        (t.fromAccountNumber || '').toLowerCase().includes(q) ||
        (t.toAccountNumber   || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        String(t.id).includes(q)
      );
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  paginated  = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  amtClass(type: string) { return type; }
  statusClass(s: string) {
    const v = (s || '').toLowerCase();
    if (v === 'completed') return 'completed';
    if (v === 'pending')   return 'pending';
    if (v === 'failed')    return 'failed';
    return '';
  }

  clearFilters() { this.search = ''; this.typeFilter = 'ALL'; this.statusFilter = 'ALL'; this.page.set(1); }

  exportCsv() {
    const rows = ['ID,Transaction ID,Type,From,To,Amount,Description,Status,Date',
      ...this.filtered().map(t =>
        `${t.id},${t.transactionId},${t.type},${t.fromAccountNumber||''},${t.toAccountNumber||''},${t.amount},${t.description||''},${t.status},${t.createdAt}`
      )
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  ngOnInit() {
    this.adminSvc.getAllTransactions().subscribe({
      next: r => { this.all.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
