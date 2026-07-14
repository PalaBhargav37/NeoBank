import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { AdminService } from './services/admin.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  auth          = inject(AuthService);
  private router    = inject(Router);
  private adminSvc  = inject(AdminService);

  sidebarOpen   = signal(false);
  darkMode      = signal(false);
  notifOpen     = signal(false);
  adminUnread   = signal(0);
  adminNotifs   = signal<any[]>([]);
  private pollSub?: Subscription;

  ngOnInit() {
    // Load on first render if already admin
    if (this.auth.isAdmin() && this.auth.isLoggedIn()) this.loadAdminNotifs();
    // Poll every 30s
    this.pollSub = interval(30000).subscribe(() => {
      if (this.auth.isAdmin() && this.auth.isLoggedIn()) this.pollUnread();
    });
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  loadAdminNotifs() {
    this.adminSvc.getAdminNotifications().subscribe({
      next: r => {
        this.adminNotifs.set(r.data || []);
        this.adminUnread.set((r.data || []).filter((n: any) => !n.isRead).length);
      }
    });
  }

  pollUnread() {
    this.adminSvc.getAdminUnreadCount().subscribe({
      next: r => this.adminUnread.set(r.data ?? 0)
    });
  }

  toggleNotifPanel() {
    this.notifOpen.update(v => !v);
    if (this.notifOpen() && this.auth.isAdmin()) this.loadAdminNotifs();
  }

  markRead(id: number) {
    this.adminSvc.markAdminNotifRead(id).subscribe(() => this.loadAdminNotifs());
  }

  markAllRead() {
    this.adminSvc.markAllAdminNotifsRead().subscribe(() => this.loadAdminNotifs());
  }

  initials() {
    const u = this.auth.currentUser();
    return u ? ((u.firstName?.[0]||'') + (u.lastName?.[0]||'')).toUpperCase() : '?';
  }
  userName() {
    const u = this.auth.currentUser();
    return u ? `${u.firstName} ${u.lastName}` : '';
  }
  goBell() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/notifications']);
    } else {
      this.toggleNotifPanel();
    }
  }
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar()  { this.sidebarOpen.set(false); }
  closeNotif()    { this.notifOpen.set(false); }
  logout()        { this.auth.logout(); }
  toggleTheme()   {
    this.darkMode.update(v => !v);
    document.documentElement.classList.toggle('dark', this.darkMode());
  }
}
