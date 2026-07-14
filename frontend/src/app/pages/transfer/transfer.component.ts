import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">↔️ Account Transfer</h1>
          <p class="page-subtitle">Send funds instantly to any NeoBank account</p>
        </div>
      </div>
      <div class="tr-layout">
        <div class="card tr-card">
          @if (error()) { <div class="alert alert-error">⚠ {{ error() }}</div> }
          @if (success()) { <div class="alert alert-success" style="animation:slideDown .3s ease">✅ {{ success() }}</div> }

          <div class="form-group">
            <label class="form-label">From Account *</label>
            <select class="form-control" [(ngModel)]="form.fromAccountNumber" name="from" required>
              <option value="">— Select source account —</option>
              @for (a of accounts(); track a.id) {
                <option [value]="a.accountNumber">{{ a.accountNumber }} — ₹{{ a.balance | number:'1.2-2' }} ({{ a.accountType }})</option>
              }
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Beneficiary Name *</label>
              <input class="form-control" [(ngModel)]="form.beneficiaryName" name="bname" placeholder="Full name as on account" required />
            </div>
            <div class="form-group">
              <label class="form-label">Recipient Account Number *</label>
              <input class="form-control" [(ngModel)]="form.toAccountNumber" name="to" placeholder="Enter account number" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">IFSC Code *</label>
              <input class="form-control" [(ngModel)]="form.ifscCode" name="ifsc" placeholder="e.g. NEOB0001001" required />
              @if (form.ifscCode.startsWith('NEOB')) {
                <small class="ifsc-hint">✅ NeoBank IFSC: <strong>{{ form.ifscCode }}</strong></small>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Transfer Amount *</label>
              <div class="amount-wrap">
                <span class="amount-prefix">₹</span>
                <input type="number" class="form-control amount-input" [(ngModel)]="form.amount" name="amount" min="100" max="50000" placeholder="0" required />
              </div>
              <div class="limit-info">ℹ️ Transfer: ₹100 – ₹50,000 per transaction · Daily cap ₹1,00,000</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Quick Amounts</label>
            <div class="quick-amounts">
              @for (q of quickAmts; track q) {
                <button type="button" class="qa-btn" [class.active]="form.amount === q" (click)="form.amount = q">₹{{ q | number }}</button>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description <span class="opt">(Optional)</span></label>
            <input class="form-control" [(ngModel)]="form.description" name="desc" placeholder="Enter transfer description" />
          </div>

          <button class="tr-btn" (click)="onTransfer()" [disabled]="loading()">
            @if (loading()) { <span class="spinner" style="border-color:#fff transparent"></span> }
            @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0">
                <path d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4M4 17l4-4"/>
              </svg>
              TRANSFER MONEY
            }
          </button>
        </div>

        @if (lastTx()) {
          <div class="card receipt-card">
            <div class="receipt-badge">✅ Transfer Successful</div>
            <div class="receipt-amount">₹{{ lastTx()!.amount | number:'1.2-2' }}</div>
            <div class="receipt-label">transferred successfully</div>
            <div class="receipt-divider"></div>
            <div class="receipt-row"><span>Txn ID</span><span class="mono">{{ lastTx()!.transactionId | slice:0:16 }}…</span></div>
            <div class="receipt-row"><span>Beneficiary</span><strong>{{ lastBeneficiary }}</strong></div>
            <div class="receipt-row"><span>From</span><span class="mono">{{ lastTx()!.fromAccountNumber }}</span></div>
            <div class="receipt-row"><span>To</span><span class="mono">{{ lastTx()!.toAccountNumber }}</span></div>
            <div class="receipt-row"><span>Status</span><span class="badge badge-success">{{ lastTx()!.status }}</span></div>
            <div class="receipt-row"><span>Date</span><span>{{ lastTx()!.createdAt | date:'dd MMM yyyy, h:mm a' }}</span></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tr-layout { display:flex; gap:1.5rem; flex-wrap:wrap; align-items:flex-start; }
    .tr-card { flex:1; min-width:320px; max-width:580px; }
    .quick-amounts { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .qa-btn { padding:0.4rem 1rem; border:1.5px solid #e2e8f0; background:#fff; border-radius:20px; cursor:pointer; font-size:0.85rem; font-weight:600; color:#475569; transition:all .2s; }
    .qa-btn:hover,.qa-btn.active { background:#E8411A; border-color:#E8411A; color:#fff; }
    .amount-wrap { position:relative; }
    .amount-prefix { position:absolute; left:1rem; top:50%; transform:translateY(-50%); font-size:1rem; font-weight:700; color:#475569; }
    .amount-input { padding-left:2rem !important; font-size:1.3rem; font-weight:700; text-align:center; height:52px; }
    .limit-info { margin-top:0.4rem; font-size:0.78rem; color:#E8411A; background:#fff0e8; border:1px solid #ffc9aa; border-radius:6px; padding:0.35rem 0.75rem; }
    .ifsc-hint { font-size:0.75rem; color:#059669; margin-top:0.25rem; display:block; }
    .opt { font-size:0.75rem; color:#94a3b8; }
    .tr-btn { width:100%; padding:0.9rem; background:linear-gradient(90deg,#C84010,#E8411A); color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; letter-spacing:.05em; margin-top:0.5rem; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
    .tr-btn:disabled { opacity:.55; cursor:not-allowed; }
    .receipt-card { flex:1; min-width:280px; max-width:340px; text-align:center; padding:2rem 1.5rem; background:linear-gradient(135deg,#f0f4ff,#eef2ff); border:1px solid #c7d2fe; }
    .receipt-badge { background:#E8411A; color:#fff; border-radius:20px; padding:0.35rem 1.2rem; font-size:0.85rem; font-weight:700; display:inline-block; margin-bottom:1rem; }
    .receipt-amount { font-size:2.5rem; font-weight:800; color:#C84010; }
    .receipt-label { font-size:0.85rem; color:#64748b; margin-bottom:1rem; }
    .receipt-divider { height:1px; background:#c7d2fe; margin:1rem 0; }
    .receipt-row { display:flex; justify-content:space-between; font-size:0.83rem; padding:0.4rem 0; border-bottom:1px solid #e0e7ff; }
    .receipt-row:last-child { border:none; }
    .receipt-row span:first-child { color:#64748b; }
    .mono { font-family:monospace; font-size:0.78rem; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
    input[type=number] { -moz-appearance:textfield; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class TransferComponent implements OnInit {
  private txSvc  = inject(TransactionService);
  private accSvc = inject(AccountService);
  loading  = signal(false);
  accounts = signal<Account[]>([]);
  lastTx   = signal<Transaction | null>(null);
  error    = signal('');
  success  = signal('');
  lastBeneficiary = '';
  form = { fromAccountNumber: '', beneficiaryName: '', toAccountNumber: '', ifscCode: 'NEOB0001001', amount: 0, description: '' };
  quickAmts = [500, 1000, 2000, 5000, 10000, 25000];

  ngOnInit() {
    this.accSvc.getAccounts().subscribe(res => {
      if (res.success) {
        const active = res.data.filter((a: Account) => a.status === 'ACTIVE');
        this.accounts.set(active);
        if (active.length) this.form.fromAccountNumber = active[0].accountNumber;
      }
    });
  }

  onTransfer() {
    if (!this.form.fromAccountNumber || !this.form.toAccountNumber || !this.form.amount) {
      this.error.set('Please fill in all required fields.'); return;
    }
    if (this.form.amount < 100)   { this.error.set('Minimum transfer is ₹100.'); return; }
    if (this.form.amount > 50000) { this.error.set('Maximum transfer is ₹50,000 per transaction.'); return; }
    this.loading.set(true); this.error.set(''); this.success.set('');
    this.lastBeneficiary = this.form.beneficiaryName;
    this.txSvc.transfer({ fromAccountNumber: this.form.fromAccountNumber, toAccountNumber: this.form.toAccountNumber, amount: this.form.amount, description: this.form.description || undefined }).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.success) {
          this.lastTx.set(res.data); this.success.set('Transfer completed successfully!');
          this.form = { fromAccountNumber: '', beneficiaryName: '', toAccountNumber: '', ifscCode: 'NEOB0001001', amount: 0, description: '' };
          this.accSvc.getAccounts().subscribe(r => { if (r.success) this.accounts.set(r.data.filter((a: Account) => a.status === 'ACTIVE')); });
        }
      },
      error: err => { this.loading.set(false); this.error.set(err.error?.message || 'Transfer failed'); }
    });
  }
}
