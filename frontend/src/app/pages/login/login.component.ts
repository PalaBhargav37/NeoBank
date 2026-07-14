import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="lp-root">
      <div class="lp-bg">
        <div class="lp-grid"></div>
        <div class="lp-orb lp-o1"></div>
        <div class="lp-orb lp-o2"></div>
        <div class="lp-orb lp-o3"></div>
      </div>

      <div class="lp-split">

        <!-- ───── LEFT HERO ───── -->
        <div class="lp-hero">
          <div class="lp-brand">
            <div class="lp-brand-icon">🏦</div>
            <div class="lp-brand-txt">
              <span class="lp-brand-name">NeoBank</span>
              <span class="lp-brand-tag">Digital Banking Platform</span>
            </div>
          </div>

          <h1 class="lp-headline">
            Banking<br>
            <span class="lp-hl-grad">Reimagined</span><br>
            for India
          </h1>
          <p class="lp-sub">Experience next-generation banking with instant transfers, smart budgets, and bank-grade security — all in one place.</p>

          <div class="lp-stats-row">
            <div class="lp-stat">
              <div class="lp-stat-val">1L+</div>
              <div class="lp-stat-key">Customers</div>
            </div>
            <div class="lp-stat-div"></div>
            <div class="lp-stat">
              <div class="lp-stat-val">₹500Cr+</div>
              <div class="lp-stat-key">Transferred</div>
            </div>
            <div class="lp-stat-div"></div>
            <div class="lp-stat">
              <div class="lp-stat-val">99.9%</div>
              <div class="lp-stat-key">Uptime</div>
            </div>
          </div>

          <div class="lp-feats">
            <div class="lp-feat"><span class="lp-feat-ico">🔒</span><span>AES-256 bank-grade security</span></div>
            <div class="lp-feat"><span class="lp-feat-ico">⚡</span><span>Instant IMPS / NEFT transfers</span></div>
            <div class="lp-feat"><span class="lp-feat-ico">📊</span><span>AI-powered budget insights</span></div>
            <div class="lp-feat"><span class="lp-feat-ico">🏦</span><span>Smart loan management</span></div>
          </div>

          <div class="lp-demo-card">
            <div class="lp-demo-icon">✅</div>
            <div class="lp-demo-body">
              <div class="lp-demo-title">Transfer Successful</div>
              <div class="lp-demo-sub">₹25,000 sent instantly · Just now</div>
            </div>
            <div class="lp-demo-amt">₹25K</div>
          </div>

          <div class="lp-trust-row">
            <span class="lp-tb">🔒 SSL Secured</span>
            <span class="lp-tb">🏦 RBI Compliant</span>
            <span class="lp-tb">✅ ISO 27001</span>
          </div>
        </div>

        <!-- ───── RIGHT FORM ───── -->
        <div class="lp-form-side">
          <div class="lp-form-card">
            <div class="lp-mobile-brand">
              <div class="lp-mb-icon">🏦</div>
              <span class="lp-mb-name">NeoBank</span>
            </div>

            <div class="lp-fh">
              <h2 class="lp-fh-title">Welcome back</h2>
              <p class="lp-fh-sub">Sign in to your NeoBank account</p>
            </div>

            @if (error()) {
              <div class="lp-alert lp-alert-err"><span>⚠️</span> {{ error() }}</div>
            }
            @if (successMsg()) {
              <div class="lp-alert lp-alert-ok"><span>✅</span> {{ successMsg() }}</div>
            }

            <form (ngSubmit)="onSubmit()" autocomplete="off">
              <div class="lp-field">
                <label class="lp-lbl">Email Address</label>
                <div class="lp-input-wrap">
                  <span class="lp-ico">✉</span>
                  <input type="email" class="lp-inp" [(ngModel)]="email" name="email"
                    placeholder="you@example.com" required autocomplete="username" />
                </div>
              </div>

              <div class="lp-field">
                <label class="lp-lbl">Password</label>
                <div class="lp-input-wrap">
                  <input [type]="showPass ? 'text' : 'password'" class="lp-inp lp-pass-inp"
                    [(ngModel)]="password" name="password"
                    placeholder="Enter your password" required autocomplete="current-password" />
                  <button type="button" class="lp-eye" (click)="showPass = !showPass" tabindex="-1">
                    @if (showPass) {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    } @else {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div class="lp-field">
                <label class="lp-lbl">Security Check</label>
                <div class="lp-captcha-wrap">
                  <div class="lp-cap-row">
                    <canvas id="captchaCanvas" width="200" height="54"></canvas>
                    <button type="button" class="lp-refresh" (click)="refreshCaptcha()">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg> New
                    </button>
                  </div>
                  <input type="text" class="lp-inp lp-cap-in"
                    [(ngModel)]="captchaInput" name="captchaInput"
                    placeholder="Type the characters above"
                    maxlength="5" [class.lp-err-bdr]="captchaError()" autocomplete="off" />
                  @if (captchaError()) {
                    <span class="lp-err-msg">⚠ {{ captchaError() }}</span>
                  }
                </div>
              </div>

              <div class="lp-opt-row">
                <label class="lp-check">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                  <span class="lp-chk"></span>
                  <span>Remember me</span>
                </label>
                <a href="#" class="lp-link" (click)="$event.preventDefault()">Forgot password?</a>
              </div>

              <button type="submit" class="lp-submit" [disabled]="loading()">
                @if (loading()) {
                  <span class="lp-spin"></span> Signing in…
                } @else {
                  Sign In <span class="lp-arrow">→</span>
                }
              </button>
            </form>

            <div class="lp-footer-row">
              Don't have an account?
              <a routerLink="/register" class="lp-link-bold">Create account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lp-root { min-height:100vh; display:flex; align-items:center; justify-content:center;
      background:#0A0604; position:relative; overflow:hidden; padding:1.5rem; }

    /* ── Animated background ── */
    .lp-bg { position:absolute; inset:0; pointer-events:none; }
    .lp-grid {
      position:absolute; inset:0;
      background-image:linear-gradient(rgba(232,65,26,0.06) 1px,transparent 1px),
        linear-gradient(90deg,rgba(232,65,26,0.06) 1px,transparent 1px);
      background-size:48px 48px;
    }
    .lp-orb { position:absolute; border-radius:50%; filter:blur(80px); animation:orbFloat 8s ease-in-out infinite; }
    .lp-o1 { width:500px; height:500px; top:-150px; left:-100px;
      background:radial-gradient(circle,rgba(200,64,16,0.35) 0%,transparent 70%); animation-duration:10s; }
    .lp-o2 { width:400px; height:400px; bottom:-120px; right:-80px;
      background:radial-gradient(circle,rgba(244,121,32,0.28) 0%,transparent 70%); animation-duration:12s; animation-delay:2s; }
    .lp-o3 { width:280px; height:280px; top:40%; left:40%;
      background:radial-gradient(circle,rgba(240,165,0,0.18) 0%,transparent 70%); animation-duration:9s; animation-delay:1s; }
    @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }

    /* ── Split layout ── */
    .lp-split {
      display:flex; align-items:stretch; width:100%; max-width:1060px;
      border-radius:28px; overflow:hidden;
      box-shadow:0 32px 100px rgba(0,0,0,0.6);
      animation:lp-appear 0.5s cubic-bezier(0.34,1.2,0.64,1);
      position:relative; z-index:1;
    }
    @keyframes lp-appear { from{opacity:0;transform:translateY(30px) scale(0.96)} to{opacity:1;transform:none} }

    /* ── Left Hero ── */
    .lp-hero {
      flex:0 0 52%; padding:3rem 2.8rem;
      background:linear-gradient(145deg,#1A0800 0%,#2A1000 40%,#1A0800 100%);
      border-right:1px solid rgba(255,255,255,0.06);
      display:flex; flex-direction:column; gap:0; justify-content:center;
      position:relative; overflow:hidden;
    }
    .lp-hero::before { content:''; position:absolute; top:-60px; right:-60px;
      width:260px; height:260px; border-radius:50%;
      background:radial-gradient(circle,rgba(232,65,26,0.15) 0%,transparent 70%); pointer-events:none; }

    .lp-brand { display:flex; align-items:center; gap:0.85rem; margin-bottom:2.2rem; }
    .lp-brand-icon { width:48px; height:48px; border-radius:14px;
      background:linear-gradient(135deg,#C84010,#E8411A);
      display:flex; align-items:center; justify-content:center; font-size:1.5rem;
      box-shadow:0 6px 20px rgba(232,65,26,0.5); animation:iconBounce 3s ease-in-out infinite; }
    @keyframes iconBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    .lp-brand-txt { display:flex; flex-direction:column; }
    .lp-brand-name { font-size:1.3rem; font-weight:900; color:#f1f5f9; letter-spacing:-0.3px; }
    .lp-brand-tag  { font-size:0.6rem; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:2px; margin-top:1px; }

    .lp-headline { font-size:2.6rem; font-weight:900; color:#f1f5f9; line-height:1.1;
      letter-spacing:-1.5px; margin-bottom:1rem; }
    .lp-hl-grad { background:linear-gradient(90deg,#FFB585,#F47920,#F0A500);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .lp-sub { font-size:0.9rem; color:rgba(255,255,255,0.5); line-height:1.7; margin-bottom:1.8rem; max-width:360px; }

    /* Stats */
    .lp-stats-row { display:flex; align-items:center; gap:0; background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:1rem 1.25rem;
      margin-bottom:1.8rem; }
    .lp-stat { flex:1; text-align:center; }
    .lp-stat-val { font-size:1.35rem; font-weight:800; color:#FFB585; }
    .lp-stat-key { font-size:0.65rem; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
    .lp-stat-div { width:1px; background:rgba(255,255,255,0.1); height:32px; flex-shrink:0; }

    /* Features */
    .lp-feats { display:flex; flex-direction:column; gap:0.65rem; margin-bottom:1.8rem; }
    .lp-feat { display:flex; align-items:center; gap:0.75rem; font-size:0.87rem; color:rgba(255,255,255,0.7); }
    .lp-feat-ico { width:30px; height:30px; background:rgba(232,65,26,0.18);
      border:1px solid rgba(232,65,26,0.25); border-radius:8px;
      display:flex; align-items:center; justify-content:center; font-size:0.85rem; flex-shrink:0; }

    /* Demo card */
    .lp-demo-card { display:flex; align-items:center; gap:0.85rem;
      background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
      border-radius:14px; padding:0.85rem 1.1rem; margin-bottom:1.5rem;
      animation:demoSlide 4s ease-in-out infinite; }
    @keyframes demoSlide { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
    .lp-demo-icon { font-size:1.4rem; flex-shrink:0; }
    .lp-demo-body { flex:1; }
    .lp-demo-title { font-size:0.84rem; font-weight:700; color:#f1f5f9; }
    .lp-demo-sub { font-size:0.73rem; color:rgba(255,255,255,0.4); margin-top:2px; }
    .lp-demo-amt { font-size:1rem; font-weight:800; color:#34d399; flex-shrink:0; }

    /* Trust row */
    .lp-trust-row { display:flex; gap:0.6rem; flex-wrap:wrap; }
    .lp-tb { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
      border-radius:20px; padding:0.28rem 0.75rem; font-size:0.7rem;
      color:rgba(255,255,255,0.45); white-space:nowrap; }

    /* ── Right Form ── */
    .lp-form-side {
      flex:1; background:#fff8f5; display:flex; flex-direction:column;
      align-items:center; justify-content:center; padding:2.5rem 2rem;
    }
    .lp-form-card { width:100%; max-width:400px; }

    .lp-mobile-brand { display:none; align-items:center; gap:0.6rem; margin-bottom:1rem; }
    .lp-mb-icon { width:38px; height:38px; background:linear-gradient(135deg,#C84010,#E8411A);
      border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
    .lp-mb-name { font-size:1.1rem; font-weight:800; color:#0f172a; }

    .lp-fh { margin-bottom:1.75rem; }
    .lp-fh-title { font-size:1.8rem; font-weight:900; color:#0f172a; letter-spacing:-0.8px; margin-bottom:0.25rem; }
    .lp-fh-sub { font-size:0.875rem; color:#94a3b8; }

    /* Alerts */
    .lp-alert { display:flex; align-items:center; gap:0.55rem; padding:0.8rem 1rem;
      border-radius:10px; margin-bottom:1.25rem; font-size:0.875rem; font-weight:500;
      border:1px solid transparent; animation:lpSlide 0.3s ease; }
    .lp-alert-err { background:#fff1f2; color:#991b1b; border-color:#fca5a5; }
    .lp-alert-ok  { background:#f0fdf4; color:#065f46; border-color:#6ee7b7; }
    @keyframes lpSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }

    /* Fields */
    .lp-field { margin-bottom:1.1rem; }
    .lp-lbl { display:block; font-size:0.8rem; font-weight:600; color:#475569; margin-bottom:0.4rem; }
    .lp-input-wrap { position:relative; }
    .lp-ico { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); font-size:0.9rem; pointer-events:none; z-index:1; }
    .lp-inp { width:100%; padding:0.72rem 1rem 0.72rem 2.4rem;
      border:1.5px solid #e2e8f0; border-radius:10px;
      font-size:0.9rem; font-family:inherit; outline:none;
      background:white; color:#0f172a; transition:all 0.22s; }
    .lp-inp:focus { border-color:#E8411A; box-shadow:0 0 0 3px rgba(232,65,26,0.12); }
    .lp-inp.lp-trail { padding-right:2.8rem; }
    .lp-inp.lp-pass-inp { padding-left:1rem; padding-right:2.8rem; }
    .lp-inp.lp-pass-inp::-ms-reveal,
    .lp-inp.lp-pass-inp::-ms-clear { display:none; }
    .lp-inp.lp-pass-inp::-webkit-credentials-auto-fill-button { display:none; }
    .lp-eye { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; font-size:1rem; padding:0; }
    .lp-err-bdr { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.1) !important; }
    .lp-err-msg { color:#dc2626; font-size:0.75rem; margin-top:0.25rem; display:block; }

    /* Captcha */
    .lp-captcha-wrap { display:flex; flex-direction:column; gap:0.5rem; }
    .lp-cap-row { display:flex; align-items:center; gap:0.6rem; }
    #captchaCanvas { border:1.5px solid #e2e8f0; border-radius:10px; background:#f8f9fe; display:block; }
    .lp-refresh { display:flex; align-items:center; gap:0.3rem; background:#f1f5f9;
      border:1.5px solid #e2e8f0; border-radius:8px; padding:0.45rem 0.65rem;
      cursor:pointer; font-size:0.75rem; color:#475569; font-weight:500;
      white-space:nowrap; transition:all 0.2s; }
    .lp-refresh:hover { background:#fff0e8; border-color:#E8411A; color:#C84010; }
    .lp-cap-in { padding-left:1rem !important; letter-spacing:4px; font-size:1rem; font-weight:700; text-align:center; }

    /* Options */
    .lp-opt-row { display:flex; justify-content:space-between; align-items:center; margin:0.75rem 0 1.5rem; }
    .lp-check { display:flex; align-items:center; gap:0.45rem; font-size:0.84rem; color:#475569; cursor:pointer; }
    .lp-check input { position:absolute; opacity:0; width:0; height:0; }
    .lp-chk { width:17px; height:17px; border:2px solid #cbd5e1; border-radius:4px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
    .lp-check input:checked ~ .lp-chk { background:#E8411A; border-color:#E8411A; }
    .lp-check input:checked ~ .lp-chk::after { content:'✓'; font-size:10px; color:white; font-weight:900; }
    .lp-link { font-size:0.84rem; color:#E8411A; text-decoration:none; font-weight:500; }
    .lp-link:hover { text-decoration:underline; }

    /* Submit */
    .lp-submit { width:100%; padding:0.9rem; font-size:0.95rem; font-weight:700;
      background:linear-gradient(135deg,#8B2008,#C84010,#E8411A);
      background-size:200% auto;
      border:none; border-radius:10px; color:white; cursor:pointer;
      display:flex; align-items:center; justify-content:center; gap:0.5rem;
      transition:all 0.3s; box-shadow:0 4px 20px rgba(232,65,26,0.45);
      letter-spacing:0.3px; font-family:inherit; }
    .lp-submit:not(:disabled):hover { background-position:right center;
      box-shadow:0 8px 28px rgba(232,65,26,0.6); transform:translateY(-2px); }
    .lp-submit:not(:disabled):active { transform:scale(0.98); }
    .lp-submit:disabled { opacity:0.6; cursor:not-allowed; }
    .lp-spin { width:16px; height:16px; border:2.5px solid rgba(255,255,255,0.3);
      border-top-color:white; border-radius:50%; animation:lp-spin 0.6s linear infinite; display:inline-block; }
    @keyframes lp-spin { to{transform:rotate(360deg)} }
    .lp-arrow { display:inline-block; transition:transform 0.2s; }
    .lp-submit:not(:disabled):hover .lp-arrow { transform:translateX(5px); }

    /* Footer */
    .lp-footer-row { text-align:center; margin-top:1.5rem; font-size:0.875rem; color:#94a3b8; }
    .lp-link-bold { color:#C84010; font-weight:700; text-decoration:none; margin-left:0.3rem; }
    .lp-link-bold:hover { text-decoration:underline; }

    /* Responsive */
    @media(max-width:900px) {
      .lp-split { flex-direction:column; max-width:480px; border-radius:20px; }
      .lp-hero { padding:2rem 2rem 1.5rem; }
      .lp-headline { font-size:2rem; }
      .lp-demo-card { display:none; }
      .lp-feats { display:none; }
      .lp-trust-row { display:none; }
      .lp-form-side { padding:2rem 2rem; }
      .lp-mobile-brand { display:flex; }
    }
    @media(max-width:520px) {
      .lp-root { padding:0; }
      .lp-split { border-radius:0; min-height:100vh; }
      .lp-hero { padding:1.5rem; }
      .lp-stats-row { padding:0.75rem 1rem; }
      .lp-stat-val { font-size:1.1rem; }
    }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  captchaInput = '';
  rememberMe = false;
  showPass = false;

  loading = signal(false);
  error = signal('');
  successMsg = signal('');
  captchaError = signal('');

  private readonly CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  private readonly COLORS = ['#1a237e','#b71c1c','#1b5e20','#4a148c','#e65100','#006064','#880e4f','#bf360c'];
  private readonly FONTS = ['Arial','Verdana','Georgia','Trebuchet MS','Courier New','Impact'];
  private captchaCode = '';

  ngOnInit() {
    const saved = localStorage.getItem('neobank_remember_email');
    if (saved) { this.email = saved; this.rememberMe = true; }
    setTimeout(() => this.drawCaptcha(), 0);
  }

  refreshCaptcha() { this.captchaInput = ''; this.captchaError.set(''); this.drawCaptcha(); }

  private drawCaptcha() {
    let code = '';
    for (let i = 0; i < 5; i++) code += this.CHARS[Math.floor(Math.random() * this.CHARS.length)];
    this.captchaCode = code;
    const canvas = document.getElementById('captchaCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#f3f4fb'); bg.addColorStop(0.5,'#e8eaf6'); bg.addColorStop(1,'#dce0f5');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
    for (let i=0;i<9;i++) { ctx.beginPath(); ctx.strokeStyle=`rgba(${Math.random()*120|0},${Math.random()*100|0},${Math.random()*200|0},0.22)`; ctx.lineWidth=Math.random()*1.5+0.4; ctx.moveTo(Math.random()*W,Math.random()*H); ctx.lineTo(Math.random()*W,Math.random()*H); ctx.stroke(); }
    for (let i=0;i<50;i++) { ctx.beginPath(); ctx.fillStyle=`rgba(${Math.random()*160|0},${Math.random()*140|0},${Math.random()*255|0},0.18)`; ctx.arc(Math.random()*W,Math.random()*H,Math.random()*2+0.4,0,Math.PI*2); ctx.fill(); }
    const slotW = W/(code.length+1);
    for (let i=0;i<code.length;i++) {
      const ch=code[i],cx=slotW*(i+0.85)+slotW*0.15,cy=H/2+(Math.random()-0.5)*10,angle=(Math.random()-0.5)*0.55,size=Math.floor(Math.random()*7)+22,font=this.FONTS[Math.floor(Math.random()*this.FONTS.length)],style=Math.random()>0.4?'bold':'bold italic',color=this.COLORS[Math.floor(Math.random()*this.COLORS.length)];
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle); ctx.font=`${style} ${size}px "${font}"`; ctx.fillStyle=color; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.shadowColor='rgba(0,0,0,0.18)'; ctx.shadowBlur=2; ctx.shadowOffsetX=1; ctx.shadowOffsetY=1; ctx.fillText(ch,0,0); ctx.restore();
    }
  }

  private validateCaptcha(): boolean {
    const input = this.captchaInput.trim().toLowerCase();
    if (!input) { this.captchaError.set('Please type the CAPTCHA code'); return false; }
    if (input !== this.captchaCode.toLowerCase()) { this.captchaError.set('Incorrect code. A new one has been generated.'); this.refreshCaptcha(); return false; }
    this.captchaError.set(''); return true;
  }

  onSubmit() {
    this.error.set(''); this.successMsg.set('');
    if (!this.email || !this.password) { this.error.set('Please enter your email and password.'); return; }
    if (!this.validateCaptcha()) return;
    if (this.rememberMe) localStorage.setItem('neobank_remember_email', this.email);
    else localStorage.removeItem('neobank_remember_email');
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.successMsg.set('Login successful! Redirecting…');
          setTimeout(() => this.router.navigate([res.data.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard']), 600);
        }
      },
      error: (err) => {
        this.loading.set(false); this.refreshCaptcha();
        const s = err.status; const msg: string = err.error?.message || '';
        if (s === 401 || s === 403 || msg.toLowerCase().includes('bad credential') || msg.toLowerCase().includes('unauthorized')) {
          this.error.set('Invalid email or password. Please try again.');
        } else if (s === 0) {
          this.error.set('Cannot connect to server. Please check your connection.');
        } else {
          this.error.set('Login failed. Please check your credentials and try again.');
        }
      }
    });
  }
}
