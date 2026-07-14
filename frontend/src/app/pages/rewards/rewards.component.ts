import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillPaymentService } from '../../services/bill-payment.service';
import { TransactionService } from '../../services/transaction.service';
import { AccountService } from '../../services/account.service';
import { BillPayment } from '../../models/bill-payment.model';
import { Transaction } from '../../models/transaction.model';
import { Account } from '../../models/account.model';

interface EarnEntry   { date: string; reason: string; points: number; icon: string; }
interface RedeemEntry { pts: number; label: string; date: string; account?: string; }

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page-container">

      <div class="page-header">
        <div>
          <h1 class="page-title">🎁 My Rewards</h1>
          <p style="color:var(--text-muted,#64748b);margin:0;font-size:0.9rem">Earn points on every bill payment & transaction</p>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;flex-direction:column;gap:1rem">
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:100px;border-radius:var(--radius-lg,12px)"></div>
          }
        </div>
      } @else {

        <!-- Points Banner -->
        <div class="pts-banner">
          <div class="pb-left">
            <div class="pb-label">AVAILABLE REWARD POINTS</div>
            <div class="pb-pts">{{ availablePoints() | number }}</div>
            <div class="pb-sub">≈ ₹{{ (availablePoints() / 10) | number:'1.0-0' }} cashback value</div>
          </div>
          <div class="pb-right">
            <div class="tier-chip" [style.background]="tierBg()">{{ tier() }}</div>
            @if (tierNext() > 0) {
              <div class="pb-label" style="margin-top:0.6rem;font-size:0.72rem">
                {{ tierNext() | number }} pts to {{ nextTierLabel() }}
              </div>
              <div class="tier-bar-wrap">
                <div class="tier-bar">
                  <div class="tier-fill" [style.width.%]="tierProgress()"></div>
                </div>
              </div>
            } @else {
              <div class="pb-label" style="margin-top:0.6rem;font-size:0.78rem;color:#ffd700">
                🏆 Max Tier Achieved!
              </div>
            }
          </div>
        </div>

        <!-- Stats -->
        <div class="rw-stats">
          <div class="rw-stat">
            <div class="rs-icon">⭐</div>
            <div class="rs-val">{{ totalPoints() | number }}</div>
            <div class="rs-lbl">Total Earned</div>
          </div>
          <div class="rw-stat">
            <div class="rs-icon">💳</div>
            <div class="rs-val">{{ billPoints() | number }}</div>
            <div class="rs-lbl">From Bills</div>
          </div>
          <div class="rw-stat">
            <div class="rs-icon">↕️</div>
            <div class="rs-val">{{ txnPoints() | number }}</div>
            <div class="rs-lbl">From Transfers</div>
          </div>
          <div class="rw-stat">
            <div class="rs-icon">🎯</div>
            <div class="rs-val">{{ redeemedTotal() | number }}</div>
            <div class="rs-lbl">Redeemed</div>
          </div>
        </div>

        <!-- How to Earn -->
        <div class="card earn-guide">
          <div class="eg-title">💡 How to Earn Points</div>
          <div class="eg-grid">
            <div class="eg-item">
              <div class="eg-icon" style="background:#e0f2fe">📱</div>
              <div class="eg-info">
                <div class="eg-label">Bill Payments</div>
                <div class="eg-rate">2 pts per ₹100 paid</div>
              </div>
            </div>
            <div class="eg-item">
              <div class="eg-icon" style="background:#d1fae5">💸</div>
              <div class="eg-info">
                <div class="eg-label">Money Transfers</div>
                <div class="eg-rate">1 pt per ₹100 sent</div>
              </div>
            </div>
            <div class="eg-item">
              <div class="eg-icon" style="background:#ede9fe">🏆</div>
              <div class="eg-info">
                <div class="eg-label">Tier Bonus</div>
                <div class="eg-rate">Silver: 1.5× · Gold: 2× · Platinum: 3×</div>
              </div>
            </div>
            <div class="eg-item">
              <div class="eg-icon" style="background:#fef3c7">🎁</div>
              <div class="eg-info">
                <div class="eg-label">Redeem Cashback</div>
                <div class="eg-rate">10 pts = ₹1 cashback</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tier Roadmap -->
        <div class="card tier-map">
          <div class="eg-title" style="margin-bottom:1rem">🗺️ Tier Roadmap</div>
          <div class="tier-steps">
            <div class="ts-item" [class.ts-active]="tierLevel() >= 1" [class.ts-current]="tierLevel() === 1">
              <div class="ts-badge" style="background:#92400e">🥉</div>
              <div class="ts-label">Bronze</div>
              <div class="ts-range">0 – 1,999 pts</div>
            </div>
            <div class="ts-line" [class.ts-done]="tierLevel() >= 2"></div>
            <div class="ts-item" [class.ts-active]="tierLevel() >= 2" [class.ts-current]="tierLevel() === 2">
              <div class="ts-badge" style="background:#475569">🥈</div>
              <div class="ts-label">Silver</div>
              <div class="ts-range">2,000 – 4,999 pts</div>
            </div>
            <div class="ts-line" [class.ts-done]="tierLevel() >= 3"></div>
            <div class="ts-item" [class.ts-active]="tierLevel() >= 3" [class.ts-current]="tierLevel() === 3">
              <div class="ts-badge" style="background:#b45309">🥇</div>
              <div class="ts-label">Gold</div>
              <div class="ts-range">5,000 – 9,999 pts</div>
            </div>
            <div class="ts-line" [class.ts-done]="tierLevel() >= 4"></div>
            <div class="ts-item" [class.ts-active]="tierLevel() >= 4" [class.ts-current]="tierLevel() === 4">
              <div class="ts-badge" style="background:linear-gradient(135deg,#C84010,#E8411A)">💎</div>
              <div class="ts-label">Platinum</div>
              <div class="ts-range">10,000+ pts</div>
            </div>
          </div>
        </div>

        <!-- Redeem Section -->
        <div class="card" style="margin-bottom:1.5rem">
          <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary,#1e293b);margin-bottom:1rem">
            🎁 Redeem Points for Cashback
          </div>

          @if (redeemMsg()) {
            <div class="alert alert-success" style="animation:slideDown 0.3s ease;margin-bottom:1rem">
              {{ redeemMsg() }}
            </div>
          }

          <div class="redeem-grid">
            @for (opt of redeemOpts; track opt.pts) {
              <div class="redeem-card"
                   [class.disabled]="availablePoints() < opt.pts"
                   [class.selected]="selectedRedeem() === opt.pts"
                   (click)="availablePoints() >= opt.pts && selectedRedeem.set(opt.pts)">
                <div class="rc-pts">{{ opt.pts }} pts</div>
                <div class="rc-arrow">→</div>
                <div class="rc-val">{{ opt.label }}</div>
              </div>
            }
          </div>

          @if (selectedRedeem()) {
            <div class="redeem-confirm">
              <span>Redeem <strong>{{ selectedRedeem() }} pts</strong> → <strong>{{ getRedeemLabel(selectedRedeem()!) }}</strong></span>

              @if (accounts().length) {
                <select class="form-control" [(ngModel)]="redeemAccount" style="flex:1;max-width:260px;font-size:0.82rem;padding:0.35rem 0.6rem">
                  <option value="">— Credit to account —</option>
                  @for (a of accounts(); track a.id) {
                    <option [value]="a.accountNumber">{{ a.accountNumber }} ({{ a.accountType }})</option>
                  }
                </select>
              }

              <button class="btn btn-primary" style="padding:0.35rem 0.9rem;font-size:0.82rem"
                      (click)="confirmRedeem()" [disabled]="accounts().length > 0 && !redeemAccount">
                ✓ Confirm
              </button>
              <button class="btn btn-secondary" style="padding:0.35rem 0.9rem;font-size:0.82rem"
                      (click)="selectedRedeem.set(null)">Cancel</button>
            </div>
          }
        </div>

        <!-- Two Columns: Earnings + Redemptions -->
        <div class="rw-cols">
          <div class="card">
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary,#1e293b);margin-bottom:0.85rem">
              📋 Earnings History
            </div>
            @if (!earningsHistory().length) {
              <div style="color:var(--text-muted,#64748b);font-size:0.88rem;text-align:center;padding:2rem 0">
                No earnings yet. Start paying bills to earn points!
              </div>
            } @else {
              <div class="rw-table">
                <div class="rw-th"><span>Date</span><span>Reason</span><span>Points</span></div>
                @for (e of earningsHistory(); track $index) {
                  <div class="rw-tr">
                    <span class="rw-date">{{ e.date | date:'d MMM' }}</span>
                    <span class="rw-reason" [title]="e.reason">{{ e.icon }} {{ e.reason }}</span>
                    <span class="rw-pts plus">+{{ e.points }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <div class="card">
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary,#1e293b);margin-bottom:0.85rem">
              💸 Redemption History
            </div>
            @if (!redemptionHistory().length) {
              <div style="color:var(--text-muted,#64748b);font-size:0.88rem;text-align:center;padding:2rem 0">
                No redemptions yet. Redeem your points above!
              </div>
            } @else {
              <div class="rw-table">
                <div class="rw-th"><span>Date</span><span>Reward</span><span>Points</span></div>
                @for (e of redemptionHistory(); track $index) {
                  <div class="rw-tr">
                    <span class="rw-date">{{ e.date | date:'d MMM' }}</span>
                    <span class="rw-reason">🎁 {{ e.label }}</span>
                    <span class="rw-pts minus">-{{ e.pts }}</span>
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
    .pts-banner { display:flex; justify-content:space-between; align-items:center;
      background:linear-gradient(135deg,#C84010 0%,#E8411A 100%);
      border-radius:var(--radius-lg,12px); padding:2rem 2.5rem; color:#fff;
      margin-bottom:1.5rem; flex-wrap:wrap; gap:1.5rem; }
    .pb-label { font-size:0.75rem; opacity:0.8; letter-spacing:.08em; text-transform:uppercase; }
    .pb-pts   { font-size:3.5rem; font-weight:800; letter-spacing:-2px; line-height:1; margin:0.25rem 0; }
    .pb-sub   { font-size:0.82rem; opacity:0.7; }
    .pb-right { text-align:right; }
    .tier-chip { display:inline-block; padding:0.4rem 1.25rem; border-radius:20px; font-weight:700; font-size:1rem; color:#fff; }
    .tier-bar-wrap { margin-top:0.4rem; }
    .tier-bar  { height:8px; background:rgba(255,255,255,0.2); border-radius:10px; width:180px; overflow:hidden; }
    .tier-fill { height:100%; background:#ffd700; border-radius:10px; transition:width 0.6s ease; }
    /* Stats */
    .rw-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    @media(max-width:640px) { .rw-stats { grid-template-columns:repeat(2,1fr); } }
    .rw-stat { background:var(--card-bg,#fff); border:1px solid var(--border,#e2e8f0); border-radius:var(--radius-lg,12px); padding:1.25rem; text-align:center; }
    .rs-icon { font-size:1.6rem; }
    .rs-val  { font-size:1.6rem; font-weight:800; color:var(--text-primary,#1e293b); margin:0.3rem 0 0.2rem; }
    .rs-lbl  { font-size:0.75rem; color:var(--text-muted,#64748b); }
    /* How to Earn */
    .earn-guide { margin-bottom:1.5rem; }
    .eg-title { font-size:0.95rem; font-weight:700; color:var(--text-primary,#1e293b); margin-bottom:0.85rem; }
    .eg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.75rem; }
    .eg-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:var(--surface,#f8fafc); border-radius:10px; }
    .eg-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .eg-label { font-size:0.85rem; font-weight:700; color:var(--text-primary,#1e293b); }
    .eg-rate  { font-size:0.75rem; color:var(--text-muted,#64748b); margin-top:0.1rem; }
    /* Tier Roadmap */
    .tier-map { margin-bottom:1.5rem; }
    .tier-steps { display:flex; align-items:center; gap:0; flex-wrap:wrap; }
    .ts-item { display:flex; flex-direction:column; align-items:center; gap:0.3rem; padding:0.5rem; min-width:80px; opacity:0.4; transition:.2s; }
    .ts-item.ts-active { opacity:1; }
    .ts-item.ts-current .ts-badge { box-shadow:0 0 0 3px rgba(57,73,171,0.3); }
    .ts-item.ts-current .ts-label { color:var(--primary,#E8411A); font-weight:700; }
    .ts-badge { width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
    .ts-label { font-size:0.8rem; font-weight:600; color:var(--text-primary,#1e293b); }
    .ts-range { font-size:0.68rem; color:var(--text-muted,#94a3b8); text-align:center; }
    .ts-line  { flex:1; height:3px; background:var(--border,#e2e8f0); border-radius:4px; min-width:20px; transition:.3s; }
    .ts-line.ts-done { background:#E8411A; }
    @media(max-width:500px) { .ts-range { display:none; } .ts-item { min-width:60px; } }
    /* Redeem */
    .redeem-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(115px,1fr)); gap:0.65rem; }
    .redeem-card { border:2px solid var(--border,#e5e7eb); border-radius:var(--radius-md,10px); padding:0.9rem 0.5rem;
      text-align:center; cursor:pointer; transition:all 0.2s; background:var(--card-bg,#fff); }
    .redeem-card:hover:not(.disabled) { border-color:var(--primary,#E8411A); transform:translateY(-2px); box-shadow:0 4px 12px rgba(232,65,26,0.15); }
    .redeem-card.selected { border-color:var(--primary,#E8411A); background:#fff0e8; }
    .redeem-card.disabled { opacity:0.4; cursor:not-allowed; }
    .rc-pts   { font-size:1.1rem; font-weight:800; color:var(--primary,#E8411A); }
    .rc-arrow { font-size:0.9rem; color:#94a3b8; margin:0.15rem 0; }
    .rc-val   { font-size:0.8rem; font-weight:600; color:var(--text-primary,#1e293b); }
    .redeem-confirm { display:flex; align-items:center; gap:0.75rem; margin-top:1rem;
      background:#f0f4ff; border-radius:var(--radius-md,10px); padding:0.75rem 1rem; flex-wrap:wrap; font-size:0.88rem; }
    /* Columns */
    .rw-cols { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    @media(max-width:720px) { .rw-cols { grid-template-columns:1fr; } }
    .rw-table { display:flex; flex-direction:column; }
    .rw-th { display:grid; grid-template-columns:70px 1fr 55px; gap:0.5rem;
      font-size:0.7rem; color:var(--text-muted,#64748b); text-transform:uppercase; letter-spacing:.04em;
      padding:0 0.25rem 0.5rem; border-bottom:1px solid var(--border,#e2e8f0); }
    .rw-tr { display:grid; grid-template-columns:70px 1fr 55px; gap:0.5rem;
      padding:0.55rem 0.25rem; border-bottom:1px solid var(--border,#f1f5f9); align-items:center; font-size:0.84rem; }
    .rw-tr:last-child { border-bottom:none; }
    .rw-date   { color:var(--text-muted,#64748b); font-size:0.76rem; }
    .rw-reason { color:var(--text-primary,#1e293b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .rw-pts    { font-weight:700; text-align:right; font-size:0.84rem; }
    .rw-pts.plus  { color:#16a34a; }
    .rw-pts.minus { color:#dc2626; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class RewardsComponent implements OnInit {
  private billSvc = inject(BillPaymentService);
  private txnSvc  = inject(TransactionService);
  private accSvc  = inject(AccountService);

  private readonly REDEEMED_KEY = 'neobank_redeemed_pts';
  private readonly HISTORY_KEY  = 'neobank_redeem_history';

  loading  = signal(true);
  bills    = signal<BillPayment[]>([]);
  txns     = signal<Transaction[]>([]);
  accounts = signal<Account[]>([]);

  redeemAccount = '';

  // Points calculation
  billPoints = computed(() =>
    this.bills().filter(b => b.status === 'SUCCESS').reduce((s, b) => s + Math.floor(b.amount / 50), 0)
  );
  txnPoints = computed(() =>
    this.txns().filter(t => (t.type === 'DEBIT' || t.type === 'TRANSFER') && t.status === 'COMPLETED')
      .reduce((s, t) => s + Math.floor(t.amount / 100), 0)
  );
  totalPoints   = computed(() => this.billPoints() + this.txnPoints());
  redeemedTotal = signal(0);
  availablePoints = computed(() => Math.max(0, this.totalPoints() - this.redeemedTotal()));

  // Tier system: Bronze < 2000, Silver 2000-4999, Gold 5000-9999, Platinum >= 10000
  tierLevel = computed(() => {
    const p = this.availablePoints();
    if (p >= 10000) return 4;
    if (p >= 5000)  return 3;
    if (p >= 2000)  return 2;
    return 1;
  });
  tier = computed(() => {
    switch (this.tierLevel()) {
      case 4: return '💎 Platinum';
      case 3: return '🥇 Gold';
      case 2: return '🥈 Silver';
      default: return '🥉 Bronze';
    }
  });
  tierBg = computed(() => {
    switch (this.tierLevel()) {
      case 4: return 'linear-gradient(135deg,#C84010,#E8411A)';
      case 3: return '#b45309';
      case 2: return '#475569';
      default: return '#92400e';
    }
  });
  tierNext = computed(() => {
    const p = this.availablePoints();
    if (p >= 10000) return 0;
    if (p >= 5000)  return 10000 - p;
    if (p >= 2000)  return 5000  - p;
    return 2000 - p;
  });
  nextTierLabel = computed(() => {
    const p = this.availablePoints();
    if (p >= 10000) return 'Platinum';
    if (p >= 5000)  return 'Platinum';
    if (p >= 2000)  return 'Gold';
    return 'Silver';
  });
  tierProgress = computed(() => {
    const p = this.availablePoints();
    if (p >= 10000) return 100;
    if (p >= 5000)  return Math.round((p - 5000)  / 5000 * 100);
    if (p >= 2000)  return Math.round((p - 2000)  / 3000 * 100);
    return Math.round(p / 2000 * 100);
  });

  // Earnings history
  earningsHistory = computed((): EarnEntry[] => {
    const b = this.bills().filter(x => x.status === 'SUCCESS')
      .map(x => ({ date: x.paidAt, reason: x.provider + ' (' + x.billType + ')', points: Math.floor(x.amount / 50), icon: '💳' }));
    const t = this.txns().filter(x => (x.type === 'DEBIT' || x.type === 'TRANSFER') && x.status === 'COMPLETED')
      .map(x => ({ date: x.createdAt, reason: x.description || 'Money Transfer', points: Math.floor(x.amount / 100), icon: '💸' }));
    return [...b, ...t].filter(e => e.points > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 25);
  });

  redeemOpts = [
    { pts: 50,   label: '₹5 Cashback'   },
    { pts: 100,  label: '₹10 Cashback'  },
    { pts: 200,  label: '₹20 Cashback'  },
    { pts: 500,  label: '₹50 Cashback'  },
    { pts: 1000, label: '₹100 Cashback' },
  ];

  selectedRedeem    = signal<number | null>(null);
  redeemMsg         = signal('');
  redemptionHistory = signal<RedeemEntry[]>([]);

  getRedeemLabel(pts: number) { return this.redeemOpts.find(o => o.pts === pts)?.label || ''; }

  confirmRedeem() {
    const pts = this.selectedRedeem();
    if (!pts) return;
    const opt = this.redeemOpts.find(o => o.pts === pts);
    if (!opt || this.availablePoints() < pts) return;

    // Update state
    this.redeemedTotal.update(r => r + pts);
    const entry: RedeemEntry = {
      pts,
      label: opt.label,
      date: new Date().toISOString(),
      account: this.redeemAccount || undefined
    };
    this.redemptionHistory.update(h => [entry, ...h]);

    // Persist to localStorage
    this.saveRedemptionData();

    const accountMsg = this.redeemAccount ? ` to account ${this.redeemAccount}` : '';
    this.redeemMsg.set(`✅ ${opt.label} redeemed successfully${accountMsg}! Cashback will reflect within 24 hours.`);
    this.selectedRedeem.set(null);
    this.redeemAccount = '';
    setTimeout(() => this.redeemMsg.set(''), 5000);
  }

  saveRedemptionData() {
    try {
      localStorage.setItem(this.REDEEMED_KEY, this.redeemedTotal().toString());
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.redemptionHistory()));
    } catch {}
  }

  loadRedemptionData() {
    try {
      const pts = localStorage.getItem(this.REDEEMED_KEY);
      if (pts) this.redeemedTotal.set(parseInt(pts, 10) || 0);
      const hist = localStorage.getItem(this.HISTORY_KEY);
      if (hist) this.redemptionHistory.set(JSON.parse(hist));
    } catch {}
  }

  ngOnInit() {
    this.loadRedemptionData();

    this.accSvc.getAccounts().subscribe(r => {
      if (r.success) this.accounts.set(r.data.filter((a: Account) => a.status === 'ACTIVE'));
    });

    this.billSvc.getMyBills().subscribe({
      next: r => { if (r.success) this.bills.set(r.data); },
      error: () => {}
    });

    this.txnSvc.getMyTransactions().subscribe({
      next:  r => { this.loading.set(false); if (r.success) this.txns.set(r.data); },
      error: () => this.loading.set(false),
    });
  }
}
