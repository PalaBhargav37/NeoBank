const fs = require('fs');
const BT = '`';
const dest = 'C:\\Users\\pala.TRN\\Downloads\\POC\\frontend\\src\\app\\pages\\budget\\budget.component.ts';

/* ─── Template ─────────────────────────────────────────────── */
const tpl = `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="pg-icon-title">
          <span class="pg-icon">📊</span>
          <div>
            <h1 class="page-title">Budget Tracker</h1>
            <p class="page-subtitle">Automatically tracks your real spending • Plan every rupee.</p>
          </div>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
          <div class="month-pick">
            <button class="mpb" (click)="prevMonth()">‹</button>
            <span class="month-lbl">{{ monthLabel() }}</span>
            <button class="mpb" (click)="nextMonth()">›</button>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="refreshSpending()" [disabled]="refreshing()" title="Re-sync from transactions">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [class.spinning]="refreshing()">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {{ refreshing() ? 'Syncing…' : 'Sync' }}
          </button>
          <button class="btn btn-primary" (click)="showAdd.set(true)">+ New Budget</button>
        </div>
      </div>

      <!-- Sync notice -->
      @if (lastSync()) {
        <div class="sync-bar">
          <span>🔄 Spending auto-synced from your transactions</span>
          <span class="sync-time">Last sync: {{ lastSync() | date:'h:mm a' }}</span>
        </div>
      }

      <!-- Summary Cards -->
      <div class="bsum-row">
        <div class="bsum-card">
          <div class="bsc-lbl">TOTAL LIMIT</div>
          <div class="bsc-val">₹{{ totalLimit() | number:'1.0-0' }}</div>
        </div>
        <div class="bsum-card active">
          <div class="bsc-lbl">TOTAL SPENT</div>
          <div class="bsc-val">₹{{ totalSpent() | number:'1.0-0' }}</div>
        </div>
        <div class="bsum-card" [class.warn]="totalSpent() > totalLimit() && totalLimit() > 0">
          <div class="bsc-lbl">REMAINING</div>
          <div class="bsc-val" [class.danger]="totalSpent() > totalLimit()">₹{{ (totalLimit() - totalSpent()) | number:'1.0-0' }}</div>
        </div>
        <div class="bsum-card">
          <div class="bsc-lbl">UTILISATION</div>
          <div class="bsc-val" [class.danger]="usagePct() > 100" [class.warn-txt]="usagePct() > 80 && usagePct() <= 100">{{ usagePct() }}%</div>
          <div class="bsc-bar"><div class="bsc-fill" [style.width.%]="usagePct()" [class.over]="usagePct() > 100" [class.warn-bar]="usagePct() > 80 && usagePct() <= 100"></div></div>
        </div>
      </div>

      <!-- Over-budget alerts -->
      @for (b of overBudgetItems(); track b.id) {
        <div class="alert-bar">
          ⚠️ <strong>{{ b.category }}</strong> is over budget by ₹{{ (b.spent - b.limit) | number:'1.0-0' }}!
        </div>
      }

      <!-- Empty state -->
      @if (!budgets().length) {
        <div class="empty-box">
          <div class="empty-icon-large">💰</div>
          <div class="empty-title">No budgets for {{ monthLabel() }}</div>
          <div class="empty-sub">Click <strong>+ New Budget</strong> to start planning your spending.</div>
        </div>
      }

      <!-- Budget Grid -->
      @if (budgets().length) {
        <div class="budget-grid">
          @for (b of budgets(); track b.id) {
            <div class="bitem-card" [class.over-card]="b.spent > b.limit">
              <div class="bitem-header">
                <span class="bitem-icon">{{ b.icon }}</span>
                <span class="bitem-name">{{ b.category }}</span>
                <div class="bitem-acts">
                  <button class="act-btn add-btn" (click)="openAddExpense(b)" title="Log expense">+</button>
                  <button class="act-btn del-btn" (click)="deleteBudget(b.id)" title="Delete">✕</button>
                </div>
              </div>

              <div class="bitem-amounts">
                <span class="bitem-spent" [class.over-amt]="b.spent > b.limit">₹{{ b.spent | number:'1.0-0' }}</span>
                <span class="bitem-limit">/ ₹{{ b.limit | number:'1.0-0' }}</span>
              </div>

              <div class="bitem-track">
                <div class="bitem-fill"
                  [style.width.%]="itemPct(b)"
                  [style.background]="b.spent > b.limit ? '#ef4444' : b.color"></div>
              </div>

              <div class="bitem-footer">
                @if (b.spent > b.limit) {
                  <span class="over-txt">🚨 Over ₹{{ (b.spent - b.limit) | number:'1.0-0' }}</span>
                } @else if (itemPct(b) >= 80) {
                  <span class="warn-txt2">⚠ ₹{{ (b.limit - b.spent) | number:'1.0-0' }} left</span>
                } @else {
                  <span class="ok-txt">✅ ₹{{ (b.limit - b.spent) | number:'1.0-0' }} left</span>
                }
                <span class="pct-txt">{{ itemPct(b) }}%</span>
              </div>

              <!-- Recent matched transactions -->
              @if (getTxForBudget(b).length) {
                <div class="bitem-txs">
                  <div class="btx-header">Recent transactions</div>
                  @for (tx of getTxForBudget(b).slice(0,3); track tx.transactionId) {
                    <div class="btx-row">
                      <span class="btx-desc">{{ tx.description || tx.type }}</span>
                      <span class="btx-amt">-₹{{ tx.amount | number:'1.0-0' }}</span>
                    </div>
                  }
                  @if (getTxForBudget(b).length > 3) {
                    <div class="btx-more">+{{ getTxForBudget(b).length - 3 }} more</div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ── Add Budget Modal ── -->
      @if (showAdd()) {
        <div class="modal-bg" (click)="showAdd.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 class="modal-title">📊 New Budget Category</h3>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" [(ngModel)]="newCat" name="cat">
                @for (c of catOptions; track c.value) {
                  <option [value]="c.value">{{ c.icon }} {{ c.label }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Monthly Limit (₹)</label>
              <input type="number" class="form-control" [(ngModel)]="newLimit" min="1" placeholder="e.g. 5000" />
            </div>
            <div class="modal-hint">
              💡 Spending will be auto-synced from your DEBIT transactions for this month.
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showAdd.set(false)">Cancel</button>
              <button class="btn btn-primary" (click)="addBudget()">Add Budget</button>
            </div>
          </div>
        </div>
      }

      <!-- ── Log Expense Modal ── -->
      @if (expenseTarget()) {
        <div class="modal-bg" (click)="expenseTarget.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3 class="modal-title">{{ expenseTarget()!.icon }} Log Expense — {{ expenseTarget()!.category }}</h3>
            <div class="form-group">
              <label class="form-label">Amount (₹) <span style="color:#dc2626">*</span></label>
              <input type="number" class="form-control" [(ngModel)]="expAmt" min="1" placeholder="e.g. 500" autofocus />
            </div>
            <div class="form-group">
              <label class="form-label">Note <span style="color:#94a3b8;font-size:0.75rem">(optional)</span></label>
              <input class="form-control" [(ngModel)]="expNote" placeholder="e.g. Lunch at office" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="expenseTarget.set(null)">Cancel</button>
              <button class="btn btn-primary" (click)="logExpense()" [disabled]="!expAmt || expAmt <= 0">Add Expense</button>
            </div>
          </div>
        </div>
      }
    </div>
`;

