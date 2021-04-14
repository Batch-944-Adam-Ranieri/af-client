import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.sass'],
})
export class SetPasswordComponent implements OnInit {
  newPassword: string = '';
  newPasswordConfirm: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  changePassword() {
    if (!this.validate()) {
      return;
    }

    this.authService.setPassword(this.newPassword).subscribe(
      (data) => {
        this.authService.jwt = data.data;
        this.toastr.success('Password changed');
        this.authService.getCurrentUserInfo();
        if (this.authService.decodedJwtDTO?.role == 'admin') {
          this.router.navigateByUrl('/admin-page');
        } else {
          this.router.navigateByUrl('/trainer-page');
        }
      },
      (error) => {
        this.toastr.error('Unable to change password');
      }
    );
  }

  validate(): boolean {
    if (this.newPassword === '' || this.newPasswordConfirm === '') {
      this.toastr.error('All fields required');
      return false;
    }
    if (this.newPassword !== this.newPasswordConfirm) {
      this.toastr.error('Passwords must match');
      return false;
    }
    return true;
  }
}
