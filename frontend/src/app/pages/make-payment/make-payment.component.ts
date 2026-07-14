import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { Account } from '../../models/account.model';

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-make-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">💳 Make Payment</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">Send money instantly to any NeoBank account</p>
        </div>
      </div>

      <!-- Step Indicator -->
      <div class="step-bar">
        @for (s of [1,2,3]; track s) {
          <div class="step-item" [class.active]="step() === s" [class.done]="step() > s">
            <div class="step-circle">{{ step() > s ? '✓' : s }}</div>
            <div class="step-label">{{ ['Enter Details','Confirm','Done'][s-1] }}</div>
          </div>
          @if (s < 3) { <div class="step-line" [class.done]="step() > s"></div> }
        }
      </div>

      <div class="pay-layout">
        <div class="card pay-card">

          <!-- ── Step 1: Enter Details ── -->
          @if (step() === 1) {
            @if (error()) { <div class="alert alert-error" style="animation:shake .3s ease">⚠ {{ error() }}</div> }

            <div class="form-group">
              <label class="form-label">Pay From Account <span class="req">*</span></label>
              <select class="form-control" [ngModel]="fromAccId()"
                      (ngModelChange)="fromAccId.set($event); error.set('')"
                      name="from" [class.input-error]="touched && !fromAccId()">
                <option value="">— Select account —</option>
                @for (a of accounts(); track a.id) {
                  <option [value]="a.id">{{ a.accountNumber }} — ₹{{ a.balance | number:'1.2-2' }} ({{ a.accountType }})</option>
                }
              </select>
              @if (touched && !fromAccId()) {
                <span class="field-error">Please select a source account</span>
              }
              @if (fromAcc()) {
                <div class="acc-mini" [class.green]="true">
                  <span style="font-size:1.4rem">💳</span>
                  <div>
                    <div style="font-family:monospace;font-weight:700;color:#1e293b">{{ fromAcc()!.accountNumber }}</div>
                    <div style="font-size:0.78rem;color:#64748b">Balance: <strong>₹{{ fromAcc()!.balance | number:'1.2-2' }}</strong></div>
                  </div>
                </div>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Recipient Account Number <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="toAccount" name="to"
                placeholder="e.g. NEOSAV000001" style="font-family:monospace;letter-spacing:0.05em"
                (ngModelChange)="error.set('')"
                [class.input-error]="touched && !toAccount.trim()" />
              @if (touched && !toAccount.trim()) {
                <span class="field-error">Recipient account number is required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Recipient Name <span class="opt">(Optional)</span></label>
              <input class="form-control" [(ngModel)]="recipientName" name="name"
                placeholder="Beneficiary name for your records" />
            </div>

            <div class="form-group">
              <label class="form-label">Quick Select Amount</label>
              <div class="quick-btns">
                @for (q of quickAmts; track q) {
                  <button type="button" class="qb" [class.active]="amount === q" (click)="amount = q">₹{{ q | number }}</button>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Amount <span class="req">*</span></label>
              <div class="amt-wrap" [class.amt-valid]="amount > 0 && amount <= 100000 && (!fromAcc() || amount <= fromAcc()!.balance)"
                                    [class.amt-invalid]="(touched && amount <= 0) || amount > 100000 || (fromAcc() && amount > fromAcc()!.balance)">
                <span class="amt-pre">₹</span>
                <input type="number" class="form-control amt-inp" [(ngModel)]="amount"
                  name="amount" min="1" max="100000" step="1" placeholder="0" />
              </div>
              <div class="limit-hint">💡 Transfer limit: ₹1 – ₹1,00,000 per transaction</div>
              @if (touched && amount <= 0) {
                <span class="field-error">Please enter a valid amount</span>
              }
              @if (amount > 100000) {
                <span class="field-error">Maximum transfer limit is ₹1,00,000</span>
              }
              @if (fromAcc() && amount > 0 && amount <= 100000 && amount > fromAcc()!.balance) {
                <span class="field-error">Insufficient balance — available ₹{{ fromAcc()!.balance | number:'1.2-2' }}</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Remarks <span class="opt">(Optional)</span></label>
              <input class="form-control" [(ngModel)]="remarks" name="remarks"
                placeholder="What's this payment for?" maxlength="100"
                [class.input-error]="remarks.length > 100" />
              <div class="char-count" [class.warn]="remarks.length > 80">{{ remarks.length }}/100</div>
            </div>

            <button class="pay-btn primary" (click)="goToConfirm()" [disabled]="paying()">
              Review Payment →
            </button>
          }

          <!-- ── Step 2: Confirm ── -->
          @if (step() === 2) {
            <div class="confirm-section">
              <div class="confirm-title">✅ Review Your Payment</div>
              <div class="confirm-grid">
                <div class="cg-row"><span class="cg-lbl">From Account</span><span class="cg-val mono">{{ fromAcc()?.accountNumber }}</span></div>
                <div class="cg-row"><span class="cg-lbl">To Account</span><span class="cg-val mono">{{ toAccount }}</span></div>
                @if (recipientName) {
                  <div class="cg-row"><span class="cg-lbl">Recipient</span><span class="cg-val">{{ recipientName }}</span></div>
                }
                <div class="cg-row"><span class="cg-lbl">Amount</span><span class="cg-val amount">₹{{ amount | number:'1.2-2' }}</span></div>
                @if (remarks) {
                  <div class="cg-row"><span class="cg-lbl">Remarks</span><span class="cg-val">{{ remarks }}</span></div>
                }
                <div class="cg-row"><span class="cg-lbl">Available Balance</span><span class="cg-val">₹{{ fromAcc()?.balance | number:'1.2-2' }}</span></div>
                <div class="cg-row"><span class="cg-lbl">Balance After</span><span class="cg-val"
                     [style.color]="(fromAcc()!.balance - amount) < 0 ? '#dc2626' : '#16a34a'">
                  ₹{{ (fromAcc()!.balance - amount) | number:'1.2-2' }}
                </span></div>
              </div>
              @if (error()) { <div class="alert alert-error" style="margin-top:1rem">⚠ {{ error() }}</div> }
              <div style="display:flex;gap:0.75rem;margin-top:1.5rem">
                <button class="pay-btn primary" (click)="submit()" [disabled]="paying()">
                  @if (paying()) { <span class="spinner" style="border-color:#fff transparent"></span> }
                  @else { 💳 Confirm & Pay }
                </button>
                <button class="pay-btn secondary" (click)="step.set(1)">← Back</button>
              </div>
            </div>
          }

          <!-- ── Step 3: Done ── -->
          @if (step() === 3) {
            <div class="done-section">
              <div class="done-anim">✅</div>
              <div class="done-title">Payment Successful!</div>
              <div class="done-amount">₹{{ amount | number:'1.2-2' }}</div>
              <div class="done-sub">sent to <strong>{{ toAccount }}</strong></div>
              <div class="done-ref">Ref: TXN-{{ txnRef() }}</div>
              <div class="done-grid">
                <div class="dg-row"><span>From</span><strong>{{ fromAcc()?.accountNumber }}</strong></div>
                <div class="dg-row"><span>To</span><strong>{{ toAccount }}</strong></div>
                @if (recipientName) { <div class="dg-row"><span>Beneficiary</span><strong>{{ recipientName }}</strong></div> }
                @if (remarks) { <div class="dg-row"><span>Remarks</span><strong>{{ remarks }}</strong></div> }
                <div class="dg-row"><span>Time</span><strong>{{ paidAt() }}</strong></div>
                <div class="dg-row"><span>New Balance</span><strong style="color:#16a34a">₹{{ newBalance() | number:'1.2-2' }}</strong></div>
              </div>
              <button class="pay-btn primary" style="margin-top:1.5rem" (click)="reset()">Make Another Payment</button>
            </div>
          }
        </div>

        <!-- Side Info Panel -->
        @if (step() === 1) {
          <div class="card info-card">
            <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);margin-bottom:1rem">ℹ️ How it works</div>
            <div class="info-steps">
              <div class="is-item"><span class="is-num">1</span><span>Enter the recipient's NeoBank account number exactly</span></div>
              <div class="is-item"><span class="is-num">2</span><span>Choose the amount to send</span></div>
              <div class="is-item"><span class="is-num">3</span><span>Review and confirm — money transfers instantly</span></div>
            </div>
            <div class="info-limits">
              <div class="il-title">Transfer Limits</div>
              <div class="il-row"><span>Min</span><strong>₹1</strong></div>
              <div class="il-row"><span>Max per txn</span><strong>₹1,00,000</strong></div>
              <div class="il-row"><span>Processing</span><strong>Instant</strong></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .step-bar { display:flex; align-items:center; gap:0; margin-bottom:1.75rem; }
    .step-item { display:flex; flex-direction:column; align-items:center; gap:0.3rem; min-width:80px; }
    .step-circle { width:36px; height:36px; border-radius:50%; border:2.5px solid #e2e8f0; background:#fff;
      display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700; color:#94a3b8; }
    .step-item.active .step-circle { border-color:var(--primary); background:var(--primary); color:#fff; }
    .step-item.done .step-circle { border-color:#16a34a; background:#16a34a; color:#fff; }
    .step-label { font-size:0.72rem; color:#94a3b8; font-weight:500; }
    .step-item.active .step-label { color:var(--primary); font-weight:700; }
    .step-item.done .step-label { color:#16a34a; }
    .step-line { flex:1; height:2px; background:#e2e8f0; margin-bottom:1.2rem; transition:background 0.3s; }
    .step-line.done { background:#16a34a; }
    .pay-layout { display:flex; gap:1.5rem; flex-wrap:wrap; align-items:flex-start; }
    .pay-card { flex:1; min-width:320px; max-width:560px; }
    .info-card { width:240px; flex-shrink:0; }
    .acc-mini { display:flex; align-items:center; gap:0.75rem; border-radius:10px;
      padding:0.75rem 1rem; margin-top:0.5rem; background:#f0f4ff; border:1px solid #e0e7ff; }
    .quick-btns { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .qb { padding:0.4rem 1rem; border:1.5px solid #e2e8f0; background:#fff; border-radius:20px;
      cursor:pointer; font-size:0.85rem; font-weight:600; color:#475569; transition:all .2s; }
    .qb:hover,.qb.active { background:var(--primary); border-color:var(--primary); color:#fff; }
    .amt-wrap { position:relative; }
    .amt-pre { position:absolute; left:1rem; top:50%; transform:translateY(-50%); font-size:1.1rem; font-weight:700; color:#475569; }
    .amt-inp { padding-left:2.2rem !important; font-size:1.5rem; font-weight:700; text-align:center; height:60px; }
    .limit-hint { margin-top:0.4rem; font-size:0.78rem; color:#3b82f6;
      background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:0.35rem 0.75rem; }
    /* Validation */
    .req { color:#dc2626; margin-left:2px; }
    .opt { font-size:0.74rem; color:#94a3b8; font-weight:400; }
    .field-error { display:block; color:#dc2626; font-size:0.76rem; margin-top:0.25rem; animation:slideDown .2s ease; }
    .input-error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
    .char-count { font-size:0.72rem; color:#94a3b8; text-align:right; margin-top:0.2rem; }
    .char-count.warn { color:#f59e0b; }
    .amt-wrap.amt-valid .amt-inp { border-color:#10b981 !important; box-shadow:0 0 0 3px rgba(16,185,129,0.1) !important; }
    .amt-wrap.amt-invalid .amt-inp { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }
    .pay-btn { padding:0.75rem 1.5rem; border:none; border-radius:10px; font-size:0.95rem; font-weight:700;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:opacity .2s; }
    .pay-btn.primary { background:linear-gradient(135deg,#3949ab,#1a237e); color:#fff; flex:1; }
    .pay-btn.primary:disabled { opacity:.55; cursor:not-allowed; }
    .pay-btn.primary:hover:not(:disabled) { opacity:.88; }
    .pay-btn.secondary { background:#f1f5f9; color:#475569; }
    .pay-btn.secondary:hover { background:#e2e8f0; }
    /* Confirm */
    .confirm-section { }
    .confirm-title { font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom:1.25rem; }
    .confirm-grid { border:1px solid #e0e7ff; border-radius:12px; overflow:hidden; }
    .cg-row { display:flex; justify-content:space-between; align-items:center;
      padding:0.7rem 1.1rem; border-bottom:1px solid #f1f5f9; }
    .cg-row:last-child { border-bottom:none; }
    .cg-lbl { font-size:0.8rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; }
    .cg-val { font-size:0.9rem; font-weight:600; color:var(--text-primary); }
    .cg-val.mono { font-family:monospace; }
    .cg-val.amount { font-size:1.1rem; color:var(--primary); }
    /* Done */
    .done-section { text-align:center; padding:1rem 0; }
    .done-anim { font-size:4rem; animation:pop 0.4s ease; }
    @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
    .done-title { font-size:1.4rem; font-weight:800; color:#16a34a; margin:0.5rem 0 0.25rem; }
    .done-amount { font-size:2.5rem; font-weight:800; color:#1e293b; }
    .done-sub { font-size:0.9rem; color:#64748b; margin:0.25rem 0; }
    .done-ref { font-size:0.75rem; color:#94a3b8; background:#f8faff; border-radius:6px;
      padding:0.25rem 0.75rem; display:inline-block; margin:0.5rem 0 1rem; font-family:monospace; }
    .done-grid { border:1px solid #e0e7ff; border-radius:12px; overflow:hidden; text-align:left; }
    .dg-row { display:flex; justify-content:space-between; padding:0.6rem 1rem;
      border-bottom:1px solid #f1f5f9; font-size:0.85rem; }
    .dg-row:last-child { border-bottom:none; }
    .dg-row span { color:#94a3b8; }
    /* Info panel */
    .info-steps { display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.25rem; }
    .is-item { display:flex; align-items:flex-start; gap:0.75rem; font-size:0.84rem; color:#475569; }
    .is-num { width:22px; height:22px; border-radius:50%; background:var(--primary); color:#fff;
      font-size:0.72rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .info-limits { background:#f8faff; border:1px solid #e0e7ff; border-radius:10px; padding:0.85rem; }
    .il-title { font-size:0.75rem; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; margin-bottom:0.6rem; font-weight:600; }
    .il-row { display:flex; justify-content:space-between; font-size:0.84rem; padding:0.25rem 0; color:#475569; }
  `]
})
export class MakePaymentComponent implements OnInit {
  private accSvc = inject(AccountService);
  private txnSvc = inject(TransactionService);

  step     = signal<Step>(1);
  loading  = signal(false);
  paying   = signal(false);
  accounts = signal<Account[]>([]);
  error    = signal('');

  fromAccId     = signal('');
  toAccount     = '';
  recipientName = '';
  amount        = 0;
  remarks       = '';
  touched       = false;

  txnRef    = signal('');
  paidAt    = signal('');
  newBalance= signal(0);

  quickAmts = [500, 1000, 2000, 5000, 10000, 25000];

  fromAcc = computed(() => this.accounts().find(a => String(a.id) === String(this.fromAccId())) ?? null);

  ngOnInit() {
    this.accSvc.getAccounts().subscribe(r => {
      if (r.success) {
        const active = r.data.filter((a: Account) => a.status === 'ACTIVE');
        this.accounts.set(active);
        if (active.length) this.fromAccId.set(String(active[0].id));
      }
    });
  }

  goToConfirm() {
    this.touched = true;
    if (!this.fromAccId) { this.error.set('Please select an account to pay from.'); return; }
    if (!this.toAccount.trim()) { this.error.set('Please enter the recipient account number.'); return; }
    if (!this.amount || this.amount <= 0) { this.error.set('Please enter a valid amount.'); return; }
    if (this.amount > 100000) { this.error.set('Maximum transfer limit is ₹1,00,000.'); return; }
    if (this.fromAcc() && this.amount > this.fromAcc()!.balance) {
      this.error.set('Insufficient balance in selected account.'); return;
    }
    const acc = this.fromAcc();
    if (acc && acc.accountNumber === this.toAccount.trim()) {
      this.error.set('Cannot transfer to the same account.'); return;
    }
    this.error.set('');
    this.step.set(2);
  }

  submit() {
    this.paying.set(true); this.error.set('');
    this.txnSvc.transfer({
      fromAccountNumber: this.fromAcc()!.accountNumber,
      toAccountNumber:   this.toAccount.trim(),
      amount:            this.amount,
      description:       this.remarks || `Payment to ${this.recipientName || this.toAccount}`,
    }).subscribe({
      next: r => {
        this.paying.set(false);
        if (r.success) {
          this.txnRef.set(r.data.transactionId || Date.now().toString().slice(-8));
          this.paidAt.set(new Date().toLocaleString('en-IN'));
          const updated = this.fromAcc()!.balance - this.amount;
          this.newBalance.set(updated);
          this.accounts.update(list => list.map(a =>
            a.accountNumber === this.fromAcc()!.accountNumber ? { ...a, balance: updated } : a
          ));
          this.step.set(3);
        }
      },
      error: err => { this.paying.set(false); this.error.set(err.error?.message || 'Payment failed. Please verify the recipient account number.'); },
    });
  }

  reset() {
    this.step.set(1);
    this.toAccount = ''; this.recipientName = ''; this.amount = 0; this.remarks = '';
    this.txnRef.set(''); this.error.set(''); this.touched = false;
  }
}
