import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
  <aside class="sidebar" [class.mob-open]="mobileOpen">

    <div class="sb-header">
      <div class="sb-logo">🏦</div>
      <div class="sb-brand-wrap">
        <span class="sb-name">NeoBank</span>
        <span class="sb-tag">{{ isAdmin() ? 'Admin Panel' : 'Digital Banking' }}</span>
      </div>
    </div>

    <div class="sb-sep"></div>

    <nav class="sb-nav">
      @for (link of activeLinks(); track link.path) {
        <button [routerLink]="link.path" routerLinkActive="sb-active"
           class="sb-item" (click)="onLinkClick()">
          <span class="sb-icon">{{ link.icon }}</span>
          <span class="sb-label">{{ link.label }}</span>
        </button>
      }
    </nav>

    <div class="sb-footer">
      <div class="sb-sep"></div>
      <div class="sb-user">
        <div class="sb-uavatar">{{ initials() }}</div>
        <div class="sb-uinfo">
          <span class="sb-uname">{{ userName() }}</span>
          <span class="sb-urole">{{ isAdmin() ? 'Administrator' : 'Customer' }}</span>
        </div>
      </div>
    </div>

  </aside>
  `,
  styles: [`
    :host { display:block; }
    .sidebar {
      position:fixed; left:0; top:0; bottom:0; width:240px;
      background:#1A0800;
      display:flex; flex-direction:column;
      z-index:1000; overflow:hidden;
      transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);
      border-right:1px solid rgba(255,255,255,0.06);
      box-shadow:2px 0 24px rgba(0,0,0,0.28);
    }
    .sb-header {
      display:flex; align-items:center; gap:0.9rem;
      padding:1.3rem 1.1rem 1.1rem; flex-shrink:0;
    }
    .sb-logo {
      width:42px; height:42px; border-radius:12px; flex-shrink:0;
      background:linear-gradient(135deg,#C84010 0%,#E8411A 100%);
      display:flex; align-items:center; justify-content:center;
      font-size:1.3rem; box-shadow:0 4px 16px rgba(232,65,26,0.45);
    }
    .sb-brand-wrap { display:flex; flex-direction:column; line-height:1.25; min-width:0; }
    .sb-name { font-size:1.02rem; font-weight:800; color:#f1f5f9; letter-spacing:-0.3px; white-space:nowrap; }
    .sb-tag  { font-size:0.58rem; color:rgba(255,255,255,0.32); text-transform:uppercase; letter-spacing:1.8px; white-space:nowrap; }
    .sb-sep  { height:1px; background:rgba(255,255,255,0.07); flex-shrink:0; }
    .sb-nav  {
      display:flex; flex-direction:column; gap:0.06rem;
      padding:0.65rem 0.7rem; overflow-y:auto; flex:1;
    }
    .sb-nav::-webkit-scrollbar { width:3px; }
    .sb-nav::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }
    .sb-item {
      display:flex; align-items:center; gap:0.82rem;
      padding:0.65rem 0.9rem; border-radius:10px;
      color:rgba(255,255,255,0.46); text-decoration:none;
      font-size:0.85rem; font-weight:500;
      transition:color 0.17s, background 0.17s;
      position:relative; white-space:nowrap;
      /* reset button defaults */
      background:none; border:none; outline:none;
      cursor:pointer; width:100%; text-align:left;
      font-family:inherit; -webkit-appearance:none;
    }
    .sb-item:hover { color:rgba(255,255,255,0.88); background:rgba(255,255,255,0.07); }
    .sb-item.sb-active { color:#fff; background:rgba(232,65,26,0.2); font-weight:600; }
    .sb-item.sb-active::before {
      content:''; position:absolute; left:0; top:20%; bottom:20%;
      width:3px; border-radius:0 3px 3px 0;
      background:linear-gradient(180deg,#FFB585 0%,#E8411A 100%);
    }
    .sb-icon  { font-size:1rem; flex-shrink:0; width:22px; text-align:center; line-height:1; }
    .sb-label { font-size:0.845rem; }
    .sb-spacer { display:none; }
    .sb-footer { padding:0 0.7rem 1rem; flex-shrink:0; }
    .sb-user {
      display:flex; align-items:center; gap:0.78rem;
      padding:0.72rem 0.9rem; border-radius:10px;
      background:rgba(255,255,255,0.05); margin-top:0.5rem; overflow:hidden;
    }
    .sb-uavatar {
      width:34px; height:34px; border-radius:9px; flex-shrink:0;
      background:linear-gradient(135deg,#F47920,#E8411A);
      display:flex; align-items:center; justify-content:center;
      font-size:0.78rem; font-weight:800; color:white;
    }
    .sb-uinfo { display:flex; flex-direction:column; line-height:1.3; overflow:hidden; min-width:0; }
    .sb-uname { font-size:0.8rem; font-weight:700; color:#f1f5f9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sb-urole { font-size:0.59rem; color:rgba(255,255,255,0.32); text-transform:uppercase; letter-spacing:1px; }
    @media(max-width:768px) {
      .sidebar { transform:translateX(-240px); box-shadow:none; }
      .sidebar.mob-open { transform:translateX(0); box-shadow:4px 0 40px rgba(0,0,0,0.7); }
    }
  `]
})
export class NavbarComponent {
  @Input() mobileOpen = false;
  @Output() closeRequest = new EventEmitter<void>();
  private auth = inject(AuthService);

  readonly customerLinks = [
    { path:'/dashboard',     label:'Dashboard',    icon:'⊞' },
    { path:'/deposit',       label:'Deposit',      icon:'💰' },
    { path:'/withdraw',      label:'Withdraw',     icon:'💸' },
    { path:'/transfer',      label:'Transfer',     icon:'🔄' },
    { path:'/transactions',  label:'History',      icon:'📋' },
    { path:'/budget',        label:'Budget',       icon:'📊' },
    { path:'/make-payment',  label:'Make Payment', icon:'💳' },
    { path:'/bills',         label:'Bills',        icon:'🧾' },
    { path:'/rewards',       label:'Rewards',      icon:'🎁' },
    { path:'/insights',      label:'Insights',     icon:'📈' },
    { path:'/loans',         label:'Loan Account', icon:'🏦' },
    { path:'/notifications', label:'Alerts',       icon:'🔔' },
    { path:'/profile',       label:'Profile',      icon:'👤' },
  ];

  readonly adminLinks = [
    { path:'/admin/dashboard',     label:'Home',          icon:'🏠' },
    { path:'/admin/users',         label:'Users',         icon:'👥' },
    { path:'/admin/transactions',  label:'Analytics',     icon:'📊' },
    { path:'/admin/accounts',      label:'Approvals',     icon:'✅' },
    { path:'/admin/deposits',      label:'Deposits',      icon:'💰' },
    { path:'/admin/withdrawals',   label:'Withdrawals',   icon:'💸' },
    { path:'/admin/loans',         label:'Loans',         icon:'🏦' },
    { path:'/admin/bills',         label:'Bills',         icon:'🧾' },
    { path:'/admin/payments',      label:'Payments',      icon:'💳' },
    { path:'/admin/system-health', label:'System Health', icon:'💚' },
    { path:'/admin/audit-log',     label:'Audit Logs',    icon:'📋' },
    { path:'/profile',             label:'Profile',       icon:'👤' },
  ];

  activeLinks = () => this.isAdmin() ? this.adminLinks : this.customerLinks;
  isAdmin   = () => this.auth.isAdmin();
  userName  = () => { const u = this.auth.currentUser(); return u ? u.firstName + ' ' + u.lastName : ''; };
  initials  = () => { const u = this.auth.currentUser(); return u ? ((u.firstName?.[0]||'') + (u.lastName?.[0]||'')).toUpperCase() : '?'; };
  onLinkClick() { this.closeRequest.emit(); }
}
