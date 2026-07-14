import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">💸 All Transactions</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">{{ transactions().length }} total records</p>
        </div>
        <div class="at-summary">
          <div class="at-stat" style="--sc:#10b981">
            <span class="at-stat-val">{{ countByType('CREDIT') }}</span>
            <span class="at-stat-lbl">Credits</span>
          </div>
          <div class="at-stat" style="--sc:#ef4444">
            <span class="at-stat-val">{{ countByType('DEBIT') }}</span>
            <span class="at-stat-lbl">Debits</span>
          </div>
          <div class="at-stat" style="--sc:#3b82f6">
            <span class="at-stat-val">{{ countByType('TRANSFER') }}</span>
            <span class="at-stat-lbl">Transfers</span>
          </div>
          <div class="at-stat" style="--sc:#f59e0b">
            <span class="at-stat-val">{{ countByType('BILL_PAYMENT') }}</span>
            <span class="at-stat-lbl">Bills</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:1.25rem;padding:1rem 1.25rem">
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
          <input class="form-control" [(ngModel)]="searchQuery" placeholder="🔍 Search by account or transaction ID..."
            style="max-width:320px" />
          <div class="at-type-tabs">
            <button class="att-btn" [class.active]="typeFilter === 'ALL'" (click)="typeFilter = 'ALL'">All</button>
            @for (t of txTypes; track t.val) {
              <button class="att-btn" [class.active]="typeFilter === t.val"
                      (click)="typeFilter = t.val" [style.--tc]="t.color">
                {{ t.icon }} {{ t.label }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- ═══ PREMIUM ANALYTICS CHARTS ═══ -->
      @if (!loading() && transactions().length) {
        <div class="analytics-grid">
          <!-- 1) Spending Analytics Donut -->
          <div class="an-card">
            <h3 class="an-title">Spending Analytics</h3>
            <div class="an-legend">
              @for (cat of spendingCats(); track cat.label) {
                <span class="an-leg-item"><span class="an-dot" [style.background]="cat.color"></span>{{ cat.label }}</span>
              }
            </div>
            <div class="donut-wrap">
              <svg viewBox="0 0 160 160" class="donut-svg">
                @for (seg of donutSegs(); track seg.label; let i = $index) {
                  <circle cx="80" cy="80" r="56" fill="none"
                    [attr.stroke]="seg.color" stroke-width="28"
                    [attr.stroke-dasharray]="seg.dash"
                    [attr.stroke-dashoffset]="seg.offset"
                    class="donut-seg" />
                }
                <circle cx="80" cy="80" r="42" fill="#0f172a" />
              </svg>
              <div class="donut-center">
                <div class="dc-val">₹{{ totalAmount() | number:'1.0-0' }}</div>
                <div class="dc-lbl">Total Volume</div>
              </div>
            </div>
          </div>

          <!-- 2) Budget vs Actual -->
          <div class="an-card">
            <h3 class="an-title">Budget vs Actual</h3>
            <div class="an-legend">
              <span class="an-leg-item"><span class="an-dot" style="background:#3b82f6"></span>Budget</span>
              <span class="an-leg-item"><span class="an-dot" style="background:#f59e0b"></span>Actual</span>
            </div>
            <div class="gbar-chart">
              <div class="gbc-y">
                @for (v of budgetYAxis(); track v) { <span>{{ v | number:'1.0-0' }}</span> }
              </div>
              <div class="gbc-main">
                @for (b of budgetVsActual(); track b.label) {
                  <div class="gbc-col">
                    <div class="gbc-pair">
                      <div class="gbc-b budget" [style.height.%]="b.budgetPct"></div>
                      <div class="gbc-b actual" [style.height.%]="b.actualPct"></div>
                    </div>
                    <span class="gbc-lbl">{{ b.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- 3) Net Worth Progression -->
          <div class="an-card">
            <h3 class="an-title">Net Worth Progression</h3>
            <div class="an-legend">
              <span class="an-leg-item"><span class="an-dot" style="background:#8b5cf6"></span>Net Worth</span>
            </div>
            <div class="line-chart">
              <div class="lc-y">
                @for (v of netWorthYAxis(); track v) { <span>{{ v | number:'1.0-0' }}</span> }
              </div>
              <div class="lc-main">
                <svg viewBox="0 0 500 180" preserveAspectRatio="none" class="lc-svg">
                  <polyline [attr.points]="netWorthLine()" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linejoin="round" class="nw-line" />
                  @for (pt of netWorthPts(); track pt.x) {
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#8b5cf6" stroke="#0f172a" stroke-width="2" />
                  }
                </svg>
                <div class="lc-x">
                  @for (l of monthLabels(); track l) { <span>{{ l }}</span> }
                </div>
              </div>
            </div>
          </div>

          <!-- 4) Reward Growth -->
          <div class="an-card">
            <h3 class="an-title">Reward Growth</h3>
            <div class="an-legend">
              <span class="an-leg-item"><span class="an-dot" style="background:#f59e0b"></span>Rewards</span>
            </div>
            <div class="rw-chart">
              <div class="rw-y">
                @for (v of rewardYAxis(); track v) { <span>{{ v }}</span> }
              </div>
              <div class="rw-main">
                @for (r of rewardBars(); track r.label) {
                  <div class="rw-col">
                    <div class="rw-bar" [style.height.%]="r.pct">
                      <span class="rw-tip">{{ r.val }}</span>
                    </div>
                    <span class="rw-lbl">{{ r.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="card" style="padding:2.5rem;text-align:center">
          <div class="spinner" style="width:40px;height:40px;border-width:4px;margin:0 auto"></div>
        </div>
      } @else if (!getFilteredTx().length) {
        <div class="card empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Transactions Found</h3>
          <p>No transactions match your current filter.</p>
        </div>
      } @else {
        <div class="card" style="overflow:hidden;padding:0">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>From Account</th>
                  <th>To Account</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of getFilteredTx(); track tx.id) {
                  <tr>
                    <td style="font-family:monospace;font-size:0.78rem;color:var(--text-muted)">
                      {{ tx.transactionId | slice:0:16 }}...
                    </td>
                    <td>
                      <span class="tx-type-pill" [attr.data-type]="tx.type">
                        {{ getTxIcon(tx.type) }} {{ tx.type | slice:0:8 }}
                      </span>
                    </td>
                    <td>
                      <span class="tx-amount" [attr.data-type]="tx.type">
                        {{ tx.type === 'CREDIT' ? '+' : '-' }}₹{{ tx.amount | number:'1.2-2' }}
                      </span>
                    </td>
                    <td style="font-family:monospace;font-size:0.8rem">{{ tx.fromAccountNumber || '—' }}</td>
                    <td style="font-family:monospace;font-size:0.8rem">{{ tx.toAccountNumber || '—' }}</td>
                    <td><span class="badge" [class]="getStatusBadge(tx.status)">{{ tx.status }}</span></td>
                    <td style="font-size:0.82rem;color:var(--text-muted)">{{ tx.createdAt | date:'d MMM, h:mm a' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div style="text-align:center;padding:0.6rem;color:var(--text-muted);font-size:0.82rem">
          Showing {{ getFilteredTx().length }} of {{ transactions().length }} transactions
        </div>
      }
    </div>
  `,
  styles: [`
    .at-summary { display:flex; gap:0.65rem; flex-wrap:wrap; }
    .at-stat { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-md);
      padding:0.5rem 0.9rem; text-align:center; border-top:3px solid var(--sc,var(--primary)); }
    .at-stat-val { display:block; font-size:1.1rem; font-weight:800; color:var(--sc,var(--primary)); }
    .at-stat-lbl { font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; }
    .at-type-tabs { display:flex; gap:0.4rem; flex-wrap:wrap; }
    .att-btn { padding:0.35rem 0.85rem; border-radius:20px; border:1.5px solid #e5e7eb; background:white;
      font-size:0.8rem; cursor:pointer; transition:all 0.2s; }
    .att-btn:hover { border-color:var(--tc,var(--primary)); color:var(--tc,var(--primary)); }
    .att-btn.active { background:var(--tc,var(--primary)); border-color:var(--tc,var(--primary)); color:white; font-weight:600; }
    .tx-type-pill { display:inline-flex; align-items:center; gap:0.25rem; padding:0.2rem 0.6rem;
      border-radius:20px; font-size:0.75rem; font-weight:600; background:#f3f4f6; color:var(--text-primary); }
    .tx-type-pill[data-type="CREDIT"] { background:#d1fae5; color:#065f46; }
    .tx-type-pill[data-type="DEBIT"] { background:#fee2e2; color:#991b1b; }
    .tx-type-pill[data-type="TRANSFER"] { background:#dbeafe; color:#1e40af; }
    .tx-type-pill[data-type="BILL_PAYMENT"] { background:#fef3c7; color:#92400e; }
    .tx-amount { font-weight:700; font-size:0.92rem; }
    .tx-amount[data-type="CREDIT"] { color:#10b981; }
    .tx-amount[data-type="DEBIT"] { color:#ef4444; }
    .tx-amount[data-type="TRANSFER"] { color:#3b82f6; }
    .tx-amount[data-type="BILL_PAYMENT"] { color:#f59e0b; }

    /* ═══ ANALYTICS CHARTS ═══ */
    .analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.5rem; }
    @media(max-width:900px) { .analytics-grid { grid-template-columns:1fr; } }
    .an-card {
      background:linear-gradient(145deg,#0f172a,#1e293b);
      border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:1.5rem;
      color:white; position:relative; overflow:hidden;
      animation:cardEntrance 0.5s ease backwards;
    }
    .an-card::before { content:''; position:absolute; top:-40px; right:-40px; width:130px; height:130px; border-radius:50%; background:rgba(59,130,246,0.06); pointer-events:none; }
    .an-title { font-size:1.05rem; font-weight:800; margin:0 0 0.5rem; color:#f1f5f9; }
    .an-legend { display:flex; gap:0.8rem; flex-wrap:wrap; margin-bottom:1rem; }
    .an-leg-item { display:flex; align-items:center; gap:0.35rem; font-size:0.72rem; color:rgba(255,255,255,0.55); }
    .an-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }

    /* Donut */
    .donut-wrap { position:relative; display:flex; align-items:center; justify-content:center; min-height:170px; }
    .donut-svg { width:170px; height:170px; transform:rotate(-90deg); }
    .donut-seg { animation:donutDraw 1s ease both; }
    @keyframes donutDraw { from{stroke-dasharray:0 352} }
    .donut-center { position:absolute; text-align:center; }
    .dc-val { font-size:1.1rem; font-weight:800; color:white; }
    .dc-lbl { font-size:0.65rem; color:rgba(255,255,255,0.4); }

    /* Grouped bar */
    .gbar-chart { display:flex; height:200px; }
    .gbc-y { display:flex; flex-direction:column; justify-content:space-between; padding-right:0.4rem; font-size:0.62rem; color:rgba(255,255,255,0.3); width:50px; text-align:right; }
    .gbc-main { display:flex; flex:1; align-items:flex-end; justify-content:space-around; border-left:1px solid rgba(255,255,255,0.08); border-bottom:1px solid rgba(255,255,255,0.08); padding:0 0.5rem; }
    .gbc-col { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; justify-content:flex-end; }
    .gbc-pair { display:flex; gap:3px; align-items:flex-end; height:85%; }
    .gbc-b { width:18px; border-radius:3px 3px 0 0; transition:height 0.6s ease; min-height:2px; }
    .gbc-b.budget { background:#3b82f6; }
    .gbc-b.actual { background:#f59e0b; }
    .gbc-lbl { font-size:0.62rem; color:rgba(255,255,255,0.4); margin-top:0.4rem; white-space:nowrap; }

    /* Line chart */
    .line-chart { display:flex; height:200px; }
    .lc-y { display:flex; flex-direction:column; justify-content:space-between; padding-right:0.4rem; font-size:0.62rem; color:rgba(255,255,255,0.3); width:60px; text-align:right; }
    .lc-main { flex:1; display:flex; flex-direction:column; border-left:1px solid rgba(255,255,255,0.08); border-bottom:1px solid rgba(255,255,255,0.08); }
    .lc-svg { flex:1; width:100%; }
    .nw-line { stroke-dasharray:1500; stroke-dashoffset:1500; animation:lineDraw 1.5s ease forwards; }
    @keyframes lineDraw { to{stroke-dashoffset:0} }
    .lc-x { display:flex; justify-content:space-between; font-size:0.62rem; color:rgba(255,255,255,0.35); padding:0.35rem 0.5rem 0; }

    /* Reward bar */
    .rw-chart { display:flex; height:200px; }
    .rw-y { display:flex; flex-direction:column; justify-content:space-between; padding-right:0.4rem; font-size:0.62rem; color:rgba(255,255,255,0.3); width:35px; text-align:right; }
    .rw-main { display:flex; flex:1; align-items:flex-end; justify-content:space-around; border-left:1px solid rgba(255,255,255,0.08); border-bottom:1px solid rgba(255,255,255,0.08); padding:0 1rem; }
    .rw-col { display:flex; flex-direction:column; align-items:center; flex:1; height:85%; justify-content:flex-end; }
    .rw-bar { width:55%; max-width:70px; border-radius:4px 4px 0 0; background:linear-gradient(to top,#f59e0b,#fbbf24); transition:height 0.8s cubic-bezier(0.34,1.2,0.64,1); position:relative; min-height:4px; }
    .rw-tip { position:absolute; top:-16px; left:50%; transform:translateX(-50%); font-size:0.62rem; font-weight:700; color:#fbbf24; white-space:nowrap; }
    .rw-lbl { font-size:0.62rem; color:rgba(255,255,255,0.4); margin-top:0.35rem; }
  `]
})
export class AdminTransactionsComponent implements OnInit {
  private adminSvc = inject(AdminService);
  loading = signal(true);
  transactions = signal<Transaction[]>([]);
  searchQuery = '';
  typeFilter = 'ALL';

  txTypes = [
    { val: 'CREDIT',       label: 'Credit',   icon: '📥', color: '#10b981' },
    { val: 'DEBIT',        label: 'Debit',    icon: '📤', color: '#ef4444' },
    { val: 'TRANSFER',     label: 'Transfer', icon: '🔁', color: '#3b82f6' },
    { val: 'BILL_PAYMENT', label: 'Bills',    icon: '🧾', color: '#f59e0b' },
  ];

  // ═══ ANALYTICS COMPUTED PROPERTIES ═══
  totalAmount = computed(() => this.transactions().reduce((s, t) => s + t.amount, 0));

  spendingCats = computed(() => {
    const txns = this.transactions();
    const total = txns.length || 1;
    const credits = txns.filter(t => t.type === 'CREDIT').length;
    const debits = txns.filter(t => t.type === 'DEBIT').length;
    const transfers = txns.filter(t => t.type === 'TRANSFER').length;
    const bills = txns.filter(t => t.type === 'BILL_PAYMENT').length;
    return [
      { label: 'EMI Payment', color: '#3b82f6', pct: Math.round((credits / total) * 100) || 25 },
      { label: 'Rent', color: '#22c55e', pct: Math.round((debits / total) * 100) || 25 },
      { label: 'Recharge Payment', color: '#f59e0b', pct: Math.round((transfers / total) * 100) || 25 },
      { label: 'Bill Payment', color: '#ef4444', pct: Math.round((bills / total) * 100) || 25 },
    ];
  });

  donutSegs = computed(() => {
    const circ = 2 * Math.PI * 56;
    let offset = 0;
    return this.spendingCats().map(c => {
      const seg = { label: c.label, color: c.color, dash: `${(c.pct / 100) * circ} ${circ}`, offset: `${-offset}` };
      offset += (c.pct / 100) * circ;
      return seg;
    });
  });

  // Month labels
  monthLabels = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
  });

  // Monthly transaction amounts
  monthlyAmounts = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const mt = this.transactions().filter(t => {
        const c = new Date(t.createdAt);
        return c.getFullYear() === yr && c.getMonth() === mo;
      });
      const income = mt.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
      const expense = mt.filter(t => t.type !== 'CREDIT').reduce((s, t) => s + t.amount, 0);
      return { income, expense };
    });
  });

  // Budget vs Actual
  budgetVsActual = computed(() => {
    const cats = this.spendingCats();
    const total = this.totalAmount() || 10000;
    return cats.map(c => {
      const actual = Math.round((c.pct / 100) * total);
      const budget = Math.round(actual * 1.15);
      const max = Math.max(budget, actual) || 1;
      return { label: c.label.split(' ')[0], budget, actual, budgetPct: Math.round((budget / (max * 1.1)) * 100), actualPct: Math.round((actual / (max * 1.1)) * 100) };
    });
  });

  budgetYAxis = computed(() => {
    const max = Math.max(...this.budgetVsActual().flatMap(b => [b.budget, b.actual])) || 9000;
    return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].reverse();
  });

  // Net Worth
  netWorthValues = computed(() => {
    let cumulative = 0;
    return this.monthlyAmounts().map(m => {
      cumulative += (m.income - m.expense);
      return cumulative;
    });
  });

  netWorthPts = computed(() => {
    const data = this.netWorthValues();
    const min = Math.min(0, ...data), max = Math.max(0, ...data);
    const range = max - min || 1;
    return data.map((v, i) => ({ x: 40 + i * (420 / Math.max(1, data.length - 1)), y: 170 - ((v - min) / range) * 160 }));
  });

  netWorthLine = computed(() => this.netWorthPts().map(p => `${p.x},${p.y}`).join(' '));

  netWorthYAxis = computed(() => {
    const data = this.netWorthValues();
    const min = Math.min(0, ...data), max = Math.max(0, ...data);
    const range = max - min || 1;
    return [max, Math.round(max - range * 0.25), Math.round(max - range * 0.5), Math.round(max - range * 0.75), min];
  });

  // Reward Growth
  rewardBars = computed(() => {
    const now = new Date();
    const bars = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const mt = this.transactions().filter(t => {
        const c = new Date(t.createdAt);
        return c.getFullYear() === yr && c.getMonth() === mo;
      });
      const val = mt.reduce((s, t) => s + Math.floor(t.amount / 100), 0);
      return { label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, val };
    });
    const maxVal = Math.max(1, ...bars.map(b => b.val));
    return bars.map(b => ({ ...b, pct: Math.round((b.val / maxVal) * 100) }));
  });

  rewardYAxis = computed(() => {
    const max = Math.max(1, ...this.rewardBars().map(r => r.val));
    return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].reverse();
  });

  // ═══ EXISTING METHODS ═══
  getFilteredTx(): Transaction[] {
    let list = this.transactions();
    if (this.typeFilter !== 'ALL') list = list.filter(t => t.type === this.typeFilter);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t =>
        (t.transactionId || '').toLowerCase().includes(q) ||
        (t.fromAccountNumber || '').includes(q) ||
        (t.toAccountNumber || '').includes(q)
      );
    }
    return list;
  }

  ngOnInit() {
    this.adminSvc.getAllTransactions().subscribe({
      next: (r) => { this.loading.set(false); if (r.success) this.transactions.set(r.data); },
      error: () => this.loading.set(false)
    });
  }

  countByType(t: string) { return this.transactions().filter(tx => tx.type === t).length; }

  getTxIcon(type: string) {
    return { CREDIT: '📥', DEBIT: '📤', TRANSFER: '🔁', BILL_PAYMENT: '🧾' }[type] || '💳';
  }

  getStatusBadge(s: string) {
    return { COMPLETED: 'badge-success', FAILED: 'badge-danger', PENDING: 'badge-warning', REVERSED: 'badge-secondary' }[s] || 'badge-secondary';
  }
}