/* ─── Styles ────────────────────────────────────────────────── */
const styles = `
    .pg-icon-title { display:flex; align-items:center; gap:0.75rem; }
    .pg-icon { font-size:2rem; }
    .month-pick { display:flex; align-items:center; gap:0.5rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.4rem 0.9rem; }
    .mpb { background:none; border:none; font-size:1.2rem; cursor:pointer; color:#3949ab; padding:0 0.15rem; }
    .month-lbl { font-weight:600; color:#1e293b; min-width:110px; text-align:center; }

    .sync-bar { display:flex; justify-content:space-between; align-items:center; background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:0.55rem 1rem; margin-bottom:1.1rem; font-size:0.82rem; color:#1e40af; }
    .sync-time { color:#60a5fa; font-size:0.75rem; }

    .bsum-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.4rem; }
    @media(max-width:720px) { .bsum-row { grid-template-columns:1fr 1fr; } }
    .bsum-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:1.1rem 1.4rem; }
    .bsum-card.active { background:linear-gradient(135deg,#059669,#10b981); border:none; }
    .bsum-card.active .bsc-lbl,.bsum-card.active .bsc-val { color:#fff; }
    .bsum-card.warn { border-color:#fbbf24; background:#fffbeb; }
    .bsc-lbl { font-size:0.72rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.4rem; }
    .bsc-val { font-size:1.5rem; font-weight:800; color:#1e293b; }
    .bsc-val.danger { color:#dc2626; }
    .bsc-val.warn-txt { color:#d97706; }
    .bsc-bar { height:5px; background:#e2e8f0; border-radius:10px; overflow:hidden; margin-top:0.5rem; }
    .bsc-fill { height:100%; background:#3949ab; border-radius:10px; transition:width 0.5s; max-width:100%; }
    .bsc-fill.over { background:#dc2626; }
    .bsc-fill.warn-bar { background:#f59e0b; }

    .alert-bar { background:#fee2e2; border:1px solid #fca5a5; border-radius:10px; padding:0.6rem 1rem; font-size:0.84rem; color:#991b1b; margin-bottom:0.75rem; animation:slideDown .3s ease; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }

    .empty-box { background:#fff; border:2px dashed #e2e8f0; border-radius:16px; padding:3rem; text-align:center; }
    .empty-icon-large { font-size:3rem; margin-bottom:0.75rem; }
    .empty-title { font-size:1.1rem; font-weight:700; color:#1e293b; margin-bottom:0.4rem; }
    .empty-sub { font-size:0.88rem; color:#64748b; }

    .budget-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:1.1rem; }
    .bitem-card { background:#fff; border-radius:14px; padding:1.15rem; box-shadow:0 1px 8px rgba(0,0,0,.07); border:1px solid #e2e8f0; transition:box-shadow .2s,transform .2s; }
    .bitem-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.1); transform:translateY(-2px); }
    .bitem-card.over-card { border-color:#fca5a5; background:#fff8f8; }
    .bitem-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.7rem; }
    .bitem-icon { font-size:1.3rem; }
    .bitem-name { font-weight:700; color:#1e293b; flex:1; font-size:0.92rem; }
    .bitem-acts { display:flex; gap:0.35rem; }
    .act-btn { width:26px; height:26px; border-radius:6px; border:none; cursor:pointer; font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; transition:all .15s; }
    .add-btn { background:#eff6ff; color:#1d4ed8; }
    .add-btn:hover { background:#1d4ed8; color:#fff; }
    .del-btn { background:#fff1f2; color:#dc2626; }
    .del-btn:hover { background:#dc2626; color:#fff; }
    .bitem-amounts { display:flex; gap:0.25rem; align-items:baseline; margin-bottom:0.5rem; }
    .bitem-spent { font-size:1.25rem; font-weight:800; color:#1e293b; }
    .bitem-spent.over-amt { color:#dc2626; }
    .bitem-limit { font-size:0.82rem; color:#94a3b8; }
    .bitem-track { height:9px; background:#f1f5f9; border-radius:10px; overflow:hidden; margin-bottom:0.55rem; }
    .bitem-fill { height:100%; border-radius:10px; transition:width .5s cubic-bezier(0.34,1.2,0.64,1); }
    .bitem-footer { display:flex; justify-content:space-between; font-size:0.79rem; margin-bottom:0.75rem; }
    .ok-txt   { color:#16a34a; font-weight:600; }
    .warn-txt2{ color:#d97706; font-weight:600; }
    .over-txt { color:#dc2626; font-weight:700; }
    .pct-txt  { color:#94a3b8; }

    /* Recent transactions inside card */
    .bitem-txs { border-top:1px solid #f1f5f9; padding-top:0.65rem; }
    .btx-header { font-size:0.68rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.4rem; }
    .btx-row { display:flex; justify-content:space-between; font-size:0.78rem; padding:0.22rem 0; border-bottom:1px solid #f8fafc; }
    .btx-row:last-of-type { border:none; }
    .btx-desc { color:#475569; max-width:70%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .btx-amt  { color:#dc2626; font-weight:700; flex-shrink:0; }
    .btx-more { font-size:0.72rem; color:#94a3b8; margin-top:0.3rem; }

    /* Modals */
    .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:9000; backdrop-filter:blur(3px); animation:fadeIn .2s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .modal-box { background:#fff; border-radius:18px; padding:2rem; width:380px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,.25); animation:popIn .25s cubic-bezier(.34,1.4,.64,1); }
    @keyframes popIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
    .modal-title { font-size:1.05rem; font-weight:700; color:#1e293b; margin:0 0 1.25rem; }
    .modal-hint { background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:0.55rem 0.85rem; font-size:0.8rem; color:#1e40af; margin-bottom:1rem; }
    .modal-actions { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.25rem; }

    /* Spinner for sync button */
    @keyframes spin { to{transform:rotate(360deg)} }
    .spinning { animation:spin .7s linear infinite; }
`;

