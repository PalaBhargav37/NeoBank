import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">💳 Account Requests</h1>
          <p class="page-subtitle">Review and approve customer account opening requests</p>
        </div>
        <button class="btn btn-secondary" (click)="loadAccounts()">🔄 Refresh</button>
      </div>

      @if (successMsg()) { <div class="alert alert-success">✅ {{ successMsg() }}</div> }
      @if (errorMsg())   { <div class="alert alert-error">⚠ {{ errorMsg() }}</div> }

      <!-- Status filter tabs -->
      <div class="status-tabs">
        <button class="tab-btn" [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">
          All <span class="tab-count">{{ accounts().length }}</span>
        </button>
        <button class="tab-btn tab-pending" [class.active]="filter() === 'PENDING'" (click)="filter.set('PENDING')">
          🕐 Pending <span class="tab-count">{{ countBy('PENDING') }}</span>
        </button>
        <button class="tab-btn tab-active" [class.active]="filter() === 'ACTIVE'" (click)="filter.set('ACTIVE')">
          ✅ Approved <span class="tab-count">{{ countBy('ACTIVE') }}</span>
        </button>
        <button class="tab-btn tab-rejected" [class.active]="filter() === 'REJECTED'" (click)="filter.set('REJECTED')">
          ❌ Rejected <span class="tab-count">{{ countBy('REJECTED') }}</span>
        </button>
      </div>

      <!-- Reject modal -->
      @if (rejectTarget()) {
        <div class="modal-overlay" (click)="cancelReject()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-title">❌ Reject Account Request</div>
            <p style="font-size:0.875rem;color:#475569;margin-bottom:1rem">
              You are rejecting the <strong>{{ rejectTarget()!.accountType.replace('_',' ') }}</strong>
              account request from <strong>{{ rejectTarget()!.ownerName }}</strong>.
            </p>
            <div class="form-group">
              <label class="form-label">Rejection Reason <span style="color:#dc2626">*</span></label>
              <textarea class="form-control" [(ngModel)]="rejectReason" rows="3"
                placeholder="e.g. Incomplete documentation, duplicate request, KYC not verified..."></textarea>
            </div>
            <div style="display:flex;gap:0.75rem;margin-top:1rem">
              <button class="btn btn-danger" (click)="confirmReject()" [disabled]="!rejectReason.trim() || submitting()">
                @if (submitting()) { <span class="spinner"></span> } Confirm Rejection
              </button>
              <button class="btn btn-secondary" (click)="cancelReject()">Cancel</button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner-dark" style="width:40px;height:40px;border-width:4px"></div>
          <span class="loading-text">Loading requests…</span>
        </div>
      } @else if (!filteredAccounts().length) {
        <div class="card empty-state">
          <span class="empty-icon">📭</span>
          <h3>No {{ filter() === 'ALL' ? '' : filter().toLowerCase() }} requests</h3>
          <p>Nothing to show for the selected filter</p>
        </div>
      } @else {
        <div class="requests-list">
          @for (acc of filteredAccounts(); track acc.id) {
            <div class="request-card" [class.req-pending]="acc.status==='PENDING'"
                 [class.req-active]="acc.status==='ACTIVE'"
                 [class.req-rejected]="acc.status==='REJECTED'">

              <!-- Card Header -->
              <div class="req-header">
                <div class="req-avatar">{{ acc.ownerName.charAt(0) }}</div>
                <div class="req-main">
                  <div class="req-name">{{ acc.ownerName }}</div>
                  <div class="req-ref">Ref: {{ acc.accountNumber }}</div>
                </div>
                <span class="badge" [class]="getStatusBadge(acc.status)">{{ acc.status }}</span>
              </div>

              <!-- Card Body -->
              <div class="req-body">
                <div class="req-detail">
                  <span class="rd-label">Account Type</span>
                  <strong class="rd-value">{{ formatType(acc.accountType) }}</strong>
                </div>
                <div class="req-detail">
                  <span class="rd-label">Currency</span>
                  <strong class="rd-value">{{ acc.currency }}</strong>
                </div>
                <div class="req-detail">
                  <span class="rd-label">Requested</span>
                  <strong class="rd-value">{{ acc.createdAt | date:'dd MMM yyyy' }}</strong>
                </div>
                <div class="req-detail">
                  <span class="rd-label">Customer ID</span>
                  <strong class="rd-value">#{{ acc.userId }}</strong>
                </div>

                @if (acc.status === 'ACTIVE') {
                  <div class="req-detail">
                    <span class="rd-label">Account No.</span>
                    <strong class="rd-value mono">{{ acc.accountNumber }}</strong>
                  </div>
                  <div class="req-detail">
                    <span class="rd-label">IFSC Code</span>
                    <strong class="rd-value mono ifsc">{{ acc.ifscCode }}</strong>
                  </div>
                  <div class="req-detail">
                    <span class="rd-label">MICR</span>
                    <strong class="rd-value mono">{{ acc.micrCode }}</strong>
                  </div>
                  <div class="req-detail">
                    <span class="rd-label">Branch</span>
                    <strong class="rd-value">{{ acc.branchName }}</strong>
                  </div>
                }

                @if (acc.status === 'REJECTED') {
                  <div class="req-detail full">
                    <span class="rd-label">Rejection Reason</span>
                    <strong class="rd-value" style="color:#dc2626">{{ acc.rejectionReason }}</strong>
                  </div>
                }

                @if (acc.reviewedBy) {
                  <div class="req-detail full">
                    <span class="rd-label">Reviewed By</span>
                    <strong class="rd-value">{{ acc.reviewedBy }} on {{ acc.reviewedAt | date:'dd MMM yyyy, h:mm a' }}</strong>
                  </div>
                }
              </div>

              <!-- Actions (only for PENDING) -->
              @if (acc.status === 'PENDING') {
                <div class="req-actions">
                  <button class="btn btn-success" (click)="approveAccount(acc)" [disabled]="submitting()">
                    @if (approvingId() === acc.id) { <span class="spinner"></span> }
                    ✅ Approve & Generate Details
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="openRejectModal(acc)" [disabled]="submitting()">
                    ❌ Reject
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* Status tabs */
    .status-tabs { display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
    .tab-btn { padding:0.45rem 1rem; border-radius:20px; border:1.5px solid #e2e8f0; background:white; font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.2s; color:#475569; display:flex; align-items:center; gap:0.4rem; }
    .tab-btn:hover { border-color:#1a237e; color:#1a237e; }
    .tab-btn.active { background:#1a237e; color:white; border-color:#1a237e; }
    .tab-pending.active  { background:#d97706; border-color:#d97706; }
    .tab-active.active   { background:#059669; border-color:#059669; }
    .tab-rejected.active { background:#dc2626; border-color:#dc2626; }
    .tab-count { background:rgba(255,255,255,0.25); border-radius:10px; padding:0 6px; font-size:0.72rem; }
    .tab-btn:not(.active) .tab-count { background:#f1f5f9; color:#64748b; }

    /* Requests list */
    .requests-list { display:flex; flex-direction:column; gap:1rem; }

    .request-card {
      background:white; border-radius:16px; border:1px solid #e2e8f0;
      overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);
      transition:all 0.25s; animation:cardEntrance 0.4s ease backwards;
    }
    .request-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1); transform:translateY(-2px); }
    .req-pending  { border-left:4px solid #f59e0b; }
    .req-active   { border-left:4px solid #10b981; }
    .req-rejected { border-left:4px solid #ef4444; }
    @keyframes cardEntrance { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    /* Header */
    .req-header { display:flex; align-items:center; gap:1rem; padding:1.1rem 1.25rem 0.75rem; }
    .req-avatar { width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg,#1a237e,#3949ab); color:white; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:800; flex-shrink:0; }
    .req-name { font-size:1rem; font-weight:700; color:#0f172a; }
    .req-ref  { font-size:0.73rem; color:#94a3b8; font-family:monospace; margin-top:0.1rem; }

    /* Body */
    .req-body { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:0.6rem; padding:0.75rem 1.25rem 1rem; background:#f8f9fe; }
    .req-detail { }
    .req-detail.full { grid-column:1/-1; }
    .rd-label { display:block; font-size:0.65rem; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.2rem; }
    .rd-value { font-size:0.85rem; color:#0f172a; display:block; }
    .rd-value.mono { font-family:monospace; font-size:0.88rem; color:#1a237e; }
    .rd-value.ifsc { font-weight:800; font-size:0.95rem; letter-spacing:1px; }

    /* Actions */
    .req-actions { display:flex; align-items:center; gap:0.75rem; padding:0.9rem 1.25rem; border-top:1px solid #e2e8f0; background:#fffbf0; flex-wrap:wrap; }

    /* Modal */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn 0.2s ease; }
    .modal-card { background:white; border-radius:16px; padding:2rem; width:100%; max-width:480px; box-shadow:0 24px 60px rgba(0,0,0,0.3); animation:scaleIn 0.25s cubic-bezier(0.34,1.3,0.64,1); }
    .modal-title { font-size:1.1rem; font-weight:700; color:#0f172a; margin-bottom:0.75rem; }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }

    @media(max-width:600px) { .req-body{grid-template-columns:1fr 1fr;} }
  `]
})
export class AdminAccountsComponent implements OnInit {
  private adminSvc = inject(AdminService);
  loading   = signal(true);
  submitting= signal(false);
  approvingId = signal<number | null>(null);
  accounts  = signal<Account[]>([]);
  filter    = signal<string>('PENDING');
  successMsg= signal('');
  errorMsg  = signal('');

  rejectTarget = signal<Account | null>(null);
  rejectReason = '';

  ngOnInit() { this.loadAccounts(); }

  loadAccounts() {
    this.loading.set(true);
    this.adminSvc.getAllAccountRequests().subscribe({
      next: (res) => { this.loading.set(false); if (res.success) this.accounts.set(res.data); },
      error: () => this.loading.set(false)
    });
  }

  filteredAccounts(): Account[] {
    const f = this.filter();
    if (f === 'ALL') return this.accounts();
    return this.accounts().filter(a => a.status === f);
  }

  countBy(status: string): number {
    return this.accounts().filter(a => a.status === status).length;
  }

  approveAccount(acc: Account) {
    this.submitting.set(true);
    this.approvingId.set(acc.id);
    this.errorMsg.set('');
    this.adminSvc.approveAccount(acc.id).subscribe({
      next: (res) => {
        this.submitting.set(false); this.approvingId.set(null);
        if (res.success) {
          this.successMsg.set(`Account approved! Number: ${res.data.accountNumber} | IFSC: ${res.data.ifscCode}`);
          this.loadAccounts();
          setTimeout(() => this.successMsg.set(''), 8000);
        }
      },
      error: (err) => {
        this.submitting.set(false); this.approvingId.set(null);
        this.errorMsg.set(err.error?.message || 'Approval failed');
      }
    });
  }

  openRejectModal(acc: Account) {
    this.rejectTarget.set(acc);
    this.rejectReason = '';
  }

  cancelReject() { this.rejectTarget.set(null); this.rejectReason = ''; }

  confirmReject() {
    const acc = this.rejectTarget();
    if (!acc || !this.rejectReason.trim()) return;
    this.submitting.set(true);
    this.adminSvc.rejectAccount(acc.id, this.rejectReason).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.successMsg.set(`Account request rejected for ${acc.ownerName}.`);
          this.rejectTarget.set(null);
          this.loadAccounts();
          setTimeout(() => this.successMsg.set(''), 5000);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'Rejection failed');
      }
    });
  }

  formatType(t: string) {
    const labels: Record<string, string> = { SAVINGS: 'Savings Account', CURRENT: 'Current Account', FIXED_DEPOSIT: 'Fixed Deposit' };
    return labels[t] ?? t.replace(/_/g, ' ');
  }
  getStatusBadge(s: string) {
    return ({ PENDING:'badge-warning', ACTIVE:'badge-success', REJECTED:'badge-danger', FROZEN:'badge-info', INACTIVE:'badge-secondary' } as any)[s] || 'badge-secondary';
  }
}
