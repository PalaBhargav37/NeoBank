const fs = require('fs');
const BT = '`';

// ───────────────────────────────────────────────────────────────
// 1. navbar.component.ts  — vertical sidebar
// ───────────────────────────────────────────────────────────────
const navbarPath = 'C:\\Users\\pala.TRN\\Downloads\\POC\\frontend\\src\\app\\components\\navbar\\navbar.component.ts';
const navbarLines = [
"import { Component, inject, Input, Output, EventEmitter } from '@angular/core';",
"import { RouterLink, RouterLinkActive } from '@angular/router';",
"import { CommonModule } from '@angular/common';",
"import { AuthService } from '../../services/auth.service';",
"",
"@Component({",
"  selector: 'app-navbar',",
"  standalone: true,",
"  imports: [CommonModule, RouterLink, RouterLinkActive],",
"  template: " + BT,
'  <aside class="sidebar" [class.mob-open]="mobileOpen">',
'',
'    <div class="sb-header">',
'      <div class="sb-logo">\uD83C\uDFE6</div>',
'      <div class="sb-brand-wrap">',
'        <span class="sb-name">NeoBank</span>',
"        <span class=\"sb-tag\">{{ isAdmin() ? 'Admin Panel' : 'Digital Banking' }}</span>",
'      </div>',
'    </div>',
'',
'    <div class="sb-sep"></div>',
'',
'    <nav class="sb-nav">',
'      @for (link of activeLinks(); track link.path) {',
'        <a [routerLink]="link.path" routerLinkActive="sb-active"',
'           class="sb-item" (click)="onLinkClick()">',
'          <span class="sb-icon">{{ link.icon }}</span>',
'          <span class="sb-label">{{ link.label }}</span>',
'        </a>',
'      }',
'    </nav>',
'',
'    <div class="sb-spacer"></div>',
'',
'    <div class="sb-footer">',
'      <div class="sb-sep"></div>',
'      <div class="sb-user">',
'        <div class="sb-uavatar">{{ initials() }}</div>',
'        <div class="sb-uinfo">',
'          <span class="sb-uname">{{ userName() }}</span>',
"          <span class=\"sb-urole\">{{ isAdmin() ? 'Administrator' : 'Customer' }}</span>",
'        </div>',
'      </div>',
'    </div>',
'',
'  </aside>',
"  " + BT + ",",
"  styles: [" + BT,
"    :host { display:block; }",
"    .sidebar {",
"      position:fixed; left:0; top:0; bottom:0; width:240px;",
"      background:#0f172a;",
"      display:flex; flex-direction:column;",
"      z-index:1000; overflow:hidden;",
"      transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);",
"      border-right:1px solid rgba(255,255,255,0.06);",
"      box-shadow:2px 0 24px rgba(0,0,0,0.28);",
"    }",
"    .sb-header {",
"      display:flex; align-items:center; gap:0.9rem;",
"      padding:1.3rem 1.1rem 1.1rem; flex-shrink:0;",
"    }",
"    .sb-logo {",
"      width:42px; height:42px; border-radius:12px; flex-shrink:0;",
"      background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);",
"      display:flex; align-items:center; justify-content:center;",
"      font-size:1.3rem; box-shadow:0 4px 16px rgba(59,130,246,0.45);",
"    }",
"    .sb-brand-wrap { display:flex; flex-direction:column; line-height:1.25; min-width:0; }",
"    .sb-name { font-size:1.02rem; font-weight:800; color:#f1f5f9; letter-spacing:-0.3px; white-space:nowrap; }",
"    .sb-tag  { font-size:0.58rem; color:rgba(255,255,255,0.32); text-transform:uppercase; letter-spacing:1.8px; white-space:nowrap; }",
"    .sb-sep  { height:1px; background:rgba(255,255,255,0.07); flex-shrink:0; }",
"    .sb-nav  {",
"      display:flex; flex-direction:column; gap:0.06rem;",
"      padding:0.65rem 0.7rem; overflow-y:auto; flex:1;",
"    }",
"    .sb-nav::-webkit-scrollbar { width:0; }",
"    .sb-item {",
"      display:flex; align-items:center; gap:0.82rem;",
"      padding:0.65rem 0.9rem; border-radius:10px;",
"      color:rgba(255,255,255,0.46); text-decoration:none;",
"      font-size:0.85rem; font-weight:500;",
"      transition:color 0.17s, background 0.17s;",
"      position:relative; white-space:nowrap;",
"    }",
"    .sb-item:hover { color:rgba(255,255,255,0.88); background:rgba(255,255,255,0.07); }",
"    .sb-item.sb-active { color:#fff; background:rgba(59,130,246,0.2); font-weight:600; }",
"    .sb-item.sb-active::before {",
"      content:''; position:absolute; left:0; top:20%; bottom:20%;",
"      width:3px; border-radius:0 3px 3px 0;",
"      background:linear-gradient(180deg,#93c5fd 0%,#3b82f6 100%);",
"    }",
"    .sb-icon  { font-size:1rem; flex-shrink:0; width:22px; text-align:center; line-height:1; }",
"    .sb-label { font-size:0.845rem; }",
"    .sb-spacer { flex:1; }",
"    .sb-footer { padding:0 0.7rem 1rem; flex-shrink:0; }",
"    .sb-user {",
"      display:flex; align-items:center; gap:0.78rem;",
"      padding:0.72rem 0.9rem; border-radius:10px;",
"      background:rgba(255,255,255,0.05); margin-top:0.5rem; overflow:hidden;",
"    }",
"    .sb-uavatar {",
"      width:34px; height:34px; border-radius:9px; flex-shrink:0;",
"      background:linear-gradient(135deg,#60a5fa,#3b82f6);",
"      display:flex; align-items:center; justify-content:center;",
"      font-size:0.78rem; font-weight:800; color:white;",
"    }",
"    .sb-uinfo { display:flex; flex-direction:column; line-height:1.3; overflow:hidden; min-width:0; }",
"    .sb-uname { font-size:0.8rem; font-weight:700; color:#f1f5f9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
"    .sb-urole { font-size:0.59rem; color:rgba(255,255,255,0.32); text-transform:uppercase; letter-spacing:1px; }",
"    @media(max-width:768px) {",
"      .sidebar { transform:translateX(-240px); box-shadow:none; }",
"      .sidebar.mob-open { transform:translateX(0); box-shadow:4px 0 40px rgba(0,0,0,0.7); }",
"    }",
"  " + BT + "]",
"})",
"export class NavbarComponent {",
"  @Input() mobileOpen = false;",
"  @Output() closeRequest = new EventEmitter<void>();",
"  private auth = inject(AuthService);",
"",
"  readonly customerLinks = [",
"    { path:'/dashboard',     label:'Dashboard',    icon:'\u229E' },",
"    { path:'/deposit',       label:'Deposit',      icon:'\uD83D\uDCB0' },",
"    { path:'/withdraw',      label:'Withdraw',     icon:'\uD83D\uDCB8' },",
"    { path:'/transfer',      label:'Transfer',     icon:'\uD83D\uDD04' },",
"    { path:'/transactions',  label:'History',      icon:'\uD83D\uDCCB' },",
"    { path:'/budget',        label:'Budget',       icon:'\uD83D\uDCCA' },",
"    { path:'/make-payment',  label:'Make Payment', icon:'\uD83D\uDCB3' },",
"    { path:'/bills',         label:'Bills',        icon:'\uD83E\uDDFE' },",
"    { path:'/rewards',       label:'Rewards',      icon:'\uD83C\uDF81' },",
"    { path:'/insights',      label:'Insights',     icon:'\uD83D\uDCC8' },",
"    { path:'/loans',         label:'Loan Account', icon:'\uD83C\uDFE6' },",
"    { path:'/notifications', label:'Alerts',       icon:'\uD83D\uDD14' },",
"    { path:'/profile',       label:'Profile',      icon:'\uD83D\uDC64' },",
"  ];",
"",
"  readonly adminLinks = [",
"    { path:'/admin/dashboard',     label:'Home',          icon:'\uD83C\uDFE0' },",
"    { path:'/admin/users',         label:'Users',         icon:'\uD83D\uDC65' },",
"    { path:'/admin/transactions',  label:'Analytics',     icon:'\uD83D\uDCCA' },",
"    { path:'/admin/accounts',      label:'Approvals',     icon:'\u2705' },",
"    { path:'/admin/deposits',      label:'Deposits',      icon:'\uD83D\uDCB0' },",
"    { path:'/admin/withdrawals',   label:'Withdrawals',   icon:'\uD83D\uDCB8' },",
"    { path:'/admin/loans',         label:'Loans',         icon:'\uD83C\uDFE6' },",
"    { path:'/admin/bills',         label:'Bills',         icon:'\uD83E\uDDFE' },",
"    { path:'/admin/payments',      label:'Payments',      icon:'\uD83D\uDCB3' },",
"    { path:'/admin/system-health', label:'System Health', icon:'\uD83D\uDC9A' },",
"    { path:'/admin/audit-log',     label:'Audit Logs',    icon:'\uD83D\uDCCB' },",
"    { path:'/profile',             label:'Profile',       icon:'\uD83D\uDC64' },",
"  ];",
"",
"  activeLinks = () => this.isAdmin() ? this.adminLinks : this.customerLinks;",
"  isAdmin   = () => this.auth.isAdmin();",
"  userName  = () => { const u = this.auth.currentUser(); return u ? u.firstName + ' ' + u.lastName : ''; };",
"  initials  = () => { const u = this.auth.currentUser(); return u ? ((u.firstName?.[0]||'') + (u.lastName?.[0]||'')).toUpperCase() : '?'; };",
"  onLinkClick() { this.closeRequest.emit(); }",
"}",
""
];
fs.writeFileSync(navbarPath, navbarLines.join('\n'), 'utf8');
console.log('navbar written:', navbarLines.join('\n').length, 'bytes');

