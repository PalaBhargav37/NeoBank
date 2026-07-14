import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { AccountService } from '../../services/account.service';
import { Loan, LoanType } from '../../models/loan.model';
import { Account } from '../../models/account.model';

type Tab = 'overview' | 'products' | 'apply' | 'applications' | 'accounts';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="loans-hub">
      <!-- Sidebar -->
      <aside class="lh-sidebar">
        <div class="lh-brand">🏦 Loans Hub</div>
        <nav class="lh-nav">
          @for (item of navItems; track item.tab) {
            <button class="lh-nav-btn" [class.active]="activeTab() === item.tab"
                    (click)="activeTab.set(item.tab)">
              <span class="lnb-icon">{{ item.icon }}</span>
              <span class="lnb-label">{{ item.label }}</span>
              @if (item.tab === 'accounts' && myAccounts().length > 0) {
                <span class="lnb-badge">{{ myAccounts().length }}</span>
              }
              @if (item.tab === 'applications' && activePendingCount() > 0) {
                <span class="lnb-badge warn">{{ activePendingCount() }}</span>
              }
            </button>
          }
        </nav>
        <button class="lh-back-btn" (click)="goBack()">← Back to Dashboard</button>
      </aside>

      <!-- Main Content -->
      <main class="lh-main">

        <!-- ── Overview ── -->
        @if (activeTab() === 'overview') {
          <div class="lh-page">
            <h2 class="lh-page-title">📊 Overview</h2>
            <div class="ov-stats">
              <div class="ov-card blue"><div class="oc-icon">💰</div><div class="oc-val">₹{{ totalBorrowed() | number:'1.0-0' }}</div><div class="oc-lbl">Total Borrowed</div></div>
              <div class="ov-card green"><div class="oc-icon">📆</div><div class="oc-val">₹{{ totalMonthlyEmi() | number:'1.0-0' }}</div><div class="oc-lbl">Monthly EMI</div></div>
              <div class="ov-card amber"><div class="oc-icon">⏳</div><div class="oc-val">{{ activePendingCount() }}</div><div class="oc-lbl">Pending Applications</div></div>
              <div class="ov-card purple"><div class="oc-icon">✅</div><div class="oc-val">{{ approvedCount() }}</div><div class="oc-lbl">Approved / Active</div></div>
            </div>

            <h3 class="lh-sub-title">⚡ Quick Actions</h3>
            <div class="qa-grid">
              <div class="qa-card" (click)="activeTab.set('products')"><div class="qa-icon">🏷️</div><div class="qa-name">Browse Products</div><div class="qa-desc">View rates & features</div></div>
              <div class="qa-card" (click)="activeTab.set('apply')"><div class="qa-icon">📝</div><div class="qa-name">Apply for Loan</div><div class="qa-desc">Quick application</div></div>
              <div class="qa-card" (click)="activeTab.set('applications')"><div class="qa-icon">📋</div><div class="qa-name">Track Applications</div><div class="qa-desc">Status & updates</div></div>
              <div class="qa-card" (click)="activeTab.set('accounts')"><div class="qa-icon">💳</div><div class="qa-name">Repay EMIs</div><div class="qa-desc">Pay instalments</div></div>
            </div>

            @if (myAccounts().length) {
              <h3 class="lh-sub-title">🏦 Recent Loan Accounts</h3>
              <div class="recent-accounts">
                @for (loan of myAccounts().slice(0, 4); track loan.id) {
                  <div class="ra-row">
                    <div class="ra-icon">{{ getLoanIcon(loan.loanType) }}</div>
                    <div class="ra-info">
                      <div class="ra-name">{{ loan.loanType }} Loan</div>
                      <div class="ra-sub">₹{{ (loan.approvedAmount || loan.requestedAmount) | number:'1.0-0' }} · {{ loan.tenureMonths }} months</div>
                    </div>
                    <div class="ra-right">
                      <span class="badge" [class]="getLoanBadge(loan.status)">{{ loan.status }}</span>
                      <div class="ra-emi">EMI ₹{{ (loan.monthlyEmi || calcEMIForLoan(loan)) | number:'1.0-0' }}/mo</div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- ── Loan Products ── -->
        @if (activeTab() === 'products') {
          <div class="lh-page">
            <h2 class="lh-page-title">🏷️ Loan Products</h2>
            <div class="prod-grid">
              @for (lt of loanTypes; track lt.value) {
                <div class="prod-card" [style.--lc]="lt.color">
                  <div class="pc-icon">{{ lt.icon }}</div>
                  <div class="pc-name">{{ lt.label }}</div>
                  <div class="pc-rate">{{ lt.rate }}% p.a.</div>
                  <div class="pc-desc">{{ lt.desc }}</div>
                  <div class="pc-tags">
                    <span class="pc-tag">Up to {{ lt.max }}</span>
                    <span class="pc-tag">{{ lt.tenure }}</span>
                  </div>
                  <button class="btn btn-primary"
                          style="width:100%;margin-top:0.85rem;font-size:0.84rem;padding:0.5rem"
                          (click)="applyForProduct(lt.value)">Apply Now →</button>
                </div>
              }
            </div>
          </div>
        }

        <!-- ── Apply for Loan ── -->
        @if (activeTab() === 'apply') {
          <div class="lh-page">
            <h2 class="lh-page-title">📝 Apply for Loan</h2>
            @if (error())        { <div class="alert alert-error">{{ error() }}</div> }
            @if (applySuccess()) { <div class="alert alert-success">{{ applySuccess() }}</div> }
            <div class="ltype-grid">
              @for (lt of loanTypes; track lt.value) {
                <div class="ltype-card" [class.selected]="form.loanType === lt.value"
                     [style.--lc]="lt.color" (click)="form.loanType = $any(lt.value)">
                  <div style="font-size:1.4rem">{{ lt.icon }}</div>
                  <div style="font-size:0.78rem;font-weight:700;margin-top:0.3rem;color:var(--text-primary)">{{ lt.label }}</div>
                  <div style="font-size:0.7rem;color:var(--lc,var(--primary));font-weight:600">{{ lt.rate }}%</div>
                </div>
              }
            </div>
            <form (ngSubmit)="applyLoan()" style="margin-top:1.5rem">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Loan Amount (₹) <span class="req">*</span></label>
                  <input type="number" class="form-control" [(ngModel)]="form.requestedAmount"
                    name="amount" min="10000" step="1000" placeholder="Min ₹10,000"
                    [class.input-error]="applyTouched && form.requestedAmount < 10000" />
                  @if (applyTouched && form.requestedAmount < 10000) {
                    <span class="field-error">Minimum loan amount is ₹10,000</span>
                  }
                  @if (applyTouched && form.requestedAmount > 10000000) {
                    <span class="field-error">Maximum loan amount is ₹1 Crore</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">Tenure <span class="req">*</span></label>
                  <select class="form-control" [(ngModel)]="form.tenureMonths" name="tenure">
                    <option [value]="6">6 Months</option><option [value]="12">1 Year</option>
                    <option [value]="24">2 Years</option><option [value]="36">3 Years</option>
                    <option [value]="48">4 Years</option><option [value]="60">5 Years</option>
                    <option [value]="120">10 Years</option><option [value]="240">20 Years</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Purpose <span class="req">*</span></label>
                <input class="form-control" [(ngModel)]="form.purpose" name="purpose"
                  placeholder="Brief description of loan purpose"
                  [class.input-error]="applyTouched && !form.purpose.trim()" />
                @if (applyTouched && !form.purpose.trim()) {
                  <span class="field-error">Please describe the purpose of the loan</span>
                }
              </div>
              @if (form.requestedAmount && form.tenureMonths) {
                <div class="emi-preview">
                  <div class="ep-item"><span class="ep-lbl">Monthly EMI</span><span class="ep-val primary">₹{{ calcEMI() | number:'1.2-2' }}</span></div>
                  <div class="ep-div"></div>
                  <div class="ep-item"><span class="ep-lbl">Interest Rate</span><span class="ep-val">{{ getRate(form.loanType) }}% p.a.</span></div>
                  <div class="ep-div"></div>
                  <div class="ep-item"><span class="ep-lbl">Total Payable</span><span class="ep-val danger">₹{{ (calcEMI() * form.tenureMonths) | number:'1.0-0' }}</span></div>
                  <div class="ep-div"></div>
                  <div class="ep-item"><span class="ep-lbl">Total Interest</span><span class="ep-val warn">₹{{ (calcEMI() * form.tenureMonths - form.requestedAmount) | number:'1.0-0' }}</span></div>
                </div>
              }
              <button type="submit" class="btn btn-primary" [disabled]="applying()" style="margin-top:1.25rem">
                @if (applying()) { <span class="spinner"></span> } 🚀 Submit Application
              </button>
            </form>
          </div>
        }

        <!-- ── My Applications ── -->
        @if (activeTab() === 'applications') {
          <div class="lh-page">
            <h2 class="lh-page-title">📋 My Applications</h2>
            @if (loading()) {
              @for (i of [1,2]; track i) {
                <div class="skeleton" style="height:130px;border-radius:var(--radius-lg);margin-bottom:1rem"></div>
              }
            } @else if (!pendingLoans().length) {
              <div class="empty-state card"><div class="empty-icon">📋</div><h3>No Applications</h3><p>Loan applications appear here.</p></div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:1rem">
                @for (loan of pendingLoans(); track loan.id) {
                  <div class="app-card" [attr.data-status]="loan.status">
                    <div class="ac-header">
                      <span class="ac-type">{{ getLoanIcon(loan.loanType) }} {{ loan.loanType }}</span>
                      <span class="badge" [class]="getLoanBadge(loan.status)">{{ loan.status }}</span>
                    </div>
                    <div class="ac-amount">₹{{ loan.requestedAmount | number:'1.0-0' }}</div>
                    <div class="ac-meta">
                      <span>{{ loan.tenureMonths }} months</span>
                      <span>Applied {{ loan.appliedAt | date:'d MMM y' }}</span>
                      @if (loan.purpose) { <span>"{{ loan.purpose }}"</span> }
                    </div>
                    @if (loan.remarks) { <div class="ac-remark">💬 {{ loan.remarks }}</div> }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- ── My Loan Accounts ── -->
        @if (activeTab() === 'accounts') {
          <div class="lh-page">
            <h2 class="lh-page-title">🏦 My Loan Accounts</h2>
            @if (loading()) {
              @for (i of [1,2]; track i) {
                <div class="skeleton" style="height:200px;border-radius:var(--radius-lg);margin-bottom:1rem"></div>
              }
            } @else if (!myAccounts().length) {
              <div class="empty-state card"><div class="empty-icon">🏦</div><h3>No Loan Accounts</h3><p>Approved loans appear here for EMI payment.</p></div>
            } @else {
              <div style="display:flex;flex-direction:column;gap:1.5rem">
                @for (loan of myAccounts(); track loan.id) {
                  <div class="la-card">
                    <!-- Header -->
                    <div class="la-header">
                      <div>
                        <div class="la-ltype">{{ getLoanIcon(loan.loanType) }} {{ loan.loanType }} Loan</div>
                        <div class="la-amount">₹{{ (loan.approvedAmount || loan.requestedAmount) | number:'1.0-0' }}</div>
                      </div>
                      <span class="badge" [class]="getLoanBadge(loan.status)">{{ loan.status }}</span>
                    </div>

                    <!-- EMI Progress Bar -->
                    @if (loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'CLOSED') {
                      <div class="emi-progress-section">
                        <div class="eps-header">
                          <span class="eps-title-sm">Repayment Progress</span>
                          <span class="eps-pct">{{ emiProgressPct(loan) }}% complete</span>
                        </div>
                        <div class="eps-track">
                          <div class="eps-fill" [style.width.%]="emiProgressPct(loan)"
                               [class.full]="emiProgressPct(loan) >= 100"></div>
                        </div>
                        <div class="eps-row">
                          <span>{{ loan.paidEmis ?? 0 }} of {{ loan.tenureMonths }} EMIs paid</span>
                          <span>{{ loan.tenureMonths - (loan.paidEmis ?? 0) }} remaining</span>
                        </div>
                      </div>

                      <!-- Paid / Outstanding summary -->
                      <div class="emi-summary-grid">
                        <div class="esm-item">
                          <span class="esm-lbl">Loan Amount</span>
                          <span class="esm-val">₹{{ (loan.approvedAmount || loan.requestedAmount) | number:'1.0-0' }}</span>
                        </div>
                        <div class="esm-item">
                          <span class="esm-lbl">Total Payable</span>
                          <span class="esm-val">₹{{ totalPayable(loan) | number:'1.0-0' }}</span>
                        </div>
                        <div class="esm-item green">
                          <span class="esm-lbl">✅ Paid So Far</span>
                          <span class="esm-val green">₹{{ (loan.totalPaidAmount ?? 0) | number:'1.2-2' }}</span>
                        </div>
                        <div class="esm-item red">
                          <span class="esm-lbl">⏳ Outstanding</span>
                          <span class="esm-val red">₹{{ outstandingBalance(loan) | number:'1.2-2' }}</span>
                        </div>
                        <div class="esm-item">
                          <span class="esm-lbl">Monthly EMI</span>
                          <span class="esm-val primary">₹{{ (loan.monthlyEmi || calcEMIForLoan(loan)) | number:'1.0-0' }}/mo</span>
                        </div>
                        <div class="esm-item">
                          <span class="esm-lbl">Interest Rate</span>
                          <span class="esm-val">{{ loan.interestRate ?? getRate(loan.loanType) }}% p.a.</span>
                        </div>
                      </div>
                    } @else {
                      <div class="la-stats">
                        <div class="la-stat"><span class="la-sl">Monthly EMI</span><span class="la-sv">₹{{ (loan.monthlyEmi || calcEMIForLoan(loan)) | number:'1.0-0' }}</span></div>
                        <div class="la-stat"><span class="la-sl">Tenure</span><span class="la-sv">{{ loan.tenureMonths }} months</span></div>
                        <div class="la-stat"><span class="la-sl">Interest Rate</span><span class="la-sv">{{ loan.interestRate ?? getRate(loan.loanType) }}%</span></div>
                        <div class="la-stat"><span class="la-sl">Applied On</span><span class="la-sv">{{ loan.appliedAt | date:'d MMM y' }}</span></div>
                      </div>
                    }

                    <!-- Payment History for this loan -->
                    @if (getHistory(loan.id).length > 0) {
                      <div class="emi-history">
                        <div class="emih-title">📋 Payment History (this session)</div>
                        <div class="emih-list">
                          @for (h of getHistory(loan.id); track h.date) {
                            <div class="emih-row">
                              <span class="emih-num">#{{ h.num }}</span>
                              <span class="emih-amt">₹{{ h.amount | number:'1.2-2' }}</span>
                              <span class="emih-date">{{ h.date | date:'d MMM, h:mm a' }}</span>
                              <span class="emih-badge">✅ Paid</span>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- EMI Pay Form -->
                    @if (loan.status === 'APPROVED' || loan.status === 'DISBURSED') {
                      <div class="emi-pay-box">
                        <div class="epb-title">💳 Pay EMI Instalment</div>
                        @if (emiError() && activeLoan()?.id === loan.id) {
                          <div class="alert alert-error" style="font-size:0.82rem;padding:0.4rem 0.75rem;margin-bottom:0.75rem">{{ emiError() }}</div>
                        }
                        @if (emiSuccess() && activeLoan()?.id === loan.id) {
                          <div class="alert alert-success" style="font-size:0.82rem;padding:0.4rem 0.75rem;margin-bottom:0.75rem">{{ emiSuccess() }}</div>
                        }
                        @if (isLoanFullyPaid(loan)) {
                          <div class="la-closed" style="margin:0">🎉 Outstanding is ₹0.00 — This loan is fully repaid!</div>
                        } @else {
                          <div class="epb-form">
                            <div class="form-group" style="flex:2;margin-bottom:0">
                              <label class="form-label">Pay From</label>
                              <select class="form-control" [(ngModel)]="emiPayAccount" [name]="'emiAcc' + loan.id">
                                <option value="">— Select account —</option>
                                @for (acc of emiAccounts(); track acc.id) {
                                  <option [value]="acc.id">{{ acc.accountNumber }} — ₹{{ acc.balance | number:'1.2-2' }}</option>
                                }
                              </select>
                            </div>
                            <div class="form-group" style="flex:2;margin-bottom:0">
                              <label class="form-label">EMI Amount (₹)</label>
                              <input type="number" class="form-control" [(ngModel)]="emiAmount"
                                [name]="'emiAmt' + loan.id" min="1" step="0.01"
                                [max]="outstandingBalance(loan)"
                                [placeholder]="'₹' + ((loan.monthlyEmi || calcEMIForLoan(loan)) | number:'1.0-0')" />
                              <small style="font-size:0.72rem;color:#94a3b8;margin-top:0.2rem;display:block">
                                Monthly instalment: <strong>₹{{ (loan.monthlyEmi || calcEMIForLoan(loan)) | number:'1.2-2' }}</strong>
                                · Outstanding: <strong style="color:#dc2626">₹{{ outstandingBalance(loan) | number:'1.2-2' }}</strong>
                              </small>
                              @if (emiAmount > outstandingBalance(loan) && outstandingBalance(loan) > 0) {
                                <small style="color:#f59e0b;font-size:0.72rem;display:block;margin-top:0.2rem">
                                  ⚠ Amount capped at ₹{{ outstandingBalance(loan) | number:'1.2-2' }} (outstanding balance)
                                </small>
                              }
                            </div>
                            <div style="padding-top:1.5rem">
                              <button class="btn btn-primary" (click)="payEmi(loan)" [disabled]="emiPaying()">
                                @if (emiPaying()) { <span class="spinner"></span> } 💳 Pay EMI
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    } @else if (loan.status === 'CLOSED') {
                      <div class="la-closed">✅ Fully repaid and closed</div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    .loans-hub { display:flex; min-height:calc(100vh - 64px); background:var(--bg); }
    /* Sidebar */
    .lh-sidebar { width:228px; flex-shrink:0; background:var(--card-bg);
      border-right:1px solid var(--border); display:flex; flex-direction:column;
      position:sticky; top:0; height:calc(100vh - 64px); }
    .lh-brand { font-size:1.1rem; font-weight:800; color:var(--primary);
      padding:1.5rem 1.25rem 1.25rem; border-bottom:1px solid var(--border); }
    .lh-nav { flex:1; padding:0.75rem 0; overflow-y:auto; }
    .lh-nav-btn { display:flex; align-items:center; gap:0.65rem; width:100%;
      padding:0.72rem 1.25rem; background:none; border:none; cursor:pointer;
      text-align:left; font-size:0.875rem; color:var(--text-muted); transition:all 0.2s;
      border-left:3px solid transparent; }
    .lh-nav-btn:hover  { background:#f8faff; color:var(--primary); }
    .lh-nav-btn.active { background:#f0f4ff; color:var(--primary); font-weight:700; border-left-color:var(--primary); }
    .lnb-icon  { font-size:1.1rem; width:20px; flex-shrink:0; }
    .lnb-label { flex:1; }
    .lnb-badge { background:#e2e8f0; color:#64748b; font-size:0.66rem; font-weight:700;
      padding:0.12rem 0.42rem; border-radius:10px; }
    .lnb-badge.warn { background:#fef9c3; color:#b45309; }
    .lh-back-btn { padding:1rem 1.25rem; background:none; border:none;
      border-top:1px solid var(--border); cursor:pointer; font-size:0.84rem;
      color:var(--text-muted); text-align:left; transition:color 0.2s; }
    .lh-back-btn:hover { color:var(--primary); }
    /* Main */
    .lh-main { flex:1; padding:2rem; overflow-y:auto; }
    .lh-page { max-width:880px; }
    .lh-page-title { font-size:1.4rem; font-weight:700; color:var(--text-primary); margin:0 0 1.5rem; }
    .lh-sub-title  { font-size:0.95rem; font-weight:700; color:var(--text-primary); margin:1.75rem 0 0.85rem; }
    /* Overview stats */
    .ov-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
    @media(max-width:900px) { .ov-stats { grid-template-columns:repeat(2,1fr); } }
    .ov-card { border-radius:var(--radius-lg); padding:1.25rem; text-align:center; }
    .ov-card.blue   { background:linear-gradient(135deg,#eff6ff,#dbeafe); }
    .ov-card.green  { background:linear-gradient(135deg,#f0fdf4,#d1fae5); }
    .ov-card.amber  { background:linear-gradient(135deg,#fffbeb,#fef3c7); }
    .ov-card.purple { background:linear-gradient(135deg,#faf5ff,#ede9fe); }
    .oc-icon { font-size:1.5rem; margin-bottom:0.4rem; }
    .oc-val  { font-size:1.55rem; font-weight:800; color:var(--text-primary); }
    .oc-lbl  { font-size:0.72rem; color:var(--text-muted); margin-top:0.2rem; }
    /* Quick actions */
    .qa-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
    @media(max-width:900px) { .qa-grid { grid-template-columns:repeat(2,1fr); } }
    .qa-card { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-lg);
      padding:1.25rem; text-align:center; cursor:pointer; transition:all 0.25s; }
    .qa-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--primary); }
    .qa-icon { font-size:2rem; margin-bottom:0.5rem; }
    .qa-name { font-weight:700; font-size:0.9rem; color:var(--text-primary); }
    .qa-desc { font-size:0.72rem; color:var(--text-muted); margin-top:0.15rem; }
    /* Recent accounts */
    .recent-accounts { background:var(--card-bg); border:1px solid var(--border);
      border-radius:var(--radius-lg); overflow:hidden; }
    .ra-row { display:flex; align-items:center; gap:1rem; padding:0.9rem 1.25rem;
      border-bottom:1px solid var(--border); }
    .ra-row:last-child { border-bottom:none; }
    .ra-icon  { font-size:1.5rem; flex-shrink:0; }
    .ra-info  { flex:1; }
    .ra-name  { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .ra-sub   { font-size:0.75rem; color:var(--text-muted); margin-top:0.1rem; }
    .ra-right { text-align:right; flex-shrink:0; }
    .ra-emi   { font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem; }
    /* Loan products */
    .prod-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:1rem; }
    .prod-card { background:var(--card-bg); border:2px solid #e5e7eb; border-radius:var(--radius-lg);
      padding:1.25rem; border-top:4px solid var(--lc,var(--primary)); transition:all 0.2s; }
    .prod-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); }
    .pc-icon { font-size:2rem; }
    .pc-name { font-weight:700; font-size:0.9rem; color:var(--text-primary); margin-top:0.4rem; }
    .pc-rate { font-size:1.1rem; font-weight:800; color:var(--lc,var(--primary)); margin:0.25rem 0; }
    .pc-desc { font-size:0.75rem; color:var(--text-muted); margin-bottom:0.6rem; }
    .pc-tags { display:flex; gap:0.4rem; flex-wrap:wrap; }
    .pc-tag  { background:#f1f5f9; color:#64748b; font-size:0.68rem; padding:0.18rem 0.5rem; border-radius:10px; }
    /* Loan type selector */
    .ltype-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(96px,1fr)); gap:0.6rem; }
    .ltype-card { border:2px solid #e5e7eb; border-radius:var(--radius-md); padding:0.75rem 0.5rem;
      text-align:center; cursor:pointer; transition:all 0.2s; }
    .ltype-card:hover    { border-color:var(--lc,var(--primary)); transform:translateY(-2px); }
    .ltype-card.selected { border-color:var(--lc,var(--primary)); background:#f0f4ff; box-shadow:0 4px 12px rgba(57,73,171,0.15); }
    /* Form Validation */
    .req { color:#dc2626; margin-left:2px; }
    .field-error { display:block; color:#dc2626; font-size:0.76rem; margin-top:0.25rem; animation:fieldSlide .2s ease; }
    .input-error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
    @keyframes fieldSlide { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
    /* EMI Preview */
    .emi-preview { display:flex; flex-wrap:wrap; background:#f0f4ff; border:1px solid #e0e7ff;
      border-radius:var(--radius-lg); overflow:hidden; margin-top:1rem; }
    .ep-item { flex:1; min-width:120px; padding:1rem; text-align:center; }
    .ep-lbl  { display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.3rem; }
    .ep-val  { font-size:1rem; font-weight:700; color:var(--primary); }
    .ep-val.primary { color:var(--primary); }
    .ep-val.danger  { color:var(--danger); }
    .ep-val.warn    { color:#d97706; }
    .ep-div  { width:1px; background:#e0e7ff; }
    /* Applications */
    .app-card { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-lg);
      padding:1.25rem; border-left:4px solid #e5e7eb; }
    .app-card[data-status="APPLIED"]      { border-left-color:#3b82f6; }
    .app-card[data-status="UNDER_REVIEW"] { border-left-color:#f59e0b; }
    .app-card[data-status="REJECTED"]     { border-left-color:#ef4444; }
    .ac-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; }
    .ac-type   { font-size:0.82rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
    .ac-amount { font-size:1.8rem; font-weight:800; color:var(--text-primary); line-height:1; margin-bottom:0.5rem; }
    .ac-meta   { display:flex; gap:1.25rem; font-size:0.8rem; color:var(--text-muted); flex-wrap:wrap; }
    .ac-remark { margin-top:0.6rem; font-size:0.82rem; color:#92400e; background:#fef9c3; padding:0.4rem 0.75rem; border-radius:6px; }
    /* Loan accounts */
    .la-card   { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.5rem; }
    .la-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; }
    .la-ltype  { font-size:0.85rem; font-weight:600; color:var(--text-muted); }
    .la-amount { font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-top:0.2rem; }
    .la-stats  { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:0.75rem; margin-bottom:1rem; }
    .la-stat   { background:#f8faff; border-radius:8px; padding:0.6rem 0.85rem; }
    .la-sl     { display:block; font-size:0.67rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:0.15rem; }
    .la-sv     { font-size:0.9rem; font-weight:600; color:var(--text-primary); }
    .emi-pay-box  { background:#f0f4ff; border:1px solid #e0e7ff; border-radius:var(--radius-md); padding:1rem 1.25rem; }
    .epb-title    { font-weight:700; font-size:0.9rem; color:var(--primary); margin-bottom:0.75rem; }
    .epb-form     { display:grid; grid-template-columns:1fr 1fr auto; gap:0.75rem; align-items:start; }
    .la-closed    { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:0.75rem 1rem; font-size:0.88rem; color:#166534; }
    /* EMI Progress */
    .emi-progress-section { margin:1rem 0 0.5rem; }
    .eps-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; }
    .eps-title-sm { font-size:0.8rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; }
    .eps-pct { font-size:0.8rem; font-weight:700; color:var(--primary); }
    .eps-track { height:10px; background:#e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:0.4rem; }
    .eps-fill { height:100%; background:linear-gradient(90deg,#3949ab,#42a5f5); border-radius:10px; transition:width 0.6s ease; }
    .eps-fill.full { background:linear-gradient(90deg,#16a34a,#4ade80); }
    .eps-row { display:flex; justify-content:space-between; font-size:0.76rem; color:var(--text-muted); }
    /* EMI Summary Grid */
    .emi-summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.65rem; margin:1rem 0; }
    @media(max-width:640px) { .emi-summary-grid { grid-template-columns:repeat(2,1fr); } }
    .esm-item { background:#f8faff; border-radius:10px; padding:0.7rem 0.85rem; border:1px solid #e0e7ff; }
    .esm-item.green { background:#f0fdf4; border-color:#bbf7d0; }
    .esm-item.red   { background:#fff1f2; border-color:#fecaca; }
    .esm-lbl { display:block; font-size:0.67rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:0.25rem; }
    .esm-val { font-size:0.95rem; font-weight:700; color:var(--text-primary); }
    .esm-val.green   { color:#16a34a; }
    .esm-val.red     { color:#dc2626; }
    .esm-val.primary { color:var(--primary); }
    /* EMI History */
    .emi-history { margin:0.75rem 0; border:1px solid #e0e7ff; border-radius:var(--radius-md); overflow:hidden; }
    .emih-title { background:#f0f4ff; padding:0.55rem 1rem; font-size:0.78rem; font-weight:700; color:var(--primary); }
    .emih-list  { display:flex; flex-direction:column; }
    .emih-row   { display:grid; grid-template-columns:36px 1fr 1fr 60px; gap:0.5rem; align-items:center;
      padding:0.55rem 1rem; border-top:1px solid #f1f5f9; font-size:0.82rem; }
    .emih-num   { font-weight:700; color:var(--text-muted); font-size:0.72rem; }
    .emih-amt   { font-weight:700; color:var(--text-primary); }
    .emih-date  { color:var(--text-muted); font-size:0.76rem; }
    .emih-badge { background:#d1fae5; color:#065f46; font-size:0.68rem; font-weight:700;
      padding:0.18rem 0.5rem; border-radius:10px; text-align:center; }
    /* Mobile */
    @media(max-width:768px) {
      .loans-hub { flex-direction:column; }
      .lh-sidebar { width:100%; height:auto; position:static; }
      .lh-nav { display:flex; flex-direction:row; overflow-x:auto; padding:0; }
      .lh-nav-btn { border-left:none; border-bottom:3px solid transparent; white-space:nowrap; }
      .lh-nav-btn.active { border-bottom-color:var(--primary); }
      .lh-brand, .lh-back-btn { display:none; }
    }
  `]
})
export class LoansComponent implements OnInit {
  private loanSvc    = inject(LoanService);
  private accountSvc = inject(AccountService);
  private router     = inject(Router);

  loading      = signal(true);
  applying     = signal(false);
  loans        = signal<Loan[]>([]);
  error        = signal('');
  applySuccess = signal('');
  activeTab    = signal<Tab>('overview');

  form = { loanType: 'PERSONAL' as LoanType, requestedAmount: 50000, tenureMonths: 24, purpose: '' };
  applyTouched = false;

  activeLoan    = signal<Loan | null>(null);
  emiAccounts   = signal<Account[]>([]);
  emiPayAccount = '';
  emiAmount     = 0;
  emiPaying     = signal(false);
  emiError      = signal('');
  emiSuccess    = signal('');

  // Session-only history (for display in payment history table this session)
  private sessionHistory = signal<Record<number, { num: number; amount: number; date: Date }[]>>({});

  getHistory(loanId: number) { return this.sessionHistory()[loanId] ?? []; }

  totalPayable(loan: Loan): number {
    const emi = loan.monthlyEmi || this.calcEMIForLoan(loan);
    return emi * loan.tenureMonths;
  }
  outstandingBalance(loan: Loan): number {
    return Math.max(0, this.totalPayable(loan) - (loan.totalPaidAmount ?? 0));
  }
  emiProgressPct(loan: Loan): number {
    const total = this.totalPayable(loan);
    if (total <= 0) return 0;
    const paid = loan.totalPaidAmount ?? 0;
    return Math.min(100, Math.round((paid / total) * 100));
  }
  isLoanFullyPaid(loan: Loan): boolean {
    return this.outstandingBalance(loan) <= 0;
  }

  navItems = [
    { tab: 'overview'     as Tab, icon: '📊', label: 'Overview'         },
    { tab: 'products'     as Tab, icon: '🏷️', label: 'Loan Products'   },
    { tab: 'apply'        as Tab, icon: '📝', label: 'Apply for Loan'  },
    { tab: 'applications' as Tab, icon: '📋', label: 'My Applications' },
    { tab: 'accounts'     as Tab, icon: '🏦', label: 'My Loan Accounts'},
  ];

  loanTypes = [
    { value: 'PERSONAL',         label: 'Personal',    icon: '👤', rate: 12.5, color: '#3b82f6', desc: 'Any personal use',         max: '₹5L',  tenure: '1–5 yrs'   },
    { value: 'HOME',             label: 'Home',        icon: '🏠', rate: 8.5,  color: '#10b981', desc: 'Buy or build home',        max: '₹50L', tenure: '5–20 yrs'  },
    { value: 'VEHICLE',          label: 'Car',         icon: '🚗', rate: 10.5, color: '#f59e0b', desc: 'Car / SUV purchase',       max: '₹20L', tenure: '1–7 yrs'   },
    { value: 'TWO_WHEELER',      label: 'Bike',        icon: '🏍️', rate: 11.0, color: '#ef4444', desc: 'Two-wheeler purchase',     max: '₹2L',  tenure: '1–3 yrs'   },
    { value: 'EDUCATION',        label: 'Education',   icon: '🎓', rate: 9.0,  color: '#8b5cf6', desc: 'Tuition & academic',       max: '₹10L', tenure: '1–10 yrs'  },
    { value: 'BUSINESS',         label: 'Business',    icon: '💼', rate: 14.0, color: '#06b6d4', desc: 'Expand your business',     max: '₹25L', tenure: '1–7 yrs'   },
    { value: 'GOLD',             label: 'Gold',        icon: '🥇', rate: 9.5,  color: '#d97706', desc: 'Against gold collateral',  max: '₹10L', tenure: '1–3 yrs'   },
    { value: 'MEDICAL',          label: 'Medical',     icon: '🏥', rate: 12.0, color: '#ec4899', desc: 'Medical expenses',         max: '₹3L',  tenure: '1–3 yrs'   },
    { value: 'AGRICULTURE',      label: 'Agriculture', icon: '🌾', rate: 7.0,  color: '#65a30d', desc: 'Farm & crop financing',    max: '₹5L',  tenure: '1–5 yrs'   },
    { value: 'CONSUMER_DURABLE', label: 'Consumer',    icon: '📱', rate: 13.0, color: '#7c3aed', desc: 'Electronics & appliances', max: '₹1L',  tenure: '6mo–2 yrs' },
  ];

  pendingLoans       = computed(() => this.loans().filter(l => ['APPLIED','UNDER_REVIEW','REJECTED'].includes(l.status)));
  myAccounts         = computed(() => this.loans().filter(l => ['APPROVED','DISBURSED','CLOSED'].includes(l.status)));
  activePendingCount = computed(() => this.loans().filter(l => ['APPLIED','UNDER_REVIEW'].includes(l.status)).length);
  approvedCount      = computed(() => this.loans().filter(l => ['APPROVED','DISBURSED'].includes(l.status)).length);
  totalBorrowed      = computed(() => this.myAccounts().reduce((s, l) => s + (l.approvedAmount || l.requestedAmount), 0));
  totalMonthlyEmi    = computed(() =>
    this.myAccounts().filter(l => l.status !== 'CLOSED').reduce((s, l) => s + (l.monthlyEmi || this.calcEMIForLoan(l)), 0)
  );

  ngOnInit() {
    this.loadLoans();
    this.accountSvc.getAccounts().subscribe(r => {
      if (r.success) this.emiAccounts.set(r.data.filter((a: Account) => a.status === 'ACTIVE'));
    });
  }

  loadLoans() {
    this.loanSvc.getMyLoans().subscribe({
      next: r => {
        this.loading.set(false);
        if (r.success) {
          this.loans.set(r.data);
          // Auto-set emi amount to first active loan's monthly instalment
          const firstActive = r.data.find((l: Loan) => ['APPROVED','DISBURSED'].includes(l.status));
          if (firstActive) {
            const outstanding = this.outstandingBalance(firstActive);
            const emi = firstActive.monthlyEmi || this.calcEMIForLoan(firstActive);
            this.emiAmount = Math.min(emi, outstanding);
          }
        }
      },
      error: () => this.loading.set(false),
    });
  }

  applyForProduct(loanType: string) {
    this.form.loanType = loanType as LoanType;
    this.activeTab.set('apply');
  }

  applyLoan() {
    this.applyTouched = true;
    this.error.set('');
    if (this.form.requestedAmount < 10000) { this.error.set('Minimum loan amount is ₹10,000.'); return; }
    if (this.form.requestedAmount > 10000000) { this.error.set('Maximum loan amount is ₹1 Crore.'); return; }
    if (!this.form.purpose.trim()) { this.error.set('Please provide the purpose of the loan.'); return; }
    this.applying.set(true);
    this.loanSvc.applyForLoan(this.form).subscribe({
      next: r => {
        this.applying.set(false);
        if (r.success) {
          this.applySuccess.set('🎉 Application submitted successfully!');
          this.loadLoans();
          setTimeout(() => { this.applySuccess.set(''); this.activeTab.set('applications'); }, 2000);
        }
      },
      error: err => { this.applying.set(false); this.error.set(err.error?.message || 'Application failed'); },
    });
  }

  getRate(type: string) { return this.loanTypes.find(l => l.value === type)?.rate || 12.5; }

  calcEMI(): number {
    const r = this.getRate(this.form.loanType) / 1200;
    const n = this.form.tenureMonths, P = this.form.requestedAmount;
    if (!n || !P || r === 0) return 0;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  calcEMIForLoan(loan: Loan): number {
    if (loan.monthlyEmi) return loan.monthlyEmi;
    const rate = (loan.interestRate ?? this.getRate(loan.loanType)) / 1200;
    const n = loan.tenureMonths;
    const P = loan.approvedAmount ?? loan.requestedAmount;
    if (!n || !P || rate === 0) return 0;
    return (P * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  }

  payEmi(loan: Loan) {
    if (!this.emiPayAccount) { this.emiError.set('Please select an account.'); return; }
    if (!this.emiAmount || this.emiAmount <= 0) { this.emiError.set('Enter a valid amount.'); return; }

    // Cap at outstanding on frontend too
    const outstanding = this.outstandingBalance(loan);
    const actualAmount = Math.min(this.emiAmount, outstanding);
    if (actualAmount <= 0) { this.emiError.set('This loan is already fully repaid.'); return; }

    this.activeLoan.set(loan);
    this.emiPaying.set(true); this.emiError.set(''); this.emiSuccess.set('');
    this.loanSvc.payEmi(loan.id, Number(this.emiPayAccount), actualAmount).subscribe({
      next: r => {
        this.emiPaying.set(false);
        if (r.success) {
          // Update this loan in the signal with fresh API data
          this.loans.update(list => list.map(l => l.id === r.data.id ? r.data : l));
          // Re-fetch accounts to update balances
          this.accountSvc.getAccounts().subscribe(acc => {
            if (acc.success) this.emiAccounts.set(acc.data.filter((a: Account) => a.status === 'ACTIVE'));
          });
          // Record in session history for display
          const updatedLoan = r.data;
          const paid = updatedLoan.paidEmis ?? 0;
          this.sessionHistory.update(h => ({
            ...h,
            [loan.id]: [{ num: paid, amount: actualAmount, date: new Date() }, ...(h[loan.id] ?? [])]
          }));
          const newOutstanding = this.outstandingBalance(updatedLoan);
          const isFullyPaid = newOutstanding <= 0;
          this.emiSuccess.set(
            isFullyPaid
              ? `🎉 Loan fully repaid! ₹${actualAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} deducted. Outstanding: ₹0.00`
              : `✅ EMI #${paid} paid — ₹${actualAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} deducted. ` +
                `${loan.tenureMonths - paid} EMIs remaining · Outstanding ₹${newOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          );
          // Reset to next instalment amount (or outstanding if less)
          const nextEmi = loan.monthlyEmi || this.calcEMIForLoan(loan);
          this.emiAmount = isFullyPaid ? 0 : Math.min(nextEmi, newOutstanding);
        }
      },
      error: err => { this.emiPaying.set(false); this.emiError.set(err.error?.message || 'EMI payment failed'); },
    });
  }

  getLoanIcon(type: string) { return this.loanTypes.find(l => l.value === type)?.icon || '🏦'; }

  getLoanBadge(s: string) {
    const m: Record<string, string> = {
      APPLIED: 'badge-info', UNDER_REVIEW: 'badge-warning', APPROVED: 'badge-success',
      REJECTED: 'badge-danger', DISBURSED: 'badge-success', CLOSED: 'badge-secondary',
    };
    return m[s] || 'badge-secondary';
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
