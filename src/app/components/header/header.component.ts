import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService, DecodedJwtDTO } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {

  currentUser?: DecodedJwtDTO;
  loggedIn = true;

  constructor(private authService:AuthService, private router:Router) { 
  }

  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  
  logout(){
    localStorage.removeItem("Authorization");
    location.reload();
  }

  ngOnInit(): void {
    this.authService.getCurrentUserInfo();
    this.currentUser = this.authService.decodedJwtDTO;
    if (!this.authService.isLoggedIn()){
      this.router.navigateByUrl("/signin");
      this.loggedIn = false;
    }else{
      this.getActiveUser();
    }
  }

  getActiveUser(){
    this.currentUser = this.authService.decodedJwtDTO;
  }

}