// ───────────────────────────────────────────────────────────────
// 2. app.html
// ───────────────────────────────────────────────────────────────
const htmlPath = 'C:\\Users\\pala.TRN\\Downloads\\POC\\frontend\\src\\app\\app.html';
const htmlContent =
'@if (auth.isLoggedIn()) {\n' +
'  <div class="shell">\n' +
'\n' +
'    <app-navbar [mobileOpen]="sidebarOpen()" (closeRequest)="closeSidebar()" />\n' +
'\n' +
'    @if (sidebarOpen()) {\n' +
'      <div class="mob-overlay" (click)="closeSidebar()"></div>\n' +
'    }\n' +
'\n' +
'    <div class="shell-right">\n' +
'\n' +
'      <header class="topbar">\n' +
'        <div class="topbar-left">\n' +
'          <button class="topbar-menu" (click)="toggleSidebar()" aria-label="Toggle menu">\n' +
'            <span></span><span></span><span></span>\n' +
'          </button>\n' +
"          <span class=\"topbar-title\">{{ auth.isAdmin() ? 'NeoBank Admin' : 'NeoBank' }}</span>\n" +
'        </div>\n' +
'        <div class="topbar-right">\n' +
'          <button class="topbar-bell" (click)="goBell()" title="Notifications">\n' +
'            <span>\uD83D\uDD14</span>\n' +
'          </button>\n' +
'          <span class="topbar-username">{{ auth.currentUser()?.firstName }}</span>\n' +
'          <div class="topbar-avatar" [title]="userName()">{{ initials() }}</div>\n' +
'          <button class="topbar-logout" (click)="logout()">\n' +
'            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>\n' +
'            Logout\n' +
'          </button>\n' +
'        </div>\n' +
'      </header>\n' +
'\n' +
'      <main class="shell-main">\n' +
'        <router-outlet />\n' +
'      </main>\n' +
'\n' +
'    </div>\n' +
'  </div>\n' +
'} @else {\n' +
'  <router-outlet />\n' +
'}\n';
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('app.html written:', htmlContent.length, 'bytes');

