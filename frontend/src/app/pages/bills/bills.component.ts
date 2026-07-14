import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillPaymentService } from '../../services/bill-payment.service';
import { AccountService } from '../../services/account.service';
import { BillPayment } from '../../models/bill-payment.model';
import { Account } from '../../models/account.model';

interface BillCat {
  value: string; label: string; icon: string; color: string; borderColor: string;
  plans?: { label: string; price: number; duration: string; desc: string; popular?: boolean }[];
}

interface SavedBiller {
  id: string; billType: string; label: string; icon: string; color: string;
  provider: string; accountReference: string; lastAmount: number; lastPaid?: string;
}

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page-container">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem">
        <span style="font-size:2rem">🧾</span>
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--text-primary,#1e293b);margin:0">Bill Payments</h1>
          <p style="font-size:0.82rem;color:var(--text-muted,#64748b);margin:0.1rem 0 0">Pay all your bills quickly in one place</p>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="bstat-row">
        <div class="bstat-card">
          <div class="bsc-lbl">Bills Paid</div>
          <div class="bsc-val">{{ totalPaid() }}</div>
        </div>
        <div class="bstat-card active">
          <div class="bsc-lbl">Total Spent</div>
          <div class="bsc-val">₹{{ totalSpent() | number:'1.0-0' }}</div>
        </div>
        <div class="bstat-card">
          <div class="bsc-lbl">Saved Billers</div>
          <div class="bsc-val">{{ savedBillers().length }}</div>
        </div>
      </div>

      <!-- ===== STEP 1: Dashboard ===== -->
      @if (step() === 1) {

        <!-- Quick Pay: Saved Billers -->
        @if (savedBillers().length > 0) {
          <div class="sec-title" style="margin-bottom:0.75rem">
            ⚡ Quick Pay
            <span class="sec-sub">Saved billers</span>
          </div>
          <div class="sb-grid">
            @for (sb of savedBillers(); track sb.id) {
              <div class="sb-card">
                <div class="sb-icon-wrap" [style.background]="sb.color">{{ sb.icon }}</div>
                <div class="sb-info">
                  <div class="sb-name">{{ sb.label }}</div>
                  <div class="sb-ref">{{ sb.accountReference }}</div>
                  @if (sb.lastPaid) {
                    <div class="sb-last">Last: ₹{{ sb.lastAmount | number:'1.0-0' }} · {{ sb.lastPaid | date:'d MMM' }}</div>
                  }
                </div>
                <div class="sb-actions">
                  <button class="sb-pay-btn" (click)="quickPay(sb)">⚡ Pay Now</button>
                  <button class="sb-del-btn" (click)="deleteBiller(sb.id)" title="Remove biller">✕</button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Category Grid -->
        <div class="sec-title" style="margin-bottom:0.75rem">
          📋 All Categories
          <span class="sec-sub">Choose a service to pay</span>
        </div>
        <div class="cat-grid" style="margin-bottom:2rem">
          @for (cat of categories; track cat.value) {
            <div class="cat-tile" [style.border-left-color]="cat.borderColor" (click)="selectCat(cat)">
              <div class="ct-icon-wrap" [style.background]="cat.color">
                <span class="ct-icon">{{ cat.icon }}</span>
              </div>
              <div class="ct-label">{{ cat.label }}</div>
              <div class="ct-arrow">Pay →</div>
            </div>
          }
        </div>

        <!-- Payment History -->
        <div class="sec-title" style="margin-bottom:0.75rem">
          🕐 Payment History
          <span class="sec-sub">{{ filteredBills().length }} records</span>
          <select class="hist-filter" [(ngModel)]="histFilterVal" (ngModelChange)="histFilter.set($event)">
            <option value="ALL">All Types</option>
            @for (cat of categories; track cat.value) {
              <option [value]="cat.value">{{ cat.label }}</option>
            }
          </select>
        </div>

        @if (loading()) {
          <div class="empty-strip">⏳ Loading bills...</div>
        } @else if (!filteredBills().length) {
          <div class="empty-strip">
            <div style="font-size:2rem;margin-bottom:0.5rem">📭</div>
            No bills found{{ histFilter() !== 'ALL' ? ' for ' + getCatLabel(histFilter()) : '' }}.
            Pay your first bill above!
          </div>
        } @else {
          <div class="bill-list">
            @for (b of filteredBills(); track b.id) {
              <div class="bill-row">
                <div class="br-icon" [style.background]="getCatColor(b.billType)">{{ getCatIcon(b.billType) }}</div>
                <div class="br-info">
                  <div class="br-title">{{ b.provider }}</div>
                  <div class="br-sub">{{ getCatLabel(b.billType) }} · {{ b.billNumber }}</div>
                </div>
                <div class="br-right">
                  <div class="br-amt">₹{{ b.amount | number:'1.2-2' }}</div>
                  <div class="br-date">{{ b.paidAt | date:'d MMM, h:mm a' }}</div>
                  <span class="badge" [class]="b.status==='SUCCESS'?'badge-success':'badge-danger'">{{ b.status }}</span>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- ===== STEP 2: Enter Details ===== -->
      @if (step() === 2) {
        <div class="card step-card">
          <div class="step-header">
            <div class="step-icon-wrap" [style.background]="selCat()!.color">{{ selCat()!.icon }}</div>
            <div style="flex:1">
              <div class="step-title">{{ selCat()!.label }}</div>
              <div class="step-sub">Step 1 of 2 · Enter your details</div>
            </div>
            <button class="back-link" (click)="goBack()">← Back</button>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Service Number / Consumer ID *</label>
              <input class="form-control" [(ngModel)]="form.accountReference" placeholder="e.g. 9876543210" />
            </div>
            <div class="form-group">
              <label class="form-label">Provider / Operator *</label>
              <input class="form-control" [(ngModel)]="form.provider" placeholder="e.g. Jio, Airtel, Dish TV" />
            </div>
          </div>

          @if (selCat()!.plans?.length) {
            <div class="plans-title">
              Choose a plan
              <button class="skip-plan" (click)="step.set(3)">Skip →</button>
            </div>
            <div class="plans-grid">
              @for (p of selCat()!.plans!; track p.price) {
                <div class="plan-card" [class.plan-sel]="form.amount === p.price" (click)="form.amount = p.price">
                  @if (p.popular) { <span class="popular-badge">🔥 Popular</span> }
                  <div class="plan-price">₹{{ p.price }}</div>
                  <div class="plan-label">{{ p.label }}</div>
                  <div class="plan-dur">{{ p.duration }}</div>
                  <div class="plan-desc">{{ p.desc }}</div>
                  <div class="plan-sel-link">{{ form.amount === p.price ? '✓ Selected' : 'Select →' }}</div>
                </div>
              }
            </div>
            <div class="or-custom">OR ENTER A CUSTOM AMOUNT</div>
          }

          <div class="form-group">
            <label class="form-label">Amount (₹) *</label>
            <div class="amount-wrap">
              <span class="amount-prefix">₹</span>
              <input type="number" class="form-control amount-input" [(ngModel)]="form.amount" min="1" placeholder="0" />
            </div>
          </div>

          <button class="next-btn" (click)="goStep3()" [disabled]="!form.provider || !form.accountReference || !form.amount">
            Next → Choose Account
          </button>
        </div>
      }

      <!-- ===== STEP 3: Confirm & Pay ===== -->
      @if (step() === 3) {
        <div class="card step-card">
          <div class="step-header">
            <div class="step-icon-wrap" [style.background]="selCat()!.color">{{ selCat()!.icon }}</div>
            <div style="flex:1">
              <div class="step-title">{{ selCat()!.label }} · ₹{{ form.amount | number:'1.2-2' }}</div>
              <div class="step-sub">Step 2 of 2 · Confirm payment</div>
            </div>
            <button class="back-link" (click)="step.set(2)">← Back</button>
          </div>

          @if (error()) {
            <div class="alert alert-error" style="margin-bottom:1rem">⚠️ {{ error() }}</div>
          }

          <div class="confirm-grid">
            <div class="cg-item"><span class="cg-lbl">Service</span><strong>{{ selCat()!.label }}</strong></div>
            <div class="cg-item"><span class="cg-lbl">Provider</span><strong>{{ form.provider }}</strong></div>
            <div class="cg-item"><span class="cg-lbl">Number / ID</span><strong>{{ form.accountReference }}</strong></div>
            <div class="cg-item"><span class="cg-lbl">Bill Ref</span><strong>{{ form.billNumber }}</strong></div>
            <div class="cg-item cg-full">
              <span class="cg-lbl">Amount to Pay</span>
              <strong class="pay-amt">₹{{ form.amount | number:'1.2-2' }}</strong>
            </div>
          </div>

          <div class="form-group" style="margin-top:1.25rem">
            <label class="form-label">Pay From Account *</label>
            <select class="form-control" [(ngModel)]="form.fromAccountNumber">
              <option value="">— Select account —</option>
              @for (a of accounts(); track a.id) {
                <option [value]="a.accountNumber">{{ a.accountNumber }} — ₹{{ a.balance | number:'1.2-2' }}</option>
              }
            </select>
          </div>

          <div style="display:flex;gap:0.75rem;margin-top:1rem">
            <button class="btn btn-secondary" (click)="step.set(2)">← Back</button>
            <button class="pay-btn" (click)="payBill()" [disabled]="paying() || !form.fromAccountNumber">
              @if (paying()) {
                <span class="spinner" style="border-color:#fff transparent;width:18px;height:18px;display:inline-block;border-radius:50%;border-width:2px;border-style:solid;animation:spin .7s linear infinite"></span>
                Processing...
              } @else {
                💳 Pay ₹{{ form.amount | number:'1.2-2' }} →
              }
            </button>
          </div>

          <p style="font-size:0.75rem;color:#94a3b8;margin-top:0.75rem;text-align:center">
            🔒 Secured & encrypted payment
          </p>
        </div>
      }

      <!-- ===== STEP 4: Receipt ===== -->
      @if (step() === 4 && lastReceipt()) {
        <div class="card step-card receipt-card">
          <div class="receipt-top">
            <div class="receipt-check">✅</div>
            <div class="receipt-title">Payment Successful!</div>
            <div class="receipt-sub">Your bill has been paid successfully</div>
          </div>

          <div class="receipt-body">
            <div class="receipt-row"><span>Service</span><strong>{{ lastReceipt().category }}</strong></div>
            <div class="receipt-row"><span>Provider</span><strong>{{ lastReceipt().provider }}</strong></div>
            <div class="receipt-row"><span>Consumer ID</span><strong>{{ lastReceipt().accountReference }}</strong></div>
            <div class="receipt-row"><span>Reference No.</span><strong>{{ lastReceipt().billNumber }}</strong></div>
            <div class="receipt-row"><span>Paid From</span><strong>{{ lastReceipt().account }}</strong></div>
            <div class="receipt-row"><span>Date &amp; Time</span><strong>{{ lastReceipt().time | date:'d MMM yyyy, h:mm a' }}</strong></div>
            <div class="receipt-amount-row">
              <span>Amount Paid</span>
              <strong class="receipt-amt">₹{{ lastReceipt().amount | number:'1.2-2' }}</strong>
            </div>
          </div>

          <div class="receipt-pts-note">
            🎁 You earned <strong>{{ getRewardPts(lastReceipt().amount) }}+ reward points</strong> for this payment!
          </div>

          <div class="receipt-actions">
            @if (!isBillerSaved()) {
              <button class="save-biller-btn" (click)="showSaveModal.set(true)">
                ⭐ Save This Biller
              </button>
            } @else {
              <div class="saved-tag">✓ Biller Already Saved</div>
            }
            <button class="pay-another-btn" (click)="payAnother()">🧾 Pay Another Bill</button>
          </div>
        </div>
      }

      <!-- Save Biller Modal -->
      @if (showSaveModal()) {
        <div class="modal-backdrop" (click)="showSaveModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-title">⭐ Save this Biller</div>
            <p style="font-size:0.85rem;color:#64748b;margin-bottom:1.25rem">Save for quick pay next time — no need to re-enter details!</p>
            <div class="form-group">
              <label class="form-label">Biller Name / Nickname</label>
              <input class="form-control" [(ngModel)]="saveName" [placeholder]="form.provider" />
            </div>
            <div style="display:flex;gap:0.75rem;margin-top:1rem">
              <button class="btn btn-primary" (click)="saveBiller()">✓ Save Biller</button>
              <button class="btn btn-secondary" (click)="showSaveModal.set(false)">Cancel</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .bstat-row { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }
    @media(max-width:600px) { .bstat-row { grid-template-columns:1fr; } }
    .bstat-card { background:var(--card-bg,#fff); border:1px solid var(--border,#e2e8f0); border-radius:14px; padding:1rem 1.4rem; }
    .bstat-card.active { background:linear-gradient(135deg,#059669,#10b981); border:none; }
    .bstat-card.active .bsc-lbl,.bstat-card.active .bsc-val { color:#fff; }
    .bsc-lbl { font-size:0.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.3rem; }
    .bsc-val { font-size:1.6rem; font-weight:800; color:var(--text-primary,#1e293b); }
    .sec-title { font-size:0.95rem; font-weight:700; color:var(--text-primary,#1e293b); display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
    .sec-sub { font-size:0.78rem; font-weight:400; color:#94a3b8; }
    .hist-filter { margin-left:auto; border:1px solid var(--border,#e2e8f0); border-radius:8px; padding:0.3rem 0.65rem; font-size:0.8rem; background:var(--card-bg,#fff); color:var(--text-primary,#1e293b); cursor:pointer; }
    /* Saved Billers */
    .sb-grid { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.5rem; }
    .sb-card { background:var(--card-bg,#fff); border:1px solid var(--border,#e2e8f0); border-radius:12px; padding:0.9rem 1.1rem; display:flex; align-items:center; gap:1rem; transition:box-shadow .2s; }
    .sb-card:hover { box-shadow:0 4px 12px rgba(0,0,0,.08); }
    .sb-icon-wrap { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .sb-info { flex:1; min-width:0; }
    .sb-name { font-weight:700; font-size:0.9rem; color:var(--text-primary,#1e293b); }
    .sb-ref  { font-size:0.75rem; color:#64748b; }
    .sb-last { font-size:0.72rem; color:#94a3b8; margin-top:0.15rem; }
    .sb-actions { display:flex; align-items:center; gap:0.5rem; flex-shrink:0; }
    .sb-pay-btn { background:linear-gradient(90deg,#059669,#10b981); color:#fff; border:none; border-radius:8px; padding:0.4rem 0.9rem; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap; }
    .sb-del-btn { background:none; border:1px solid var(--border,#e2e8f0); color:#94a3b8; border-radius:8px; padding:0.4rem 0.6rem; font-size:0.8rem; cursor:pointer; transition:.2s; }
    .sb-del-btn:hover { border-color:#ef4444; color:#ef4444; }
    /* Category Grid */
    .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:0.75rem; }
    .cat-tile { background:var(--card-bg,#fff); border:1px solid var(--border,#e2e8f0); border-radius:12px; border-left:4px solid; padding:1rem; cursor:pointer; transition:all .2s; }
    .cat-tile:hover { box-shadow:0 4px 16px rgba(0,0,0,.1); transform:translateY(-2px); }
    .ct-icon-wrap { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:0.6rem; }
    .ct-icon { font-size:1.4rem; }
    .ct-label { font-size:0.82rem; font-weight:700; color:var(--text-primary,#1e293b); }
    .ct-arrow { font-size:0.8rem; color:#94a3b8; margin-top:0.3rem; opacity:0; transition:.2s; }
    .cat-tile:hover .ct-arrow { opacity:1; color:#059669; }
    /* History */
    .empty-strip { background:var(--card-bg,#f8fafc); border:1.5px dashed var(--border,#e2e8f0); border-radius:10px; padding:1.5rem; text-align:center; font-size:0.88rem; color:#64748b; }
    .bill-list { display:flex; flex-direction:column; gap:0.6rem; }
    .bill-row { background:var(--card-bg,#fff); border:1px solid var(--border,#e2e8f0); border-radius:10px; padding:0.9rem 1.1rem; display:flex; align-items:center; gap:1rem; transition:.2s; }
    .bill-row:hover { box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .br-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .br-info { flex:1; min-width:0; }
    .br-title { font-weight:600; font-size:0.92rem; color:var(--text-primary,#1e293b); }
    .br-sub  { font-size:0.75rem; color:#94a3b8; }
    .br-right { display:flex; flex-direction:column; align-items:flex-end; gap:0.2rem; }
    .br-amt  { font-weight:700; font-size:0.95rem; color:var(--text-primary,#1e293b); }
    .br-date { font-size:0.72rem; color:#94a3b8; }
    /* Step Card */
    .step-card { max-width:600px; }
    .step-header { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; }
    .step-icon-wrap { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.7rem; flex-shrink:0; }
    .step-title { font-size:1.1rem; font-weight:700; color:var(--text-primary,#1e293b); }
    .step-sub   { font-size:0.78rem; color:#94a3b8; }
    .back-link  { background:none; border:1px solid var(--border,#e2e8f0); color:#64748b; border-radius:8px; padding:0.35rem 0.75rem; font-size:0.82rem; cursor:pointer; }
    /* Plans */
    .plans-title { font-size:0.92rem; font-weight:700; color:var(--text-primary,#1e293b); margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between; }
    .skip-plan { background:none; border:none; color:#3949ab; cursor:pointer; font-size:0.82rem; font-weight:600; }
    .plans-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:0.75rem; margin-bottom:1rem; }
    .plan-card { border:1.5px solid var(--border,#e2e8f0); border-radius:12px; padding:1rem; cursor:pointer; transition:all .2s; position:relative; background:var(--card-bg,#fff); }
    .plan-card:hover,.plan-card.plan-sel { border-color:#3949ab; background:#f0f4ff; }
    .popular-badge { position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#f59e0b; color:#fff; font-size:0.7rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:20px; white-space:nowrap; }
    .plan-price { font-size:1.3rem; font-weight:800; color:var(--text-primary,#1e293b); }
    .plan-label { font-size:0.78rem; font-weight:600; color:#3949ab; margin-top:0.15rem; }
    .plan-dur   { font-size:0.75rem; color:#64748b; }
    .plan-desc  { font-size:0.72rem; color:#94a3b8; margin-top:0.2rem; }
    .plan-sel-link { font-size:0.75rem; color:#3949ab; font-weight:600; margin-top:0.5rem; }
    .or-custom { text-align:center; font-size:0.75rem; color:#94a3b8; font-weight:700; letter-spacing:.08em; border-top:1px dashed var(--border,#e2e8f0); padding-top:0.75rem; margin-bottom:0.75rem; }
    .amount-wrap   { position:relative; }
    .amount-prefix { position:absolute; left:1rem; top:50%; transform:translateY(-50%); font-weight:700; color:#475569; pointer-events:none; }
    .amount-input  { padding-left:2rem !important; font-size:1.3rem !important; font-weight:700; height:52px; }
    input[type=number].amount-input::-webkit-inner-spin-button,
    input[type=number].amount-input::-webkit-outer-spin-button { -webkit-appearance:none; }
    input[type=number].amount-input { -moz-appearance:textfield; }
    .next-btn { width:100%; padding:0.85rem; background:linear-gradient(90deg,#059669,#10b981); color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; margin-top:0.5rem; transition:.2s; }
    .next-btn:hover:not(:disabled) { filter:brightness(1.05); }
    .next-btn:disabled { opacity:.5; cursor:not-allowed; }
    /* Confirm */
    .confirm-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; background:var(--surface,#f8fafc); border-radius:12px; padding:1rem; }
    .cg-item { display:flex; flex-direction:column; gap:0.15rem; }
    .cg-full { grid-column:1/-1; }
    .cg-lbl  { font-size:0.7rem; color:#94a3b8; text-transform:uppercase; font-weight:700; }
    .cg-item strong { font-size:0.88rem; color:var(--text-primary,#1e293b); }
    .pay-amt { color:#059669 !important; font-size:1.15rem !important; }
    .pay-btn { flex:1; padding:0.85rem 1.5rem; background:linear-gradient(90deg,#059669,#10b981); color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:.2s; }
    .pay-btn:hover:not(:disabled) { filter:brightness(1.05); }
    .pay-btn:disabled { opacity:.5; cursor:not-allowed; }
    @keyframes spin { to { transform:rotate(360deg); } }
    /* Receipt */
    .receipt-card { max-width:540px; }
    .receipt-top { text-align:center; padding:1.5rem 1rem 1rem; }
    .receipt-check { font-size:3.5rem; margin-bottom:0.5rem; animation:pop .4s ease; }
    @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
    .receipt-title { font-size:1.5rem; font-weight:800; color:#059669; margin-bottom:0.25rem; }
    .receipt-sub   { font-size:0.85rem; color:#64748b; }
    .receipt-body  { border:1px solid var(--border,#e2e8f0); border-radius:12px; overflow:hidden; margin:1rem 0; }
    .receipt-row   { display:flex; justify-content:space-between; align-items:center; padding:0.65rem 1rem; border-bottom:1px solid var(--border,#f1f5f9); font-size:0.88rem; }
    .receipt-row span { color:#64748b; }
    .receipt-row strong { color:var(--text-primary,#1e293b); font-weight:600; }
    .receipt-amount-row { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:#f0fdf4; font-size:0.9rem; font-weight:700; }
    .receipt-amount-row span { color:#15803d; }
    .receipt-amt { color:#059669; font-size:1.25rem; }
    .receipt-pts-note { background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:0.6rem 1rem; font-size:0.82rem; color:#92400e; margin-bottom:1rem; text-align:center; }
    .receipt-actions { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .save-biller-btn  { flex:1; padding:0.75rem; background:#fffbeb; border:1.5px solid #fbbf24; color:#92400e; border-radius:10px; font-size:0.88rem; font-weight:700; cursor:pointer; transition:.2s; }
    .save-biller-btn:hover { background:#fef3c7; }
    .saved-tag        { flex:1; padding:0.75rem; background:#f0fdf4; border:1.5px solid #bbf7d0; color:#15803d; border-radius:10px; font-size:0.88rem; font-weight:700; text-align:center; }
    .pay-another-btn  { flex:1; padding:0.75rem; background:linear-gradient(90deg,#3949ab,#5c6bc0); color:#fff; border:none; border-radius:10px; font-size:0.88rem; font-weight:700; cursor:pointer; transition:.2s; }
    .pay-another-btn:hover { filter:brightness(1.05); }
    /* Modal */
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .modal-card { background:var(--card-bg,#fff); border-radius:16px; padding:1.5rem; width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,.3); animation:slideUp .25s ease; }
    @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
    .modal-title { font-size:1.1rem; font-weight:700; color:var(--text-primary,#1e293b); margin-bottom:0.25rem; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class BillsComponent implements OnInit {
  private billSvc = inject(BillPaymentService);
  private accSvc  = inject(AccountService);

  private readonly BILLERS_KEY = 'neobank_saved_billers';

  loading       = signal(true);
  paying        = signal(false);
  bills         = signal<BillPayment[]>([]);
  accounts      = signal<Account[]>([]);
  error         = signal('');
  step          = signal(1);
  selCat        = signal<BillCat | null>(null);
  paidSession   = signal(0);
  savedBillers  = signal<SavedBiller[]>([]);
  showSaveModal = signal(false);
  saveName      = '';
  lastReceipt   = signal<any>(null);
  histFilter    = signal('ALL');
  histFilterVal = 'ALL';

  totalPaid   = computed(() => this.bills().filter(b => b.status === 'SUCCESS').length);
  totalSpent  = computed(() => this.bills().filter(b => b.status === 'SUCCESS').reduce((s, b) => s + b.amount, 0));
  pendingCount = computed(() => this.savedBillers().length);
  amountDue    = computed(() => 0);

  filteredBills = computed(() => {
    const f = this.histFilter();
    return f === 'ALL' ? this.bills() : this.bills().filter(b => b.billType === f);
  });

  form = { billType: '', provider: '', accountReference: '', billNumber: '', amount: 0, fromAccountNumber: '' };

  categories: BillCat[] = [
    { value: 'MOBILE_PREPAID',  label: 'Mobile Prepaid',    icon: '📱', color: '#e0f2fe', borderColor: '#0ea5e9',
      plans: [{label:'Basic',price:19,duration:'28 days',desc:'200MB data'},{label:'Talktime',price:49,duration:'28 days',desc:'₹49 talktime'},{label:'Popular',price:179,duration:'28 days',desc:'2GB/day + calls',popular:true},{label:'Standard',price:299,duration:'28 days',desc:'3GB/day + calls'},{label:'Unlimited',price:399,duration:'56 days',desc:'2GB/day unlimited'},{label:'Premium',price:599,duration:'84 days',desc:'3GB/day unlimited'}] },
    { value: 'MOBILE_POSTPAID', label: 'Mobile Postpaid',   icon: '📞', color: '#ede9fe', borderColor: '#8b5cf6',
      plans: [{label:'Basic',price:299,duration:'1 month',desc:'30GB data'},{label:'Standard',price:399,duration:'1 month',desc:'75GB data',popular:true},{label:'Pro',price:599,duration:'1 month',desc:'150GB + calls'},{label:'Premium',price:799,duration:'1 month',desc:'Unlimited data'}] },
    { value: 'DTH',             label: 'DTH',               icon: '📺', color: '#fef3c7', borderColor: '#f59e0b',
      plans: [{label:'Hindi Lite',price:199,duration:'1 month',desc:'120+ channels'},{label:'Family HD',price:350,duration:'1 month',desc:'250+ HD channels',popular:true},{label:'Premium HD',price:599,duration:'1 month',desc:'350+ channels + sports'},{label:'Half-Yearly',price:1850,duration:'6 months',desc:'Best value'}] },
    { value: 'ELECTRICITY',     label: 'Electricity',       icon: '⚡', color: '#fef9c3', borderColor: '#eab308' },
    { value: 'GAS',             label: 'Gas Cylinder/Piped',icon: '🔥', color: '#fee2e2', borderColor: '#ef4444',
      plans: [{label:'Standard',price:850,duration:'14kg cylinder',desc:'LPG refill'},{label:'5kg',price:480,duration:'5kg cylinder',desc:'Small cylinder'},{label:'Composite',price:950,duration:'14.2kg',desc:'Composite cylinder'}] },
    { value: 'WATER',           label: 'Water',             icon: '💧', color: '#dbeafe', borderColor: '#3b82f6' },
    { value: 'INTERNET',        label: 'Broadband / Wi-Fi', icon: '🌐', color: '#ede9fe', borderColor: '#8b5cf6',
      plans: [{label:'40 Mbps',price:499,duration:'1 month',desc:'Unlimited data'},{label:'100 Mbps',price:699,duration:'1 month',desc:'Unlimited data',popular:true},{label:'200 Mbps',price:999,duration:'1 month',desc:'Unlimited data'},{label:'500 Mbps',price:1299,duration:'1 month',desc:'Unlimited data'}] },
    { value: 'CREDIT_CARD',     label: 'Credit Card',       icon: '💳', color: '#e0e7ff', borderColor: '#6366f1' },
    { value: 'FASTAG',          label: 'FASTag Recharge',   icon: '🚗', color: '#d1fae5', borderColor: '#10b981',
      plans: [{label:'₹100',price:100,duration:'FASTag',desc:'Top-up'},{label:'₹250',price:250,duration:'FASTag',desc:'Top-up'},{label:'₹500',price:500,duration:'FASTag',desc:'Top-up',popular:true},{label:'₹1000',price:1000,duration:'FASTag',desc:'Top-up'},{label:'₹2000',price:2000,duration:'FASTag',desc:'Top-up'}] },
  ];

  ngOnInit() {
    this.loadSavedBillers();
    this.billSvc.getMyBills().subscribe({
      next:  r => { this.loading.set(false); if (r.success) this.bills.set(r.data); },
      error: () => this.loading.set(false)
    });
    this.accSvc.getAccounts().subscribe(r => {
      if (r.success) {
        const active = r.data.filter((a: Account) => a.status === 'ACTIVE');
        this.accounts.set(active);
        if (active.length) this.form.fromAccountNumber = active[0].accountNumber;
      }
    });
  }

  loadSavedBillers() {
    try {
      const data = localStorage.getItem(this.BILLERS_KEY);
      if (data) this.savedBillers.set(JSON.parse(data));
    } catch {}
  }

  persistBillers() {
    localStorage.setItem(this.BILLERS_KEY, JSON.stringify(this.savedBillers()));
  }

  quickPay(sb: SavedBiller) {
    const cat = this.categories.find(c => c.value === sb.billType);
    if (!cat) return;
    this.selCat.set(cat);
    this.form.billType        = sb.billType;
    this.form.provider        = sb.provider;
    this.form.accountReference = sb.accountReference;
    this.form.amount          = sb.lastAmount || 0;
    this.form.billNumber      = 'BILL-' + Date.now().toString().slice(-8);
    this.error.set('');
    this.step.set(3);
  }

  deleteBiller(id: string) {
    this.savedBillers.update(list => list.filter(b => b.id !== id));
    this.persistBillers();
  }

  selectCat(c: BillCat) {
    this.selCat.set(c);
    this.form.billType         = c.value;
    this.form.amount           = 0;
    this.form.provider         = '';
    this.form.accountReference = '';
    this.form.billNumber       = 'BILL-' + Date.now().toString().slice(-8);
    this.error.set('');
    this.step.set(2);
  }

  goStep3() {
    if (!this.form.provider || !this.form.accountReference || !this.form.amount) return;
    this.step.set(3);
  }

  goBack() {
    this.step.set(1);
    this.selCat.set(null);
  }

  payBill() {
    this.paying.set(true);
    this.error.set('');
    this.billSvc.payBill(this.form).subscribe({
      next: r => {
        this.paying.set(false);
        if (r.success) {
          this.paidSession.update(n => n + 1);
          this.lastReceipt.set({
            category:         this.selCat()!.label,
            icon:             this.selCat()!.icon,
            color:            this.selCat()!.color,
            provider:         this.form.provider,
            accountReference: this.form.accountReference,
            billNumber:       this.form.billNumber,
            amount:           this.form.amount,
            account:          this.form.fromAccountNumber,
            time:             new Date(),
            txId:             r.data?.billNumber || r.data?.id || ('TXN' + Date.now().toString().slice(-8))
          });
          // Update lastAmount on saved biller if exists
          const existing = this.savedBillers().find(
            b => b.billType === this.form.billType && b.accountReference === this.form.accountReference
          );
          if (existing) {
            this.savedBillers.update(list =>
              list.map(b => b.id === existing.id
                ? { ...b, lastAmount: this.form.amount, lastPaid: new Date().toISOString() }
                : b
              )
            );
            this.persistBillers();
          }
          this.billSvc.getMyBills().subscribe(res => { if (res.success) this.bills.set(res.data); });
          this.saveName = this.form.provider;
          this.step.set(4);
        }
      },
      error: err => {
        this.paying.set(false);
        this.error.set(err.error?.message || 'Payment failed. Please try again.');
      }
    });
  }

  isBillerSaved(): boolean {
    return this.savedBillers().some(
      b => b.billType === this.form.billType && b.accountReference === this.form.accountReference
    );
  }

  saveBiller() {
    const cat = this.selCat();
    if (!cat || this.isBillerSaved()) return;
    const newBiller: SavedBiller = {
      id:               Date.now().toString(),
      billType:         this.form.billType,
      label:            this.saveName.trim() || this.form.provider,
      icon:             cat.icon,
      color:            cat.color,
      provider:         this.form.provider,
      accountReference: this.form.accountReference,
      lastAmount:       this.form.amount,
      lastPaid:         new Date().toISOString()
    };
    this.savedBillers.update(list => [...list, newBiller]);
    this.persistBillers();
    this.showSaveModal.set(false);
  }

  payAnother() {
    const defaultAcc = this.accounts()[0]?.accountNumber || '';
    this.step.set(1);
    this.selCat.set(null);
    this.lastReceipt.set(null);
    this.showSaveModal.set(false);
    this.form = { billType: '', provider: '', accountReference: '', billNumber: '', amount: 0, fromAccountNumber: defaultAcc };
  }

  getCatIcon(type: string)  { return this.categories.find(c => c.value === type)?.icon  || '🧾'; }
  getCatColor(type: string) { return this.categories.find(c => c.value === type)?.color || '#f3f4f6'; }
  getCatLabel(type: string) { return this.categories.find(c => c.value === type)?.label || type; }
  getRewardPts(amount: number) { return Math.floor(amount / 50); }
}
