import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { ApiResponse } from '../../models/notification.model';

const DEPOSIT_LIMITS: Record<string, { min: number; max: number; label: string }> = {
  SAVINGS:       { min: 1,   max: 200000,    label: '₹1 – ₹2,00,000' },
  CURRENT:       { min: 1,   max: 10000000,  label: '₹1 – ₹1,00,00,000 (1 Cr)' },
  FIXED_DEPOSIT: { min: 1,   max: 50000000,  label: '₹1 – ₹5,00,00,000 (5 Cr)' },
};

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">⬇️ Deposit Money</h1>
          <p class="page-subtitle">Add funds to your NeoBank account</p>
        </div>
        <button class="btn btn-secondary" (click)="router.navigate(['/accounts'])">← Back</button>
      </div>

      <div class="dep-layout">
        <div class="card dep-card">
          @if (error()) {
            <div class="alert alert-error" style="animation:shake .3s ease">⚠ {{ error() }}</div>
          }
          @if (success()) {
            <div class="alert alert-success" style="animation:slideDown .3s ease">✅ {{ success() }}</div>
          }

          <!-- Account Selector -->
          <div class="form-group">
            <label class="form-label">Select Account <span class="req">*</span></label>
            <select class="form-control" [ngModel]="selectedAccId()"
                    (ngModelChange)="selectedAccId.set($event); onAccChange()"
                    name="acc" [class.input-error]="touched && !selectedAccId()">
              <option value="">— Choose an account —</option>
              @for (a of accounts(); track a.id) {
                <option [value]="a.id">{{ a.accountNumber }} — ₹{{ a.balance | number:'1.2-2' }} ({{ a.accountType }})</option>
              }
            </select>
            @if (touched && !selectedAccId()) {
              <span class="field-error">Please select an account</span>
            }
            @if (selectedAcc()) {
              <div class="acc-mini-card" style="animation:slideDown .25s ease">
                <div class="acc-mini-left">
                  <div class="acc-mini-avatar" [class]="accAvatar(selectedAcc()!.accountType)">
                    {{ accIcon(selectedAcc()!.accountType) }}
                  </div>
                  <div>
                    <div class="acc-mini-num">{{ selectedAcc()!.accountNumber }}</div>
                    <div class="acc-mini-type">{{ selectedAcc()!.accountType }} · {{ selectedAcc()!.currency }}</div>
                  </div>
                </div>
                <div class="acc-mini-right">
                  <div class="acc-mini-bal">₹{{ selectedAcc()!.balance | number:'1.2-2' }}</div>
                  <div class="acc-mini-lbl">Available Balance</div>
                </div>
              </div>
            }
          </div>

          <!-- Quick Amounts -->
          <div class="form-group">
            <label class="form-label">Quick Amount</label>
            <div class="quick-amounts">
              @for (q of quickAmounts(); track q) {
                <button type="button" class="qa-btn" [class.active]="amount === q"
                        (click)="amount = q; touched = false">
                  ₹{{ q | number }}
                </button>
              }
            </div>
          </div>

          <!-- Amount Input -->
          <div class="form-group">
            <label class="form-label">Deposit Amount <span class="req">*</span></label>
            <div class="amount-wrap" [class.amount-valid]="amount > 0 && amount <= maxLimit()"
                                     [class.amount-invalid]="touched && (amount <= 0 || amount > maxLimit())">
              <span class="amount-prefix">₹</span>
              <input type="number" class="form-control amount-input"
                [(ngModel)]="amount" name="amount"
                [min]="1" [max]="maxLimit()" step="1" placeholder="0.00"
                (ngModelChange)="touched = false" />
            </div>
            <div class="limit-bar">
              <span class="limit-info">
                💡 Limit for <strong>{{ selectedAcc()?.accountType || 'account' }}</strong>:
                {{ limitLabel() }}
              </span>
              @if (amount > 0) {
                <span class="amt-preview" [class.over]="amount > maxLimit()">
                  @if (amount > maxLimit()) { ⚠ Exceeds limit }
                  @else { ✓ Valid }
                </span>
              }
            </div>
            @if (touched && amount <= 0) {
              <span class="field-error">Please enter a valid amount</span>
            }
            @if (touched && amount > maxLimit()) {
              <span class="field-error">Amount exceeds limit of ₹{{ maxLimit() | number }}</span>
            }
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Description <span class="opt">(Optional)</span></label>
            <input class="form-control" [(ngModel)]="description" name="desc"
              placeholder="e.g. Salary credit, Cash deposit..." maxlength="100"
              [class.input-error]="description.length > 100" />
            <div class="char-count" [class.warn]="description.length > 80">{{ description.length }}/100</div>
          </div>

          <button class="dep-btn" (click)="doDeposit()" [disabled]="loading()">
            @if (loading()) {
              <span class="btn-spinner"></span> Processing…
            } @else {
              <span>⬇️</span> Deposit Money
            }
          </button>
        </div>

        <!-- Receipt -->
        @if (receipt()) {
          <div class="receipt-card" style="animation:scaleIn .4s cubic-bezier(.34,1.4,.64,1)">
            <div class="receipt-header">
              <div class="receipt-check">✓</div>
              <div class="receipt-title">Deposit Successful</div>
            </div>
            <div class="receipt-amount">₹{{ receipt()!.amount | number:'1.2-2' }}</div>
            <div class="receipt-sub">credited to your account</div>
            <div class="receipt-divider"></div>
            <div class="receipt-row"><span>Account No.</span><strong>{{ receipt()!.accountNumber }}</strong></div>
            <div class="receipt-row"><span>Description</span><span>{{ receipt()!.description }}</span></div>
            <div class="receipt-row"><span>New Balance</span><strong class="credit">₹{{ receipt()!.newBalance | number:'1.2-2' }}</strong></div>
            <div class="receipt-row"><span>Date & Time</span><span>{{ receipt()!.time }}</span></div>
            <button class="btn btn-secondary btn-sm" style="width:100%;margin-top:1rem" (click)="receipt.set(null)">
              Make Another Deposit
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dep-layout { display:flex; gap:1.5rem; flex-wrap:wrap; align-items:flex-start; }
    .dep-card { flex:1; min-width:320px; max-width:560px; }

    /* Field validation */
    .req { color:#dc2626; margin-left:2px; }
    .opt { font-size:0.74rem; color:#94a3b8; font-weight:400; }
    .field-error { display:block; color:#dc2626; font-size:0.76rem; margin-top:0.3rem; animation:slideDown .2s ease; }
    .input-error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
    .char-count { font-size:0.72rem; color:#94a3b8; text-align:right; margin-top:0.2rem; }
    .char-count.warn { color:#f59e0b; }

    /* Account mini card */
    .acc-mini-card { display:flex; align-items:center; justify-content:space-between; gap:0.75rem;
      background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:1.5px solid #6ee7b7;
      border-radius:12px; padding:0.85rem 1rem; margin-top:0.6rem; }
    .acc-mini-left { display:flex; align-items:center; gap:0.75rem; }
    .acc-mini-avatar { width:40px; height:40px; border-radius:10px; display:flex; align-items:center;
      justify-content:center; font-size:1.2rem; flex-shrink:0; }
    .acc-mini-avatar.savings { background:#dbeafe; }
    .acc-mini-avatar.current { background:#ede9fe; }
    .acc-mini-avatar.fixed { background:#fef9c3; }
    .acc-mini-num { font-family:monospace; font-weight:700; font-size:0.9rem; color:#065f46; }
    .acc-mini-type { font-size:0.72rem; color:#64748b; margin-top:0.1rem; }
    .acc-mini-right { text-align:right; }
    .acc-mini-bal { font-size:1.1rem; font-weight:800; color:#065f46; }
    .acc-mini-lbl { font-size:0.7rem; color:#64748b; }

    /* Quick amounts */
    .quick-amounts { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .qa-btn { padding:0.38rem 0.9rem; border:1.5px solid #e2e8f0; background:#fff; border-radius:20px;
      cursor:pointer; font-size:0.82rem; font-weight:600; color:#475569; transition:all .2s; }
    .qa-btn:hover { border-color:#3949ab; color:#3949ab; transform:translateY(-1px); }
    .qa-btn.active { background:linear-gradient(135deg,#3949ab,#5c6bc0); border-color:#3949ab; color:#fff;
      box-shadow:0 4px 12px rgba(57,73,171,0.3); }

    /* Amount input */
    .amount-wrap { position:relative; border-radius:12px; overflow:hidden; }
    .amount-prefix { position:absolute; left:1rem; top:50%; transform:translateY(-50%); font-size:1.2rem;
      font-weight:800; color:#475569; pointer-events:none; z-index:1; }
    .amount-input { padding-left:2.5rem !important; font-size:1.6rem; font-weight:800;
      text-align:center; height:64px; border-width:2px; transition:all .2s; }
    .amount-wrap.amount-valid .amount-input { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
    .amount-wrap.amount-invalid .amount-input { border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,0.08); }

    /* Limit bar */
    .limit-bar { display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem; flex-wrap:wrap; gap:0.3rem; }
    .limit-info { font-size:0.76rem; color:#3b82f6; background:#eff6ff; border:1px solid #bfdbfe;
      border-radius:6px; padding:0.3rem 0.65rem; }
    .amt-preview { font-size:0.76rem; font-weight:700; padding:0.3rem 0.65rem; border-radius:6px; }
    .amt-preview:not(.over) { background:#f0fdf4; color:#059669; }
    .amt-preview.over { background:#fff1f2; color:#dc2626; }

    /* Deposit button */
    .dep-btn { width:100%; padding:1rem; margin-top:0.75rem;
      background:linear-gradient(135deg,#059669,#10b981,#34d399);
      background-size:200% auto; color:#fff; border:none; border-radius:12px;
      font-size:1rem; font-weight:700; cursor:pointer; letter-spacing:.03em;
      display:flex; align-items:center; justify-content:center; gap:0.6rem;
      transition:all .3s; box-shadow:0 4px 20px rgba(5,150,105,0.35); }
    .dep-btn:not(:disabled):hover { background-position:right center; transform:translateY(-2px);
      box-shadow:0 8px 28px rgba(5,150,105,0.45); }
    .dep-btn:not(:disabled):active { transform:scale(0.98); }
    .dep-btn:disabled { opacity:.55; cursor:not-allowed; }
    .btn-spinner { width:16px; height:16px; border:2.5px solid rgba(255,255,255,0.35);
      border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }
    @keyframes spin { to{transform:rotate(360deg)} }

    /* Receipt */
    .receipt-card { flex:1; min-width:280px; max-width:340px; background:white;
      border:1px solid #e2e8f0; border-radius:16px; padding:0; overflow:hidden;
      box-shadow:0 8px 32px rgba(0,0,0,0.08); }
    .receipt-header { background:linear-gradient(135deg,#059669,#10b981);
      padding:1.5rem; text-align:center; }
    .receipt-check { width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.25);
      display:flex; align-items:center; justify-content:center; font-size:1.4rem;
      font-weight:800; color:white; margin:0 auto 0.5rem; border:2px solid rgba(255,255,255,0.4); }
    .receipt-title { color:rgba(255,255,255,0.95); font-weight:700; font-size:0.9rem; letter-spacing:.05em; text-transform:uppercase; }
    .receipt-amount { font-size:2.2rem; font-weight:800; color:#065f46;
      text-align:center; padding:1rem 1.5rem 0.25rem; }
    .receipt-sub { text-align:center; font-size:0.8rem; color:#64748b; padding-bottom:0.75rem; }
    .receipt-divider { height:1px; background:#f1f5f9; margin:0 1.5rem; }
    .receipt-row { display:flex; justify-content:space-between; align-items:center;
      font-size:0.83rem; padding:0.6rem 1.5rem; border-bottom:1px solid #f8fafc; }
    .receipt-row:last-of-type { border:none; }
    .receipt-row span:first-child { color:#94a3b8; }
    .credit { color:#059669; font-weight:700; }

    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
    @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
  `]
})
export class DepositComponent implements OnInit {
  private accSvc = inject(AccountService);
  router = inject(Router);

  accounts  = signal<Account[]>([]);
  loading   = signal(false);
  error     = signal('');
  success   = signal('');
  receipt   = signal<{ accountNumber: string; amount: number; description: string; newBalance: number; time: string } | null>(null);

  selectedAccId = signal('');
  amount        = 0;
  description   = '';
  touched       = false;

  selectedAcc = computed(() => this.accounts().find(a => String(a.id) === String(this.selectedAccId())) ?? null);

  maxLimit = computed(() => {
    const acc = this.selectedAcc();
    if (!acc) return 200000;
    return (DEPOSIT_LIMITS[acc.accountType] ?? DEPOSIT_LIMITS['SAVINGS']).max;
  });

  limitLabel = computed(() => {
    const acc = this.selectedAcc();
    if (!acc) return '';
    return (DEPOSIT_LIMITS[acc.accountType] ?? DEPOSIT_LIMITS['SAVINGS']).label;
  });

  quickAmounts = computed(() => {
    const acc = this.selectedAcc();
    const type = acc?.accountType ?? 'SAVINGS';
    if (type === 'CURRENT')       return [10000, 50000, 100000, 500000, 1000000, 5000000];
    if (type === 'FIXED_DEPOSIT') return [50000, 100000, 500000, 1000000, 5000000, 10000000];
    return [500, 1000, 5000, 10000, 50000, 100000];
  });

  accAvatar(type: string): string {
    if (type === 'CURRENT') return 'current';
    if (type === 'FIXED_DEPOSIT') return 'fixed';
    return 'savings';
  }

  accIcon(type: string): string {
    if (type === 'CURRENT') return '🏢';
    if (type === 'FIXED_DEPOSIT') return '🔒';
    return '🏦';
  }

  onAccChange() {
    this.error.set('');
    this.success.set('');
    this.receipt.set(null);
  }

  setQuick(v: number) { this.amount = v; }

  ngOnInit() {
    this.accSvc.getAccounts().subscribe({
      next: (res: ApiResponse<Account[]>) => this.accounts.set(res.data ?? []),
      error: () => this.error.set('Failed to load accounts')
    });
  }

  doDeposit() {
    this.touched = true;
    this.error.set('');
    this.success.set('');

    if (!this.selectedAccId()) { this.error.set('Please select an account.'); return; }
    if (!this.amount || this.amount <= 0) { this.error.set('Please enter a valid amount.'); return; }
    if (this.amount > this.maxLimit()) {
      this.error.set(`Amount exceeds the deposit limit of ₹${this.maxLimit().toLocaleString('en-IN')}.`);
      return;
    }

    this.loading.set(true);
    this.accSvc.deposit(Number(this.selectedAccId()), this.amount, this.description || 'Deposit').subscribe({
      next: (res: any) => {
        const acc = this.selectedAcc()!;
        this.receipt.set({
          accountNumber: acc.accountNumber,
          amount: this.amount,
          description: this.description || 'Deposit',
          newBalance: res.balance ?? (acc.balance + this.amount),
          time: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        });
        this.accSvc.getAccounts().subscribe((res: ApiResponse<Account[]>) => this.accounts.set(res.data ?? []));
        this.amount = 0;
        this.description = '';
        this.touched = false;
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.message ?? 'Deposit failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
