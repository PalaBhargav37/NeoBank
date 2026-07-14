import { Component, inject, signal, computed, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { BillPaymentService } from '../../services/bill-payment.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">📈 Financial Insights</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">Smart analysis of your income & spending</p>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;gap:1rem;margin-bottom:1.5rem">
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:110px;flex:1;border-radius:var(--radius-lg)"></div>
          }
        </div>
      } @else {

        <!-- 3 Stat Cards -->
        <div class="ins-stats">
          <div class="ins-stat green">
            <div class="is-icon">💰</div>
            <div class="is-val">₹{{ totalIncome() | number:'1.0-0' }}</div>
            <div class="is-lbl">Total Income</div>
            <div class="is-sub">{{ creditCount() }} credit transactions</div>
          </div>
          <div class="ins-stat orange">
            <div class="is-icon">💸</div>
            <div class="is-val">₹{{ totalExpense() | number:'1.0-0' }}</div>
            <div class="is-lbl">Total Expense</div>
            <div class="is-sub">{{ debitCount() }} debit transactions</div>
          </div>
          <div class="ins-stat" [class.blue]="savings() >= 0" [class.red]="savings() < 0">
            <div class="is-icon">{{ savings() >= 0 ? '🏦' : '⚠️' }}</div>
            <div class="is-val">₹{{ savings() | number:'1.0-0' }}</div>
            <div class="is-lbl">Net Savings</div>
            <div class="is-sub">{{ savingsRate() }}% savings rate</div>
          </div>
        </div>

        <!-- ═══ PREMIUM ANALYTICS GRID (4 charts) ═══ -->
        <div class="chart-grid">

          <!-- 1) Spending Analytics (Donut Chart) -->
          <div class="chart-card">
            <h3 class="cc-title">Spending Analytics</h3>
            <div class="cc-legend-row">
              @for (cat of categoryBreakdown(); track cat.label) {
                <span class="legend-item">
                  <span class="leg-dot" [style.background]="cat.color"></span>
                  {{ cat.label }}
                </span>
              }
            </div>
            <div class="donut-wrap">
              <svg viewBox="0 0 160 160" class="donut-svg">
                @for (seg of donutSegments(); track seg.label; let i = $index) {
                  <circle cx="80" cy="80" r="56" fill="none"
                    [attr.stroke]="seg.color"
                    stroke-width="28"
                    [attr.stroke-dasharray]="seg.dash"
                    [attr.stroke-dashoffset]="seg.offset"
                    [style.animation-delay]="(i * 0.15) + 's'"
                    class="donut-seg" />
                }
                <circle cx="80" cy="80" r="42" fill="var(--surface, #fff)" />
              </svg>
              <div class="donut-center">
                <div class="dc-val">₹{{ totalExpense() | number:'1.0-0' }}</div>
                <div class="dc-lbl">Total Spent</div>
              </div>
            </div>
          </div>

          <!-- 2) Budget vs Actual (Grouped Bar Chart) -->
          <div class="chart-card">
            <h3 class="cc-title">Budget vs Actual</h3>
            <div class="cc-legend-row">
              <span class="legend-item"><span class="leg-dot" style="background:#3b82f6"></span>Budget</span>
              <span class="legend-item"><span class="leg-dot" style="background:#f59e0b"></span>Actual</span>
            </div>
            <div class="grouped-bar-chart">
              <div class="gbc-y-axis">
                @for (v of yAxisBudget(); track v) {
                  <span>{{ v | number:'1.0-0' }}</span>
                }
              </div>
              <div class="gbc-bars">
                @for (b of budgetVsActual(); track b.label) {
                  <div class="gbc-col">
                    <div class="gbc-bar-pair">
                      <div class="gbc-bar budget" [style.height.%]="barPct(b.budget, maxBudget())"></div>
                      <div class="gbc-bar actual" [style.height.%]="barPct(b.actual, maxBudget())"></div>
                    </div>
                    <span class="gbc-label">{{ b.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- 3) Net Worth Progression (Line Chart) -->
          <div class="chart-card">
            <h3 class="cc-title">Net Worth Progression</h3>
            <div class="cc-legend-row">
              <span class="legend-item"><span class="leg-dot" style="background:#8b5cf6"></span>Net Worth</span>
            </div>
            <div class="line-chart-wrap">
              <div class="lc-y-axis">
                @for (v of yAxisNetWorth(); track v) {
                  <span>{{ v | number:'1.0-0' }}</span>
                }
              </div>
              <div class="lc-area">
                <svg viewBox="0 0 500 200" preserveAspectRatio="none" class="lc-svg">
                  <polyline [attr.points]="netWorthLine()" class="nw-line" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linejoin="round" />
                  @for (pt of netWorthPoints(); track pt.x) {
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#8b5cf6" stroke="var(--surface,#fff)" stroke-width="2" />
                  }
                </svg>
                <div class="lc-x-labels">
                  @for (m of monthlyData(); track m.label) {
                    <span>{{ m.label }}</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- 4) Reward Growth (Bar Chart) -->
          <div class="chart-card">
            <h3 class="cc-title">Reward Growth</h3>
            <div class="cc-legend-row">
              <span class="legend-item"><span class="leg-dot" style="background:#f59e0b"></span>Rewards</span>
            </div>
            <div class="reward-chart">
              <div class="rc-y-axis">
                @for (v of yAxisRewards(); track v) {
                  <span>{{ v }}</span>
                }
              </div>
              <div class="rc-bars">
                @for (r of rewardDataWithPct(); track r.label) {
                  <div class="rc-col">
                    <div class="rc-bar" [style.height.%]="r.pct">
                      <span class="rc-tip">{{ r.value }}</span>
                    </div>
                    <span class="rc-label">{{ r.label }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Income vs Expense Monthly Bar Chart -->
        <div class="card" style="margin-top:1.5rem">
          <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:1.25rem">
            📊 Income vs Expense — Last 6 Months
          </div>
          @if (!transactions().length) {
            <div style="text-align:center;color:var(--text-muted);padding:2rem 0;font-size:0.9rem">
              No transaction data available yet.
            </div>
          } @else {
            <div class="bar-chart">
              @for (bar of monthlyData(); track bar.label) {
                <div class="bar-col">
                  <div class="bar-labels">
                    @if (bar.income > 0) {
                      <span class="btip income">₹{{ bar.income | number:'1.0-0' }}</span>
                    }
                    @if (bar.expense > 0) {
                      <span class="btip expense">₹{{ bar.expense | number:'1.0-0' }}</span>
                    }
                  </div>
                  <div class="bar-bars">
                    <div class="bar-income" [style.height.px]="barH(bar.income)"></div>
                    <div class="bar-expense" [style.height.px]="barH(bar.expense)"></div>
                  </div>
                  <div class="bar-month">{{ bar.label }}</div>
                </div>
              }
            </div>
            <div class="chart-legend">
              <span class="leg-i">■ Income</span>
              <span class="leg-e">■ Expense</span>
            </div>
          }
        </div>

        <!-- Two Columns: Breakdown + Recent -->
        <div class="ins-cols">
          <div class="card">
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem">
              💸 Spending Breakdown
            </div>
            @if (!categoryBreakdown().length) {
              <div style="color:var(--text-muted);font-size:0.88rem;padding:1.5rem 0;text-align:center">
                No spending data yet.
              </div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:0.9rem">
                @for (cat of categoryBreakdown(); track cat.label) {
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem">
                      <span style="font-size:0.88rem;color:var(--text-primary)">{{ cat.icon }} {{ cat.label }}</span>
                      <span style="font-size:0.84rem;font-weight:700;color:var(--text-primary)">
                        ₹{{ cat.amount | number:'1.0-0' }}
                        <span style="font-size:0.72rem;color:var(--text-muted);font-weight:400">&nbsp;{{ cat.pct }}%</span>
                      </span>
                    </div>
                    <div class="cat-track">
                      <div class="cat-fill" [style.width.%]="cat.pct" [style.background]="cat.color"></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="card">
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin-bottom:1rem">
              🕐 Recent Transactions
            </div>
            @if (!transactions().length) {
              <div style="color:var(--text-muted);font-size:0.88rem;padding:1.5rem 0;text-align:center">
                No transactions yet.
              </div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:0.25rem">
                @for (t of recentTxns(); track t.id) {
                  <div class="rt-row">
                    <div class="rt-icon" [class.credit]="t.type==='CREDIT'" [class.debit]="t.type!=='CREDIT'">
                      {{ t.type === 'CREDIT' ? '↓' : '↑' }}
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        {{ t.description || t.type }}
                      </div>
                      <div style="font-size:0.72rem;color:var(--text-muted)">{{ t.createdAt | date:'d MMM, h:mm a' }}</div>
                    </div>
                    <div style="font-weight:700;font-size:0.9rem;flex-shrink:0"
                         [style.color]="t.type==='CREDIT'?'#16a34a':'#dc2626'">
                      {{ t.type === 'CREDIT' ? '+' : '-' }}₹{{ t.amount | number:'1.0-0' }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } <!-- end @else -->
    </div>
  `,
  styles: [`
    .ins-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }
    @media(max-width:640px) { .ins-stats { grid-template-columns:1fr; } }
    .ins-stat { border-radius:var(--radius-lg); padding:1.5rem; border:1px solid var(--border); }
    .ins-stat.green  { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-color:#bbf7d0; }
    .ins-stat.orange { background:linear-gradient(135deg,#fffbeb,#fef3c7); border-color:#fde68a; }
    .ins-stat.blue   { background:linear-gradient(135deg,#eff6ff,#dbeafe); border-color:#bfdbfe; }
    .ins-stat.red    { background:linear-gradient(135deg,#fff1f2,#fee2e2); border-color:#fecaca; }
    .is-icon { font-size:1.75rem; margin-bottom:0.5rem; }
    .is-val  { font-size:2rem; font-weight:800; color:var(--text-primary); line-height:1; }
    .is-lbl  { font-size:0.88rem; font-weight:600; color:var(--text-muted); margin-top:0.4rem; }
    .is-sub  { font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem; }

    /* ═══ CHART GRID ═══ */
    .chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.5rem; }
    @media(max-width:900px) { .chart-grid { grid-template-columns:1fr; } }

    .chart-card {
      background:linear-gradient(145deg,#0f172a,#1e293b);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:16px; padding:1.5rem;
      color:white; position:relative; overflow:hidden;
      animation:cardEntrance 0.5s ease backwards;
    }
    .chart-card::before {
      content:''; position:absolute; top:-40px; right:-40px; width:140px; height:140px;
      border-radius:50%; background:rgba(59,130,246,0.06); pointer-events:none;
    }
    .cc-title { font-size:1.1rem; font-weight:800; margin:0 0 0.6rem; letter-spacing:-0.3px; }
    .cc-legend-row { display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; }
    .legend-item { display:flex; align-items:center; gap:0.4rem; font-size:0.75rem; color:rgba(255,255,255,0.6); }
    .leg-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }

    /* ── Donut Chart ── */
    .donut-wrap { position:relative; display:flex; align-items:center; justify-content:center; min-height:180px; }
    .donut-svg { width:180px; height:180px; transform:rotate(-90deg); }
    .donut-seg { animation:donutDraw 1s ease both; }
    @keyframes donutDraw { from{stroke-dasharray:0 352} }
    .donut-center { position:absolute; text-align:center; }
    .dc-val { font-size:1.2rem; font-weight:800; color:white; }
    .dc-lbl { font-size:0.68rem; color:rgba(255,255,255,0.45); }

    /* ── Grouped Bar Chart ── */
    .grouped-bar-chart { display:flex; gap:0; height:200px; }
    .gbc-y-axis { display:flex; flex-direction:column; justify-content:space-between; padding-right:0.5rem; font-size:0.65rem; color:rgba(255,255,255,0.35); width:50px; text-align:right; }
    .gbc-bars { display:flex; flex:1; align-items:flex-end; gap:0; justify-content:space-around; border-left:1px solid rgba(255,255,255,0.1); border-bottom:1px solid rgba(255,255,255,0.1); padding:0 0.5rem; }
    .gbc-col { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; justify-content:flex-end; }
    .gbc-bar-pair { display:flex; gap:3px; align-items:flex-end; height:85%; }
    .gbc-bar { width:20px; border-radius:3px 3px 0 0; transition:height 0.6s ease; min-height:2px; }
    .gbc-bar.budget { background:#3b82f6; }
    .gbc-bar.actual { background:#f59e0b; }
    .gbc-label { font-size:0.65rem; color:rgba(255,255,255,0.45); margin-top:0.4rem; white-space:nowrap; }

    /* ── Line Chart ── */
    .line-chart-wrap { display:flex; gap:0; height:200px; }
    .lc-y-axis { display:flex; flex-direction:column; justify-content:space-between; padding-right:0.5rem; font-size:0.65rem; color:rgba(255,255,255,0.35); width:60px; text-align:right; }
    .lc-area { flex:1; display:flex; flex-direction:column; position:relative; border-left:1px solid rgba(255,255,255,0.1); border-bottom:1px solid rgba(255,255,255,0.1); }
    .lc-svg { flex:1; width:100%; height:100%; }
    .nw-line { animation:lineDraw 1.5s ease both; stroke-dasharray:1500; stroke-dashoffset:1500; }
    @keyframes lineDraw { to { stroke-dashoffset:0; } }
    .lc-x-labels { display:flex; justify-content:space-between; font-size:0.65rem; color:rgba(255,255,255,0.4); padding:0.4rem 0.5rem 0; }

    /* ── Reward Bar Chart ── */
    .reward-chart { display:flex; gap:0; height:200px; }
    .rc-y-axis { display:flex; flex-direction:column; justify-content:space-between; padding-right:0.5rem; font-size:0.65rem; color:rgba(255,255,255,0.35); width:35px; text-align:right; }
    .rc-bars { display:flex; flex:1; align-items:flex-end; gap:0; justify-content:space-around; border-left:1px solid rgba(255,255,255,0.1); border-bottom:1px solid rgba(255,255,255,0.1); padding:0 1rem; }
    .rc-col { display:flex; flex-direction:column; align-items:center; flex:1; height:85%; justify-content:flex-end; }
    .rc-bar {
      width:60%; max-width:80px; border-radius:4px 4px 0 0;
      background:linear-gradient(to top,#f59e0b,#fbbf24);
      transition:height 0.8s cubic-bezier(0.34,1.2,0.64,1); position:relative;
      min-height:4px;
    }
    .rc-tip { position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:0.65rem; font-weight:700; color:#fbbf24; white-space:nowrap; }
    .rc-label { font-size:0.65rem; color:rgba(255,255,255,0.45); margin-top:0.4rem; }

    /* ── Original charts ── */
    .bar-chart { display:flex; align-items:flex-end; gap:1.25rem; min-height:200px; overflow-x:auto; padding-bottom:0.5rem; }
    .bar-col   { display:flex; flex-direction:column; align-items:center; min-width:64px; }
    .bar-labels { display:flex; flex-direction:column; gap:0.1rem; align-items:center; margin-bottom:0.4rem; min-height:40px; justify-content:flex-end; }
    .btip { font-size:0.64rem; white-space:nowrap; font-weight:600; }
    .btip.income  { color:#16a34a; }
    .btip.expense { color:#f59e0b; }
    .bar-bars { display:flex; gap:5px; align-items:flex-end; }
    .bar-income  { width:22px; background:linear-gradient(to top,#22c55e,#86efac); border-radius:4px 4px 0 0; min-height:4px; transition:height 0.5s ease; }
    .bar-expense { width:22px; background:linear-gradient(to top,#f59e0b,#fcd34d); border-radius:4px 4px 0 0; min-height:4px; transition:height 0.5s ease; }
    .bar-month { font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem; font-weight:500; }
    .chart-legend { display:flex; gap:1.5rem; margin-top:0.75rem; font-size:0.8rem; }
    .leg-i { color:#22c55e; font-weight:700; }
    .leg-e { color:#f59e0b; font-weight:700; }
    .ins-cols { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    @media(max-width:720px) { .ins-cols { grid-template-columns:1fr; } }
    .cat-track { height:7px; background:#f1f5f9; border-radius:10px; overflow:hidden; }
    .cat-fill  { height:100%; border-radius:10px; transition:width 0.5s; }
    .rt-row { display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0; border-bottom:1px solid #f1f5f9; }
    .rt-row:last-child { border-bottom:none; }
    .rt-icon { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700; flex-shrink:0; }
    .rt-icon.credit { background:#dcfce7; color:#16a34a; }
    .rt-icon.debit  { background:#fee2e2; color:#dc2626; }
  `]
})
export class InsightsComponent implements OnInit {
  private txnSvc  = inject(TransactionService);
  private billSvc = inject(BillPaymentService);

  loading      = signal(true);
  transactions = signal<Transaction[]>([]);
  bills        = signal<any[]>([]);

  done         = computed(() => this.transactions().filter(t => t.status === 'COMPLETED'));
  totalIncome  = computed(() => this.done().filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0));
  totalExpense = computed(() => this.done().filter(t => t.type !== 'CREDIT').reduce((s, t) => s + t.amount, 0));
  savings      = computed(() => this.totalIncome() - this.totalExpense());
  savingsRate  = computed(() => !this.totalIncome() ? 0 : Math.round(this.savings() / this.totalIncome() * 100));
  creditCount  = computed(() => this.done().filter(t => t.type === 'CREDIT').length);
  debitCount   = computed(() => this.done().filter(t => t.type !== 'CREDIT').length);
  recentTxns   = computed(() =>
    [...this.transactions()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
  );

  monthlyData = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d  = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const mt = this.done().filter(t => {
        const c = new Date(t.createdAt);
        return c.getFullYear() === yr && c.getMonth() === mo;
      });
      return {
        label:   d.toLocaleDateString('en-IN', { year:'numeric', month:'2-digit' }).replace(/\//g,'-'),
        income:  mt.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0),
        expense: mt.filter(t => t.type !== 'CREDIT').reduce((s, t) => s + t.amount, 0),
      };
    });
  });

  maxBar = computed(() => Math.max(1, ...this.monthlyData().flatMap(m => [m.income, m.expense])));
  barH(val: number): number { return Math.max(4, Math.round((val / this.maxBar()) * 150)); }

  catDefs = [
    { keys: ['emi','loan','instalment'],                                        label: 'EMI Payment',      icon: '🏦', color: '#3b82f6' },
    { keys: ['rent','house','flat'],                                            label: 'Rent',             icon: '🏠', color: '#22c55e' },
    { keys: ['recharge','mobile','dth','prepaid','postpaid'],                   label: 'Recharge Payment', icon: '📱', color: '#f59e0b' },
    { keys: ['bill','elect','water','gas','internet','broadband','utility'],    label: 'Bill Payment',     icon: '💡', color: '#ef4444' },
    { keys: ['food','eat','dining','restaurant','swiggy','zomato'],             label: 'Food',             icon: '🍽️', color: '#8b5cf6' },
    { keys: ['shop','amazon','flipkart','buy','purchase','mall'],               label: 'Shopping',         icon: '🛍️', color: '#06b6d4' },
    { keys: ['transfer','sent','fund','neft','rtgs','imps'],                    label: 'Transfers',        icon: '↔️', color: '#ec4899' },
  ];

  categoryBreakdown = computed(() => {
    const debits = this.done().filter(t => t.type !== 'CREDIT');
    const total  = debits.reduce((s, t) => s + t.amount, 0) || 1;
    const buckets: Record<string, number> = {};
    this.catDefs.forEach(c => buckets[c.label] = 0);
    buckets['Others'] = 0;
    debits.forEach(t => {
      const d   = (t.description || '').toLowerCase();
      const cat = this.catDefs.find(c => c.keys.some(k => d.includes(k)));
      buckets[cat ? cat.label : 'Others'] += t.amount;
    });
    return [
      ...this.catDefs.map(c => ({ label: c.label, icon: c.icon, color: c.color, amount: buckets[c.label], pct: Math.round(buckets[c.label] / total * 100) })),
      { label: 'Others', icon: '📦', color: '#94a3b8', amount: buckets['Others'], pct: Math.round(buckets['Others'] / total * 100) },
    ].filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  });

  // ═══ DONUT segments ═══
  donutSegments = computed(() => {
    const cats = this.categoryBreakdown();
    const circ = 2 * Math.PI * 56; // ~351.86
    let offset = 0;
    return cats.map(c => {
      const seg = { label: c.label, color: c.color, dash: `${(c.pct / 100) * circ} ${circ}`, offset: `${-offset}` };
      offset += (c.pct / 100) * circ;
      return seg;
    });
  });

  // ═══ Budget vs Actual ═══
  budgetVsActual = computed(() => {
    const cats = this.categoryBreakdown().slice(0, 4);
    return cats.map(c => ({
      label:  c.label.split(' ')[0],
      budget: Math.round(c.amount * 1.15),
      actual: c.amount,
    }));
  });
  maxBudget = computed(() => Math.max(1, ...this.budgetVsActual().flatMap(b => [b.budget, b.actual])));
  yAxisBudget = computed(() => {
    const max = this.maxBudget();
    return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].reverse();
  });
  barPct(val: number, max: number) { return Math.round((val / max) * 100); }

  // ═══ Net Worth ═══
  netWorthData = computed(() => {
    let cumulative = 0;
    return this.monthlyData().map(m => {
      cumulative += (m.income - m.expense);
      return cumulative;
    });
  });
  yAxisNetWorth = computed(() => {
    const data = this.netWorthData();
    const min = Math.min(0, ...data), max = Math.max(0, ...data);
    const range = max - min || 1;
    return [max, Math.round(max - range * 0.25), Math.round(max - range * 0.5), Math.round(max - range * 0.75), min];
  });
  netWorthPoints = computed(() => {
    const data = this.netWorthData();
    const min = Math.min(0, ...data), max = Math.max(0, ...data);
    const range = max - min || 1;
    return data.map((v, i) => ({
      x: 40 + i * (420 / Math.max(1, data.length - 1)),
      y: 190 - ((v - min) / range) * 180
    }));
  });
  netWorthLine = computed(() => this.netWorthPoints().map(p => `${p.x},${p.y}`).join(' '));

  // ═══ Reward Growth ═══
  rewardData = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const mt = this.done().filter(t => {
        const c = new Date(t.createdAt);
        return c.getFullYear() === yr && c.getMonth() === mo;
      });
      const pts = mt.reduce((s, t) => s + Math.floor(t.amount / 100), 0);
      return { label: d.toLocaleDateString('en-IN', { year:'numeric', month:'2-digit' }).replace(/\//g,'-'), value: pts };
    });
  });
  maxReward = computed(() => Math.max(1, ...this.rewardData().map(r => r.value)));
  rewardDataWithPct = computed(() => this.rewardData().map(r => ({ ...r, pct: Math.round((r.value / this.maxReward()) * 100) })));
  // alias
  get rewardDataComputed() { return this.rewardDataWithPct(); }
  yAxisRewards = computed(() => {
    const max = this.maxReward();
    return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].reverse();
  });

  ngOnInit() {
    this.txnSvc.getMyTransactions().subscribe({
      next:  r => { this.loading.set(false); if (r.success) this.transactions.set(r.data); },
      error: () => this.loading.set(false),
    });
    this.billSvc.getMyBills().subscribe({ next: r => { if (r.success) this.bills.set(r.data); } });
  }
}
