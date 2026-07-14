import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Dashboard } from '../../models/notification.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="page-title">Welcome back, <span class="name-accent">{{ userName() }}</span> 👋</h1>
          <p class="page-subtitle">{{ today }}</p>
        </div>
        <div class="header-badge">
          <span class="live-dot"></span> Live
        </div>
      </div>

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner-dark" style="width:40px;height:40px;border-width:4px"></div>
          <span class="loading-text">Loading your data…</span>
        </div>
      } @else if (dashboard()) {

        <!-- Clickable Stat Cards -->
        <div class="stats-grid">
          <a routerLink="/accounts" class="stat-card stat-blue sc-link">
            <div class="sc-icon">💰</div>
            <div class="sc-label">Total Balance</div>
            <div class="sc-value">₹{{ dashboard()!.totalBalance | number:'1.2-2' }}</div>
            <div class="sc-sub">Across all accounts</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/accounts" class="stat-card stat-cyan sc-link">
            <div class="sc-icon">💳</div>
            <div class="sc-label">Accounts</div>
            <div class="sc-value">{{ dashboard()!.totalAccounts }}</div>
            <div class="sc-sub">Active accounts</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/transactions" class="stat-card stat-green sc-link">
            <div class="sc-icon">📊</div>
            <div class="sc-label">Transactions</div>
            <div class="sc-value">{{ dashboard()!.totalTransactions }}</div>
            <div class="sc-sub">All time</div>
            <span class="sc-arrow">→</span>
          </a>
          <a routerLink="/notifications" class="stat-card stat-orange sc-link">
            <div class="sc-icon">🔔</div>
            <div class="sc-label">Notifications</div>
            <div class="sc-value">{{ dashboard()!.unreadNotifications }}</div>
            <div class="sc-sub">Unread alerts</div>
            <span class="sc-arrow">→</span>
          </a>
        </div>

        <!-- My Account Cards (bank card style) -->
        @if (activeAccounts().length) {
          <div class="section-header">
            <h2 class="section-title">💳 My Accounts</h2>
            <a routerLink="/accounts" class="see-all">View All →</a>
          </div>
          <div class="bank-cards-row">
            @for (acc of activeAccounts(); track acc.id) {
              <a routerLink="/accounts" class="bank-card" [class]="'bc-' + getAccColor(acc.accountType)">
                <!-- Background shimmer circles -->
                <div class="bc-circle bc-c1"></div>
                <div class="bc-circle bc-c2"></div>
                <!-- Top row -->
                <div class="bc-top">
                  <div class="bc-bank-name">🏦 NeoBank</div>
                  <div class="bc-type-badge">{{ acc.accountType }}</div>
                </div>
                <!-- Chip -->
                <div class="bc-chip">
                  <div class="bc-chip-inner"></div>
                </div>
                <!-- Account number -->
                <div class="bc-number">{{ acc.accountNumber }}</div>
                <!-- Bottom row -->
                <div class="bc-bottom">
                  <div>
                    <div class="bc-lbl">Available Balance</div>
                    <div class="bc-balance">₹{{ acc.balance | number:'1.2-2' }}</div>
                  </div>
                  <div class="bc-status-wrap">
                    <span class="bc-status" [class.bc-active]="acc.status === 'ACTIVE'">{{ acc.status }}</span>
                    <div class="bc-tap">Tap to view →</div>
                  </div>
                </div>
                <!-- Quick action buttons -->
                <div class="bc-actions">
                  <a routerLink="/deposit" (click)="$event.stopPropagation()" class="bc-action bc-dep">⬇ Deposit</a>
                  <a routerLink="/withdraw" (click)="$event.stopPropagation()" class="bc-action bc-wth">⬆ Withdraw</a>
                  <a routerLink="/transfer" (click)="$event.stopPropagation()" class="bc-action bc-trf">↔ Transfer</a>
                </div>
              </a>
            }
          </div>
        }

        <!-- Quick Actions -->
        <div class="card" style="margin-top:1.5rem">
          <div class="card-title">⚡ Quick Actions</div>
          <div class="qa-grid">
            <a routerLink="/transfer" class="qa-card qa-blue">
              <div class="qa-icon">💸</div>
              <div class="qa-label">Transfer Money</div>
              <div class="qa-desc">Send to any account</div>
              <span class="qa-arrow">→</span>
            </a>
            <a routerLink="/bills" class="qa-card qa-purple">
              <div class="qa-icon">🧾</div>
              <div class="qa-label">Pay Bills</div>
              <div class="qa-desc">Utilities & services</div>
              <span class="qa-arrow">→</span>
            </a>
            <a routerLink="/loans" class="qa-card qa-green">
              <div class="qa-icon">🏦</div>
              <div class="qa-label">Apply for Loan</div>
              <div class="qa-desc">Quick approval</div>
              <span class="qa-arrow">→</span>
            </a>
            <a routerLink="/accounts" class="qa-card qa-teal">
              <div class="qa-icon">💳</div>
              <div class="qa-label">My Accounts</div>
              <div class="qa-desc">View & manage</div>
              <span class="qa-arrow">→</span>
            </a>
            <a routerLink="/transactions" class="qa-card qa-orange">
              <div class="qa-icon">📋</div>
              <div class="qa-label">Transactions</div>
              <div class="qa-desc">History & details</div>
              <span class="qa-arrow">→</span>
            </a>
            <a routerLink="/notifications" class="qa-card qa-pink">
              <div class="qa-icon">🔔</div>
              <div class="qa-label">Notifications</div>
              <div class="qa-desc">Alerts & updates</div>
              <span class="qa-arrow">→</span>
            </a>
          </div>
        </div>

        <!-- Recent Transactions -->
        @if (dashboard()!.recentTransactions.length) {
          <div class="card" style="margin-top:1.5rem">
            <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
              <span>📊 Recent Transactions</span>
              <a routerLink="/transactions" class="see-all">View All →</a>
            </div>
            <div class="tx-list">
              @for (tx of dashboard()!.recentTransactions.slice(0,5); track tx.id) {
                <a routerLink="/transactions" class="tx-row">
                  <div class="tx-icon" [class]="getTxColor(tx.type)">
                    {{ getTxIcon(tx.type) }}
                  </div>
                  <div class="tx-info">
                    <div class="tx-type">{{ tx.type }}</div>
                    <div class="tx-date">{{ tx.createdAt | date:'MMM d, h:mm a' }}</div>
                  </div>
                  <div class="tx-right">
                    <div class="tx-amt" [class]="tx.type==='CREDIT'?'amt-credit':'amt-debit'">
                      {{ tx.type==='CREDIT' ? '+' : '-' }}₹{{ tx.amount | number:'1.2-2' }}
                    </div>
                    <span class="badge" [class]="getTxBadge(tx.status)">{{ tx.status }}</span>
                  </div>
                </a>
              }
            </div>
          </div>
        }

        <!-- Contact & Support -->
        <div class="support-section">
          <div class="support-header">
            <h2 class="section-title">📞 Contact & Support</h2>
            <span class="support-badge">24/7 Available</span>
          </div>
          <div class="support-grid">
            <div class="support-card sup-phone">
              <div class="sup-icon">📞</div>
              <div class="sup-info">
                <div class="sup-title">Phone Support</div>
                <div class="sup-detail">1800-123-4567 (Toll-Free)</div>
                <div class="sup-detail">+91 80 7327 77523</div>
              </div>
            </div>
            <div class="support-card sup-email">
              <div class="sup-icon">✉️</div>
              <div class="sup-info">
                <div class="sup-title">Email Support</div>
                <div class="sup-detail">support&#64;neobank.in</div>
                <div class="sup-detail">help&#64;neobank.in</div>
              </div>
            </div>
            <div class="support-card sup-location">
              <div class="sup-icon">📍</div>
              <div class="sup-info">
                <div class="sup-title">Head Office</div>
                <div class="sup-detail">NeoBank Tower, BKC</div>
                <div class="sup-detail">Mumbai 400051</div>
              </div>
            </div>
            <div class="support-card sup-chat">
              <div class="sup-icon">💬</div>
              <div class="sup-info">
                <div class="sup-title">Live Chat</div>
                <div class="sup-detail">Instant resolution</div>
                <div class="sup-detail">Available 24/7</div>
              </div>
            </div>
          </div>
          <div class="support-meta">
            <span class="sm-item"><strong>IFSC:</strong> NEOB0000001</span>
            <span class="sm-item"><strong>SWIFT:</strong> NEOBINBB</span>
            <span class="sm-item"><strong>RBI Lic:</strong> RBI/2020-21/DL-12345</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Header */
    .dash-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:1.75rem; animation:slideDown 0.3s ease; }
    .name-accent { color:#3949ab; }
    .header-badge { display:flex; align-items:center; gap:0.4rem; background:#ecfdf5; color:#059669; font-size:0.78rem; font-weight:700; padding:0.35rem 0.75rem; border-radius:20px; border:1px solid #6ee7b7; }
    .live-dot { width:7px; height:7px; background:#059669; border-radius:50%; animation:pulse 1.5s ease infinite; display:inline-block; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

    /* Clickable stat cards */
    .stat-card { border:none !important; text-decoration:none; position:relative; overflow:hidden; }
    .stat-blue  { background:linear-gradient(135deg,#1a237e,#3949ab); color:white; }
    .stat-cyan  { background:linear-gradient(135deg,#0077b6,#00b4d8); color:white; }
    .stat-green { background:linear-gradient(135deg,#047857,#059669); color:white; }
    .stat-orange{ background:linear-gradient(135deg,#c2410c,#ea580c); color:white; }
    .sc-icon { font-size:2rem; margin-bottom:0.5rem; }
    .sc-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.85; }
    .sc-value { font-size:1.9rem; font-weight:800; line-height:1; margin:0.25rem 0; animation:countUp 0.6s ease; }
    .sc-sub   { font-size:0.75rem; opacity:0.72; }
    .sc-arrow { position:absolute; bottom:1rem; right:1rem; font-size:1.1rem; opacity:0; transition:all 0.2s ease; transform:translateX(-4px); }
    .sc-link { cursor:pointer; transition:transform 0.25s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.25s ease; }
    .sc-link:hover { transform:translateY(-5px) scale(1.02); box-shadow:0 16px 36px rgba(0,0,0,0.2) !important; }
    .sc-link:hover .sc-arrow { opacity:1; transform:translateX(0); }
    @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    /* Section header */
    .section-header { display:flex; align-items:center; justify-content:space-between; margin:1.75rem 0 1rem; }
    .section-title { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0; }
    .see-all { font-size:0.82rem; color:#3949ab; font-weight:600; text-decoration:none; }
    .see-all:hover { text-decoration:underline; }

    /* Bank Cards */
    .bank-cards-row { display:flex; gap:1.25rem; overflow-x:auto; padding:0.25rem 0 0.75rem; scroll-snap-type:x mandatory; }
    .bank-card {
      min-width:300px; max-width:340px; border-radius:20px; padding:1.5rem;
      color:white; text-decoration:none; position:relative; overflow:hidden;
      display:flex; flex-direction:column; gap:0; cursor:pointer;
      scroll-snap-align:start; flex-shrink:0;
      transition:transform 0.3s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.3s ease;
      box-shadow:0 8px 24px rgba(0,0,0,0.18);
    }
    .bank-card:hover { transform:translateY(-6px) rotateX(2deg); box-shadow:0 20px 48px rgba(0,0,0,0.28); }
    /* Card color themes */
    .bc-blue   { background:linear-gradient(135deg,#1a237e 0%,#3949ab 50%,#5c6bc0 100%); }
    .bc-purple { background:linear-gradient(135deg,#4a148c 0%,#7b1fa2 50%,#9c27b0 100%); }
    .bc-green  { background:linear-gradient(135deg,#1b5e20 0%,#2e7d32 50%,#43a047 100%); }
    .bc-teal   { background:linear-gradient(135deg,#004d40 0%,#00695c 50%,#00897b 100%); }
    /* Shimmer circles */
    .bc-circle { position:absolute; border-radius:50%; background:rgba(255,255,255,0.07); }
    .bc-c1 { width:180px; height:180px; top:-60px; right:-50px; }
    .bc-c2 { width:120px; height:120px; bottom:-30px; left:-30px; }
    /* Card internals */
    .bc-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.2rem; position:relative; z-index:1; }
    .bc-bank-name { font-size:0.82rem; font-weight:700; letter-spacing:0.05em; opacity:0.9; }
    .bc-type-badge { font-size:0.65rem; font-weight:700; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.35); border-radius:20px; padding:0.2rem 0.6rem; letter-spacing:.06em; text-transform:uppercase; }
    .bc-chip { width:38px; height:28px; background:linear-gradient(135deg,#ffd700,#ffa000); border-radius:5px; margin-bottom:1rem; position:relative; z-index:1; }
    .bc-chip-inner { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:28px; height:18px; border:1.5px solid rgba(0,0,0,0.2); border-radius:3px; }
    .bc-number { font-family:monospace; font-size:0.92rem; font-weight:600; letter-spacing:0.12em; opacity:0.9; margin-bottom:1.2rem; position:relative; z-index:1; }
    .bc-bottom { display:flex; justify-content:space-between; align-items:flex-end; position:relative; z-index:1; }
    .bc-lbl { font-size:0.6rem; text-transform:uppercase; letter-spacing:.08em; opacity:0.65; margin-bottom:0.15rem; }
    .bc-balance { font-size:1.3rem; font-weight:800; }
    .bc-status-wrap { text-align:right; }
    .bc-status { font-size:0.65rem; font-weight:700; background:rgba(255,255,255,0.15); border-radius:20px; padding:0.18rem 0.55rem; border:1px solid rgba(255,255,255,0.3); }
    .bc-active { background:rgba(52,211,153,0.3); border-color:rgba(52,211,153,0.5); }
    .bc-tap { font-size:0.62rem; opacity:0; margin-top:0.35rem; transition:opacity 0.2s; }
    .bank-card:hover .bc-tap { opacity:0.8; }
    /* Action buttons on card */
    .bc-actions { display:flex; gap:0.5rem; margin-top:1rem; position:relative; z-index:1; }
    .bc-action { flex:1; text-align:center; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); border-radius:8px; padding:0.35rem 0.3rem; font-size:0.68rem; font-weight:700; color:white; text-decoration:none; transition:all 0.2s; backdrop-filter:blur(4px); }
    .bc-action:hover { background:rgba(255,255,255,0.28); transform:translateY(-1px); }

    /* Quick Actions */
    .qa-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; }
    .qa-card { display:flex; flex-direction:column; padding:1.25rem 1rem; border-radius:14px; text-decoration:none; position:relative; overflow:hidden; transition:all 0.28s cubic-bezier(0.34,1.4,0.64,1); border:1px solid transparent; }
    .qa-card:hover { transform:translateY(-5px) scale(1.02); box-shadow:0 12px 32px rgba(0,0,0,0.15); }
    .qa-icon  { font-size:1.8rem; margin-bottom:0.6rem; }
    .qa-label { font-size:0.88rem; font-weight:700; color:#0f172a; }
    .qa-desc  { font-size:0.75rem; color:#64748b; margin-top:0.15rem; }
    .qa-arrow { position:absolute; bottom:0.9rem; right:1rem; font-size:1rem; opacity:0; transition:all 0.2s; }
    .qa-card:hover .qa-arrow { opacity:1; transform:translateX(3px); }
    .qa-blue   { background:linear-gradient(135deg,#eff6ff,#dbeafe); border-color:#bfdbfe; }
    .qa-purple { background:linear-gradient(135deg,#f5f3ff,#ede9fe); border-color:#c4b5fd; }
    .qa-green  { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-color:#86efac; }
    .qa-teal   { background:linear-gradient(135deg,#f0fdfa,#ccfbf1); border-color:#5eead4; }
    .qa-orange { background:linear-gradient(135deg,#fff7ed,#ffedd5); border-color:#fdba74; }
    .qa-pink   { background:linear-gradient(135deg,#fdf4ff,#fae8ff); border-color:#e9d5ff; }

    /* Transaction rows */
    .tx-list { display:flex; flex-direction:column; gap:0.75rem; }
    .tx-row { display:flex; align-items:center; gap:0.9rem; padding:0.75rem; border-radius:10px; background:#f8f9fe; transition:background 0.15s; text-decoration:none; cursor:pointer; }
    .tx-row:hover { background:#eef2ff; }
    .tx-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
    .tx-icon.credit { background:#dcfce7; color:#059669; }
    .tx-icon.debit  { background:#fee2e2; color:#dc2626; }
    .tx-icon.other  { background:#f0f9ff; color:#0284c7; }
    .tx-info { flex:1; min-width:0; }
    .tx-type { font-size:0.82rem; font-weight:600; color:#0f172a; }
    .tx-date { font-size:0.72rem; color:#94a3b8; }
    .tx-right { text-align:right; }
    .tx-amt { font-size:0.9rem; font-weight:700; }
    .amt-credit { color:#059669; }
    .amt-debit  { color:#dc2626; }

    .btn-outline { background:transparent; color:#1a237e; border:1.5px solid #1a237e; }
    .btn-outline:hover { background:#1a237e; color:white; }

    /* Support Section */
    .support-section { margin-top:2rem; }
    .support-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .support-badge { font-size:0.72rem; font-weight:700; color:#059669; background:#ecfdf5; border:1px solid #6ee7b7; padding:0.25rem 0.7rem; border-radius:20px; }
    .support-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-bottom:1rem; }
    .support-card {
      display:flex; align-items:flex-start; gap:0.9rem; padding:1.2rem;
      border-radius:14px; border:1px solid #e2e8f0; background:white;
      transition:all 0.25s cubic-bezier(0.34,1.4,0.64,1);
    }
    .support-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
    .sup-phone { border-left:3px solid #3b82f6; }
    .sup-email { border-left:3px solid #8b5cf6; }
    .sup-location { border-left:3px solid #f59e0b; }
    .sup-chat { border-left:3px solid #10b981; }
    .sup-icon { font-size:1.6rem; flex-shrink:0; }
    .sup-info { min-width:0; }
    .sup-title { font-size:0.82rem; font-weight:700; color:#0f172a; margin-bottom:0.25rem; }
    .sup-detail { font-size:0.78rem; color:#64748b; line-height:1.6; }
    .support-meta {
      display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap;
      padding:0.8rem 1.2rem; border-radius:10px;
      background:#f8fafc; border:1px solid #e2e8f0;
    }
    .sm-item { font-size:0.75rem; color:#64748b; }
    .sm-item strong { color:#334155; }

    @media (max-width:768px) { .qa-grid { grid-template-columns:repeat(2,1fr); } .bank-cards-row { gap:1rem; } .bank-card { min-width:260px; } .support-grid { grid-template-columns:1fr 1fr; } .support-meta { gap:0.8rem; } }
    @media (max-width:480px) { .qa-grid { grid-template-columns:repeat(2,1fr); } .support-grid { grid-template-columns:1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardSvc = inject(DashboardService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  dashboard = signal<Dashboard | null>(null);
  today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  userName = () => this.auth.currentUser()?.firstName || 'User';

  ngOnInit() {
    this.dashboardSvc.getDashboard().subscribe({
      next: (res) => { this.loading.set(false); if (res.success) this.dashboard.set(res.data); },
      error: () => this.loading.set(false)
    });
  }

  /** Only show ACTIVE accounts on dashboard cards (hide REJECTED/INACTIVE/CLOSED) */
  activeAccounts() {
    return (this.dashboard()?.accounts ?? []).filter((a: any) => a.status === 'ACTIVE');
  }

  getBadgeClass(s: string) { return { 'badge-success':s==='ACTIVE','badge-danger':s==='FROZEN'||s==='CLOSED','badge-warning':s==='INACTIVE' }; }
  getTxBadge(s: string) { return { 'badge-success':s==='COMPLETED','badge-danger':s==='FAILED','badge-warning':s==='PENDING' }; }

  getAccIcon(t: string) { if(t==='SAVINGS') return '💰'; if(t==='CURRENT') return '🏧'; return '📈'; }
  getAccColor(t: string) { if(t==='SAVINGS') return 'blue'; if(t==='CURRENT') return 'purple'; return 'green'; }
  getTxIcon(t: string) { if(t==='CREDIT') return '↑'; if(t==='DEBIT') return '↓'; return '↔'; }
  getTxColor(t: string) { if(t==='CREDIT') return 'credit'; if(t==='DEBIT') return 'debit'; return 'other'; }
}
