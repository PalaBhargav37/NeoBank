import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">🛡️ Admin Dashboard</h1>
          <p class="page-subtitle">System overview and management</p>
        </div>
        <div class="header-badge">
          <span class="live-dot"></span> Live
        </div>
      </div>

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner-dark" style="width:40px;height:40px;border-width:4px"></div>
          <span class="loading-text">Loading stats…</span>
        </div>
      } @else {
        <div class="stats-grid">
          <a routerLink="/admin/users" class="stat-card stat-blue sc-link">
            <div class="sc-icon">👥</div>
            <div class="sc-label">Total Users</div>
            <div class="sc-value">{{ stats()?.totalUsers || 0 }}</div>
            <div class="sc-sub">Registered accounts</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/admin/users" class="stat-card stat-green sc-link">
            <div class="sc-icon">✅</div>
            <div class="sc-label">Active Users</div>
            <div class="sc-value">{{ stats()?.activeUsers || 0 }}</div>
            <div class="sc-sub">Currently active</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/admin/accounts" class="stat-card stat-cyan sc-link">
            <div class="sc-icon">💳</div>
            <div class="sc-label">Total Accounts</div>
            <div class="sc-value">{{ stats()?.totalAccounts || 0 }}</div>
            <div class="sc-sub">All account records</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/admin/transactions" class="stat-card stat-orange sc-link">
            <div class="sc-icon">📊</div>
            <div class="sc-label">Transactions</div>
            <div class="sc-value">{{ stats()?.totalTransactions || 0 }}</div>
            <div class="sc-sub">All time</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/admin/loans" class="stat-card stat-purple sc-link">
            <div class="sc-icon">🏦</div>
            <div class="sc-label">Total Loans</div>
            <div class="sc-value">{{ stats()?.totalLoans || 0 }}</div>
            <div class="sc-sub">Loan applications</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/admin/loans" class="stat-card stat-red sc-link">
            <div class="sc-icon">⏳</div>
            <div class="sc-label">Pending Loans</div>
            <div class="sc-value">{{ stats()?.pendingLoans || 0 }}</div>
            <div class="sc-sub">Awaiting review</div>
            <span class="sc-arrow">→</span>
          </a>
        </div>

        <!-- Pending account requests alert -->
        @if ((stats()?.pendingAccounts || 0) > 0) {
          <div class="pending-alert">
            <span class="pa-icon">🔔</span>
            <div>
              <strong>{{ stats()!.pendingAccounts }} account request(s) awaiting approval</strong>
              <p>Customers are waiting for their accounts to be reviewed and approved.</p>
            </div>
            <a routerLink="/admin/accounts" class="btn btn-warning btn-sm">Review Now →</a>
          </div>
        }

        <div class="card" style="margin-top:1.5rem">
          <div class="card-title">⚡ Quick Navigation</div>
          <div class="quick-nav">
            <a routerLink="/admin/users" class="qn-card">
              <span class="qn-icon">👥</span>
              <span class="qn-label">Manage Users</span>
            </a>
            <a routerLink="/admin/accounts" class="qn-card qn-orange">
              <span class="qn-icon">💳</span>
              <span class="qn-label">Account Requests</span>
              @if ((stats()?.pendingAccounts || 0) > 0) {
                <span class="qn-badge">{{ stats()!.pendingAccounts }}</span>
              }
            </a>
            <a routerLink="/admin/loans" class="qn-card qn-purple">
              <span class="qn-icon">🏦</span>
              <span class="qn-label">Review Loans</span>
            </a>
            <a routerLink="/admin/transactions" class="qn-card qn-teal">
              <span class="qn-icon">📋</span>
              <span class="qn-label">Transactions</span>
            </a>
            <a routerLink="/admin/deposits" class="qn-card qn-green">
              <span class="qn-icon">⬇️</span>
              <span class="qn-label">Deposits</span>
            </a>
            <a routerLink="/admin/withdrawals" class="qn-card qn-red">
              <span class="qn-icon">⬆️</span>
              <span class="qn-label">Withdrawals</span>
            </a>
            <a routerLink="/admin/payments" class="qn-card qn-blue">
              <span class="qn-icon">💸</span>
              <span class="qn-label">Payments</span>
            </a>
            <a routerLink="/admin/system-health" class="qn-card qn-indigo">
              <span class="qn-icon">🖥️</span>
              <span class="qn-label">System Health</span>
            </a>
          </div>
        </div>

        <!-- ═══ PREMIUM ANALYTICS SECTION ═══ -->
        <div class="analytics-grid">
          <!-- Spending Analytics Donut -->
          <div class="an-card">
            <h3 class="an-title">Spending Analytics</h3>
            <div class="an-legend">
              @for (cat of spendingCategories; track cat.label) {
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
                <div class="dc-val">{{ stats()?.totalTransactions || 0 }}</div>
                <div class="dc-lbl">Total Txns</div>
              </div>
            </div>
          </div>

          <!-- Budget vs Actual Bar -->
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
                @for (b of budgetData(); track b.label) {
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

          <!-- Net Worth Progression -->
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
                  <polyline [attr.points]="netWorthLinePoints()" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linejoin="round" class="nw-line" />
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

          <!-- Reward Growth -->
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
    </div>
  `,
  styles: [`
    .header-badge { display:flex; align-items:center; gap:0.4rem; background:#ecfdf5; color:#059669; font-size:0.78rem; font-weight:700; padding:0.35rem 0.75rem; border-radius:20px; border:1px solid #6ee7b7; }
    .live-dot { width:7px; height:7px; background:#059669; border-radius:50%; animation:pulse 1.5s ease infinite; display:inline-block; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .stat-card { border:none !important; text-decoration:none; position:relative; overflow:hidden; }
    .stat-blue   { background:linear-gradient(135deg,#1a237e,#3949ab); color:white; }
    .stat-green  { background:linear-gradient(135deg,#047857,#059669); color:white; }
    .stat-cyan   { background:linear-gradient(135deg,#0077b6,#00b4d8); color:white; }
    .stat-orange { background:linear-gradient(135deg,#c2410c,#ea580c); color:white; }
    .stat-purple { background:linear-gradient(135deg,#6d28d9,#7c3aed); color:white; }
    .stat-red    { background:linear-gradient(135deg,#b91c1c,#dc2626); color:white; }
    .sc-icon  { font-size:2rem; margin-bottom:0.4rem; }
    .sc-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.82; }
    .sc-value { font-size:2rem; font-weight:800; line-height:1.1; margin:0.2rem 0; }
    .sc-sub   { font-size:0.72rem; opacity:0.7; }
    .sc-arrow { position:absolute; bottom:1rem; right:1rem; font-size:1.1rem; opacity:0;
      transition:all 0.2s ease; transform:translateX(-4px); }
    .sc-link { cursor:pointer; transition:transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease; }
    .sc-link:hover { transform:translateY(-5px) scale(1.02); box-shadow:0 16px 36px rgba(0,0,0,0.22) !important; }
    .sc-link:hover .sc-arrow { opacity:1; transform:translateX(0); }
    .sc-link::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.07); opacity:0; transition:opacity 0.2s; }
    .sc-link:hover::after { opacity:1; }

    /* Pending alert */
    .pending-alert { display:flex; align-items:center; gap:1rem; background:#fffbeb; border:2px solid #fcd34d; border-radius:14px; padding:1rem 1.25rem; margin-top:1.5rem; animation:slideDown 0.3s ease; flex-wrap:wrap; }
    .pa-icon { font-size:1.75rem; flex-shrink:0; animation:bell 2s ease infinite; }
    @keyframes bell { 0%,90%,100%{transform:rotate(0)} 95%{transform:rotate(15deg)} 97%{transform:rotate(-15deg)} }
    .pending-alert > div { flex:1; min-width:0; }
    .pending-alert strong { color:#92400e; font-size:0.95rem; }
    .pending-alert p { color:#a16207; font-size:0.82rem; margin-top:0.2rem; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

    /* Quick nav */
    .quick-nav { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; }
    .qn-card { display:flex; flex-direction:column; align-items:center; gap:0.5rem; padding:1.25rem; border-radius:14px; background:#f8f9fe; border:1.5px solid #e2e8f0; text-decoration:none; color:#1a237e; font-weight:600; font-size:0.85rem; transition:all 0.25s; position:relative; }
    .qn-card:hover { background:#eef2ff; border-color:#1a237e; transform:translateY(-3px); box-shadow:0 8px 20px rgba(26,35,126,0.12); }
    .qn-orange:hover { border-color:#d97706; color:#92400e; background:#fffbeb; }
    .qn-purple:hover { border-color:#7c3aed; color:#6d28d9; background:#f5f3ff; }
    .qn-teal:hover   { border-color:#0d9488; color:#0f766e; background:#f0fdfa; }
    .qn-green:hover  { border-color:#059669; color:#065f46; background:#f0fdf4; }
    .qn-red:hover    { border-color:#dc2626; color:#991b1b; background:#fff1f2; }
    .qn-blue:hover   { border-color:#2563eb; color:#1e40af; background:#eff6ff; }
    .qn-indigo:hover { border-color:#4f46e5; color:#3730a3; background:#eef2ff; }
    .qn-icon  { font-size:1.8rem; }
    .qn-label { text-align:center; }
    .qn-badge { position:absolute; top:-6px; right:-6px; background:#dc2626; color:white; font-size:0.65rem; font-weight:800; min-width:20px; height:20px; border-radius:10px; display:flex; align-items:center; justify-content:center; padding:0 5px; border:2px solid white; animation:bounceIn 0.5s ease; }
    @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }

    /* ═══ ANALYTICS CHARTS ═══ */
    .analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-top:1.5rem; }
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
    .dc-val { font-size:1.5rem; font-weight:800; color:white; }
    .dc-lbl { font-size:0.68rem; color:rgba(255,255,255,0.4); }

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
export class AdminDashboardComponent implements OnInit {
  private adminSvc = inject(AdminService);
  loading = signal(true);
  stats = signal<any>(null);
  allTransactions = signal<any[]>([]);

  spendingCategories = [
    { label: 'EMI Payment', color: '#3b82f6', pct: 35 },
    { label: 'Rent', color: '#22c55e', pct: 25 },
    { label: 'Recharge Payment', color: '#f59e0b', pct: 20 },
    { label: 'Bill Payment', color: '#ef4444', pct: 20 },
  ];

  // ── Donut segments ──
  donutSegs = computed(() => {
    const circ = 2 * Math.PI * 56;
    let offset = 0;
    return this.spendingCategories.map(c => {
      const seg = { label: c.label, color: c.color, dash: `${(c.pct / 100) * circ} ${circ}`, offset: `${-offset}` };
      offset += (c.pct / 100) * circ;
      return seg;
    });
  });

  // ── Budget vs Actual data ──
  budgetData = computed(() => {
    const cats = this.spendingCategories;
    const base = (this.stats()?.totalTransactions || 10) * 200;
    return cats.map(c => {
      const budget = Math.round(base * c.pct / 100 * 1.15);
      const actual = Math.round(base * c.pct / 100);
      const max = Math.max(budget, actual);
      return { label: c.label.split(' ')[0], budget, actual, budgetPct: Math.round(budget / (max * 1.1) * 100), actualPct: Math.round(actual / (max * 1.1) * 100) };
    });
  });
  budgetYAxis = computed(() => {
    const max = Math.max(...this.budgetData().flatMap(b => [b.budget, b.actual])) || 9000;
    return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].reverse();
  });

  // ── Net Worth Line ──
  monthLabels = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
  });
  netWorthValues = computed(() => {
    const base = -150000;
    return this.monthLabels().map((_, i) => base + i * (i + 1) * 5000 + Math.round(Math.random() * 3000));
  });
  netWorthPts = computed(() => {
    const data = this.netWorthValues();
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    return data.map((v, i) => ({ x: 40 + i * (420 / Math.max(1, data.length - 1)), y: 170 - ((v - min) / range) * 160 }));
  });
  netWorthLinePoints = computed(() => this.netWorthPts().map(p => `${p.x},${p.y}`).join(' '));
  netWorthYAxis = computed(() => {
    const data = this.netWorthValues();
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    return [max, Math.round(max - range * 0.25), Math.round(max - range * 0.5), Math.round(max - range * 0.75), min];
  });

  // ── Reward Growth ──
  rewardBars = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const val = Math.round(10 + (i + 1) * 8 + Math.random() * 10);
      return { label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, val, pct: 0 };
    }).map((r, _, arr) => ({ ...r, pct: Math.round((r.val / Math.max(...arr.map(x => x.val))) * 100) }));
  });
  rewardYAxis = computed(() => {
    const max = Math.max(...this.rewardBars().map(r => r.val));
    return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].reverse();
  });

  ngOnInit() {
    this.adminSvc.getDashboardStats().subscribe({
      next: (r) => { this.loading.set(false); if (r.success) this.stats.set(r.data); },
      error: () => this.loading.set(false)
    });
  }
}
