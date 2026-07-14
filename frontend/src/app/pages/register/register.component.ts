import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Floating shapes -->
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>

      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">🏦</span>
          <h1>Create Account</h1>
          <p>Join NeoBank today — it's free</p>
        </div>

        @if (error()) {
          <div class="alert alert-error"><span>⚠️</span> {{ error() }}</div>
        }
        @if (success()) {
          <div class="alert alert-success"><span>✅</span> {{ success() }}</div>
        }

        <form (ngSubmit)="onSubmit()" autocomplete="off">
          <!-- Name row -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First Name <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="form.firstName" name="firstName"
                placeholder="John" [class.input-error]="submitted && form.firstName.trim().length < 2" />
              @if (submitted && form.firstName.trim().length === 0) {
                <span class="field-error">First name is required</span>
              } @else if (submitted && form.firstName.trim().length < 2) {
                <span class="field-error">Minimum 2 characters</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Last Name <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="form.lastName" name="lastName"
                placeholder="Doe" [class.input-error]="submitted && form.lastName.trim().length < 2" />
              @if (submitted && form.lastName.trim().length === 0) {
                <span class="field-error">Last name is required</span>
              } @else if (submitted && form.lastName.trim().length < 2) {
                <span class="field-error">Minimum 2 characters</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address <span class="req">*</span></label>
            <input type="email" class="form-control" [(ngModel)]="form.email" name="email"
              placeholder="you@example.com" [class.input-error]="submitted && !isEmailValid()" />
            @if (submitted && !form.email.trim()) {
              <span class="field-error">Email is required</span>
            } @else if (submitted && !isEmailValid()) {
              <span class="field-error">Enter a valid email address</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number <span class="req">*</span></label>
            <input type="tel" class="form-control" [(ngModel)]="form.phone" name="phone"
              placeholder="9876543210" maxlength="10"
              [class.input-error]="submitted && !isPhoneValid()" />
            @if (submitted && !form.phone.trim()) {
              <span class="field-error">Phone number is required</span>
            } @else if (submitted && !isPhoneValid()) {
              <span class="field-error">Enter a valid 10-digit mobile number</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Password <span class="req">*</span> <small>(min 8 chars)</small></label>
            <div class="input-icon-wrap">
              <input [type]="showPass ? 'text' : 'password'" class="form-control"
                [(ngModel)]="form.password" name="password"
                placeholder="Create a strong password" minlength="8"
                [class.input-error]="submitted && form.password.length < 8" />
              <button type="button" class="eye-btn" (click)="showPass = !showPass" tabindex="-1">
                {{ showPass ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (form.password.length > 0) {
              <div class="strength-bar">
                <div class="strength-fill" [class]="passwordStrength.level"
                     [style.width]="passwordStrength.score + '%'"></div>
              </div>
              <span class="strength-label" [class]="passwordStrength.level">
                {{ passwordStrength.level | titlecase }} password
              </span>
            }
            @if (submitted && form.password.length === 0) {
              <span class="field-error">Password is required</span>
            } @else if (submitted && form.password.length < 8) {
              <span class="field-error">Password must be at least 8 characters</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date of Birth <span class="req">*</span></label>
              <input type="date" class="form-control" [(ngModel)]="form.dateOfBirth" name="dateOfBirth"
                [max]="maxDob" [class.input-error]="submitted && !isAdult()" />
              @if (submitted && !form.dateOfBirth) {
                <span class="field-error">Date of birth is required</span>
              } @else if (submitted && !isAdult()) {
                <span class="field-error">You must be at least 18 years old</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input class="form-control" [(ngModel)]="form.country" name="country" placeholder="India" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Address</label>
            <input class="form-control" [(ngModel)]="form.address" name="address"
              placeholder="Street, City" />
          </div>

          <!-- CAPTCHA -->
          <div class="form-group captcha-group">
            <label class="form-label">Security Verification</label>
            <div class="captcha-box">
              <div class="captcha-row">
                <canvas id="regCaptchaCanvas" width="210" height="58"></canvas>
                <button type="button" class="captcha-refresh" (click)="refreshCaptcha()" title="New code">🔄</button>
              </div>
              <input type="text" class="form-control captcha-input"
                [(ngModel)]="captchaInput" name="captchaInput"
                placeholder="Type the 5 chars above" maxlength="5"
                [class.is-invalid]="captchaError()" autocomplete="off" />
              <small class="captcha-hint"></small>
              @if (captchaError()) {
                <small class="captcha-error">{{ captchaError() }}</small>
              }
            </div>
          </div>

          <!-- Terms -->
          <label class="terms-label" [class.terms-error]="submitted && !termsAccepted">
            <input type="checkbox" [(ngModel)]="termsAccepted" name="terms" />
            <span>I agree to the <a href="#" (click)="$event.preventDefault()">Terms of Service</a>
              and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a></span>
          </label>
          @if (submitted && !termsAccepted) {
            <span class="field-error" style="margin-top:-0.5rem;display:block">Please accept the Terms of Service</span>
          }

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> Creating Account…
            } @else {
              Create Account <span class="btn-arrow">→</span>
            }
          </button>
        </form>

        <div class="auth-footer">Already have an account? <a routerLink="/login">Sign in</a></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #8B2008 0%, #C84010 50%, #E8411A 100%);
      background-size:400% 400%; animation:gradientShift 10s ease infinite;
      padding: 1.5rem 1rem; position:relative; overflow:hidden; }
    @keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

    /* Floating shapes */
    .shape { position:absolute; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); animation:float 6s ease-in-out infinite; }
    .shape-1 { width:280px; height:280px; top:-60px; left:-80px; animation-duration:8s; }
    .shape-2 { width:180px; height:180px; top:60%; right:-50px; animation-duration:6s; animation-delay:1s; }
    .shape-3 { width:120px; height:120px; bottom:10%; left:10%; animation-duration:7s; animation-delay:2s; }
    @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(5deg)} }

    .auth-card { background: white; border-radius: 20px; padding: 2.25rem 2.5rem;
      width: 100%; max-width: 560px; box-shadow: 0 24px 80px rgba(0,0,0,0.35);
      position:relative; z-index:1;
      animation: scaleIn 0.45s cubic-bezier(0.34,1.2,0.64,1); }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }

    .auth-header { text-align: center; margin-bottom: 1.5rem; }
    .auth-logo { font-size: 2.5rem; animation:float 4s ease-in-out infinite; display:block; }
    .auth-header h1 { font-size: 1.7rem; font-weight: 800; color: #0f172a; letter-spacing:-0.5px; margin: 0.4rem 0 0.2rem; }
    .auth-header p { color: #94a3b8; font-size: 0.875rem; }

    .alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1rem;
      border-radius: 10px; margin-bottom: 1rem; font-size: 0.875rem; font-weight: 500; border:1px solid transparent;
      animation:slideDown 0.3s ease; }
    .alert-error { background: #fff1f2; color: #991b1b; border-color:#fca5a5; }
    .alert-success { background: #f0fdf4; color: #065f46; border-color:#6ee7b7; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { margin-bottom: 0.9rem; }
    .form-label { display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.3rem; }
    .form-label small { font-weight: 400; color: #94a3b8; }
    .form-control { width: 100%; padding: 0.65rem 0.9rem; border: 1.5px solid #e2e8f0;
      border-radius: 10px; font-size: 0.9rem; box-sizing: border-box; transition: all 0.22s; outline:none; font-family:inherit; }
    .form-control:focus { border-color: #E8411A; box-shadow: 0 0 0 3px rgba(232,65,26,0.1); }

    /* Validation styles */
    .req { color:#dc2626; margin-left:2px; }
    .field-error { display:block; color:#dc2626; font-size:0.76rem; margin-top:0.25rem; animation:slideDown .2s ease; }
    .input-error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
    .terms-error { color:#dc2626; animation:shake .3s ease; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} }

    /* Password strength */
    .strength-bar { height:4px; background:#e2e8f0; border-radius:4px; margin-top:0.4rem; overflow:hidden; }
    .strength-fill { height:100%; border-radius:4px; transition:width .3s ease,background .3s ease; }
    .strength-fill.weak   { background:#ef4444; }
    .strength-fill.medium { background:#f59e0b; }
    .strength-fill.strong { background:#10b981; }
    .strength-label { font-size:0.72rem; font-weight:600; margin-top:0.2rem; display:inline-block; }
    .strength-label.weak   { color:#ef4444; }
    .strength-label.medium { color:#f59e0b; }
    .strength-label.strong { color:#10b981; }

    .input-icon-wrap { position: relative; }
    .input-icon-wrap .form-control { padding-right: 2.5rem; }
    .eye-btn { position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0; }

    /* CAPTCHA */
    .captcha-group { margin-top: 0.1rem; }
    .captcha-box { display: flex; flex-direction: column; gap: 0.45rem; }
    .captcha-row { display: flex; align-items: center; gap: 0.6rem; }
    #regCaptchaCanvas { border: 1.5px solid #e2e8f0; border-radius: 10px; background: #f8f9fe; display: block; }
    .captcha-refresh {
      display:flex; align-items:center; gap:0.3rem; background: #f8f9fe; border: 1.5px solid #e2e8f0;
      border-radius: 8px; padding: 0.45rem 0.65rem; cursor: pointer; font-size: 0.78rem; color:#475569;
      font-weight:500; transition: all 0.2s; white-space:nowrap; }
    .captcha-refresh:hover { background: #fff0e8; border-color:#E8411A; color:#C84010; }
    .captcha-input { max-width: 200px; letter-spacing: 4px; font-weight: 700; font-size: 1rem; text-align:center; }
    .captcha-input.is-invalid { border-color: #dc2626 !important; }
    .captcha-hint { color: #94a3b8; font-size: 0.74rem; display: block; }
    .captcha-error { color: #dc2626; font-size: 0.78rem; display: block; }

    /* Terms */
    .terms-label { display: flex; align-items: flex-start; gap: 0.5rem;
      font-size: 0.83rem; color: #475569; margin: 0.6rem 0 1.1rem; cursor: pointer; }
    .terms-label input { margin-top: 0.15rem; accent-color: #E8411A; flex-shrink: 0; }
    .terms-label a { color: #C84010; text-decoration: none; font-weight:500; }
    .terms-label a:hover { text-decoration: underline; }

    .btn-submit { width: 100%; padding: 0.875rem; font-size: 0.95rem; font-weight: 700;
      background: linear-gradient(135deg, #8B2008, #C84010, #E8411A); background-size:200% auto;
      border: none; border-radius: 10px; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: all 0.3s; box-shadow:0 4px 20px rgba(232,65,26,0.4); letter-spacing:0.3px; }
    .btn-submit:not(:disabled):hover { background-position:right center; box-shadow:0 6px 28px rgba(232,65,26,0.55); transform:translateY(-1px); }
    .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }
    .btn-arrow { transition:transform 0.2s; }
    .btn-submit:not(:disabled):hover .btn-arrow { transform:translateX(4px); }

    .auth-footer { text-align: center; margin-top: 1.25rem; font-size: 0.875rem; color: #94a3b8; }
    .auth-footer a { color: #C84010; font-weight: 700; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }

    .spinner { display: inline-block; width: 14px; height: 14px;
      border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media(max-width:480px) { .form-row{grid-template-columns:1fr;} .auth-card{padding:1.75rem 1.25rem;} }
  `]
})
export class RegisterComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = {
    firstName: '', lastName: '', email: '', password: '',
    phone: '', dateOfBirth: '', country: '', address: ''
  };

  captchaInput = '';
  showPass = false;
  termsAccepted = false;
  submitted = false;

  loading = signal(false);
  error = signal('');
  success = signal('');
  captchaError = signal('');

  /** ISO date string for max allowed DOB (18 years ago) */
  maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim());
  }

  isPhoneValid(): boolean {
    return /^[6-9]\d{9}$/.test(this.form.phone.trim());
  }

  isAdult(): boolean {
    if (!this.form.dateOfBirth) return false;
    const dob = new Date(this.form.dateOfBirth);
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() - 18);
    return dob <= limit;
  }

  get passwordStrength(): { level: 'weak' | 'medium' | 'strong'; score: number } {
    const p = this.form.password;
    if (p.length === 0) return { level: 'weak', score: 0 };
    let score = 0;
    if (p.length >= 8)  score += 25;
    if (p.length >= 12) score += 15;
    if (/[A-Z]/.test(p)) score += 20;
    if (/[0-9]/.test(p)) score += 20;
    if (/[^A-Za-z0-9]/.test(p)) score += 20;
    if (score >= 70) return { level: 'strong', score: 100 };
    if (score >= 40) return { level: 'medium', score: 60 };
    return { level: 'weak', score: 30 };
  }

  private readonly CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  private readonly COLORS = ['#1a237e','#b71c1c','#1b5e20','#4a148c','#e65100','#006064','#880e4f','#bf360c'];
  private readonly FONTS = ['Arial','Verdana','Georgia','Trebuchet MS','Courier New','Impact'];
  private captchaCode = '';

  ngOnInit() {
    setTimeout(() => this.drawCaptcha(), 0);
  }

  refreshCaptcha() {
    this.captchaInput = '';
    this.captchaError.set('');
    this.drawCaptcha();
  }

  private drawCaptcha() {
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += this.CHARS[Math.floor(Math.random() * this.CHARS.length)];
    }
    this.captchaCode = code;

    const canvas = document.getElementById('regCaptchaCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Gradient background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f3f4fb');
    bg.addColorStop(0.5, '#e8eaf6');
    bg.addColorStop(1, '#dce0f5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Wavy stripe
    ctx.beginPath();
    ctx.moveTo(0, H * 0.5);
    for (let x = 0; x <= W; x += 6) {
      ctx.lineTo(x, H * 0.5 + Math.sin(x * 0.18) * 5);
    }
    ctx.strokeStyle = 'rgba(100,120,210,0.13)';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Noise lines
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.random()*120|0},${Math.random()*100|0},${Math.random()*200|0},0.22)`;
      ctx.lineWidth = Math.random() * 1.5 + 0.4;
      ctx.moveTo(Math.random() * W, Math.random() * H);
      ctx.lineTo(Math.random() * W, Math.random() * H);
      ctx.stroke();
    }

    // Noise arcs
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H,
        Math.random() * 22 + 8, 0, Math.PI * (Math.random() + 0.5));
      ctx.strokeStyle = 'rgba(80,80,180,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${Math.random()*160|0},${Math.random()*140|0},${Math.random()*255|0},0.18)`;
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw each character
    const slotW = W / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      const cx = slotW * (i + 0.85) + slotW * 0.15;
      const cy = H / 2 + (Math.random() - 0.5) * 10;
      const angle = (Math.random() - 0.5) * 0.55;
      const size = Math.floor(Math.random() * 7) + 22;
      const font = this.FONTS[Math.floor(Math.random() * this.FONTS.length)];
      const style = Math.random() > 0.4 ? 'bold' : 'bold italic';
      const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.font = `${style} ${size}px "${font}"`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }

  private validateCaptcha(): boolean {
    const input = this.captchaInput.trim().toLowerCase();
    if (!input) {
      this.captchaError.set('Please type the CAPTCHA code');
      return false;
    }
    if (input !== this.captchaCode.toLowerCase()) {
      this.captchaError.set('Incorrect code. A new one has been generated.');
      this.refreshCaptcha();
      return false;
    }
    this.captchaError.set('');
    return true;
  }

  onSubmit() {
    this.submitted = true;
    this.error.set('');
    this.success.set('');

    if (this.form.firstName.trim().length < 2 || this.form.lastName.trim().length < 2) {
      this.error.set('Please enter your full name (min 2 characters each).');
      return;
    }
    if (!this.form.email.trim() || !this.isEmailValid()) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    if (!this.form.phone.trim() || !this.isPhoneValid()) {
      this.error.set('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (this.form.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (!this.form.dateOfBirth || !this.isAdult()) {
      this.error.set('You must be at least 18 years old to register.');
      return;
    }
    if (!this.termsAccepted) {
      this.error.set('Please accept the Terms of Service to continue.');
      return;
    }
    if (!this.validateCaptcha()) return;

    this.loading.set(true);
    this.auth.register(this.form).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.success.set('Account created successfully! Redirecting...');
          setTimeout(() => this.router.navigate(['/dashboard']), 800);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.refreshCaptcha();
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}