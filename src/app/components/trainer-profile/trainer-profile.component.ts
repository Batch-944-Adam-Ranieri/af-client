import { Component, OnInit } from '@angular/core';
import { AuthService, DecodedJwtDTO } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-trainer-profile',
  templateUrl: './trainer-profile.component.html',
  styleUrls: ['./trainer-profile.component.sass']
})
export class TrainerProfileComponent implements OnInit {

  userInfo?: DecodedJwtDTO;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userInfo = this.authService.decodedJwtDTO;
  }

}
