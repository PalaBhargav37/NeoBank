import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div style="display:flex;justify-content:center;align-items:center;min-height:40vh">
          <div class="spinner-dark" style="width:48px;height:48px;border-width:4px"></div>
        </div>
      } @else {
        <!-- Hero Cover -->
        <div class="card profile-hero" style="margin-bottom:1.5rem">
          <div class="profile-cover"></div>
          <div class="profile-hero-body">
            <div class="profile-avatar-wrap">
              <div class="profile-avatar">{{ initials() }}</div>
            </div>
            <div class="profile-hero-info">
              <h2 class="profile-hero-name">{{ user()?.firstName }} {{ user()?.lastName }}</h2>
              <div class="profile-hero-email">✉ {{ user()?.email }}</div>
              <div class="profile-hero-badges">
                <span class="badge badge-info">{{ user()?.role }}</span>
                <span class="badge" [class]="user()?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">{{ user()?.status }}</span>
                <span class="badge" [class]="getKycBadge(user()?.kycStatus)">KYC: {{ user()?.kycStatus }}</span>
              </div>
            </div>
            <div class="profile-hero-stats">
              <div class="phs-item">
                <span class="phs-val">{{ user()?.createdAt | date:'yyyy' }}</span>
                <span class="phs-label">Member Since</span>
              </div>
              <div class="phs-div"></div>
              <div class="phs-item">
                <span class="phs-val" style="color:var(--success)">{{ user()?.status }}</span>
                <span class="phs-label">Account Status</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-layout">
          <!-- Left: Forms -->
          <div style="flex:1;min-width:0">

            <!-- Personal Information -->
            <div class="card" style="margin-bottom:1.25rem">
              <div class="card-title">👤 Personal Information</div>
              @if (profileSuccess()) { <div class="alert alert-success">✅ {{ profileSuccess() }}</div> }
              @if (profileError()) { <div class="alert alert-error">{{ profileError() }}</div> }
              <form (ngSubmit)="saveProfile()">

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">First Name <span class="req">*</span></label>
                    <input class="form-control" [(ngModel)]="profileForm.firstName" name="fn" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name <span class="req">*</span></label>
                    <input class="form-control" [(ngModel)]="profileForm.lastName" name="ln" required />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">✉ Email Address <span class="auto-filled-tag">auto-filled</span></label>
                    <input class="form-control readonly-field" [value]="user()?.email || ''" readonly />
                    <small class="field-hint">Email cannot be changed</small>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select class="form-control" [(ngModel)]="profileForm.gender" name="gender">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">🎂 Date of Birth</label>
                    <input type="date" class="form-control" [(ngModel)]="profileForm.dateOfBirth" name="dob" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">📱 Mobile Number</label>
                    <input class="form-control" [(ngModel)]="profileForm.phone" name="phone"
                      placeholder="10-digit mobile number" maxlength="10"
                      [class.input-error]="profileForm.phone && !isPhoneValid()" />
                    @if (profileForm.phone && !isPhoneValid()) {
                      <span class="field-error">Enter valid 10-digit mobile number starting with 6-9</span>
                    }
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">🪪 Aadhaar Number</label>
                    <input class="form-control" [(ngModel)]="profileForm.aadhaarNumber" name="aadhaar"
                      placeholder="12-digit Aadhaar number" maxlength="12"
                      [class.input-error]="profileForm.aadhaarNumber && !isAadhaarValid()" />
                    @if (profileForm.aadhaarNumber && !isAadhaarValid()) {
                      <span class="field-error">Aadhaar must be exactly 12 digits</span>
                    }
                  </div>
                  <div class="form-group">
                    <label class="form-label">📋 PAN Number</label>
                    <input class="form-control" [(ngModel)]="profileForm.panNumber" name="pan"
                      placeholder="E.G. ABCDE1234F" maxlength="10" style="text-transform:uppercase"
                      [class.input-error]="profileForm.panNumber && !isPanValid()" />
                    @if (profileForm.panNumber && !isPanValid()) {
                      <span class="field-error">Invalid PAN format (e.g. ABCDE1234F)</span>
                    }
                  </div>
                </div>

                <!-- Address Section -->
                <div class="section-divider"><span>🏠 Address Details</span></div>

                <div class="form-group">
                  <label class="form-label">Address Line</label>
                  <input class="form-control" [(ngModel)]="profileForm.address" name="addr" placeholder="House/Flat, Street, Area" />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">State</label>
                    <select class="form-control" [(ngModel)]="profileForm.state" name="state">
                      <option value="">Select state</option>
                      @for (s of indianStates; track s) { <option [value]="s">{{ s }}</option> }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">District</label>
                    <input class="form-control" [(ngModel)]="profileForm.district" name="district" placeholder="Enter district" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">🏙 City</label>
                    <input class="form-control" [(ngModel)]="profileForm.city" name="city" placeholder="Enter city name" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Pincode</label>
                    <input class="form-control" [(ngModel)]="profileForm.pincode" name="pincode"
                      placeholder="6-digit pincode" maxlength="6"
                      [class.input-error]="profileForm.pincode && !isPincodeValid()" />
                    @if (profileForm.pincode && !isPincodeValid()) {
                      <span class="field-error">Pincode must be 6 digits</span>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">🌍 Country</label>
                  <input class="form-control" [(ngModel)]="profileForm.country" name="country" />
                </div>

                <!-- Nominee Section -->
                <div class="section-divider"><span>👨‍👩‍👧 Nominee Details</span></div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Nominee Name</label>
                    <input class="form-control" [(ngModel)]="profileForm.nomineeName" name="nomName" placeholder="Nominee full name" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nominee Relation</label>
                    <select class="form-control" [(ngModel)]="profileForm.nomineeRelation" name="nomRel">
                      <option value="">Select relation</option>
                      <option>Spouse</option>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Son</option>
                      <option>Daughter</option>
                      <option>Brother</option>
                      <option>Sister</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Nominee Mobile</label>
                    <input class="form-control" [(ngModel)]="profileForm.nomineeMobile" name="nomMob"
                      placeholder="10-digit (optional)" maxlength="10" />
                  </div>
                </div>

                <div style="margin-top:1.5rem">
                  <button type="submit" class="btn btn-primary btn-lg" [disabled]="saving() || !isFormValid()">
                    @if (saving()) { <span class="btn-spinner"></span> } 💾 Save Changes
                  </button>
                </div>
              </form>
            </div>

            <!-- Security Settings -->
            <div class="card">
              <div class="card-title">🔐 Security Settings</div>
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
                Use a strong password with at least 8 characters including numbers and symbols.
              </p>
              @if (pwSuccess()) { <div class="alert alert-success">✅ {{ pwSuccess() }}</div> }
              @if (pwError()) { <div class="alert alert-error">{{ pwError() }}</div> }
              <form (ngSubmit)="changePassword()">
                <div class="form-group">
                  <label class="form-label">Current Password</label>
                  <input type="password" class="form-control" [(ngModel)]="pwForm.current" name="curr" required placeholder="Enter current password" />
                </div>
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input type="password" class="form-control" [(ngModel)]="pwForm.newPw" name="newpw" required minlength="8" placeholder="Minimum 8 characters" />
                </div>
                <button type="submit" class="btn btn-warning" [disabled]="changingPw()">
                  @if (changingPw()) { <span class="btn-spinner"></span> } 🔑 Change Password
                </button>
              </form>
            </div>
          </div>

          <!-- Right: Sidebar -->
          <div class="profile-sidebar-panel">
            <div class="card" style="text-align:center;padding:1.75rem 1.5rem">
              <div class="psp-avatar">{{ initials() }}</div>
              <div class="psp-name">{{ user()?.firstName }} {{ user()?.lastName }}</div>
              <div class="psp-email">{{ user()?.email }}</div>
              <div style="margin:1rem 0;height:1px;background:var(--border)"></div>
              <div class="psp-detail-list">
                @if (user()?.phone) {
                  <div class="psp-detail-row"><span class="psp-detail-key">📱 Phone</span><span class="psp-detail-val">{{ user()?.phone }}</span></div>
                }
                @if (user()?.gender) {
                  <div class="psp-detail-row"><span class="psp-detail-key">⚧ Gender</span><span class="psp-detail-val">{{ user()?.gender }}</span></div>
                }
                @if (user()?.dateOfBirth) {
                  <div class="psp-detail-row"><span class="psp-detail-key">🎂 DOB</span><span class="psp-detail-val">{{ user()?.dateOfBirth | date:'d MMM yyyy' }}</span></div>
                }
                @if (user()?.aadhaarNumber) {
                  <div class="psp-detail-row"><span class="psp-detail-key">🪪 Aadhaar</span><span class="psp-detail-val">{{ maskAadhaar(user()?.aadhaarNumber) }}</span></div>
                }
                @if (user()?.panNumber) {
                  <div class="psp-detail-row"><span class="psp-detail-key">📋 PAN</span><span class="psp-detail-val">{{ user()?.panNumber }}</span></div>
                }
                @if (user()?.state) {
                  <div class="psp-detail-row"><span class="psp-detail-key">📍 State</span><span class="psp-detail-val">{{ user()?.state }}</span></div>
                }
                @if (user()?.city) {
                  <div class="psp-detail-row"><span class="psp-detail-key">🏙 City</span><span class="psp-detail-val">{{ user()?.city }}</span></div>
                }
                @if (user()?.nomineeName) {
                  <div class="psp-detail-row"><span class="psp-detail-key">👤 Nominee</span><span class="psp-detail-val">{{ user()?.nomineeName }}</span></div>
                }
                <div class="psp-detail-row"><span class="psp-detail-key">📅 Joined</span><span class="psp-detail-val">{{ user()?.createdAt | date:'MMM yyyy' }}</span></div>
              </div>
            </div>

            <!-- KYC Card -->
            <div class="card" style="padding:1.25rem">
              <div class="kyc-header">
                <span style="font-size:1.8rem">🪪</span>
                <div>
                  <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary)">KYC Verification</div>
                  <span class="badge" [class]="getKycBadge(user()?.kycStatus)" style="margin-top:0.25rem">{{ user()?.kycStatus }}</span>
                </div>
              </div>
              @if (user()?.kycStatus === 'APPROVED') {
                <p style="font-size:0.82rem;color:var(--success);margin-top:0.75rem">✅ Your identity has been verified.</p>
              } @else if (user()?.kycStatus === 'PENDING') {
                <p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.75rem">⏳ KYC in progress. Fill in Aadhaar &amp; PAN above.</p>
              }
            </div>

            <!-- Nominee Summary Card -->
            @if (user()?.nomineeName) {
              <div class="card" style="padding:1.25rem">
                <div class="card-title" style="font-size:0.9rem;margin-bottom:0.75rem">👨‍👩‍👧 Nominee</div>
                <div class="psp-detail-list">
                  <div class="psp-detail-row"><span class="psp-detail-key">Name</span><span class="psp-detail-val">{{ user()?.nomineeName }}</span></div>
                  @if (user()?.nomineeRelation) {
                    <div class="psp-detail-row"><span class="psp-detail-key">Relation</span><span class="psp-detail-val">{{ user()?.nomineeRelation }}</span></div>
                  }
                  @if (user()?.nomineeMobile) {
                    <div class="psp-detail-row"><span class="psp-detail-key">Mobile</span><span class="psp-detail-val">{{ user()?.nomineeMobile }}</span></div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-hero { padding:0; overflow:hidden; }
    .profile-cover { height:130px; background:var(--grad-primary); position:relative; overflow:hidden; }
    .profile-cover::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 60%); }
    .profile-hero-body { padding:0 2rem 1.5rem; display:flex; align-items:flex-end; gap:1.5rem; flex-wrap:wrap; }
    .profile-avatar-wrap { margin-top:-44px; flex-shrink:0; }
    .profile-avatar { width:88px; height:88px; background:white; border:4px solid white;
      border-radius:50%; display:flex; align-items:center; justify-content:center;
      font-size:2rem; font-weight:800; color:var(--primary);
      box-shadow:0 4px 20px rgba(0,0,0,0.18); animation:scaleIn 0.4s ease; }
    .profile-hero-info { flex:1; padding-bottom:0.5rem; }
    .profile-hero-name { font-size:1.5rem; font-weight:800; color:var(--text-primary); margin:0 0 0.25rem; }
    .profile-hero-email { font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem; }
    .profile-hero-badges { display:flex; gap:0.4rem; flex-wrap:wrap; }
    .profile-hero-stats { display:flex; align-items:center; background:#f8faff;
      border-radius:var(--radius-md); padding:0.75rem 1.5rem; margin-bottom:0.5rem; border:1px solid #e0e7ff; }
    .phs-item { text-align:center; padding:0 1.2rem; }
    .phs-val { display:block; font-size:1.15rem; font-weight:700; color:var(--primary); }
    .phs-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; }
    .phs-div { width:1px; background:#e0e7ff; height:32px; }
    .profile-layout { display:flex; gap:1.5rem; align-items:flex-start; }
    .profile-sidebar-panel { width:295px; flex-shrink:0; display:flex; flex-direction:column; gap:1rem; }
    .psp-avatar { width:72px; height:72px; background:var(--grad-primary); color:white; border-radius:50%;
      display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:800; margin:0 auto 0.75rem; }
    .psp-name { font-size:1.05rem; font-weight:700; color:var(--text-primary); margin-bottom:0.25rem; }
    .psp-email { font-size:0.82rem; color:var(--text-muted); word-break:break-all; }
    .psp-detail-list { text-align:left; }
    .psp-detail-row { display:flex; justify-content:space-between; align-items:center;
      padding:0.5rem 0; border-bottom:1px solid var(--border); font-size:0.82rem; }
    .psp-detail-row:last-child { border-bottom:none; }
    .psp-detail-key { color:var(--text-muted); flex-shrink:0; }
    .psp-detail-val { font-weight:600; color:var(--text-primary); text-align:right; max-width:55%; word-break:break-all; }
    .kyc-header { display:flex; align-items:center; gap:0.75rem; }
    .readonly-field { background:#f8faff !important; color:#64748b !important; cursor:not-allowed; }
    .section-divider { display:flex; align-items:center; gap:0.75rem; margin:1.5rem 0 1.1rem;
      font-size:0.78rem; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.6px; }
    .section-divider::before,.section-divider::after { content:''; flex:1; height:1.5px;
      background:linear-gradient(to right,var(--primary-light),var(--border)); border-radius:1px; }
    .section-divider::after { background:linear-gradient(to left,var(--primary-light),var(--border)); }
    .auto-filled-tag { background:#dbeafe; color:#1d4ed8; font-size:0.65rem; font-weight:700;
      padding:0.1rem 0.45rem; border-radius:4px; margin-left:0.3rem; text-transform:uppercase; vertical-align:middle; }
    @media(max-width:1000px) { .profile-layout { flex-direction:column; } .profile-sidebar-panel { width:100%; } }
    @media(max-width:600px) { .profile-hero-stats { display:none; } .profile-hero-body { padding:0 1rem 1rem; } .form-row { grid-template-columns:1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  private userSvc = inject(UserService);
  loading    = signal(true);
  saving     = signal(false);
  changingPw = signal(false);
  user        = signal<User | null>(null);
  profileForm: any = {};
  pwForm = { current: '', newPw: '' };
  profileSuccess = signal(''); profileError = signal('');
  pwSuccess      = signal(''); pwError      = signal('');

  readonly indianStates = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
    'West Bengal','Andaman & Nicobar Islands','Chandigarh',
    'Dadra & Nagar Haveli and Daman & Diu','Delhi','Jammu & Kashmir',
    'Ladakh','Lakshadweep','Puducherry'
  ];

  ngOnInit() {
    this.userSvc.getProfile().subscribe({
      next: (r) => {
        this.loading.set(false);
        if (r.success) { this.user.set(r.data); this.profileForm = { ...r.data }; }
      },
      error: () => this.loading.set(false)
    });
  }

  initials() {
    const u = this.user();
    return u ? (u.firstName?.[0] || '') + (u.lastName?.[0] || '') : '?';
  }

  maskAadhaar(n?: string) {
    if (!n || n.length < 8) return n || '—';
    return n.slice(0, 4) + '-XXXX-' + n.slice(8);
  }

  isPhoneValid()   { return !this.profileForm.phone          || /^[6-9]\d{9}$/.test(this.profileForm.phone); }
  isAadhaarValid() { return !this.profileForm.aadhaarNumber  || /^\d{12}$/.test(this.profileForm.aadhaarNumber); }
  isPanValid()     { return !this.profileForm.panNumber      || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test((this.profileForm.panNumber || '').toUpperCase()); }
  isPincodeValid() { return !this.profileForm.pincode        || /^\d{6}$/.test(this.profileForm.pincode); }
  isFormValid()    { return this.isPhoneValid() && this.isAadhaarValid() && this.isPanValid() && this.isPincodeValid(); }

  saveProfile() {
    if (!this.isFormValid()) return;
    if (this.profileForm.panNumber) this.profileForm.panNumber = this.profileForm.panNumber.toUpperCase();
    this.saving.set(true); this.profileError.set('');
    this.userSvc.updateProfile(this.profileForm).subscribe({
      next: (r) => {
        this.saving.set(false);
        if (r.success) {
          this.user.set(r.data);
          this.profileSuccess.set('Profile updated successfully!');
          setTimeout(() => this.profileSuccess.set(''), 4000);
        }
      },
      error: (e) => { this.saving.set(false); this.profileError.set(e.error?.message || 'Update failed'); }
    });
  }

  changePassword() {
    this.changingPw.set(true); this.pwError.set('');
    this.userSvc.changePassword(this.pwForm.current, this.pwForm.newPw).subscribe({
      next: () => {
        this.changingPw.set(false);
        this.pwSuccess.set('Password changed successfully!');
        this.pwForm = { current: '', newPw: '' };
        setTimeout(() => this.pwSuccess.set(''), 4000);
      },
      error: (e) => { this.changingPw.set(false); this.pwError.set(e.error?.message || 'Failed'); }
    });
  }

  getKycBadge(s?: string) {
    return { APPROVED:'badge-success', REJECTED:'badge-danger', SUBMITTED:'badge-warning', PENDING:'badge-secondary' }[s||''] || 'badge-secondary';
  }
}
