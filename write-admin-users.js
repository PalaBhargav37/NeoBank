const fs = require('fs');
const dest = 'C:/Users/pala.TRN/Downloads/POC/frontend/src/app/pages/admin/admin-users/admin-users.component.ts';

const BT = '\`';
const DOLLAR = '$';

const template = [
  "    <div class=\"page-container\">",
  "      <div class=\"page-header\" style=\"margin-bottom:1.5rem\">",
  "        <div>",
  "          <h1 class=\"page-title\">User Management</h1>",
  "          <p style=\"color:var(--text-muted);margin:0;font-size:0.9rem\">{{ users().length }} total users registered</p>",
  "        </div>",
  "        <div class=\"au-summary\">",
  "          <div class=\"au-stat\" style=\"--sc:var(--success)\">",
  "            <span class=\"au-stat-val\">{{ countByStatus('ACTIVE') }}</span>",
  "            <span class=\"au-stat-lbl\">Active</span>",
  "          </div>",
  "          <div class=\"au-stat\" style=\"--sc:#f59e0b\">",
  "            <span class=\"au-stat-val\">{{ countByStatus('SUSPENDED') }}</span>",
  "            <span class=\"au-stat-lbl\">Suspended</span>",
  "          </div>",
  "          <div class=\"au-stat\" style=\"--sc:#6b7280\">",
  "            <span class=\"au-stat-val\">{{ countByStatus('INACTIVE') }}</span>",
  "            <span class=\"au-stat-lbl\">Inactive</span>",
  "          </div>",
  "        </div>",
  "      </div>",
  "",
  "      @if (success()) {",
  "        <div class=\"alert alert-success\">{{ success() }}</div>",
  "      }",
  "      @if (errorMsg()) {",
  "        <div class=\"alert alert-error\">{{ errorMsg() }}</div>",
  "      }",
  "",
  "      <div class=\"card\" style=\"margin-bottom:1.25rem;padding:1rem 1.25rem\">",
  "        <input class=\"form-control\" [(ngModel)]=\"searchQuery\"",
  "          placeholder=\"Search by name or email...\" style=\"max-width:360px\" />",
  "      </div>",
  "",
  "      @if (loading()) {",
  "        <div class=\"au-grid\">",
  "          @for (i of [1,2,3,4,5,6]; track i) {",
  "            <div class=\"skeleton\" style=\"height:180px;border-radius:var(--radius-lg)\"></div>",
  "          }",
  "        </div>",
  "      } @else if (!getFilteredUsers().length) {",
  "        <div class=\"card empty-state\">",
  "          <div class=\"empty-icon\">&#128101;</div>",
  "          <p>No users match your search.</p>",
  "        </div>",
  "      } @else {",
  "        <div class=\"au-grid\">",
  "          @for (u of getFilteredUsers(); track u.id) {",
  "            <div class=\"au-card\"",
  "                 [class.selected]=\"selectedUser()?.id === u.id\"",
  "                 [class.suspended-card]=\"u.status === 'SUSPENDED'\"",
  "                 (click)=\"openUser(u)\">",
  "              <div class=\"auc-header\">",
  "                <div class=\"auc-avatar\" [style.background]=\"getAvatarGrad(u)\">{{ getInitials(u) }}</div>",
  "                <div class=\"auc-info\">",
  "                  <div class=\"auc-name\">{{ u.firstName }} {{ u.lastName }}</div>",
  "                  <div class=\"auc-email\">{{ u.email }}</div>",
  "                </div>",
  "                <span class=\"badge\" [class]=\"u.role === 'ADMIN' ? 'badge-info' : 'badge-secondary'\">{{ u.role }}</span>",
  "              </div>",
  "              <div class=\"auc-divider\"></div>",
  "              <div class=\"auc-meta\">",
  "                <div class=\"auc-meta-item\">",
  "                  <span class=\"auc-meta-key\">Status</span>",
  "                  <span class=\"badge\" [class]=\"getStatusBadge(u.status)\">{{ u.status }}</span>",
  "                </div>",
  "                <div class=\"auc-meta-item\">",
  "                  <span class=\"auc-meta-key\">KYC</span>",
  "                  <span class=\"badge\" [class]=\"getKycBadge(u.kycStatus)\">{{ u.kycStatus }}</span>",
  "                </div>",
  "                @if (u.phone) {",
  "                  <div class=\"auc-meta-item\">",
  "                    <span class=\"auc-meta-key\">Phone</span>",
  "                    <span class=\"auc-meta-val\">{{ u.phone }}</span>",
  "                  </div>",
  "                }",
  "              </div>",
  "              <div class=\"auc-footer\">",
  "                <span class=\"view-details-hint\">View details &#8250;</span>",
  "                <div class=\"auc-actions\" (click)=\"$event.stopPropagation()\">",
  "                  @if (u.status === 'ACTIVE' && u.role !== 'ADMIN') {",
  "                    <button class=\"btn-action btn-suspend\" (click)=\"confirmAction(u, 'SUSPENDED')\">Suspend</button>",
  "                  }",
  "                  @if (u.status === 'SUSPENDED') {",
  "                    <button class=\"btn-action btn-activate\" (click)=\"confirmAction(u, 'ACTIVE')\">Reactivate</button>",
  "                  }",
  "                  @if (u.status === 'INACTIVE') {",
  "                    <button class=\"btn-action btn-activate\" (click)=\"confirmAction(u, 'ACTIVE')\">Activate</button>",
  "                  }",
  "                </div>",
  "              </div>",
  "            </div>",
  "          }",
  "        </div>",
  "      }",
  "    </div>",
  "",
  "    @if (selectedUser()) {",
  "      <div class=\"drawer-backdrop\" (click)=\"closeDrawer()\"></div>",
  "      <div class=\"drawer\">",
  "        <div class=\"drawer-header\">",
  "          <div class=\"drawer-avatar\" [style.background]=\"getAvatarGrad(selectedUser()!)\">",
  "            {{ getInitials(selectedUser()!) }}",
  "          </div>",
  "          <div class=\"drawer-user-info\">",
  "            <div class=\"drawer-user-name\">{{ selectedUser()!.firstName }} {{ selectedUser()!.lastName }}</div>",
  "            <div class=\"drawer-user-email\">{{ selectedUser()!.email }}</div>",
  "            <div class=\"drawer-badges\">",
  "              <span class=\"badge\" [class]=\"selectedUser()!.role === 'ADMIN' ? 'badge-info' : 'badge-secondary'\">{{ selectedUser()!.role }}</span>",
  "              <span class=\"badge\" [class]=\"getStatusBadge(selectedUser()!.status)\">{{ selectedUser()!.status }}</span>",
  "              <span class=\"badge\" [class]=\"getKycBadge(selectedUser()!.kycStatus)\">KYC: {{ selectedUser()!.kycStatus }}</span>",
  "            </div>",
  "          </div>",
  "          <div style=\"display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;flex-shrink:0\">",
  "            @if (!editMode()) {",
  "              <button class=\"drawer-edit-btn\" (click)=\"startEdit()\">&#9998; Edit Details</button>",
  "            }",
  "            <button class=\"drawer-close\" (click)=\"closeDrawer()\">&times;</button>",
  "          </div>",
  "        </div>",
  "",
  "        @if (selectedUser()!.status === 'SUSPENDED') {",
  "          <div class=\"drawer-suspended-banner\">",
  "            This account is currently SUSPENDED — user cannot log in or perform any actions.",
  "          </div>",
  "        }",
  "",
  "        <div class=\"drawer-tabs\">",
  "          <button class=\"dtab\" [class.active]=\"drawerTab() === 'info'\" (click)=\"drawerTab.set('info')\">Personal Info</button>",
  "          <button class=\"dtab\" [class.active]=\"drawerTab() === 'accounts'\" (click)=\"drawerTab.set('accounts')\">",
  "            Bank Accounts",
  "            @if (!accountsLoading()) { <span class=\"dtab-count\">{{ userAccounts().length }}</span> }",
  "          </button>",
  "          <button class=\"dtab\" [class.active]=\"drawerTab() === 'actions'\" (click)=\"drawerTab.set('actions')\">Actions</button>",
  "        </div>",
  "",
  "        @if (drawerTab() === 'info') {",
  "          @if (!editMode()) {",
  "            <div class=\"drawer-section\">",
  "              <div class=\"drawer-info-grid\">",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">First Name</span><span class=\"dig-val\">{{ selectedUser()!.firstName }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">Last Name</span><span class=\"dig-val\">{{ selectedUser()!.lastName }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">Email</span><span class=\"dig-val\">{{ selectedUser()!.email }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">Phone</span><span class=\"dig-val\">{{ selectedUser()!.phone || '—' }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">Date of Birth</span><span class=\"dig-val\">{{ selectedUser()!.dateOfBirth || '—' }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">City</span><span class=\"dig-val\">{{ selectedUser()!.city || '—' }}</span></div>",
  "                <div class=\"dig-item full\"><span class=\"dig-lbl\">Address</span><span class=\"dig-val\">{{ selectedUser()!.address || '—' }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">Country</span><span class=\"dig-val\">{{ selectedUser()!.country || '—' }}</span></div>",
  "                <div class=\"dig-item\"><span class=\"dig-lbl\">Registered On</span>",
  "                  <span class=\"dig-val\">{{ selectedUser()!.createdAt ? (selectedUser()!.createdAt | date:'dd MMM yyyy') : '—' }}</span></div>",
  "              </div>",
  "            </div>",
  "          } @else {",
  "            <div class=\"drawer-section\">",
  "              <div class=\"edit-banner\">Admin Edit Mode — changes are saved directly to the customer record.</div>",
  "              <div class=\"edit-grid\">",
  "                <div class=\"form-group\">",
  "                  <label class=\"form-label\">First Name <span class=\"req\">*</span></label>",
  "                  <input class=\"form-control\" [(ngModel)]=\"editForm.firstName\" placeholder=\"First name\" />",
  "                  @if (editSubmitted && !editForm.firstName?.trim()) { <span class=\"field-error\">Required</span> }",
  "                </div>",
  "                <div class=\"form-group\">",
  "                  <label class=\"form-label\">Last Name <span class=\"req\">*</span></label>",
  "                  <input class=\"form-control\" [(ngModel)]=\"editForm.lastName\" placeholder=\"Last name\" />",
  "                  @if (editSubmitted && !editForm.lastName?.trim()) { <span class=\"field-error\">Required</span> }",
  "                </div>",
  "                <div class=\"form-group full\">",
  "                  <label class=\"form-label\">Email</label>",
  "                  <input class=\"form-control\" [value]=\"selectedUser()!.email\" disabled style=\"background:#f8faff;color:#94a3b8;cursor:not-allowed\" />",
  "                  <span class=\"field-hint\">Email cannot be changed</span>",
  "                </div>",
  "                <div class=\"form-group\">",
  "                  <label class=\"form-label\">Phone <span class=\"req\">*</span></label>",
  "                  <input class=\"form-control\" [(ngModel)]=\"editForm.phone\" placeholder=\"10-digit mobile\" maxlength=\"10\" />",
  "                  @if (editSubmitted && !isPhoneValid(editForm.phone)) { <span class=\"field-error\">Valid 10-digit phone required</span> }",
  "                </div>",
  "                <div class=\"form-group\">",
  "                  <label class=\"form-label\">Date of Birth</label>",
  "                  <input class=\"form-control\" type=\"date\" [(ngModel)]=\"editForm.dateOfBirth\" [max]=\"maxDob\" />",
  "                </div>",
  "                <div class=\"form-group full\">",
  "                  <label class=\"form-label\">Address</label>",
  "                  <input class=\"form-control\" [(ngModel)]=\"editForm.address\" placeholder=\"Street address\" />",
  "                </div>",
  "                <div class=\"form-group\">",
  "                  <label class=\"form-label\">City</label>",
  "                  <input class=\"form-control\" [(ngModel)]=\"editForm.city\" placeholder=\"City\" />",
  "                </div>",
  "                <div class=\"form-group\">",
  "                  <label class=\"form-label\">Country</label>",
  "                  <select class=\"form-control\" [(ngModel)]=\"editForm.country\">",
  "                    <option value=\"\">Select country</option>",
  "                    <option value=\"India\">India</option>",
  "                    <option value=\"USA\">USA</option>",
  "                    <option value=\"UK\">UK</option>",
  "                    <option value=\"UAE\">UAE</option>",
  "                    <option value=\"Singapore\">Singapore</option>",
  "                    <option value=\"Canada\">Canada</option>",
  "                    <option value=\"Australia\">Australia</option>",
  "                    <option value=\"Germany\">Germany</option>",
  "                  </select>",
  "                </div>",
  "              </div>",
  "              <div class=\"edit-actions\">",
  "                <button class=\"btn btn-secondary\" (click)=\"cancelEdit()\" [disabled]=\"editSaving()\">Cancel</button>",
  "                <button class=\"btn btn-primary\" (click)=\"saveEdit()\" [disabled]=\"editSaving()\">",
  "                  @if (editSaving()) { <span class=\"btn-spinner\"></span> Saving... } @else { Save Changes }",
  "                </button>",
  "              </div>",
  "            </div>",
  "          }",
  "        }",
  "",
  "        @if (drawerTab() === 'accounts') {",
  "          <div class=\"drawer-section\">",
  "            @if (accountsLoading()) {",
  "              <div class=\"drawer-accounts-loading\">Loading accounts&hellip;</div>",
  "            } @else if (!userAccounts().length) {",
  "              <div class=\"drawer-empty-accounts\">No bank accounts found for this user.</div>",
  "            } @else {",
  "              <div class=\"drawer-accounts-list\">",
  "                @for (acc of userAccounts(); track acc.id) {",
  "                  <div class=\"drawer-acc-card\" [attr.data-status]=\"acc.status\">",
  "                    <div class=\"dac-top\">",
  "                      <div class=\"dac-type-icon\">{{ getAccIcon(acc.accountType) }}</div>",
  "                      <div class=\"dac-info\">",
  "                        <div class=\"dac-type\">{{ acc.accountType }}</div>",
  "                        <div class=\"dac-number\">{{ acc.accountNumber }}</div>",
  "                      </div>",
  "                      <div class=\"dac-right\">",
  "                        <div class=\"dac-balance\">&#8377;{{ acc.balance | number:'1.2-2' }}</div>",
  "                        <span class=\"badge\" [class]=\"getAccStatusBadge(acc.status)\">{{ acc.status }}</span>",
  "                      </div>",
  "                    </div>",
  "                    @if (acc.status === 'ACTIVE' && acc.ifscCode) {",
  "                      <div class=\"dac-bottom\">",
  "                        <span>{{ acc.bankName || 'NeoBank' }}</span>",
  "                        <span>IFSC: <strong>{{ acc.ifscCode }}</strong></span>",
  "                      </div>",
  "                    }",
  "                  </div>",
  "                }",
  "              </div>",
  "            }",
  "          </div>",
  "        }",
  "",
  "        @if (drawerTab() === 'actions') {",
  "          <div class=\"drawer-section\">",
  "            <div class=\"action-cards\">",
  "              @if (selectedUser()!.role !== 'ADMIN') {",
  "                <div class=\"action-card\" [class.action-danger]=\"selectedUser()!.status === 'ACTIVE'\" [class.action-success]=\"selectedUser()!.status !== 'ACTIVE'\">",
  "                  <div class=\"action-card-icon\">&#128683;</div>",
  "                  <div class=\"action-card-info\">",
  "                    <div class=\"action-card-title\">{{ selectedUser()!.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account' }}</div>",
  "                    <div class=\"action-card-desc\">",
  "                      @if (selectedUser()!.status === 'ACTIVE') { Block user from logging in and all transactions. }",
  "                      @else { Restore full access to NeoBank for this customer. }",
  "                    </div>",
  "                  </div>",
  "                  <button class=\"action-card-btn\" [class.btn-danger-sm]=\"selectedUser()!.status === 'ACTIVE'\" [class.btn-success-sm]=\"selectedUser()!.status !== 'ACTIVE'\"",
  "                    (click)=\"confirmAction(selectedUser()!, selectedUser()!.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'); closeDrawer()\">",
  "                    {{ selectedUser()!.status === 'ACTIVE' ? 'Suspend' : 'Reactivate' }}",
  "                  </button>",
  "                </div>",
  "              }",
  "              <div class=\"action-card action-info\">",
  "                <div class=\"action-card-icon\">&#9998;</div>",
  "                <div class=\"action-card-info\">",
  "                  <div class=\"action-card-title\">Edit Customer Details</div>",
  "                  <div class=\"action-card-desc\">Update name, phone, address and date of birth.</div>",
  "                </div>",
  "                <button class=\"action-card-btn btn-primary-sm\" (click)=\"drawerTab.set('info'); startEdit()\">Edit</button>",
  "              </div>",
  "              <div class=\"action-card action-neutral\">",
  "                <div class=\"action-card-icon\">&#127974;</div>",
  "                <div class=\"action-card-info\">",
  "                  <div class=\"action-card-title\">View Bank Accounts</div>",
  "                  <div class=\"action-card-desc\">{{ userAccounts().length }} account(s) linked to this customer.</div>",
  "                </div>",
  "                <button class=\"action-card-btn btn-secondary-sm\" (click)=\"drawerTab.set('accounts')\">View</button>",
  "              </div>",
  "            </div>",
  "          </div>",
  "        }",
  "      </div>",
  "    }",
  "",
  "    @if (confirmUser()) {",
  "      <div class=\"modal-backdrop\" (click)=\"cancelConfirm()\">",
  "        <div class=\"modal-box\" (click)=\"$event.stopPropagation()\">",
  "          <div class=\"modal-icon\" [class.modal-icon-warn]=\"confirmTargetStatus() === 'SUSPENDED'\" [class.modal-icon-ok]=\"confirmTargetStatus() === 'ACTIVE'\">",
  "            {{ confirmTargetStatus() === 'SUSPENDED' ? '&#128683;' : '&#9989;' }}",
  "          </div>",
  "          <h3 class=\"modal-title\">{{ confirmTargetStatus() === 'SUSPENDED' ? 'Suspend User?' : 'Reactivate User?' }}</h3>",
  "          <p class=\"modal-msg\">",
  "            <strong>{{ confirmUser()!.firstName }} {{ confirmUser()!.lastName }}</strong>",
  "            @if (confirmTargetStatus() === 'SUSPENDED') { will lose all access to NeoBank immediately. }",
  "            @else { will regain full access to NeoBank. }",
  "          </p>",
  "          <div class=\"modal-actions\">",
  "            <button class=\"btn btn-secondary\" (click)=\"cancelConfirm()\">Cancel</button>",
  "            <button class=\"btn\" [class]=\"confirmTargetStatus() === 'SUSPENDED' ? 'btn-danger' : 'btn-success'\"",
  "                    (click)=\"doConfirm()\" [disabled]=\"actionLoading()\">",
  "              @if (actionLoading()) { <span class=\"modal-spinner\"></span> }",
  "              {{ confirmTargetStatus() === 'SUSPENDED' ? 'Yes, Suspend' : 'Yes, Reactivate' }}",
  "            </button>",
  "          </div>",
  "        </div>",
  "      </div>",
  "    }",
].join('\n');

