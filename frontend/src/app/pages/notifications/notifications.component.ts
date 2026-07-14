import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Notifications</h1>
        @if (notifications().some(n => !n.isRead)) {
          <button class="btn btn-secondary" (click)="markAll()">✅ Mark All as Read</button>
        }
      </div>

      @if (loading()) {
        <div class="loading-overlay"><div class="spinner-dark" style="width:40px;height:40px;border-width:4px"></div></div>
      } @else if (!notifications().length) {
        <div class="card empty-state">
          <span class="empty-icon">🔔</span>
          <h3>All caught up!</h3>
          <p>No notifications at the moment</p>
        </div>
      } @else {
        <div class="notif-list">
          @for (n of notifications(); track n.id; let i = $index) {
            <div class="notif-item" [class.unread]="!n.isRead"
                 [style.animation-delay]="(i * 0.05) + 's'" (click)="markRead(n)">
              <div class="notif-icon-wrap">{{ getIcon(n.type) }}</div>
              <div class="notif-body" style="flex:1;min-width:0">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">🕒 {{ n.createdAt | date:'dd MMM yyyy, h:mm a' }}</div>
              </div>
              @if (!n.isRead) { <div class="unread-dot"></div> }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-list { display:flex; flex-direction:column; gap:0.75rem; }
    .notif-item {
      background:white; border-radius:14px; padding:1.1rem 1.25rem;
      display:flex; align-items:flex-start; gap:1rem;
      box-shadow:0 1px 6px rgba(0,0,0,0.06); cursor:pointer;
      transition:all 0.25s; position:relative; border:1px solid #f0f4ff;
      animation:slideRight 0.35s ease backwards;
    }
    .notif-item:hover { box-shadow:0 6px 20px rgba(26,35,126,0.1); transform:translateX(4px); border-color:#c7d2fe; }
    .notif-item.unread { border-left:4px solid #3949ab; background:linear-gradient(135deg,#f5f7ff,#eef2ff); }
    .notif-icon-wrap { width:44px; height:44px; border-radius:12px; background:#eef2ff; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .notif-item.unread .notif-icon-wrap { background:#dbeafe; }
    .notif-title { font-weight:700; font-size:0.92rem; color:#0f172a; margin-bottom:0.3rem; }
    .notif-msg { font-size:0.85rem; color:#475569; line-height:1.5; }
    .notif-time { font-size:0.75rem; color:#94a3b8; margin-top:0.4rem; display:flex; align-items:center; gap:0.3rem; }
    .unread-dot { width:9px; height:9px; background:#3949ab; border-radius:50%; flex-shrink:0; margin-top:0.4rem; animation:pulse 2s ease infinite; }
    @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
    @keyframes slideRight { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  `]
})
export class NotificationsComponent implements OnInit {
  private notifSvc = inject(NotificationService);
  loading = signal(true);
  notifications = signal<Notification[]>([]);

  ngOnInit() {
    this.notifSvc.getNotifications().subscribe({
      next: (r) => { this.loading.set(false); if (r.success) this.notifications.set(r.data); },
      error: () => this.loading.set(false)
    });
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.notifSvc.markAsRead(n.id).subscribe(r => {
      if (r.success) this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    });
  }

  markAll() {
    this.notifSvc.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    });
  }

  getIcon(type: string) {
    return { TRANSACTION: '💸', LOAN: '🏦', SYSTEM: '⚙️', ALERT: '⚠️' }[type] || '🔔';
  }
}
