import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService {

  
  constructor(private router: Router, private authService: AuthService, private toastr: ToastrService) {}

  canActivate( state: RouterStateSnapshot) {
    if (this.authService.isAdminAuthorized()) {
      return true;
    } else {
      this.router.navigate(["/signin"], {
        queryParams: {
          return: state.url
        }
      });
      this.toastr.error("You don't have access to this page! Please sign in.");
      return false;
    }
  }
  
}
