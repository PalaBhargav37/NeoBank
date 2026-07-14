import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Loan } from '../../../models/loan.model';

@Component({
  selector: 'app-admin-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">🏦 Loan Management</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">Full overview of all loan accounts — click any row for details</p>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="load()">🔄 Refresh</button>
      </div>

      @if (success()) { <div class="alert alert-success" style="animation:slideDown 0.3s ease;margin-bottom:1rem">✅ {{ success() }}</div> }
      @if (error())   { <div class="alert alert-error" style="margin-bottom:1rem">{{ error() }}</div> }

      <!-- Summary Stats -->
      <div class="lm-stats">
        <div class="lm-stat blue">
          <div class="lms-icon">💰</div>
          <div class="lms-val">₹{{ totalBorrowed() | number:'1.0-0' }}</div>
          <div class="lms-lbl">Total Borrowed</div>
        </div>
        <div class="lm-stat green">
          <div class="lms-icon">📆</div>
          <div class="lms-val">₹{{ totalMonthlyEmi() | number:'1.0-0' }}</div>
          <div class="lms-lbl">Monthly EMI (Active)</div>
        </div>
        <div class="lm-stat amber">
          <div class="lms-icon">⏳</div>
          <div class="lms-val">{{ pendingCount() }}</div>
          <div class="lms-lbl">Pending Review</div>
        </div>
        <div class="lm-stat purple">
          <div class="lms-icon">✅</div>
          <div class="lms-val">{{ approvedCount() }}</div>
          <div class="lms-lbl">Active Loans</div>
        </div>
        <div class="lm-stat red">
          <div class="lms-icon">❌</div>
          <div class="lms-val">{{ rejectedCount() }}</div>
          <div class="lms-lbl">Rejected</div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="lm-tabs">
        <button class="lmt" [class.active]="activeTab() === 'ALL'" (click)="activeTab.set('ALL')" style="--tc:var(--primary)">
          📋 All <span class="lmt-c">{{ loans().length }}</span>
        </button>
        @for (t of tabs; track t.val) {
          <button class="lmt" [class.active]="activeTab() === t.val" (click)="activeTab.set(t.val)" [style.--tc]="t.color">
            {{ t.icon }} {{ t.label }} <span class="lmt-c">{{ countByStatus(t.val) }}</span>
          </button>
        }
      </div>

      <!-- Search -->
      <div style="margin-bottom:1rem">
        <input class="form-control" style="max-width:360px" [ngModel]="search()" (ngModelChange)="search.set($event)"
          placeholder="🔍 Search by name, loan type, amount..." />
      </div>

      @if (loading()) {
        <div style="display:flex;flex-direction:column;gap:0.6rem">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton" style="height:72px;border-radius:var(--radius-md)"></div>
          }
        </div>
      } @else if (!filteredLoans().length) {
        <div class="card empty-state">
          <div class="empty-icon">🏦</div>
          <h3>No loans found</h3>
          <p>Try changing the filter or search.</p>
        </div>
      } @else {

        <!-- Table Header -->
        <div class="lm-table-head">
          <span>Borrower</span>
          <span>Loan Type</span>
          <span>Amount</span>
          <span>EMI / Month</span>
          <span>Total Payable</span>
          <span>Paid</span>
          <span>Outstanding</span>
          <span>Status</span>
          <span>Applied On</span>
        </div>

        <!-- Loan Rows -->
        <div style="display:flex;flex-direction:column;gap:0.4rem">
          @for (loan of filteredLoans(); track loan.id) {
            <div class="lm-row" [attr.data-status]="loan.status"
                 [class.expanded]="expandedId() === loan.id"
                 (click)="toggle(loan)">
              <!-- Row Cells -->
              <span class="lm-cell borrower">
                <span class="borrower-avatar">{{ loan.userName.charAt(0).toUpperCase() }}</span>
                <div>
                  <div class="borrower-name">{{ loan.userName }}</div>
                  <div class="borrower-id">ID #{{ loan.userId }}</div>
                </div>
              </span>
              <span class="lm-cell">
                <span class="loan-type-chip">{{ getLoanIcon(loan.loanType) }} {{ loan.loanType }}</span>
              </span>
              <span class="lm-cell amount">₹{{ loan.requestedAmount | number:'1.0-0' }}</span>
              <span class="lm-cell emi">₹{{ (loan.monthlyEmi || calcEMI(loan)) | number:'1.0-0' }}/mo</span>
              <span class="lm-cell">₹{{ totalPayable(loan) | number:'1.0-0' }}</span>
              <span class="lm-cell paid">₹{{ (loan.totalPaidAmount ?? 0) | number:'1.0-0' }}</span>
              <span class="lm-cell outstanding">₹{{ adminOutstanding(loan) | number:'1.0-0' }}</span>
              <span class="lm-cell"><span class="badge" [class]="getBadge(loan.status)">{{ loan.status }}</span></span>
              <span class="lm-cell date">{{ loan.appliedAt | date:'d MMM y' }}</span>
            </div>

            <!-- ── Expanded Detail Panel ── -->
            @if (expandedId() === loan.id) {
              <div class="lm-detail" (click)="$event.stopPropagation()">

                <!-- Detail Header -->
                <div class="lmd-header">
                  <div class="lmd-title">{{ getLoanIcon(loan.loanType) }} {{ loan.loanType }} Loan — Full Details</div>
                  <div style="display:flex;gap:0.5rem;align-items:center">
                    <span class="badge" [class]="getBadge(loan.status)" style="font-size:0.82rem">{{ loan.status }}</span>
                    <button class="lmd-close" (click)="expandedId.set(null)">✕ Close</button>
                  </div>
                </div>

                <div class="lmd-cols">
                  <!-- LEFT: Borrower + Loan Info -->
                  <div>
                    <!-- Borrower Card -->
                    <div class="lmd-section">
                      <div class="lmds-title">👤 Borrower Information</div>
                      <div class="lmd-info-grid">
                        <div class="lmdig-item"><span class="lmdig-lbl">Full Name</span><span class="lmdig-val">{{ loan.userName }}</span></div>
                        <div class="lmdig-item"><span class="lmdig-lbl">User ID</span><span class="lmdig-val mono">#{{ loan.userId }}</span></div>
                        <div class="lmdig-item"><span class="lmdig-lbl">Applied On</span><span class="lmdig-val">{{ loan.appliedAt | date:'dd MMM yyyy, h:mm a' }}</span></div>
                        <div class="lmdig-item"><span class="lmdig-lbl">Reviewed On</span><span class="lmdig-val">{{ loan.reviewedAt ? (loan.reviewedAt | date:'dd MMM yyyy, h:mm a') : '—' }}</span></div>
                        @if (loan.purpose) {
                          <div class="lmdig-item full"><span class="lmdig-lbl">Purpose</span><span class="lmdig-val">{{ loan.purpose }}</span></div>
                        }
                        @if (loan.remarks) {
                          <div class="lmdig-item full"><span class="lmdig-lbl">Admin Remarks</span><span class="lmdig-val">{{ loan.remarks }}</span></div>
                        }
                      </div>
                    </div>

                    <!-- Loan Terms -->
                    <div class="lmd-section" style="margin-top:1rem">
                      <div class="lmds-title">📋 Loan Terms</div>
                      <div class="lmd-info-grid">
                        <div class="lmdig-item"><span class="lmdig-lbl">Loan Type</span><span class="lmdig-val">{{ getLoanIcon(loan.loanType) }} {{ loan.loanType }}</span></div>
                        <div class="lmdig-item"><span class="lmdig-lbl">Requested Amount</span><span class="lmdig-val primary">₹{{ loan.requestedAmount | number:'1.2-2' }}</span></div>
                        @if (loan.approvedAmount) {
                          <div class="lmdig-item"><span class="lmdig-lbl">Approved Amount</span><span class="lmdig-val success">₹{{ loan.approvedAmount | number:'1.2-2' }}</span></div>
                        }
                        <div class="lmdig-item"><span class="lmdig-lbl">Tenure</span><span class="lmdig-val">{{ loan.tenureMonths }} months ({{ (loan.tenureMonths/12).toFixed(1) }} yrs)</span></div>
                        <div class="lmdig-item"><span class="lmdig-lbl">Interest Rate</span><span class="lmdig-val">{{ loan.interestRate ?? '—' }}% p.a.</span></div>
                        <div class="lmdig-item"><span class="lmdig-lbl">Monthly EMI</span><span class="lmdig-val primary">₹{{ (loan.monthlyEmi || calcEMI(loan)) | number:'1.2-2' }}</span></div>
                      </div>
                    </div>
                  </div>

                  <!-- RIGHT: Financial Summary -->
                  <div>
                    <div class="lmd-section">
                      <div class="lmds-title">💰 Financial Summary</div>
                      <div class="fin-summary">
                        <div class="fin-row main">
                          <span>Loan Amount</span>
                          <strong>₹{{ (loan.approvedAmount || loan.requestedAmount) | number:'1.2-2' }}</strong>
                        </div>
                        <div class="fin-row">
                          <span>Total Interest</span>
                          <span class="warn">₹{{ totalInterest(loan) | number:'1.2-2' }}</span>
                        </div>
                        <div class="fin-row total">
                          <span>Total Payable</span>
                          <strong class="danger">₹{{ totalPayable(loan) | number:'1.2-2' }}</strong>
                        </div>
                        <div class="fin-divider"></div>
                        <div class="fin-row">
                          <span>✅ Total Paid</span>
                          <span class="success">₹{{ (loan.totalPaidAmount ?? 0) | number:'1.2-2' }}</span>
                        </div>
                        <div class="fin-row">
                          <span>📊 EMIs Paid</span>
                          <span class="success">{{ loan.paidEmis ?? 0 }} of {{ loan.tenureMonths }}</span>
                        </div>
                        <div class="fin-row outstanding-row">
                          <span>⏳ Outstanding Balance</span>
                          <strong class="danger">₹{{ adminOutstanding(loan) | number:'1.2-2' }}</strong>
                        </div>
                      </div>

                      <!-- Progress -->
                      @if (loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'CLOSED') {
                        <div style="margin-top:1rem">
                          <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);margin-bottom:0.35rem">
                            <span>Repayment Progress</span>
                            <span>{{ adminRepaymentPct(loan) }}%</span>
                          </div>
                          <div class="prog-track">
                            <div class="prog-fill" [style.width.%]="adminRepaymentPct(loan)"
                                 [class.full]="adminRepaymentPct(loan) >= 100"></div>
                          </div>
                          <div style="display:flex;justify-content:space-between;font-size:0.74rem;color:#94a3b8;margin-top:0.3rem">
                            <span>{{ loan.paidEmis ?? 0 }} of {{ loan.tenureMonths }} EMIs paid</span>
                            <span>{{ loan.tenureMonths - (loan.paidEmis ?? 0) }} remaining</span>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- EMI Schedule Preview -->
                    <div class="lmd-section" style="margin-top:1rem">
                      <div class="lmds-title">📅 EMI Schedule (first 3)</div>
                      <div class="emi-sched">
                        @for (n of [1,2,3]; track n) {
                          <div class="ems-row">
                            <span class="ems-n">#{{ n }}</span>
                            <span class="ems-date">{{ emiDate(loan, n) | date:'MMM yyyy' }}</span>
                            <span class="ems-amt">₹{{ (loan.monthlyEmi || calcEMI(loan)) | number:'1.0-0' }}</span>
                            <span class="ems-badge pending">Pending</span>
                          </div>
                        }
                        @if (loan.tenureMonths > 3) {
                          <div class="ems-more">+ {{ loan.tenureMonths - 3 }} more instalments</div>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Review Section (only for pending) -->
                @if (loan.status === 'APPLIED' || loan.status === 'UNDER_REVIEW') {
                  <div class="lmd-review">
                    <div class="lmds-title" style="margin-bottom:1rem">⚖️ Admin Decision</div>
                    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
                      <div class="form-group" style="flex:1;min-width:180px;margin-bottom:0">
                        <label class="form-label">Decision</label>
                        <select class="form-control" [(ngModel)]="decision">
                          <option value="">— Select —</option>
                          <option value="APPROVED">✅ Approve</option>
                          <option value="REJECTED">❌ Reject</option>
                          <option value="UNDER_REVIEW">🔍 Under Review</option>
                        </select>
                      </div>
                      <div class="form-group" style="flex:2;min-width:220px;margin-bottom:0">
                        <label class="form-label">Remarks (optional)</label>
                        <input class="form-control" [(ngModel)]="remarks" placeholder="Add reviewer notes..." />
                      </div>
                      <button class="btn btn-primary" (click)="submitDecision(loan)"
                              [disabled]="!decision || submitting()" style="flex-shrink:0">
                        @if (submitting()) { <span class="spinner"></span> } ✅ Submit Decision
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="lmd-status-banner" [class]="loan.status.toLowerCase()">
                    @if (loan.status === 'APPROVED' || loan.status === 'DISBURSED') {
                      ✅ This loan has been <strong>approved</strong>. EMI collections are active.
                    } @else if (loan.status === 'REJECTED') {
                      ❌ This application was <strong>rejected</strong>.
                      @if (loan.remarks) { Reason: {{ loan.remarks }} }
                    } @else if (loan.status === 'CLOSED') {
                      🎉 This loan has been <strong>fully repaid</strong> and closed.
                    }
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
    /* Stats */
    .lm-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:1rem; margin-bottom:1.5rem; }
    @media(max-width:900px) { .lm-stats { grid-template-columns:repeat(3,1fr); } }
    .lm-stat { border-radius:var(--radius-lg); padding:1.25rem 1rem; text-align:center; border:1px solid var(--border); }
    .lm-stat.blue   { background:linear-gradient(135deg,#eff6ff,#dbeafe); border-color:#bfdbfe; }
    .lm-stat.green  { background:linear-gradient(135deg,#f0fdf4,#d1fae5); border-color:#a7f3d0; }
    .lm-stat.amber  { background:linear-gradient(135deg,#fffbeb,#fef3c7); border-color:#fde68a; }
    .lm-stat.purple { background:linear-gradient(135deg,#faf5ff,#ede9fe); border-color:#ddd6fe; }
    .lm-stat.red    { background:linear-gradient(135deg,#fff1f2,#fee2e2); border-color:#fecaca; }
    .lms-icon { font-size:1.5rem; margin-bottom:0.35rem; }
    .lms-val  { font-size:1.5rem; font-weight:800; color:var(--text-primary); line-height:1; }
    .lms-lbl  { font-size:0.72rem; color:var(--text-muted); margin-top:0.3rem; }
    /* Tabs */
    .lm-tabs { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem; }
    .lmt { padding:0.4rem 1rem; border-radius:20px; border:1.5px solid #e5e7eb; background:white;
      font-size:0.82rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:0.4rem; }
    .lmt:hover  { border-color:var(--tc); color:var(--tc); }
    .lmt.active { background:var(--tc); border-color:var(--tc); color:white; font-weight:600; }
    .lmt-c { background:rgba(0,0,0,0.12); border-radius:10px; padding:0.1rem 0.45rem; font-size:0.7rem; font-weight:700; }
    .lmt:not(.active) .lmt-c { background:#f3f4f6; color:var(--text-muted); }
    /* Table */
    .lm-table-head { display:grid;
      grid-template-columns: 200px 130px 110px 110px 120px 100px 120px 130px 100px;
      gap:0.5rem; padding:0.5rem 1rem; font-size:0.68rem; font-weight:700;
      text-transform:uppercase; letter-spacing:.05em; color:var(--text-muted);
      background:#f8faff; border-radius:var(--radius-md) var(--radius-md) 0 0;
      border:1px solid var(--border); border-bottom:none; overflow-x:auto; }
    .lm-row { display:grid;
      grid-template-columns: 200px 130px 110px 110px 120px 100px 120px 130px 100px;
      gap:0.5rem; padding:0.75rem 1rem; align-items:center;
      background:var(--card-bg); border:1px solid var(--border); border-top:none;
      cursor:pointer; transition:all 0.2s; overflow-x:auto; }
    .lm-row:last-of-type { border-radius:0 0 var(--radius-md) var(--radius-md); }
    .lm-row:hover  { background:#f0f4ff; }
    .lm-row.expanded { background:#f0f4ff; border-color:var(--primary); border-left:3px solid var(--primary); }
    .lm-row[data-status="APPLIED"]      { border-left:3px solid #3b82f6; }
    .lm-row[data-status="UNDER_REVIEW"] { border-left:3px solid #f59e0b; }
    .lm-row[data-status="APPROVED"]     { border-left:3px solid #10b981; }
    .lm-row[data-status="REJECTED"]     { border-left:3px solid #ef4444; }
    .lm-row[data-status="CLOSED"]       { border-left:3px solid #94a3b8; }
    .lm-cell { font-size:0.85rem; color:var(--text-primary); }
    .lm-cell.borrower { display:flex; align-items:center; gap:0.6rem; }
    .borrower-avatar { width:32px; height:32px; border-radius:50%; background:var(--primary);
      color:#fff; font-size:0.82rem; font-weight:700; display:flex; align-items:center;
      justify-content:center; flex-shrink:0; }
    .borrower-name { font-weight:600; font-size:0.85rem; color:var(--text-primary); }
    .borrower-id   { font-size:0.72rem; color:var(--text-muted); font-family:monospace; }
    .loan-type-chip { background:#f1f5f9; border-radius:6px; padding:0.2rem 0.5rem;
      font-size:0.75rem; font-weight:600; color:#475569; white-space:nowrap; }
    .lm-cell.amount { font-weight:700; color:var(--primary); }
    .lm-cell.emi    { color:#16a34a; font-weight:600; }
    .lm-cell.paid   { color:#16a34a; }
    .lm-cell.outstanding { color:#dc2626; font-weight:600; }
    .lm-cell.date   { font-size:0.78rem; color:var(--text-muted); }
    /* Detail Panel */
    .lm-detail { background:#f8faff; border:1px solid var(--primary); border-top:none;
      border-radius:0 0 var(--radius-lg) var(--radius-lg); padding:1.5rem;
      animation:slideDown 0.25s ease; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    .lmd-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .lmd-title  { font-size:1.1rem; font-weight:700; color:var(--text-primary); }
    .lmd-close  { background:#fff; border:1.5px solid #e2e8f0; border-radius:8px; padding:0.3rem 0.75rem;
      cursor:pointer; font-size:0.82rem; color:#64748b; transition:all 0.2s; }
    .lmd-close:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }
    .lmd-cols   { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
    @media(max-width:800px) { .lmd-cols { grid-template-columns:1fr; } }
    .lmd-section { background:#fff; border:1px solid #e0e7ff; border-radius:var(--radius-md); padding:1.1rem; }
    .lmds-title  { font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em;
      color:var(--primary); margin-bottom:0.85rem; }
    .lmd-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; }
    .lmdig-item.full { grid-column:1/-1; }
    .lmdig-lbl  { display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; margin-bottom:0.15rem; }
    .lmdig-val  { font-size:0.88rem; font-weight:600; color:var(--text-primary); }
    .lmdig-val.primary { color:var(--primary); }
    .lmdig-val.success { color:#16a34a; }
    .lmdig-val.mono    { font-family:monospace; }
    /* Financial summary */
    .fin-summary { display:flex; flex-direction:column; }
    .fin-row { display:flex; justify-content:space-between; align-items:center;
      padding:0.5rem 0; border-bottom:1px solid #f1f5f9; font-size:0.88rem; }
    .fin-row:last-child { border-bottom:none; }
    .fin-row.main  { font-weight:600; }
    .fin-row.total { font-weight:700; padding-top:0.65rem; border-top:2px solid #e2e8f0; border-bottom:none; }
    .fin-row.outstanding-row { background:#fff1f2; border-radius:6px; padding:0.5rem 0.6rem; margin-top:0.2rem; border:none; }
    .fin-divider { height:1px; background:#e2e8f0; margin:0.5rem 0; }
    .warn    { color:#d97706; font-weight:600; }
    .success { color:#16a34a; font-weight:600; }
    .danger  { color:#dc2626; font-weight:600; }
    /* Progress */
    .prog-track { height:10px; background:#e2e8f0; border-radius:10px; overflow:hidden; }
    .prog-fill  { height:100%; background:linear-gradient(90deg,#3949ab,#42a5f5); border-radius:10px; transition:width 0.6s; }
    .prog-fill.full { background:linear-gradient(90deg,#16a34a,#4ade80); }
    /* EMI Schedule */
    .emi-sched { display:flex; flex-direction:column; }
    .ems-row   { display:grid; grid-template-columns:28px 1fr auto auto; gap:0.5rem;
      align-items:center; padding:0.5rem 0; border-bottom:1px solid #f1f5f9; font-size:0.84rem; }
    .ems-row:last-child { border-bottom:none; }
    .ems-n     { font-weight:700; color:#94a3b8; font-size:0.72rem; }
    .ems-date  { color:var(--text-muted); }
    .ems-amt   { font-weight:700; color:var(--primary); }
    .ems-badge.pending { background:#fef9c3; color:#b45309; font-size:0.68rem; font-weight:700;
      padding:0.15rem 0.5rem; border-radius:10px; }
    .ems-more  { font-size:0.78rem; color:#94a3b8; text-align:center; padding:0.5rem; font-style:italic; }
    /* Review section */
    .lmd-review { background:#fff; border:1px solid #e0e7ff; border-radius:var(--radius-md);
      padding:1.25rem; margin-top:1.5rem; }
    /* Status banner */
    .lmd-status-banner { border-radius:var(--radius-md); padding:1rem 1.25rem; margin-top:1.5rem;
      font-size:0.9rem; border:1px solid; }
    .lmd-status-banner.approved, .lmd-status-banner.disbursed
      { background:#f0fdf4; border-color:#bbf7d0; color:#166534; }
    .lmd-status-banner.rejected { background:#fff1f2; border-color:#fecaca; color:#991b1b; }
    .lmd-status-banner.closed   { background:#f8faff; border-color:#e0e7ff; color:#3949ab; }
  `]
})
export class AdminLoansComponent implements OnInit {
  private adminSvc = inject(AdminService);

  loading    = signal(true);
  submitting = signal(false);
  loans      = signal<Loan[]>([]);
  expandedId = signal<number | null>(null);
  decision   = '';
  remarks    = '';
  success    = signal('');
  error      = signal('');
  activeTab  = signal('ALL');
  search     = signal('');

  tabs = [
    { val: 'APPLIED',      label: 'New',          icon: '🆕', color: '#3b82f6' },
    { val: 'UNDER_REVIEW', label: 'Under Review',  icon: '🔍', color: '#f59e0b' },
    { val: 'APPROVED',     label: 'Approved',      icon: '✅', color: '#10b981' },
    { val: 'DISBURSED',    label: 'Disbursed',     icon: '💸', color: '#8b5cf6' },
    { val: 'REJECTED',     label: 'Rejected',      icon: '❌', color: '#ef4444' },
    { val: 'CLOSED',       label: 'Closed',        icon: '🔒', color: '#94a3b8' },
  ];

  totalBorrowed  = computed(() =>
    this.loans().filter(l => ['APPROVED','DISBURSED'].includes(l.status))
      .reduce((s, l) => s + (l.approvedAmount || l.requestedAmount), 0)
  );
  totalMonthlyEmi = computed(() =>
    this.loans().filter(l => ['APPROVED','DISBURSED'].includes(l.status))
      .reduce((s, l) => s + (l.monthlyEmi || this.calcEMI(l)), 0)
  );
  pendingCount  = computed(() => this.loans().filter(l => ['APPLIED','UNDER_REVIEW'].includes(l.status)).length);
  approvedCount = computed(() => this.loans().filter(l => ['APPROVED','DISBURSED'].includes(l.status)).length);
  rejectedCount = computed(() => this.loans().filter(l => l.status === 'REJECTED').length);

  filteredLoans = computed(() => {
    let list = this.activeTab() === 'ALL' ? this.loans() : this.loans().filter(l => l.status === this.activeTab());
    if (this.search().trim()) {
      const q = this.search().toLowerCase();
      list = list.filter(l =>
        l.userName.toLowerCase().includes(q) ||
        l.loanType.toLowerCase().includes(q) ||
        String(l.requestedAmount).includes(q) ||
        l.status.toLowerCase().includes(q)
      );
    }
    return list;
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminSvc.getAllLoans().subscribe({
      next: r => { this.loading.set(false); if (r.success) this.loans.set(r.data); },
      error: () => this.loading.set(false),
    });
  }

  toggle(loan: Loan) {
    if (this.expandedId() === loan.id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(loan.id);
      this.decision = ''; this.remarks = '';
    }
  }

  submitDecision(loan: Loan) {
    if (!this.decision) return;
    this.submitting.set(true); this.error.set('');
    this.adminSvc.updateLoanStatus(loan.id, this.decision, this.remarks).subscribe({
      next: r => {
        this.submitting.set(false);
        if (r.success) {
          this.loans.update(list => list.map(l => l.id === r.data.id ? r.data : l));
          this.expandedId.set(null);
          this.success.set(`Loan #${loan.id} (${loan.userName}) updated to ${this.decision}`);
          setTimeout(() => this.success.set(''), 4000);
        }
      },
      error: e => { this.submitting.set(false); this.error.set(e.error?.message || 'Update failed'); },
    });
  }

  /* ── Helpers ── */
  calcEMI(loan: Loan): number {
    const rate = (loan.interestRate ?? 12.5) / 1200;
    const n = loan.tenureMonths;
    const P = loan.approvedAmount ?? loan.requestedAmount;
    if (!n || !P || rate === 0) return 0;
    return (P * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  }

  totalPayable(loan: Loan): number {
    return (loan.monthlyEmi || this.calcEMI(loan)) * loan.tenureMonths;
  }

  totalInterest(loan: Loan): number {
    return this.totalPayable(loan) - (loan.approvedAmount || loan.requestedAmount);
  }

  adminOutstanding(loan: Loan): number {
    return Math.max(0, this.totalPayable(loan) - (loan.totalPaidAmount ?? 0));
  }

  adminRepaymentPct(loan: Loan): number {
    const paid = loan.paidEmis ?? 0;
    if (!loan.tenureMonths) return 0;
    return Math.min(100, Math.round((paid / loan.tenureMonths) * 100));
  }

  emiDate(loan: Loan, n: number): Date {
    const d = new Date(loan.appliedAt);
    d.setMonth(d.getMonth() + n);
    return d;
  }

  countByStatus(s: string) { return this.loans().filter(l => l.status === s).length; }

  getLoanIcon(type: string) {
    return ({ PERSONAL:'👤', HOME:'🏠', VEHICLE:'🚗', TWO_WHEELER:'🏍️',
      EDUCATION:'🎓', BUSINESS:'💼', GOLD:'🥇', MEDICAL:'🏥',
      AGRICULTURE:'🌾', CONSUMER_DURABLE:'📱' } as any)[type] || '🏦';
  }

  getBadge(s: string) {
    return ({ APPLIED:'badge-info', UNDER_REVIEW:'badge-warning', APPROVED:'badge-success',
      REJECTED:'badge-danger', DISBURSED:'badge-success', CLOSED:'badge-secondary' } as any)[s] || 'badge-secondary';
  }
}