/* ─── Class body ────────────────────────────────────────────── */
const cls = `
export class BudgetComponent implements OnInit {
  private txSvc = inject(TransactionService);

  showAdd        = signal(false);
  month          = signal(new Date().getMonth());
  year           = signal(new Date().getFullYear());
  budgets        = signal<BudgetItem[]>([]);
  refreshing     = signal(false);
  lastSync       = signal<Date | null>(null);
  expenseTarget  = signal<BudgetItem | null>(null);
  expAmt         = 0;
  expNote        = '';
  newCat         = 'food';
  newLimit       = 5000;
  private nextId = 1;

  // All debit transactions for the selected month
  private monthTxs = signal<Transaction[]>([]);

  ngOnInit() { this.loadBudgets(); this.refreshSpending(); }

  /* ── Computed ── */
  monthLabel   = computed(() => new Date(this.year(), this.month(), 1).toLocaleString('default', { month:'long', year:'numeric' }));
  totalLimit   = computed(() => this.budgets().reduce((s,b) => s + b.limit, 0));
  totalSpent   = computed(() => this.budgets().reduce((s,b) => s + b.spent, 0));
  usagePct     = computed(() => this.totalLimit() === 0 ? 0 : Math.round(this.totalSpent() / this.totalLimit() * 100));
  overBudgetItems = computed(() => this.budgets().filter(b => b.spent > b.limit));
  itemPct(b: BudgetItem) { return b.limit === 0 ? 0 : Math.min(Math.round(b.spent / b.limit * 100), 100); }

  /* ── Storage ── */
  private storageKey()  { return \`neobank_budget_\${this.year()}_\${this.month()}\`; }
  private expKey(id: number) { return \`neobank_exp_\${this.year()}_\${this.month()}_\${id}\`; }
  private saveBudgets() { localStorage.setItem(this.storageKey(), JSON.stringify(this.budgets())); }
  private loadBudgets() {
    const saved = localStorage.getItem(this.storageKey());
    if (saved) {
      try {
        const items = JSON.parse(saved) as BudgetItem[];
        this.budgets.set(items);
        this.nextId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
      } catch { this.budgets.set([]); }
    } else { this.budgets.set([]); }
  }

  /* ── Fetch transactions & auto-map to categories ── */
  refreshSpending() {
    this.refreshing.set(true);
    this.txSvc.getMyTransactions().subscribe({
      next: res => {
        this.refreshing.set(false);
        if (!res.success) return;
        const y = this.year(), m = this.month();
        // Filter: only DEBIT / BILL_PAYMENT in selected month, completed
        const filtered = (res.data || []).filter((tx: Transaction) => {
          const d = new Date(tx.createdAt);
          return d.getFullYear() === y && d.getMonth() === m
            && (tx.type === 'DEBIT' || tx.type === 'BILL_PAYMENT')
            && tx.status === 'COMPLETED';
        });
        this.monthTxs.set(filtered);
        this.recalcSpent(filtered);
        this.lastSync.set(new Date());
      },
      error: () => this.refreshing.set(false)
    });
  }

  private recalcSpent(txs: Transaction[]) {
    this.budgets.update(list => list.map(b => {
      const manualExp = this.getManualExpenses(b.id);
      const autoSpent = txs.filter(tx => this.matchCategory(tx, b)).reduce((s, tx) => s + tx.amount, 0);
      return { ...b, spent: autoSpent + manualExp };
    }));
    this.saveBudgets();
  }

  /* ── Category keyword matcher ── */
  private matchCategory(tx: Transaction, b: BudgetItem): boolean {
    const desc = (tx.description || '').toLowerCase();
    const cat  = b.category.toLowerCase();
    const keywords: Record<string, string[]> = {
      'food & dining':    ['food','restaurant','dining','swiggy','zomato','cafe','lunch','dinner','breakfast','eat','hotel','cook','canteen'],
      'transport':        ['transport','uber','ola','fuel','petrol','cab','bus','train','metro','auto','toll','parking','flight','travel'],
      'shopping':         ['shopping','amazon','flipkart','myntra','mall','cloth','dress','order','purchase','buy','store','mart'],
      'utilities':        ['electricity','water','gas','internet','broadband','mobile','phone','recharge','bill','wifi','prepaid','postpaid','dth','utility'],
      'entertainment':    ['netflix','amazon prime','hotstar','movie','cinema','entertainment','game','sport','concert','fun','stream','disney'],
      'health':           ['medical','health','doctor','hospital','pharmacy','medicine','clinic','dental','lab','test','prescription'],
      'education':        ['education','school','college','course','book','tuition','fees','coaching','exam','certification','library'],
      'rent':             ['rent','house','flat','pg','hostel','maintenance','society','lease','deposit'],
    };
    const words = keywords[cat] || [];
    if (words.some(w => desc.includes(w))) return true;
    // Fallback: BILL_PAYMENT -> utilities, remaining DEBITs -> others
    if (cat === 'utilities' && tx.type === 'BILL_PAYMENT' && words.length === 0) return true;
    if (cat === 'others') {
      const allWords = Object.values(keywords).flat();
      return !allWords.some(w => desc.includes(w));
    }
    return false;
  }

  /* ── Get transactions matched to a budget card ── */
  getTxForBudget(b: BudgetItem): Transaction[] {
    return this.monthTxs().filter(tx => this.matchCategory(tx, b));
  }

  /* ── Manual expenses (localStorage) ── */
  private getManualExpenses(id: number): number {
    const saved = localStorage.getItem(this.expKey(id));
    if (!saved) return 0;
    try { return (JSON.parse(saved) as number[]).reduce((s, v) => s + v, 0); } catch { return 0; }
  }
  private addManualExpense(id: number, amt: number) {
    const saved = localStorage.getItem(this.expKey(id));
    let list: number[] = [];
    try { list = saved ? JSON.parse(saved) : []; } catch {}
    list.push(amt);
    localStorage.setItem(this.expKey(id), JSON.stringify(list));
  }

  openAddExpense(b: BudgetItem) { this.expenseTarget.set(b); this.expAmt = 0; this.expNote = ''; }
  logExpense() {
    const b = this.expenseTarget();
    if (!b || !this.expAmt || this.expAmt <= 0) return;
    this.addManualExpense(b.id, this.expAmt);
    this.budgets.update(list => list.map(item => item.id === b.id ? { ...item, spent: item.spent + this.expAmt } : item));
    this.saveBudgets();
    this.expenseTarget.set(null);
  }

  /* ── CRUD ── */
  addBudget() {
    if (!this.newLimit || this.newLimit <= 0) return;
    const opt = this.catOptions.find(c => c.value === this.newCat)!;
    const newItem: BudgetItem = { id: this.nextId++, category: opt.label, icon: opt.icon, limit: this.newLimit, spent: 0, color: opt.color };
    this.budgets.update(list => [...list, newItem]);
    // Immediately calculate spent for this new item from already-loaded txs
    const manualExp = this.getManualExpenses(newItem.id);
    const autoSpent = this.monthTxs().filter(tx => this.matchCategory(tx, newItem)).reduce((s, tx) => s + tx.amount, 0);
    this.budgets.update(list => list.map(b => b.id === newItem.id ? { ...b, spent: autoSpent + manualExp } : b));
    this.newCat = 'food'; this.newLimit = 5000;
    this.showAdd.set(false);
    this.saveBudgets();
  }

  deleteBudget(id: number) {
    this.budgets.update(list => list.filter(b => b.id !== id));
    localStorage.removeItem(this.expKey(id));
    this.saveBudgets();
  }

  prevMonth() {
    if (this.month() === 0) { this.month.set(11); this.year.update(y => y - 1); }
    else this.month.update(m => m - 1);
    this.loadBudgets(); this.refreshSpending();
  }
  nextMonth() {
    if (this.month() === 11) { this.month.set(0); this.year.update(y => y + 1); }
    else this.month.update(m => m + 1);
    this.loadBudgets(); this.refreshSpending();
  }

  readonly catOptions = [
    { value:'food',          label:'Food & Dining',    icon:'🍽️', color:'#f59e0b' },
    { value:'transport',     label:'Transport',         icon:'🚗',  color:'#3b82f6' },
    { value:'shopping',      label:'Shopping',          icon:'🛍️', color:'#8b5cf6' },
    { value:'utilities',     label:'Utilities',         icon:'💡',  color:'#06b6d4' },
    { value:'entertainment', label:'Entertainment',     icon:'🎬',  color:'#ec4899' },
    { value:'health',        label:'Health',            icon:'🏥',  color:'#22c55e' },
    { value:'education',     label:'Education',         icon:'📚',  color:'#f97316' },
    { value:'rent',          label:'Rent',              icon:'🏠',  color:'#6366f1' },
    { value:'others',        label:'Others',            icon:'📦',  color:'#64748b' },
  ];
}
`;

const full = `import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

interface BudgetItem { id: number; category: string; icon: string; limit: number; spent: number; color: string; }

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ${BT}${tpl}  ${BT},
  styles: [${BT}${styles}  ${BT}]
})
${cls}
`;

fs.writeFileSync(dest, full, 'utf8');
console.log('budget written:', full.length, 'bytes');