const styles = [
  "    .au-summary{display:flex;gap:.75rem}",
  "    .au-stat{background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius-md);padding:.6rem 1rem;text-align:center;border-top:3px solid var(--sc,var(--primary))}",
  "    .au-stat-val{display:block;font-size:1.2rem;font-weight:800;color:var(--sc,var(--primary))}",
  "    .au-stat-lbl{font-size:.72rem;color:var(--text-muted);text-transform:uppercase}",
  "    .au-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}",
  "    .au-card{background:var(--card-bg);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;box-shadow:var(--shadow-sm);cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s}",
  "    .au-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--primary)}",
  "    .au-card.selected{border-color:var(--primary);box-shadow:0 0 0 3px rgba(99,102,241,.15)}",
  "    .au-card.suspended-card{border-color:#fca5a5;background:linear-gradient(135deg,#fff,#fff5f5)}",
  "    .auc-header{display:flex;align-items:center;gap:.75rem}",
  "    .auc-avatar{width:44px;height:44px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;flex-shrink:0}",
  "    .auc-info{flex:1;min-width:0}",
  "    .auc-name{font-weight:700;font-size:.95rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  "    .auc-email{font-size:.75rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  "    .auc-divider{height:1px;background:var(--border);margin:.85rem 0}",
  "    .auc-meta{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-bottom:.75rem}",
  "    .auc-meta-item{display:flex;align-items:center;gap:.35rem}",
  "    .auc-meta-key{font-size:.72rem;color:var(--text-muted);font-weight:600}",
  "    .auc-meta-val{font-size:.8rem;font-weight:600;color:var(--text-primary)}",
  "    .auc-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.4rem}",
  "    .view-details-hint{font-size:.72rem;color:var(--primary);font-weight:600;opacity:.7}",
  "    .au-card:hover .view-details-hint{opacity:1}",
  "    .auc-actions{display:flex;gap:.5rem}",
  "    .btn-action{padding:.4rem .9rem;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s}",
  "    .btn-suspend{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff}",
  "    .btn-suspend:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(220,38,38,.45)}",
  "    .btn-activate{background:linear-gradient(135deg,#059669,#10b981);color:#fff}",
  "    .btn-activate:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(5,150,105,.45)}",
  "    .drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;backdrop-filter:blur(3px);animation:fadeIn .2s ease}",
  "    .drawer{position:fixed;top:0;right:0;height:100vh;width:520px;max-width:96vw;background:#fff;z-index:1001;box-shadow:-8px 0 48px rgba(0,0,0,.2);overflow-y:auto;display:flex;flex-direction:column;animation:slideInRight .3s cubic-bezier(.34,1,.64,1)}",
  "    @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}",
  "    @keyframes fadeIn{from{opacity:0}to{opacity:1}}",
  "    .drawer-header{display:flex;align-items:flex-start;gap:1rem;padding:1.5rem;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;flex-shrink:0}",
  "    .drawer-avatar{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;border:3px solid rgba(255,255,255,.4);flex-shrink:0}",
  "    .drawer-user-info{flex:1;min-width:0}",
  "    .drawer-user-name{font-size:1.2rem;font-weight:800;color:#fff}",
  "    .drawer-user-email{font-size:.8rem;color:rgba(255,255,255,.8);margin:.15rem 0 .5rem}",
  "    .drawer-badges{display:flex;flex-wrap:wrap;gap:.35rem}",
  "    .drawer-badges .badge{font-size:.68rem}",
  "    .drawer-edit-btn{background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.5);color:#fff;padding:.3rem .85rem;border-radius:8px;cursor:pointer;font-size:.78rem;font-weight:700;transition:background .2s;white-space:nowrap}",
  "    .drawer-edit-btn:hover{background:rgba(255,255,255,.35)}",
  "    .drawer-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;transition:background .2s}",
  "    .drawer-close:hover{background:rgba(255,255,255,.35)}",
  "    .drawer-suspended-banner{background:#fff1f2;border-bottom:2px solid #fca5a5;color:#991b1b;padding:.75rem 1.5rem;font-size:.82rem;font-weight:600}",
  "    .drawer-tabs{display:flex;border-bottom:2px solid #e2e8f0;background:#f8faff;flex-shrink:0}",
  "    .dtab{flex:1;padding:.75rem .5rem;border:none;background:none;cursor:pointer;font-size:.8rem;font-weight:600;color:#64748b;transition:all .2s;border-bottom:2px solid transparent;margin-bottom:-2px;display:flex;align-items:center;justify-content:center;gap:.4rem}",
  "    .dtab:hover{color:var(--primary);background:rgba(99,102,241,.05)}",
  "    .dtab.active{color:var(--primary);border-bottom-color:var(--primary);background:#fff}",
  "    .dtab-count{background:var(--primary);color:#fff;border-radius:10px;padding:.1rem .45rem;font-size:.65rem;font-weight:700}",
  "    .drawer-section{padding:1.25rem 1.5rem;flex:1}",
  "    .drawer-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}",
  "    .dig-item{display:flex;flex-direction:column;gap:.15rem}",
  "    .dig-item.full{grid-column:1/-1}",
  "    .dig-lbl{font-size:.68rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em;font-weight:600}",
  "    .dig-val{font-size:.9rem;font-weight:600;color:var(--text-primary);word-break:break-word}",
  "    .edit-banner{background:linear-gradient(135deg,#fef3c7,#fffbeb);border:1.5px solid #fcd34d;border-radius:10px;padding:.75rem 1rem;font-size:.8rem;color:#92400e;font-weight:600;margin-bottom:1.25rem}",
  "    .edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:.85rem 1rem}",
  "    .form-group.full{grid-column:1/-1}",
  "    .req{color:#dc2626}",
  "    .field-error{font-size:.72rem;color:#dc2626;margin-top:.2rem;display:block}",
  "    .field-hint{font-size:.72rem;color:#94a3b8;margin-top:.2rem;display:block}",
  "    .edit-actions{display:flex;gap:.75rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid #e2e8f0}",
  "    .btn-spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:4px}",
  "    .drawer-accounts-loading{text-align:center;color:var(--text-muted);padding:1.5rem}",
  "    .drawer-empty-accounts{text-align:center;color:var(--text-muted);font-size:.85rem;padding:1.5rem;font-style:italic}",
  "    .drawer-accounts-list{display:flex;flex-direction:column;gap:.75rem}",
  "    .drawer-acc-card{border:1.5px solid #e2e8f0;border-radius:12px;overflow:hidden}",
  "    .drawer-acc-card[data-status=ACTIVE]{border-color:#bbf7d0}",
  "    .drawer-acc-card[data-status=PENDING]{border-color:#fde68a}",
  "    .drawer-acc-card[data-status=REJECTED]{border-color:#fca5a5}",
  "    .dac-top{display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem}",
  "    .dac-type-icon{font-size:1.5rem;flex-shrink:0}",
  "    .dac-info{flex:1;min-width:0}",
  "    .dac-type{font-size:.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}",
  "    .dac-number{font-size:.9rem;font-weight:700;color:var(--text-primary);font-family:monospace}",
  "    .dac-right{text-align:right}",
  "    .dac-balance{font-size:1rem;font-weight:800;color:#16a34a;margin-bottom:.25rem}",
  "    .dac-bottom{display:flex;flex-wrap:wrap;gap:.5rem 1rem;padding:.5rem 1rem .75rem;background:#f8faff;font-size:.75rem;color:#64748b;border-top:1px solid #e2e8f0}",
  "    .action-cards{display:flex;flex-direction:column;gap:.85rem}",
  "    .action-card{display:flex;align-items:center;gap:1rem;padding:1rem 1.1rem;border-radius:12px;border:1.5px solid #e2e8f0;background:#fafafa}",
  "    .action-card.action-danger{border-color:#fecaca;background:#fff5f5}",
  "    .action-card.action-success{border-color:#bbf7d0;background:#f0fdf4}",
  "    .action-card.action-info{border-color:#bfdbfe;background:#eff6ff}",
  "    .action-card.action-neutral{border-color:#e2e8f0;background:#f8faff}",
  "    .action-card-icon{font-size:1.5rem;flex-shrink:0}",
  "    .action-card-info{flex:1;min-width:0}",
  "    .action-card-title{font-size:.88rem;font-weight:700;color:var(--text-primary)}",
  "    .action-card-desc{font-size:.75rem;color:#64748b;margin-top:.15rem;line-height:1.4}",
  "    .action-card-btn{padding:.4rem 1rem;border:none;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;flex-shrink:0}",
  "    .btn-danger-sm{background:#dc2626;color:#fff}",
  "    .btn-danger-sm:hover{background:#b91c1c}",
  "    .btn-success-sm{background:#059669;color:#fff}",
  "    .btn-success-sm:hover{background:#047857}",
  "    .btn-primary-sm{background:var(--primary);color:#fff}",
  "    .btn-primary-sm:hover{opacity:.9}",
  "    .btn-secondary-sm{background:#e2e8f0;color:#475569}",
  "    .btn-secondary-sm:hover{background:#cbd5e1}",
  "    .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn .2s ease;backdrop-filter:blur(4px)}",
  "    .modal-box{background:#fff;border-radius:20px;padding:2rem;max-width:400px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.3);animation:scaleIn .25s cubic-bezier(.34,1.4,.64,1)}",
  "    @keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}",
  "    .modal-icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1rem}",
  "    .modal-icon-warn{background:#fff1f2;border:2px solid #fca5a5}",
  "    .modal-icon-ok{background:#f0fdf4;border:2px solid #6ee7b7}",
  "    .modal-title{font-size:1.2rem;font-weight:800;color:#0f172a;text-align:center;margin:0 0 .6rem}",
  "    .modal-msg{font-size:.875rem;color:#64748b;text-align:center;margin:0 0 1.5rem;line-height:1.6}",
  "    .modal-actions{display:flex;gap:.75rem;justify-content:center}",
  "    .modal-actions .btn{padding:.65rem 1.5rem;font-size:.9rem;min-width:120px}",
  "    .btn-danger{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700}",
  "    .btn-danger:hover{transform:translateY(-1px)}",
  "    .btn-success{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700}",
  "    .btn-success:hover{transform:translateY(-1px)}",
  "    .modal-spinner{display:inline-block;width:14px;height:14px;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:4px}",
  "    @keyframes spin{to{transform:rotate(360deg)}}",
].join('\n');

const tsClass = `
  private adminSvc = inject(AdminService);

  loading       = signal(true);
  users         = signal<User[]>([]);
  success       = signal('');
  errorMsg      = signal('');
  actionLoading = signal(false);
  confirmUser   = signal<User | null>(null);
  confirmTargetStatus = signal<'ACTIVE' | 'SUSPENDED'>('SUSPENDED');
  searchQuery   = '';

  selectedUser    = signal<User | null>(null);
  userAccounts    = signal<Account[]>([]);
  accountsLoading = signal(false);
  drawerTab       = signal<'info' | 'accounts' | 'actions'>('info');

  editMode      = signal(false);
  editSaving    = signal(false);
  editSubmitted = false;
  editForm: Partial<User> = {};

  maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  ngOnInit() {
    this.adminSvc.getAllUsers().subscribe({
      next: (r) => { this.loading.set(false); if (r.success) this.users.set(r.data); },
      error: () => this.loading.set(false)
    });
  }

  openUser(u: User) {
    this.selectedUser.set(u);
    this.drawerTab.set('info');
    this.editMode.set(false);
    this.userAccounts.set([]);
    this.accountsLoading.set(true);
    this.adminSvc.getUserAccounts(u.id).subscribe({
      next: (r) => { this.accountsLoading.set(false); if (r.success) this.userAccounts.set(r.data); },
      error: () => this.accountsLoading.set(false)
    });
  }

  closeDrawer() { this.selectedUser.set(null); this.editMode.set(false); }

  startEdit() {
    const u = this.selectedUser()!;
    this.editForm = {
      firstName: u.firstName, lastName: u.lastName, phone: u.phone,
      dateOfBirth: u.dateOfBirth, address: u.address, city: u.city, country: u.country
    };
    this.editSubmitted = false;
    this.editMode.set(true);
  }

  cancelEdit() { this.editMode.set(false); this.editSubmitted = false; }

  saveEdit() {
    this.editSubmitted = true;
    if (!this.editForm.firstName?.trim() || !this.editForm.lastName?.trim() || !this.isPhoneValid(this.editForm.phone)) return;
    this.editSaving.set(true);
    const id = this.selectedUser()!.id;
    this.adminSvc.updateUser(id, this.editForm).subscribe({
      next: (r) => {
        this.editSaving.set(false);
        if (r.success) {
          this.users.update(list => list.map(u => u.id === id ? r.data : u));
          this.selectedUser.set(r.data);
          this.editMode.set(false);
          this.editSubmitted = false;
          this.success.set(r.data.firstName + ' ' + r.data.lastName + '\\u2019s details have been updated.');
          setTimeout(() => this.success.set(''), 4000);
        }
      },
      error: (err) => {
        this.editSaving.set(false);
        this.errorMsg.set(err?.error?.message || 'Failed to save changes.');
        setTimeout(() => this.errorMsg.set(''), 4000);
      }
    });
  }

  isPhoneValid(phone: string | undefined): boolean { return /^[6-9]\\d{9}$/.test(phone || ''); }

  getFilteredUsers(): User[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u => (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(q));
  }

  confirmAction(user: User, status: 'ACTIVE' | 'SUSPENDED') {
    this.confirmUser.set(user);
    this.confirmTargetStatus.set(status);
  }

  cancelConfirm() { this.confirmUser.set(null); }

  doConfirm() {
    const user = this.confirmUser(); const status = this.confirmTargetStatus();
    if (!user) return;
    this.actionLoading.set(true); this.errorMsg.set('');
    this.adminSvc.updateUserStatus(user.id, status).subscribe({
      next: (r) => {
        this.actionLoading.set(false); this.confirmUser.set(null);
        if (r.success) {
          this.adminSvc.getAllUsers().subscribe({ next: (res) => { if (res.success) this.users.set(res.data); } });
          this.success.set(status === 'ACTIVE'
            ? user.firstName + ' ' + user.lastName + ' has been reactivated.'
            : user.firstName + ' ' + user.lastName + ' has been suspended.');
          setTimeout(() => this.success.set(''), 4000);
        }
      },
      error: (err) => {
        this.actionLoading.set(false); this.confirmUser.set(null);
        this.errorMsg.set(err?.error?.message || 'Failed to update user status.');
        setTimeout(() => this.errorMsg.set(''), 5000);
      }
    });
  }

  countByStatus(s: string) { return this.users().filter(u => u.status === s).length; }
  getInitials(u: User) { return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase(); }

  getAvatarGrad(u: User) {
    const g = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#11998e,#38ef7d)',
               'linear-gradient(135deg,#fc4a1a,#f7b733)','linear-gradient(135deg,#4facfe,#00f2fe)',
               'linear-gradient(135deg,#f093fb,#f5576c)'];
    return g[(u.id || 0) % g.length];
  }

  getAccIcon(t: string): string {
    const m: Record<string, string> = { SAVINGS: '\\uD83C\\uDFE6', CURRENT: '\\uD83D\\uDCBC', FIXED_DEPOSIT: '\\uD83D\\uDD12' };
    return m[t] || '\\uD83D\\uDCB3';
  }

  getAccStatusBadge(s: string): string {
    const m: Record<string, string> = {ACTIVE:'badge-success',PENDING:'badge-warning',REJECTED:'badge-danger',FROZEN:'badge-info',CLOSED:'badge-secondary',INACTIVE:'badge-secondary'};
    return m[s] || 'badge-secondary';
  }
  getStatusBadge(s: string): string {
    const m: Record<string, string> = {ACTIVE:'badge-success',SUSPENDED:'badge-danger',INACTIVE:'badge-warning'};
    return m[s] || 'badge-secondary';
  }
  getKycBadge(s: string): string {
    const m: Record<string, string> = {APPROVED:'badge-success',REJECTED:'badge-danger',SUBMITTED:'badge-warning',PENDING:'badge-secondary'};
    return m[s] || 'badge-secondary';
  }
`;

const code =
`import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ${BT}
${template}
  ${BT},
  styles: [${BT}
${styles}
  ${BT}]
})
export class AdminUsersComponent implements OnInit {
${tsClass}
}
`;

fs.writeFileSync(dest, code, 'utf8');
console.log('Written', fs.statSync(dest).size, 'bytes');