// ───────────────────────────────────────────────────────────────
// 3. app.css
// ───────────────────────────────────────────────────────────────
const cssPath = 'C:\\Users\\pala.TRN\\Downloads\\POC\\frontend\\src\\app\\app.css';
const cssContent =
'/* Shell layout */\n' +
'.shell {\n' +
'  display:flex; min-height:100vh;\n' +
'  background:var(--bg,#f0f2f8); position:relative;\n' +
'}\n' +
'.shell-right {\n' +
'  flex:1; margin-left:240px;\n' +
'  display:flex; flex-direction:column;\n' +
'  min-height:100vh; overflow:hidden;\n' +
'}\n' +
'\n' +
'/* Top bar */\n' +
'.topbar {\n' +
'  height:60px; background:#0f172a;\n' +
'  display:flex; align-items:center; justify-content:space-between;\n' +
'  padding:0 1.5rem;\n' +
'  border-bottom:1px solid rgba(255,255,255,0.07);\n' +
'  box-shadow:0 2px 20px rgba(0,0,0,0.3);\n' +
'  position:sticky; top:0; z-index:500; flex-shrink:0;\n' +
'}\n' +
'.topbar-left  { display:flex; align-items:center; gap:1rem; }\n' +
'.topbar-right { display:flex; align-items:center; gap:0.65rem; }\n' +
'\n' +
'.topbar-menu {\n' +
'  display:none; flex-direction:column; gap:5px;\n' +
'  width:36px; height:36px; padding:8px;\n' +
'  background:rgba(255,255,255,0.08);\n' +
'  border:1px solid rgba(255,255,255,0.12); border-radius:8px;\n' +
'  cursor:pointer; align-items:center; justify-content:center;\n' +
'  transition:background 0.2s;\n' +
'}\n' +
'.topbar-menu span { display:block; width:18px; height:2px; background:rgba(255,255,255,0.8); border-radius:2px; }\n' +
'.topbar-menu:hover { background:rgba(255,255,255,0.14); }\n' +
'\n' +
'.topbar-title {\n' +
'  font-size:1rem; font-weight:700; color:#60a5fa;\n' +
'  letter-spacing:-0.2px; white-space:nowrap;\n' +
'}\n' +
'\n' +
'.topbar-bell {\n' +
'  width:36px; height:36px;\n' +
'  background:rgba(251,191,36,0.12);\n' +
'  border:1px solid rgba(251,191,36,0.22); border-radius:10px;\n' +
'  display:flex; align-items:center; justify-content:center;\n' +
'  font-size:1rem; cursor:pointer;\n' +
'  transition:all 0.2s; text-decoration:none;\n' +
'}\n' +
'.topbar-bell:hover { background:rgba(251,191,36,0.24); transform:scale(1.06); }\n' +
'\n' +
'.topbar-username {\n' +
'  font-size:0.85rem; font-weight:600;\n' +
'  color:rgba(255,255,255,0.78); white-space:nowrap;\n' +
'}\n' +
'\n' +
'.topbar-avatar {\n' +
'  width:34px; height:34px; border-radius:10px; flex-shrink:0;\n' +
'  background:linear-gradient(135deg,#f59e0b,#d97706);\n' +
'  display:flex; align-items:center; justify-content:center;\n' +
'  font-size:0.75rem; font-weight:800; color:white;\n' +
'  border:2px solid rgba(255,255,255,0.2);\n' +
'}\n' +
'\n' +
'.topbar-logout {\n' +
'  display:flex; align-items:center; gap:0.4rem;\n' +
'  padding:0.4rem 0.95rem;\n' +
'  background:#dc2626; border:none; border-radius:8px;\n' +
'  color:white; font-size:0.8rem; font-weight:600;\n' +
'  cursor:pointer; transition:all 0.2s; white-space:nowrap;\n' +
'}\n' +
'.topbar-logout:hover { background:#b91c1c; transform:translateY(-1px); box-shadow:0 4px 14px rgba(220,38,38,0.45); }\n' +
'\n' +
'/* Page scroll area */\n' +
'.shell-main {\n' +
'  flex:1; overflow-y:auto; overflow-x:hidden;\n' +
'  background:var(--bg,#f0f2f8);\n' +
'}\n' +
'.shell-main::-webkit-scrollbar { width:6px; }\n' +
'.shell-main::-webkit-scrollbar-track { background:transparent; }\n' +
'.shell-main::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }\n' +
'.shell-main::-webkit-scrollbar-thumb:hover { background:#94a3b8; }\n' +
'\n' +
'/* Mobile overlay */\n' +
'.mob-overlay {\n' +
'  position:fixed; inset:0;\n' +
'  background:rgba(0,0,0,0.65);\n' +
'  z-index:999; backdrop-filter:blur(2px);\n' +
'  animation:fadeIn 0.2s ease;\n' +
'}\n' +
'\n' +
'/* Responsive */\n' +
'@media(max-width:768px) {\n' +
'  .shell-right     { margin-left:0; }\n' +
'  .topbar-menu     { display:flex; }\n' +
'  .topbar-username { display:none; }\n' +
'}\n' +
'\n' +
'@keyframes fadeIn { from{opacity:0} to{opacity:1} }\n';
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('app.css written:', cssContent.length, 'bytes');
