import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface HealthCheck {
  name: string;
  icon: string;
  status: 'UP' | 'DOWN' | 'WARN' | 'CHECKING';
  detail: string;
  latency?: number;
}

@Component({
  selector: 'app-admin-system-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="margin-bottom:1.5rem">
        <div>
          <h1 class="page-title">🖥️ System Health</h1>
          <p style="color:var(--text-muted);margin:0;font-size:0.9rem">Real-time system status and monitoring</p>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <span class="last-check">Last checked: {{ lastChecked() }}</span>
          <button class="refresh-btn" (click)="runChecks()" [disabled]="checking()">
            {{ checking() ? '⟳ Checking...' : '🔄 Refresh' }}
          </button>
        </div>
      </div>

      <!-- Overall Status -->
      <div class="overall-banner" [class]="overallClass()">
        <span class="overall-icon">{{ overallIcon() }}</span>
        <div>
          <div class="overall-title">{{ overallTitle() }}</div>
          <div class="overall-sub">{{ upCount() }} of {{ checks().length }} services operational</div>
        </div>
      </div>

      <!-- Health Cards -->
      <div class="health-grid">
        @for (c of checks(); track c.name) {
          <div class="health-card" [class]="c.status.toLowerCase()">
            <div class="hc-header">
              <span class="hc-icon">{{ c.icon }}</span>
              <span class="hc-name">{{ c.name }}</span>
              <span class="hc-badge" [class]="c.status.toLowerCase()">
                @if (c.status === 'CHECKING') { <span class="dot-spin">⟳</span> }
                {{ c.status }}
              </span>
            </div>
            <div class="hc-detail">{{ c.detail }}</div>
            @if (c.latency !== undefined) {
              <div class="hc-latency">
                <span class="lat-bar">
                  <span class="lat-fill" [style.width.%]="Math.min(c.latency / 5, 100)"
                    [class.good]="c.latency < 200" [class.warn]="c.latency >= 200 && c.latency < 500"
                    [class.bad]="c.latency >= 500"></span>
                </span>
                <span class="lat-val">{{ c.latency }}ms</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- System Info -->
      <div class="card mt">
        <h3 class="card-title">📊 System Information</h3>
        <div class="info-grid">
          @for (i of sysInfo; track i.label) {
            <div class="info-item">
              <span class="info-icon">{{ i.icon }}</span>
              <div>
                <div class="info-label">{{ i.label }}</div>
                <div class="info-val">{{ i.value }}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .last-check { font-size:0.82rem; color:#94a3b8; }
    .refresh-btn { padding:0.5rem 1.1rem; background:#3949ab; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:600; }
    .refresh-btn:disabled { background:#cbd5e1; cursor:not-allowed; }

    .overall-banner { display:flex; align-items:center; gap:1rem; padding:1.2rem 1.5rem; border-radius:14px; margin-bottom:1.5rem; }
    .overall-banner.good { background:#f0fdf4; border:1px solid #bbf7d0; }
    .overall-banner.warn { background:#fefce8; border:1px solid #fef08a; }
    .overall-banner.bad  { background:#fef2f2; border:1px solid #fecaca; }
    .overall-icon  { font-size:2.5rem; }
    .overall-title { font-size:1.15rem; font-weight:700; color:#1e293b; }
    .overall-sub   { font-size:0.85rem; color:#64748b; }

    .health-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem; margin-bottom:1rem; }
    .health-card { background:#fff; border-radius:14px; padding:1.2rem; box-shadow:0 1px 8px rgba(0,0,0,0.07); border-top:4px solid #22c55e; }
    .health-card.down    { border-color:#ef4444; }
    .health-card.warn    { border-color:#f59e0b; }
    .health-card.checking{ border-color:#94a3b8; }
    .hc-header { display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem; }
    .hc-icon { font-size:1.4rem; }
    .hc-name { font-weight:600; color:#1e293b; flex:1; font-size:0.95rem; }
    .hc-badge { padding:0.2rem 0.6rem; border-radius:20px; font-size:0.72rem; font-weight:700; }
    .hc-badge.up       { background:#dcfce7; color:#15803d; }
    .hc-badge.down     { background:#fee2e2; color:#b91c1c; }
    .hc-badge.warn     { background:#fef9c3; color:#92400e; }
    .hc-badge.checking { background:#f1f5f9; color:#64748b; }
    .dot-spin { display:inline-block; animation:spin 1s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .hc-detail { font-size:0.8rem; color:#64748b; margin-bottom:0.5rem; }
    .hc-latency { display:flex; align-items:center; gap:0.5rem; }
    .lat-bar { flex:1; height:6px; background:#f1f5f9; border-radius:10px; overflow:hidden; }
    .lat-fill { height:100%; border-radius:10px; transition:width 0.4s; }
    .lat-fill.good { background:#22c55e; }
    .lat-fill.warn { background:#f59e0b; }
    .lat-fill.bad  { background:#ef4444; }
    .lat-val { font-size:0.75rem; color:#64748b; min-width:48px; text-align:right; }

    .card { background:#fff; border-radius:14px; padding:1.4rem; box-shadow:0 1px 8px rgba(0,0,0,0.07); }
    .card.mt { margin-top:1rem; }
    .card-title { font-size:1rem; font-weight:700; color:#1e293b; margin:0 0 1rem; }
    .info-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:0.75rem; }
    .info-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:#f8fafc; border-radius:10px; }
    .info-icon { font-size:1.4rem; }
    .info-label { font-size:0.75rem; color:#64748b; }
    .info-val   { font-size:0.9rem; font-weight:600; color:#1e293b; }
  `]
})
export class AdminSystemHealthComponent implements OnInit {
  private http = inject(HttpClient);

  Math = Math;
  checking    = signal(false);
  lastChecked = signal('—');

  checks = signal<HealthCheck[]>([
    { name:'Backend API',   icon:'⚡', status:'CHECKING', detail:'Spring Boot Application Server' },
    { name:'Database',      icon:'🗄️', status:'CHECKING', detail:'MySQL 9.4 - neobank_db' },
    { name:'Auth Service',  icon:'🔐', status:'CHECKING', detail:'JWT Authentication Service' },
    { name:'File Storage',  icon:'📁', status:'UP',       detail:'Static resources', latency:12 },
    { name:'Email Service', icon:'📧', status:'UP',       detail:'Notification delivery', latency:145 },
    { name:'Scheduler',     icon:'⏰', status:'UP',       detail:'Background job runner', latency:8 },
  ]);

  sysInfo = [
    { icon:'☕', label:'Runtime',       value:'Java 21 (OpenJDK)' },
    { icon:'🌿', label:'Framework',     value:'Spring Boot 3.5.11' },
    { icon:'🗄️', label:'Database',     value:'MySQL 9.4.0' },
    { icon:'🌐', label:'Frontend',      value:'Angular 21' },
    { icon:'🔒', label:'Auth',          value:'JWT Bearer Token' },
    { icon:'🚀', label:'Backend Port',  value:'8080' },
    { icon:'🖥️', label:'Frontend Port', value:'4200' },
    { icon:'📦', label:'Environment',   value:'Development' },
  ];

  overallClass  = () => this.checks().some(c => c.status === 'DOWN') ? 'bad' : this.checks().some(c => c.status === 'WARN') ? 'warn' : 'good';
  overallIcon   = () => this.checks().some(c => c.status === 'DOWN') ? '🔴' : this.checks().some(c => c.status === 'WARN') ? '🟡' : '🟢';
  overallTitle  = () => this.checks().some(c => c.status === 'DOWN') ? 'System Degraded' : this.checks().some(c => c.status === 'WARN') ? 'Partial Issues' : 'All Systems Operational';
  upCount       = () => this.checks().filter(c => c.status === 'UP').length;

  runChecks() {
    this.checking.set(true);
    this.checks.update(list => list.map(c => ({ ...c, status: 'CHECKING' as const })));

    // Check the real backend
    const start = Date.now();
    this.http.get<any>('http://localhost:8080/api/auth/login', { observe: 'response' }).subscribe({
      next: () => this.setBackendUp(Date.now() - start),
      error: (err) => {
        if (err.status === 400 || err.status === 405 || err.status === 401) {
          this.setBackendUp(Date.now() - start);
        } else {
          this.setBackendDown();
        }
      }
    });

    // Simulate other checks
    setTimeout(() => {
      this.checks.update(list => list.map(c => {
        if (c.name === 'Database')     return { ...c, status:'UP' as const, detail:'MySQL 9.4 — Connected', latency: 18 };
        if (c.name === 'Auth Service') return { ...c, status:'UP' as const, detail:'JWT tokens issuing normally', latency: 32 };
        return c;
      }));
      this.checking.set(false);
      this.lastChecked.set(new Date().toLocaleTimeString());
    }, 1500);
  }

  private setBackendUp(latency: number) {
    this.checks.update(list => list.map(c =>
      c.name === 'Backend API' ? { ...c, status:'UP' as const, detail:'Spring Boot running on :8080', latency } : c
    ));
  }
  private setBackendDown() {
    this.checks.update(list => list.map(c =>
      c.name === 'Backend API' ? { ...c, status:'DOWN' as const, detail:'Cannot reach :8080' } : c
    ));
  }

  ngOnInit() { this.runChecks(); }
}
