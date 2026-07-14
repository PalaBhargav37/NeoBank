import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Accounts</h1>
          <p class="page-subtitle">Manage your bank accounts</p>
        </div>
        <button class="btn btn-primary" (click)="showCreate = !showCreate">
          {{ showCreate ? '✕ Cancel' : '+ Request New Account' }}
        </button>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <span class="info-icon">ℹ️</span>
        <span>New account requests require <strong>admin approval</strong>. Once approved, your account number, IFSC code and branch details will be assigned automatically.</span>
      </div>

      <!-- Request Form -->
      @if (showCreate) {
        <div class="card request-card">
          <div class="card-title">🏦 Submit Account Opening Request</div>
          @if (createError()) { <div class="alert alert-error">⚠ {{ createError() }}</div> }
          @if (createSuccess()) { <div class="alert alert-success">✅ {{ createSuccess() }}</div> }
          <form (ngSubmit)="createAccount()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Account Type</label>
                <select class="form-control" [(ngModel)]="newAccount.accountType" name="type">
                  <option value="SAVINGS">💰 Savings Account</option>
                  <option value="CURRENT">💳 Current Account</option>
                  <option value="FIXED_DEPOSIT">📈 Fixed Deposit</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Currency</label>
                <input class="form-control" value="₹ INR — Indian Rupee" readonly
                  style="background:#f8faff;color:var(--text-muted);cursor:default" />
              </div>
            </div>
            <div class="notice-box">
              <strong>📋 What happens next?</strong>
              <ol>
                <li>Your request is submitted with status <span class="badge badge-warning">PENDING</span></li>
                <li>Admin reviews and approves your request</li>
                <li>On approval, account number, IFSC &amp; branch details are auto-generated</li>
                <li>You receive a notification when your account is ready</li>
              </ol>
            </div>
            <div style="display:flex; gap:0.75rem; margin-top:1rem">
              <button type="submit" class="btn btn-primary" [disabled]="creating()">
                @if (creating()) { <span class="spinner"></span> Submitting… }
                @else { 📤 Submit Request }
              </button>
              <button type="button" class="btn btn-secondary" (click)="showCreate = false">Cancel</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner-dark" style="width:40px;height:40px;border-width:4px"></div>
          <span class="loading-text">Loading accounts…</span>
        </div>
      } @else if (!accounts().length) {
        <div class="card empty-state">
          <span class="empty-icon">💳</span>
          <h3>No account requests yet</h3>
          <p>Click <strong>"+ Request New Account"</strong> to open your first account</p>
        </div>
      } @else {
        <!-- Status tabs -->
        <div class="status-tabs">
          <button class="tab-btn" [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">
            All <span class="tab-count">{{ accounts().length }}</span>
          </button>
          <button class="tab-btn" [class.active]="filter() === 'ACTIVE'" (click)="filter.set('ACTIVE')">
            Active <span class="tab-count">{{ countBy('ACTIVE') }}</span>
          </button>
          <button class="tab-btn tab-pending" [class.active]="filter() === 'PENDING'" (click)="filter.set('PENDING')">
            Pending <span class="tab-count">{{ countBy('PENDING') }}</span>
          </button>
          <button class="tab-btn tab-rejected" [class.active]="filter() === 'REJECTED'" (click)="filter.set('REJECTED')">
            Rejected <span class="tab-count">{{ countBy('REJECTED') }}</span>
          </button>
        </div>

        <div class="accounts-grid">
          @for (acc of filteredAccounts(); track acc.id) {
            <!-- PENDING card -->
            @if (acc.status === 'PENDING') {
              <div class="account-card pending-card">
                <div class="pending-header">
                  <div class="pending-icon">⏳</div>
                  <div>
                    <div class="pending-title">{{ formatType(acc.accountType) }} Account</div>
                    <div class="pending-ref">Ref: {{ acc.accountNumber }}</div>
                  </div>
                  <span class="badge badge-warning" style="margin-left:auto">PENDING</span>
                </div>
                <div class="pending-body">
                  <div class="pending-info">
                    <span>Currency</span><strong>{{ acc.currency }}</strong>
                  </div>
                  <div class="pending-info">
                    <span>Requested</span><strong>{{ acc.createdAt | date:'dd MMM yyyy' }}</strong>
                  </div>
                </div>
                <div class="pending-footer">
                  <span class="pulse-dot"></span>
                  Your request is under admin review. You will be notified on approval.
                </div>
              </div>
            }

            <!-- REJECTED card -->
            @if (acc.status === 'REJECTED') {
              <div class="account-card rejected-card">
                <div class="rejected-header">
                  <div class="rejected-icon">❌</div>
                  <div>
                    <div class="rejected-title">{{ formatType(acc.accountType) }} Account</div>
                    <div class="rejected-ref">Ref: {{ acc.accountNumber }}</div>
                  </div>
                  <span class="badge badge-danger" style="margin-left:auto">REJECTED</span>
                </div>
                <div class="rejected-reason">
                  <strong>Reason:</strong> {{ acc.rejectionReason || 'Application did not meet requirements.' }}
                </div>
                <div class="rejected-footer">
                  Reviewed on {{ acc.reviewedAt | date:'dd MMM yyyy' }}
                </div>
              </div>
            }

            <!-- ACTIVE card (credit-card style) -->
            @if (acc.status !== 'PENDING' && acc.status !== 'REJECTED') {
              <div class="account-card">
                <div class="card-inner" [class]="cardClass(acc.accountType)">
                  <div class="card-top">
                    <div class="card-chip"></div>
                    <span class="card-type-badge">{{ formatType(acc.accountType) }}</span>
                  </div>
                  <div class="card-num">{{ acc.accountNumber }}</div>
                  <div class="card-bottom">
                    <div>
                      <div class="card-bal-label">Available Balance</div>
                      <div class="card-bal-amount">{{ currencySymbol(acc.currency) }}{{ acc.balance | number:'1.2-2' }}</div>
                    </div>
                    <div class="card-status">
                      <div class="status-dot" [class]="statusDot(acc.status)"></div>
                      <span style="font-size:0.65rem;opacity:0.7">{{ acc.status }}</span>
                      <div class="card-date">{{ acc.createdAt | date:'MMM yyyy' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions Row -->
                @if (acc.status === 'ACTIVE') {
                  <div class="card-actions-row">
                    <button class="ca-btn ca-deposit" (click)="openAction(acc, 'deposit')">
                      <span>⬇️</span> Deposit
                    </button>
                    <button class="ca-btn ca-withdraw" (click)="openAction(acc, 'withdraw')">
                      <span>⬆️</span> Withdraw
                    </button>
                    <button class="ca-btn ca-transfer" routerLink="/transfer">
                      <span>🔁</span> Transfer
                    </button>
                  </div>

                  <!-- Inline deposit/withdraw form -->
                  @if (actionAccount()?.id === acc.id) {
                    <div class="action-panel" [class.action-deposit]="actionType() === 'deposit'"
                         [class.action-withdraw]="actionType() === 'withdraw'">
                      <div class="ap-title">
                        {{ actionType() === 'deposit' ? '⬇️ Deposit Funds' : '⬆️ Withdraw Funds' }}
                      </div>
                      <div class="ap-balance">Current Balance: <strong>{{ currencySymbol(acc.currency) }}{{ acc.balance | number:'1.2-2' }}</strong></div>
                      @if (actionError()) { <div class="alert alert-error" style="font-size:0.82rem;padding:0.5rem 0.75rem">{{ actionError() }}</div> }
                      @if (actionSuccess()) { <div class="alert alert-success" style="font-size:0.82rem;padding:0.5rem 0.75rem">{{ actionSuccess() }}</div> }
                      <div style="display:flex;gap:0.6rem;margin-top:0.75rem;align-items:center">
                        <div style="position:relative;flex:1">
                          <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:#64748b;font-weight:600">₹</span>
                          <input type="number" class="form-control" [(ngModel)]="actionAmount"
                            style="padding-left:2rem" placeholder="Enter amount" min="1" step="1" />
                        </div>
                        <button class="btn btn-primary btn-sm" style="white-space:nowrap" (click)="submitAction(acc)"
                          [disabled]="actionLoading()">
                          @if (actionLoading()) { <span class="spinner"></span> } Confirm
                        </button>
                        <button class="btn btn-secondary btn-sm" (click)="closeAction()">✕</button>
                      </div>
                    </div>
                  }
                }

                <!-- Bank Details Panel -->
                @if (acc.ifscCode) {
                  <div class="bank-details">
                    <div class="bd-title">🏦 Bank Details</div>
                    <div class="bd-grid">
                      <div class="bd-item">
                        <span class="bd-label">Bank Name</span>
                        <strong class="bd-value">{{ acc.bankName }}</strong>
                      </div>
                      <div class="bd-item">
                        <span class="bd-label">Branch</span>
                        <strong class="bd-value">{{ acc.branchName }}</strong>
                      </div>
                      <div class="bd-item">
                        <span class="bd-label">IFSC Code</span>
                        <strong class="bd-value ifsc">{{ acc.ifscCode }}</strong>
                      </div>
                      <div class="bd-item">
                        <span class="bd-label">MICR Code</span>
                        <strong class="bd-value">{{ acc.micrCode }}</strong>
                      </div>
                      <div class="bd-item">
                        <span class="bd-label">Branch Code</span>
                        <strong class="bd-value">{{ acc.branchCode }}</strong>
                      </div>
                      <div class="bd-item">
                        <span class="bd-label">Currency</span>
                        <strong class="bd-value">{{ acc.currency }}</strong>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* Info banner */
    .info-banner { display:flex; align-items:flex-start; gap:0.75rem; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:0.9rem 1.1rem; margin-bottom:1.5rem; font-size:0.875rem; color:#1e40af; animation:slideDown 0.3s ease; }
    .info-icon { font-size:1.1rem; flex-shrink:0; margin-top:0.05rem; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

    /* Request form */
    .request-card { border:2px dashed #bfdbfe; background:#fafcff; }
    .notice-box { background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:1rem; font-size:0.85rem; margin-top:0.75rem; }
    .notice-box ol { margin:0.5rem 0 0 1.25rem; line-height:2; }

    /* Status tabs */
    .status-tabs { display:flex; gap:0.5rem; margin-bottom:1.25rem; flex-wrap:wrap; }
    .tab-btn { padding:0.45rem 1rem; border-radius:20px; border:1.5px solid #e2e8f0; background:white; font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.2s; color:#475569; display:flex; align-items:center; gap:0.4rem; }
    .tab-btn:hover { border-color:#1a237e; color:#1a237e; }
    .tab-btn.active { background:#1a237e; color:white; border-color:#1a237e; }
    .tab-pending.active { background:#d97706; border-color:#d97706; }
    .tab-rejected.active { background:#dc2626; border-color:#dc2626; }
    .tab-count { background:rgba(255,255,255,0.25); border-radius:10px; padding:0 6px; font-size:0.72rem; }
    .tab-btn:not(.active) .tab-count { background:#f1f5f9; color:#64748b; }

    /* Grid */
    .accounts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.5rem; }

    /* PENDING card */
    .pending-card { background:white; border-radius:16px; border:2px solid #fde68a; overflow:hidden; animation:cardEntrance 0.4s ease backwards; box-shadow:0 4px 16px rgba(217,119,6,0.1); }
    @keyframes cardEntrance { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    .pending-header { display:flex; align-items:center; gap:0.85rem; padding:1.25rem 1.25rem 0.75rem; }
    .pending-icon { width:44px; height:44px; border-radius:12px; background:#fef3c7; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; }
    .pending-title { font-size:1rem; font-weight:700; color:#0f172a; }
    .pending-ref { font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:0.1rem; }
    .pending-body { padding:0 1.25rem 0.75rem; display:flex; gap:1rem; }
    .pending-info { flex:1; background:#fffbeb; border-radius:8px; padding:0.6rem 0.8rem; }
    .pending-info span { display:block; font-size:0.68rem; color:#92400e; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.2rem; }
    .pending-footer { background:#fef3c7; padding:0.75rem 1.25rem; font-size:0.78rem; color:#92400e; display:flex; align-items:center; gap:0.5rem; }
    .pulse-dot { width:8px; height:8px; background:#d97706; border-radius:50%; flex-shrink:0; animation:pulseDot 1.5s ease infinite; }
    @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

    /* REJECTED card */
    .rejected-card { background:white; border-radius:16px; border:2px solid #fca5a5; overflow:hidden; animation:cardEntrance 0.4s ease backwards; box-shadow:0 4px 16px rgba(220,38,38,0.08); }
    .rejected-header { display:flex; align-items:center; gap:0.85rem; padding:1.25rem 1.25rem 0.75rem; }
    .rejected-icon { width:44px; height:44px; border-radius:12px; background:#fee2e2; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; }
    .rejected-title { font-size:1rem; font-weight:700; color:#0f172a; }
    .rejected-ref { font-size:0.75rem; color:#94a3b8; font-family:monospace; margin-top:0.1rem; }
    .rejected-reason { padding:0.75rem 1.25rem; background:#fff1f2; font-size:0.83rem; color:#991b1b; line-height:1.5; }
    .rejected-footer { background:#fee2e2; padding:0.6rem 1.25rem; font-size:0.75rem; color:#b91c1c; }

    /* ACTIVE credit-card style */
    .account-card { border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); transition:all 0.32s cubic-bezier(0.34,1.4,0.64,1); animation:cardEntrance 0.4s ease backwards; }
    .account-card:hover { transform:translateY(-6px); box-shadow:0 20px 48px rgba(0,0,0,0.18); }
    .card-inner { position:relative; padding:1.75rem; min-height:170px; display:flex; flex-direction:column; justify-content:space-between; }
    .card-savings  { background:linear-gradient(135deg,#1a237e,#3949ab,#5c6bc0); color:white; }
    .card-current { background:linear-gradient(135deg,#0f766e,#0d9488,#14b8a6); color:white; }
    .card-fixed    { background:linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa); color:white; }
    .card-default  { background:linear-gradient(135deg,#374151,#4b5563); color:white; }
    .card-inner::before,.card-inner::after { content:''; position:absolute; border-radius:50%; background:rgba(255,255,255,0.07); }
    .card-inner::before { width:120px; height:120px; top:-40px; right:-30px; }
    .card-inner::after  { width:80px; height:80px; bottom:-20px; right:40px; }
    .card-top { display:flex; justify-content:space-between; align-items:flex-start; position:relative; z-index:1; }
    .card-chip { width:36px; height:28px; background:rgba(255,255,255,0.3); border-radius:5px; border:1px solid rgba(255,255,255,0.4); }
    .card-type-badge { font-size:0.68rem; font-weight:700; background:rgba(255,255,255,0.2); padding:0.22rem 0.6rem; border-radius:20px; letter-spacing:1px; text-transform:uppercase; }
    .card-num { font-family:monospace; font-size:0.88rem; font-weight:600; letter-spacing:2px; opacity:0.9; margin:0.85rem 0 0.4rem; position:relative; z-index:1; }
    .card-bottom { display:flex; justify-content:space-between; align-items:flex-end; position:relative; z-index:1; }
    .card-bal-label { font-size:0.62rem; opacity:0.7; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.15rem; }
    .card-bal-amount { font-size:1.4rem; font-weight:800; }
    .card-status { display:flex; flex-direction:column; align-items:flex-end; gap:0.25rem; }
    .status-dot { width:8px; height:8px; border-radius:50%; }
    .dot-active { background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.8); }
    .dot-inactive{ background:#fbbf24; }
    .dot-frozen  { background:#f87171; }
    .card-date { font-size:0.62rem; opacity:0.65; }

    /* Bank details */
    .bank-details { background:#f8f9fe; border-top:1px solid #e2e8f0; padding:1.1rem 1.25rem; }
    .bd-title { font-size:0.78rem; font-weight:700; color:#1a237e; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.5px; }
    .bd-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; }
    .bd-item { }
    .bd-label { display:block; font-size:0.65rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.15rem; }
    .bd-value { font-size:0.82rem; color:#0f172a; display:block; }
    .bd-value.ifsc { font-family:monospace; font-size:0.88rem; font-weight:800; color:#1a237e; letter-spacing:1px; }

    /* Quick action buttons */
    .card-actions-row { display:flex; gap:0; border-top:1px solid #e2e8f0; }
    .ca-btn { flex:1; padding:0.7rem 0.5rem; border:none; background:white; font-size:0.8rem;
      font-weight:600; cursor:pointer; transition:all 0.18s; display:flex; align-items:center;
      justify-content:center; gap:0.35rem; color:#475569; }
    .ca-btn:hover { background:#f8faff; }
    .ca-deposit:hover { color:#059669; background:#f0fdf4; }
    .ca-withdraw:hover { color:#dc2626; background:#fff1f2; }
    .ca-transfer:hover { color:#2563eb; background:#eff6ff; }
    .ca-btn + .ca-btn { border-left:1px solid #e2e8f0; }

    /* Inline action panel */
    .action-panel { padding:1rem 1.25rem; border-top:2px solid #e2e8f0; animation:slideDown 0.25s ease; }
    .action-deposit { border-top-color:#10b981; background:#f0fdf4; }
    .action-withdraw { border-top-color:#ef4444; background:#fff1f2; }
    .ap-title { font-weight:700; font-size:0.9rem; margin-bottom:0.4rem; color:#0f172a; }
    .ap-balance { font-size:0.78rem; color:#64748b; margin-bottom:0.6rem; }

    @media(max-width:768px) { .accounts-grid{grid-template-columns:1fr;} }
  `]
})
export class AccountsComponent implements OnInit {
  private accountSvc = inject(AccountService);
  loading = signal(true);
  creating = signal(false);
  accounts = signal<Account[]>([]);
  createError = signal('');
  createSuccess = signal('');
  filter = signal<string>('ACTIVE');
  showCreate = false;
  newAccount = { accountType: 'SAVINGS' as any, currency: 'INR' };

  // Deposit / Withdraw state
  actionAccount = signal<Account | null>(null);
  actionType = signal<'deposit' | 'withdraw'>('deposit');
  actionAmount = 0;
  actionLoading = signal(false);
  actionError = signal('');
  actionSuccess = signal('');

  ngOnInit() { this.loadAccounts(); }

  loadAccounts() {
    this.loading.set(true);
    this.accountSvc.getAccounts().subscribe({
      next: (res) => { this.loading.set(false); if (res.success) this.accounts.set(res.data); },
      error: () => this.loading.set(false)
    });
  }

  openAction(acc: Account, type: 'deposit' | 'withdraw') {
    this.actionAccount.set(acc);
    this.actionType.set(type);
    this.actionAmount = 0;
    this.actionError.set('');
    this.actionSuccess.set('');
  }

  closeAction() { this.actionAccount.set(null); }

  submitAction(acc: Account) {
    if (!this.actionAmount || this.actionAmount <= 0) {
      this.actionError.set('Please enter a valid amount greater than ₹0');
      return;
    }
    this.actionLoading.set(true);
    this.actionError.set('');
    this.actionSuccess.set('');
    const obs = this.actionType() === 'deposit'
      ? this.accountSvc.deposit(acc.id, this.actionAmount)
      : this.accountSvc.withdraw(acc.id, this.actionAmount);

    obs.subscribe({
      next: (res) => {
        this.actionLoading.set(false);
        if (res.success) {
          const label = this.actionType() === 'deposit' ? 'Deposit' : 'Withdrawal';
          this.actionSuccess.set(`✅ ${label} of ₹${this.actionAmount.toLocaleString('en-IN')} successful!`);
          this.actionAmount = 0;
          // Update account balance in list
          this.accounts.update(list => list.map(a => a.id === res.data.id ? res.data : a));
          this.actionAccount.set(res.data);
          setTimeout(() => { this.closeAction(); }, 2000);
        }
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(err.error?.message || 'Transaction failed. Please try again.');
      }
    });
  }

  filteredAccounts(): Account[] {
    const f = this.filter();
    if (f === 'ALL') return this.accounts().filter(a => a.status !== 'REJECTED');
    return this.accounts().filter(a => a.status === f);
  }

  countBy(status: string): number {
    return this.accounts().filter(a => a.status === status).length;
  }

  createAccount() {
    this.creating.set(true); this.createError.set(''); this.createSuccess.set('');
    this.accountSvc.createAccount(this.newAccount).subscribe({
      next: (res) => {
        this.creating.set(false);
        if (res.success) {
          this.createSuccess.set('✅ Account request submitted! Awaiting admin approval.');
          this.showCreate = false;
          this.loadAccounts();
          this.filter.set('PENDING');
          setTimeout(() => this.createSuccess.set(''), 5000);
        }
      },
      error: (err) => { this.creating.set(false); this.createError.set(err.error?.message || 'Failed to submit request.'); }
    });
  }

  formatType(type: string) {
    const labels: Record<string, string> = { SAVINGS: 'Savings', CURRENT: 'Current', FIXED_DEPOSIT: 'Fixed Deposit' };
    return labels[type] ?? type.replace(/_/g, ' ');
  }
  cardClass(type: string) { return ({ SAVINGS:'card-savings', CURRENT:'card-current', FIXED_DEPOSIT:'card-fixed' } as any)[type] || 'card-default'; }
  statusDot(s: string) { return s === 'ACTIVE' ? 'dot-active' : s === 'FROZEN' ? 'dot-frozen' : 'dot-inactive'; }
  currencySymbol(currency: string): string {
    return ({ INR:'₹', USD:'$', EUR:'€', GBP:'£' } as Record<string,string>)[currency] ?? currency+' ';
  }
}
