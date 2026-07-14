const fs = require('fs');
const dest = 'C:/Users/pala.TRN/Downloads/POC/frontend/src/app/pages/admin/admin-users/admin-users.component.ts';
const BT = '`';
const code = `import { Component, inject, signal, OnInit } from '@angular/core';
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
    <div class="page-container">PLACEHOLDER</div>
  ${BT},
  styles: [${BT}${BT}]
})
export class AdminUsersComponent implements OnInit {
  private adminSvc = inject(AdminService);
  loading = signal(true);
  ngOnInit() { this.adminSvc.getAllUsers().subscribe({ next: (r) => { this.loading.set(false); } }); }
}
`;
fs.writeFileSync(dest, code, 'utf8');
console.log('Written', fs.statSync(dest).size, 'bytes');
